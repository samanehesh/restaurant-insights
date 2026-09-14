import { hasLocale } from "next-intl";
import { redirect } from "next/navigation";

import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";

type ProtectedLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}>;

export default async function ProtectedLayout({
  children,
  params,
}: ProtectedLayoutProps) {
  const { locale } = await params;

  const safeLocale = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${safeLocale}/sign-in`);
  }

  return children;
}