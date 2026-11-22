"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/lib/auth";
import {
  hasAddressErrors,
  readAddressValues,
  validateAddress,
} from "@/lib/addresses";
import { prisma } from "@/lib/db";

export type AddressState = {
  status: "idle" | "error";
  message: string;
  errors: Record<string, string>;
};

const INVALID: AddressState = {
  status: "error",
  message: "Check the highlighted fields and try again.",
  errors: {},
};

function parseId(formData: FormData): number | null {
  const value = Number(String(formData.get("id") ?? ""));
  return Number.isInteger(value) && value > 0 ? value : null;
}

function addressData(values: ReturnType<typeof readAddressValues>) {
  return {
    label: values.label,
    line1: values.line1,
    line2: values.line2 || null,
    city: values.city,
    region: values.region,
    postalCode: values.postalCode,
    country: values.country,
  };
}

export async function createAddress(
  previous: AddressState,
  formData: FormData,
): Promise<AddressState> {
  void previous;
  const customer = await getCurrentCustomer();
  if (!customer) {
    redirect("/account/sign-in");
  }

  const values = readAddressValues(formData);
  const errors = validateAddress(values);
  if (hasAddressErrors(errors)) {
    return { ...INVALID, errors };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const count = await tx.address.count({
        where: { customerId: customer.id },
      });
      const makeDefault = values.isDefault || count === 0;

      if (makeDefault) {
        await tx.address.updateMany({
          where: { customerId: customer.id },
          data: { isDefault: false },
        });
      }

      await tx.address.create({
        data: {
          ...addressData(values),
          customerId: customer.id,
          isDefault: makeDefault,
        },
      });
    });
  } catch {
    return {
      status: "error",
      message: "We could not save that address just now. Try again.",
      errors: {},
    };
  }

  revalidatePath("/account/addresses");
  redirect("/account/addresses");
}

export async function updateAddress(
  previous: AddressState,
  formData: FormData,
): Promise<AddressState> {
  void previous;
  const customer = await getCurrentCustomer();
  if (!customer) {
    redirect("/account/sign-in");
  }

  const id = parseId(formData);
  if (!id) {
    return { ...INVALID, message: "That address could not be found." };
  }

  const values = readAddressValues(formData);
  const errors = validateAddress(values);
  if (hasAddressErrors(errors)) {
    return { ...INVALID, errors };
  }

  const existing = await prisma.address.findFirst({
    where: { id, customerId: customer.id },
    select: { id: true, isDefault: true },
  });
  if (!existing) {
    return { ...INVALID, message: "That address could not be found." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const data = addressData(values);

      if (values.isDefault) {
        await tx.address.updateMany({
          where: { customerId: customer.id, id: { not: id } },
          data: { isDefault: false },
        });
        await tx.address.update({
          where: { id },
          data: { ...data, isDefault: true },
        });
        return;
      }

      if (!existing.isDefault) {
        await tx.address.update({ where: { id }, data });
        return;
      }

      const replacement = await tx.address.findFirst({
        where: { customerId: customer.id, id: { not: id } },
        orderBy: { id: "asc" },
        select: { id: true },
      });
      await tx.address.update({
        where: { id },
        data: { ...data, isDefault: replacement ? false : true },
      });
      if (replacement) {
        await tx.address.update({
          where: { id: replacement.id },
          data: { isDefault: true },
        });
      }
    });
  } catch {
    return {
      status: "error",
      message: "We could not save that address just now. Try again.",
      errors: {},
    };
  }

  revalidatePath("/account/addresses");
  redirect("/account/addresses");
}

export async function setDefaultAddress(formData: FormData): Promise<void> {
  const customer = await getCurrentCustomer();
  if (!customer) {
    redirect("/account/sign-in");
  }

  const id = parseId(formData);
  if (!id) {
    return;
  }

  const address = await prisma.address.findFirst({
    where: { id, customerId: customer.id },
    select: { id: true },
  });
  if (!address) {
    return;
  }

  await prisma.$transaction([
    prisma.address.updateMany({
      where: { customerId: customer.id },
      data: { isDefault: false },
    }),
    prisma.address.update({ where: { id }, data: { isDefault: true } }),
  ]);

  revalidatePath("/account/addresses");
}

export async function deleteAddress(formData: FormData): Promise<void> {
  const customer = await getCurrentCustomer();
  if (!customer) {
    redirect("/account/sign-in");
  }

  const id = parseId(formData);
  if (!id) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    const address = await tx.address.findFirst({
      where: { id, customerId: customer.id },
      select: { id: true, isDefault: true },
    });
    if (!address) {
      return;
    }

    await tx.address.delete({ where: { id } });

    if (address.isDefault) {
      const replacement = await tx.address.findFirst({
        where: { customerId: customer.id },
        orderBy: { id: "asc" },
        select: { id: true },
      });
      if (replacement) {
        await tx.address.update({
          where: { id: replacement.id },
          data: { isDefault: true },
        });
      }
    }
  });

  revalidatePath("/account/addresses");
}
