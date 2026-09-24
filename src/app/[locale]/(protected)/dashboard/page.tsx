import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { getOnboardingState } from "@/features/onboarding/server/get-onboarding-state";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";

type DashboardPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function DashboardPage({
  params,
}: DashboardPageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/sign-in`);
  }

  const onboardingState = await getOnboardingState(user.id);

  if (onboardingState.stage === "restaurant") {
    redirect(`/${locale}/onboarding`);
  }

  if (onboardingState.stage === "branch") {
    redirect(`/${locale}/onboarding/branch`);
  }

  if (onboardingState.stage === "hours") {
    redirect(`/${locale}/onboarding/hours`);
  }

  const t = await getTranslations({
    locale,
    namespace: "Dashboard",
  });

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-6 rounded-xl border bg-white p-8 shadow-sm sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              {t("eyebrow")}
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              {t("title", {
                restaurant: onboardingState.restaurant.name,
              })}
            </h1>

            <p className="mt-3 text-gray-600">
              {t("description")}
            </p>
          </div>

          <SignOutButton
            label={t("signOut")}
            locale={locale}
          />
        </header>

        <section
          aria-labelledby="setup-summary-title"
          className="mt-8"
        >
          <h2
            className="text-xl font-semibold"
            id="setup-summary-title"
          >
            {t("setupSummary")}
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <article className="rounded-xl border bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                {t("restaurant")}
              </p>

              <p className="mt-2 text-lg font-semibold">
                {onboardingState.restaurant.name}
              </p>
            </article>

            <article className="rounded-xl border bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                {t("primaryBranch")}
              </p>

              <p className="mt-2 text-lg font-semibold">
                {onboardingState.branch.name}
              </p>
            </article>

            <article className="rounded-xl border bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                {t("businessHours")}
              </p>

              <p className="mt-2 text-lg font-semibold text-green-700">
                {t("configured")}
              </p>
            </article>
          </div>
        </section>

        <section className="mt-8 rounded-xl border bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold">
            {t("nextTitle")}
          </h2>

          <p className="mt-2 text-gray-600">
            {t("nextDescription")}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "menu",
              "analytics",
              "recommendations",
              "settings",
            ].map((module) => (
              <div
                className="rounded-lg border bg-gray-50 p-4"
                key={module}
              >
                <p className="font-medium">
                  {t(`modules.${module}`)}
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  {t("comingSoon")}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}