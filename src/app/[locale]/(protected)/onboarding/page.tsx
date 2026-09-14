import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";

type OnboardingPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function OnboardingPage({
  params,
}: OnboardingPageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const t = await getTranslations({
    locale,
    namespace: "Onboarding",
  });

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-24">
      <section className="mx-auto max-w-3xl rounded-xl border bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              {t("eyebrow")}
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              {t("title")}
            </h1>

            <p className="mt-3 text-gray-600">
              {t("description")}
            </p>
          </div>

          <SignOutButton
            label={t("signOut")}
            locale={locale}
          />
        </div>

        <div className="mt-8 rounded-lg border bg-gray-50 p-4">
          <p className="text-sm text-gray-500">
            {t("signedInAs")}
          </p>

          <p className="mt-1 font-medium">
            {user?.email}
          </p>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold">
            {t("nextStepTitle")}
          </h2>

          <p className="mt-2 text-gray-600">
            {t("nextStepDescription")}
          </p>
        </div>
      </section>
    </main>
  );
}