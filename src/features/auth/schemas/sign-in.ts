import { z } from "zod";

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .email("invalidEmail"),

  password: z
    .string()
    .min(1, "passwordRequired"),
});