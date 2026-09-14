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

export const createRestaurantSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "nameTooShort")
    .max(200, "nameTooLong"),

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

  currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, "invalidCurrency"),

  defaultLocale: z.enum(["en", "fr"]),
});