"use server";

import { createClient } from "@/lib/supabase/server";
import { signUpSchema } from "../schemas/sign-up";
import { headers } from "next/headers";
export type SignUpState = {
  success?: boolean;
  message?: "signupFailed";
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function signUp(
  _previousState: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const result = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    locale: formData.get("locale"),
  });

  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  const { fullName, email, password, locale } = result.data;

  const supabase = await createClient();

  const requestHeaders = await headers();

  const origin =
    requestHeaders.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  const normalizedOrigin = origin.replace(/\/$/, "");

  const emailRedirectTo =
    `${normalizedOrigin}/${locale}/auth/confirm`;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
        emailRedirectTo,
        data: {
            full_name: fullName,
            preferred_locale: locale,
        },
    },
  });

  if (error) {
    console.error("Supabase signup failed:", error.message);

    return {
      message: "signupFailed",
    };
  }

  return {
    success: true,
  };
}