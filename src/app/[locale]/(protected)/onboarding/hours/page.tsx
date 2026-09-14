import { and, eq } from "drizzle-orm";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { BusinessHoursForm } from "@/features/onboarding/components/business-hours-form";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/server/db";
import { branches } from "@/server/db/schema/branches";
import { businessHours } from "@/server/db/schema/business-hours";
import { restaurantMembers } from "@/server/db/schema/restaurant-members";

type HoursOnboardingPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function HoursOnboardingPage({
  params,
}: HoursOnboardingPageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const t = await getTranslations({
    locale,
    namespace: "HoursOnboarding",
  });

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/sign-in`);
  }

  const [branch] = await db
    .select({
      id: branches.id,
      name: branches.name,
    })
    .from(branches)
    .innerJoin(
      restaurantMembers,
      and(
        eq(
          restaurantMembers.restaurantId,
          branches.restaurantId,
        ),
        eq(restaurantMembers.userId, user.id),
      ),
    )
    .limit(1);

  if (!branch) {
    redirect(`/${locale}/onboarding/branch`);
  }

  const savedHours = await db
    .select({
      id: businessHours.id,
    })
    .from(businessHours)
    .where(eq(businessHours.branchId, branch.id));

  const hoursAreComplete = savedHours.length === 7;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-24">
      <section className="mx-auto max-w-4xl rounded-xl border bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              {t("eyebrow")}
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              {t("title")}
            </h1>

            <p className="mt-3 text-gray-600">
              {t("description", {
                branch: branch.name,
              })}
            </p>
          </div>

          <SignOutButton
            label={t("signOut")}
            locale={locale}
          />
        </div>

        <div className="mt-8">
          {hoursAreComplete ? (
            <div
              className="rounded-lg border border-blue-300 bg-blue-50 p-5 text-blue-900"
              role="status"
            >
              <h2 className="font-semibold">
                {t("existingTitle")}
              </h2>

              <p className="mt-2 text-sm">
                {t("existingDescription")}
              </p>
            </div>
          ) : (
            <BusinessHoursForm branchId={branch.id} />
          )}
        </div>
      </section>
    </main>
  );
}