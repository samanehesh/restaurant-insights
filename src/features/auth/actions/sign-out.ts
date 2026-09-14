"use server";

import { hasLocale } from "next-intl";
import { redirect } from "next/navigation";

import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";

export async function signOut(formData: FormData) {
  const requestedLocale = formData.get("locale");

  const locale =
    typeof requestedLocale === "string" &&
    hasLocale(routing.locales, requestedLocale)
      ? requestedLocale
      : routing.defaultLocale;

  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Supabase sign-out failed:", error.message);
    redirect(`/${locale}/onboarding?error=signout`);
  }

  redirect(`/${locale}/sign-in`);
}