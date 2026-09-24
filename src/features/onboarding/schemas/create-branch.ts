import { z } from "zod";

function isValidTimezone(timezone: string) {
  try {
    new Intl.DateTimeFormat("en", {
      timeZone: timezone,
    }).format();

    return true;
  } catch {
    return false;
  }
}

export const createBranchSchema = z.object({
  restaurantId: z.string().uuid("invalidRestaurant"),

  name: z
    .string()
    .trim()
    .min(2, "nameTooShort")
    .max(150, "nameTooLong"),

  addressLine1: z
    .string()
    .trim()
    .min(3, "addressTooShort")
    .max(200, "addressTooLong"),

  addressLine2: z
    .string()
    .trim()
    .max(200, "addressTooLong")
    .optional()
    .transform((value) => value || undefined),

  city: z
    .string()
    .trim()
    .min(2, "cityTooShort")
    .max(100, "cityTooLong"),

  region: z
    .string()
    .trim()
    .min(2, "regionTooShort")
    .max(100, "regionTooLong"),

  postalCode: z
    .string()
    .trim()
    .min(3, "postalCodeTooShort")
    .max(20, "postalCodeTooLong"),

  country: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, "invalidCountry"),

  timezone: z
    .string()
    .trim()
    .min(1, "timezoneRequired")
    .max(100, "invalidTimezone")
    .refine(isValidTimezone, "invalidTimezone"),
});