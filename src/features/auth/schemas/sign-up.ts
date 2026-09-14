import { z } from "zod";

export const signUpSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "fullNameTooShort")
      .max(150, "fullNameTooLong"),

    email: z
      .string()
      .trim()
      .email("invalidEmail"),

    password: z
      .string()
      .min(8, "passwordTooShort")
      .max(72, "passwordTooLong"),

    confirmPassword: z.string(),

    locale: z.enum(["en", "fr"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwordsDoNotMatch",
    path: ["confirmPassword"],
  });