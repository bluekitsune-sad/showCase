import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export const CART_COOKIE = "maison_cart";
export const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
export const MAX_PER_LINE = 10;

export type CartLine = {
  id: number;
  quantity: number;
  variant: {
    id: number;
    size: string;
    colour: string;
    sku: string;
    stock: number;
    product: {
      id: number;
      name: string;
      slug: string;
      price: number;
      currency: string;
    };
  };
};

export type Cart = {
  id: number;
  token: string;
  items: CartLine[];
};

export async function readCartToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(CART_COOKIE)?.value ?? null;
}

export async function getCart(): Promise<Cart | null> {
  const token = await readCartToken();
  if (!token) {
    return null;
  }

  return prisma.cart.findUnique({
    where: { token },
    select: {
      id: true,
      token: true,
      items: {
        orderBy: { id: "asc" },
        select: {
          id: true,
          quantity: true,
          variant: {
            select: {
              id: true,
              size: true,
              colour: true,
              sku: true,
              stock: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  price: true,
                  currency: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function getCartCount(): Promise<number> {
  const token = await readCartToken();
  if (!token) {
    return 0;
  }

  const cart = await prisma.cart.findUnique({
    where: { token },
    select: { items: { select: { quantity: true } } },
  });

  return cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
}

export function cartSubtotal(cart: Cart): number {
  return cart.items.reduce(
    (sum, item) => sum + item.variant.product.price * item.quantity,
    0,
  );
}

export function cartItemCount(cart: Cart): number {
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}
