import { formatPrice } from "@/lib/format";

export const SHIPPING_FLAT = 850;
export const SHIPPING_THRESHOLD = 15000;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const CARD_PATTERN = /^\d{13,19}$/;
const EXPIRY_PATTERN = /^(0[1-9]|1[0-2])\/(\d{2})$/;
const CVC_PATTERN = /^\d{3,4}$/;

export type DiscountRecord = {
  code: string;
  description: string;
  kind: string;
  value: number;
  minSubtotal: number;
  active: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
};

export type DiscountResult =
  | { ok: true; amount: number; message: string }
  | { ok: false; amount: number; message: string };

export function shippingFor(subtotal: number): number {
  return subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
}

export function evaluateDiscount(
  discount: DiscountRecord | null,
  subtotal: number,
  now: Date = new Date(),
): DiscountResult {
  if (!discount) {
    return {
      ok: false,
      amount: 0,
      message: "That code is not recognised. Check the spelling and try again.",
    };
  }

  if (!discount.active) {
    return {
      ok: false,
      amount: 0,
      message: `${discount.code} is no longer available.`,
    };
  }

  if (discount.startsAt && discount.startsAt > now) {
    return {
      ok: false,
      amount: 0,
      message: `${discount.code} is not active yet.`,
    };
  }

  if (discount.endsAt && discount.endsAt < now) {
    return { ok: false, amount: 0, message: `${discount.code} has expired.` };
  }

  if (subtotal < discount.minSubtotal) {
    return {
      ok: false,
      amount: 0,
      message: `Spend ${formatPrice(discount.minSubtotal)} or more to use ${discount.code}.`,
    };
  }

  const raw =
    discount.kind === "percent"
      ? Math.round((subtotal * discount.value) / 100)
      : discount.value;
  const amount = Math.min(Math.max(raw, 0), subtotal);

  if (amount <= 0) {
    return {
      ok: false,
      amount: 0,
      message: `${discount.code} has nothing to take off this order.`,
    };
  }

  return {
    ok: true,
    amount,
    message: `${discount.code} applied — ${formatPrice(amount)} off.`,
  };
}

export type CheckoutValues = {
  email: string;
  name: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
};

export type CheckoutErrors = Partial<Record<keyof CheckoutValues, string>>;

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export function readCheckoutValues(formData: FormData): CheckoutValues {
  return {
    email: text(formData, "email").toLowerCase(),
    name: text(formData, "name"),
    line1: text(formData, "line1"),
    line2: text(formData, "line2"),
    city: text(formData, "city"),
    region: text(formData, "region"),
    postalCode: text(formData, "postalCode"),
    country: text(formData, "country"),
    cardName: text(formData, "cardName"),
    cardNumber: text(formData, "cardNumber").replace(/\s+/g, ""),
    expiry: text(formData, "expiry"),
    cvc: text(formData, "cvc"),
  };
}

export function validateCheckout(
  values: CheckoutValues,
  now: Date = new Date(),
): CheckoutErrors {
  const errors: CheckoutErrors = {};

  if (values.email.length > 254 || !EMAIL_PATTERN.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (values.name.length < 2 || values.name.length > 120) {
    errors.name = "Enter the recipient's full name.";
  }
  if (values.line1.length < 3 || values.line1.length > 160) {
    errors.line1 = "Enter a street address.";
  }
  if (values.line2.length > 160) {
    errors.line2 = "Keep the second line under 160 characters.";
  }
  if (values.city.length < 2 || values.city.length > 80) {
    errors.city = "Enter a city.";
  }
  if (values.region.length < 2 || values.region.length > 80) {
    errors.region = "Enter a state, region or county.";
  }
  if (values.postalCode.length < 3 || values.postalCode.length > 12) {
    errors.postalCode = "Enter a postal code.";
  }
  if (values.country.length < 2 || values.country.length > 56) {
    errors.country = "Enter a country.";
  }
  if (values.cardName.length < 2 || values.cardName.length > 120) {
    errors.cardName = "Enter the name on the card.";
  }
  if (!CARD_PATTERN.test(values.cardNumber)) {
    errors.cardNumber = "Use 13–19 digits. This demo never charges the card.";
  }

  const expiry = EXPIRY_PATTERN.exec(values.expiry);
  if (!expiry) {
    errors.expiry = "Use MM/YY.";
  } else {
    const month = Number(expiry[1]);
    const year = 2000 + Number(expiry[2]);
    const endOfMonth = new Date(Date.UTC(year, month, 1));
    if (endOfMonth <= now) {
      errors.expiry = "That card has expired.";
    }
  }

  if (!CVC_PATTERN.test(values.cvc)) {
    errors.cvc = "Use 3 or 4 digits.";
  }

  return errors;
}

export function hasErrors(errors: CheckoutErrors): boolean {
  return Object.keys(errors).length > 0;
}
