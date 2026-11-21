"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CART_COOKIE, readCartToken } from "@/lib/cart";
import {
  evaluateDiscount,
  hasErrors,
  readCheckoutValues,
  shippingFor,
  validateCheckout,
  type CheckoutErrors,
} from "@/lib/checkout";
import { prisma } from "@/lib/db";

export type DiscountState = {
  status: "idle" | "applied" | "error";
  message: string;
  code: string;
  amount: number;
};

export const initialDiscountState: DiscountState = {
  status: "idle",
  message: "",
  code: "",
  amount: 0,
};

export type CheckoutState = {
  status: "idle" | "error";
  message: string;
  errors: CheckoutErrors;
};

class OrderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderError";
  }
}

function normaliseCode(raw: FormDataEntryValue | null): string {
  return String(raw ?? "").trim().toUpperCase();
}

function newOrderNumber(): string {
  return `MS-${Date.now().toString(36).toUpperCase()}${crypto
    .randomUUID()
    .replace(/-/g, "")
    .slice(0, 4)
    .toUpperCase()}`;
}

export async function applyDiscountCode(
  previous: DiscountState,
  formData: FormData,
): Promise<DiscountState> {
  void previous;

  if (formData.get("intent") === "clear") {
    return {
      status: "idle",
      message: "Discount code removed.",
      code: "",
      amount: 0,
    };
  }

  const code = normaliseCode(formData.get("code"));
  if (!code) {
    return {
      status: "error",
      message: "Enter a discount code to apply it.",
      code: "",
      amount: 0,
    };
  }

  const token = await readCartToken();
  if (!token) {
    return {
      status: "error",
      message: "Your bag is empty, so there is nothing to discount.",
      code: "",
      amount: 0,
    };
  }

  const cart = await prisma.cart.findUnique({
    where: { token },
    select: {
      items: {
        select: {
          quantity: true,
          variant: { select: { product: { select: { price: true } } } },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return {
      status: "error",
      message: "Your bag is empty, so there is nothing to discount.",
      code: "",
      amount: 0,
    };
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.variant.product.price * item.quantity,
    0,
  );
  const discount = await prisma.discount.findUnique({ where: { code } });
  const result = evaluateDiscount(discount, subtotal);

  if (!result.ok) {
    return { status: "error", message: result.message, code: "", amount: 0 };
  }

  return {
    status: "applied",
    message: result.message,
    code,
    amount: result.amount,
  };
}

export async function placeOrder(
  previous: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  void previous;

  const values = readCheckoutValues(formData);
  const errors = validateCheckout(values);
  if (hasErrors(errors)) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      errors,
    };
  }

  const token = await readCartToken();
  if (!token) {
    return {
      status: "error",
      message: "Your bag is empty. Add a piece before checking out.",
      errors: {},
    };
  }

  const requestedCode = normaliseCode(formData.get("discountCode"));

  let orderNumber: string;
  try {
    orderNumber = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { token },
        select: {
          id: true,
          items: {
            orderBy: { id: "asc" },
            select: {
              quantity: true,
              variant: {
                select: {
                  id: true,
                  size: true,
                  colour: true,
                  stock: true,
                  product: {
                    select: { name: true, price: true, currency: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new OrderError(
          "Your bag is empty. Add a piece before checking out.",
        );
      }

      for (const item of cart.items) {
        if (item.variant.stock < item.quantity) {
          throw new OrderError(
            item.variant.stock === 0
              ? `${item.variant.product.name} (${item.variant.colour} / ${item.variant.size}) has sold out. Remove it from your bag to continue.`
              : `Only ${item.variant.stock} of ${item.variant.product.name} (${item.variant.colour} / ${item.variant.size}) remain. Reduce the quantity in your bag.`,
          );
        }
      }

      const subtotal = cart.items.reduce(
        (sum, item) => sum + item.variant.product.price * item.quantity,
        0,
      );
      const currency = cart.items[0].variant.product.currency;

      let discountAmount = 0;
      let appliedCode: string | null = null;
      if (requestedCode) {
        const discount = await tx.discount.findUnique({
          where: { code: requestedCode },
        });
        const result = evaluateDiscount(discount, subtotal);
        if (!result.ok) {
          throw new OrderError(
            `${result.message} Update the code and try again.`,
          );
        }
        discountAmount = result.amount;
        appliedCode = requestedCode;
      }

      const shipping = shippingFor(subtotal);
      const total = subtotal - discountAmount + shipping;

      for (const item of cart.items) {
        const updated = await tx.variant.updateMany({
          where: { id: item.variant.id, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count === 0) {
          throw new OrderError(
            `${item.variant.product.name} (${item.variant.colour} / ${item.variant.size}) just sold out. Remove it from your bag to continue.`,
          );
        }
      }

      const existingCustomer = await tx.customer.findUnique({
        where: { email: values.email },
        select: { id: true },
      });
      const customer =
        existingCustomer ??
        (await tx.customer.create({
          data: { email: values.email, name: values.name },
          select: { id: true },
        }));

      const existingAddress = await tx.address.findFirst({
        where: {
          customerId: customer.id,
          line1: values.line1,
          postalCode: values.postalCode,
        },
        select: { id: true },
      });
      if (!existingAddress) {
        await tx.address.create({
          data: {
            customerId: customer.id,
            label: "Checkout",
            line1: values.line1,
            line2: values.line2 || null,
            city: values.city,
            region: values.region,
            postalCode: values.postalCode,
            country: values.country,
          },
        });
      }

      const number = newOrderNumber();
      await tx.order.create({
        data: {
          orderNumber: number,
          customerId: customer.id,
          status: "processing",
          email: values.email,
          subtotal,
          discountTotal: discountAmount,
          shippingTotal: shipping,
          total,
          currency,
          discountCode: appliedCode,
          shippingName: values.name,
          shippingLine1: values.line1,
          shippingLine2: values.line2 || null,
          shippingCity: values.city,
          shippingRegion: values.region,
          shippingPostalCode: values.postalCode,
          shippingCountry: values.country,
          items: {
            create: cart.items.map((item) => ({
              variantId: item.variant.id,
              productName: item.variant.product.name,
              variantLabel: `${item.variant.colour} / ${item.variant.size}`,
              status: "processing",
              quantity: item.quantity,
              unitPrice: item.variant.product.price,
              lineTotal: item.variant.product.price * item.quantity,
            })),
          },
        },
      });

      await tx.cart.delete({ where: { id: cart.id } });

      return number;
    });
  } catch (error) {
    if (error instanceof OrderError) {
      return { status: "error", message: error.message, errors: {} };
    }
    return {
      status: "error",
      message:
        "We could not place the order just now. Please try again in a moment.",
      errors: {},
    };
  }

  const store = await cookies();
  store.delete(CART_COOKIE);
  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/", "layout");
  redirect(`/checkout/${orderNumber}`);
}
