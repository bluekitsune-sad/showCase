"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  CART_COOKIE,
  CART_COOKIE_MAX_AGE,
  MAX_PER_LINE,
} from "@/lib/cart";
import { prisma } from "@/lib/db";

export type AddToBagState = {
  status: "idle" | "success" | "error";
  message: string;
};

async function cartForWrite(): Promise<{ id: number }> {
  const store = await cookies();
  const token = store.get(CART_COOKIE)?.value;

  if (token) {
    const existing = await prisma.cart.findUnique({
      where: { token },
      select: { id: true },
    });
    if (existing) {
      return existing;
    }
  }

  const created = await prisma.cart.create({
    data: { token: crypto.randomUUID() },
    select: { id: true, token: true },
  });

  store.set(CART_COOKIE, created.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE,
  });

  return { id: created.id };
}

function refreshBag() {
  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

export async function addToCart(
  previous: AddToBagState,
  formData: FormData,
): Promise<AddToBagState> {
  void previous;

  const variantId = Number(formData.get("variantId"));
  const requested = Number(formData.get("quantity") ?? 1);

  if (!Number.isInteger(variantId) || variantId <= 0) {
    return { status: "error", message: "That piece could not be added." };
  }

  const variant = await prisma.variant.findUnique({
    where: { id: variantId },
    select: {
      stock: true,
      size: true,
      colour: true,
      product: { select: { name: true } },
    },
  });

  if (!variant) {
    return { status: "error", message: "That piece is no longer available." };
  }

  if (variant.stock <= 0) {
    return {
      status: "error",
      message: `Sold out in ${variant.colour} / ${variant.size}. Choose another option.`,
    };
  }

  const quantity = Number.isInteger(requested)
    ? Math.min(Math.max(requested, 1), MAX_PER_LINE)
    : 1;

  const cart = await cartForWrite();
  const existing = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
    select: { id: true, quantity: true },
  });

  const ceiling = Math.min(variant.stock, MAX_PER_LINE);
  const nextQuantity = Math.min((existing?.quantity ?? 0) + quantity, ceiling);

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: nextQuantity },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, variantId, quantity: nextQuantity },
    });
  }

  refreshBag();

  if (existing && nextQuantity === existing.quantity) {
    return {
      status: "success",
      message: `Your bag already has the last of the ${variant.product.name} in ${variant.colour} / ${variant.size}.`,
    };
  }

  return {
    status: "success",
    message: `${variant.product.name} — ${variant.colour} / ${variant.size} added to your bag.`,
  };
}

export async function updateCartItem(formData: FormData): Promise<void> {
  const itemId = Number(formData.get("itemId"));
  const quantity = Number(formData.get("quantity"));

  if (!Number.isInteger(itemId) || !Number.isInteger(quantity)) {
    return;
  }

  const store = await cookies();
  const token = store.get(CART_COOKIE)?.value;
  if (!token) {
    return;
  }

  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cart: { token } },
    select: { id: true, variant: { select: { stock: true } } },
  });

  if (!item) {
    return;
  }

  const nextQuantity = Math.min(
    quantity,
    item.variant.stock,
    MAX_PER_LINE,
  );

  if (nextQuantity <= 0) {
    await prisma.cartItem.delete({ where: { id: item.id } });
  } else {
    await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: nextQuantity },
    });
  }

  refreshBag();
}

export async function removeCartItem(formData: FormData): Promise<void> {
  const itemId = Number(formData.get("itemId"));
  if (!Number.isInteger(itemId)) {
    return;
  }

  const store = await cookies();
  const token = store.get(CART_COOKIE)?.value;
  if (!token) {
    return;
  }

  await prisma.cartItem.deleteMany({
    where: { id: itemId, cart: { token } },
  });

  refreshBag();
}
