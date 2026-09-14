import type { EmailOtpType } from "@supabase/supabase-js";
import { hasLocale } from "next-intl";
import { type NextRequest, NextResponse } from "next/server";

import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";

type ConfirmRouteContext = {
  params: Promise<{
    locale: string;
  }>;
};

export async function GET(
  request: NextRequest,
  context: ConfirmRouteContext,
) {
  const { locale } = await context.params;

  const safeLocale = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale;

  const code = request.nextUrl.searchParams.get("code");
  const tokenHash =
    request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");

  const supabase = await createClient();

  if (code) {
    const { error } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(
        new URL(
          `/${safeLocale}/sign-in?confirmation=success`,
          request.url,
        ),
      );
    }

    console.error(
      "Authorization code exchange failed:",
      error.message,
    );
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    });

    if (!error) {
      return NextResponse.redirect(
        new URL(
          `/${safeLocale}/sign-in?confirmation=error`,
          request.url,
        ),
      );
    }

    console.error(
      "Email token verification failed:",
      error.message,
    );
  }

  return NextResponse.redirect(
    new URL(
      `/${safeLocale}/sign-in?confirmation=error`,
      request.url,
    ),
  );
}