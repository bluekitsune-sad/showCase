"use server";

import { revalidatePath } from "next/cache";
import { getCurrentCustomer } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type WishlistState = {
  status: "idle" | "success" | "error";
  message: string;
  saved: boolean;
};

function refreshWishlist() {
  revalidatePath("/wishlist");
  revalidatePath("/", "layout");
}

export async function toggleWishlist(
  previous: WishlistState,
  formData: FormData,
): Promise<WishlistState> {
  void previous;

  const productId = Number(formData.get("productId"));
  if (!Number.isInteger(productId) || productId <= 0) {
    return {
      status: "error",
      message: "That piece could not be saved.",
      saved: false,
    };
  }

  const customer = await getCurrentCustomer();
  if (!customer) {
    return {
      status: "error",
      message: "Sign in to keep a wishlist across visits.",
      saved: false,
    };
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { name: true },
  });

  if (!product) {
    return {
      status: "error",
      message: "That piece is no longer available.",
      saved: false,
    };
  }

  const where = {
    customerId_productId: { customerId: customer.id, productId },
  };
  const existing = await prisma.wishlistItem.findUnique({ where });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    refreshWishlist();
    return {
      status: "success",
      message: `${product.name} removed from your wishlist.`,
      saved: false,
    };
  }

  await prisma.wishlistItem.create({
    data: { customerId: customer.id, productId },
  });
  refreshWishlist();
  return {
    status: "success",
    message: `${product.name} saved to your wishlist.`,
    saved: true,
  };
}

export async function removeFromWishlist(formData: FormData): Promise<void> {
  const productId = Number(formData.get("productId"));
  if (!Number.isInteger(productId) || productId <= 0) {
    return;
  }

  const customer = await getCurrentCustomer();
  if (!customer) {
    return;
  }

  await prisma.wishlistItem.deleteMany({
    where: { customerId: customer.id, productId },
  });

  refreshWishlist();
}
