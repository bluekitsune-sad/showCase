export type AddressValues = {
  label: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

export type AddressErrors = Partial<Record<keyof AddressValues, string>>;

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export function readAddressValues(formData: FormData): AddressValues {
  return {
    label: text(formData, "label"),
    line1: text(formData, "line1"),
    line2: text(formData, "line2"),
    city: text(formData, "city"),
    region: text(formData, "region"),
    postalCode: text(formData, "postalCode"),
    country: text(formData, "country").toUpperCase(),
    isDefault: formData.get("isDefault") === "on",
  };
}

export function validateAddress(values: AddressValues): AddressErrors {
  const errors: AddressErrors = {};

  if (values.label.length < 2 || values.label.length > 40) {
    errors.label = "Give this address a short label, like Home or Studio.";
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

  return errors;
}

export function hasAddressErrors(errors: AddressErrors): boolean {
  return Object.keys(errors).length > 0;
}
