"use server";

import { createClient } from "@/lib/supabase/server";

import { signInSchema } from "../schemas/sign-in";

export type SignInState = {
  success?: boolean;
  message?: "invalidCredentials" | "signInFailed";
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function signIn(
  _previousState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const result = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  });

  if (error) {
    console.error("Supabase sign-in failed:", error.message);

    if (
      error.message.toLowerCase().includes("invalid login credentials") ||
      error.message.toLowerCase().includes("email not confirmed")
    ) {
      return {
        message: "invalidCredentials",
      };
    }

    return {
      message: "signInFailed",
    };
  }

  return {
    success: true,
  };
}