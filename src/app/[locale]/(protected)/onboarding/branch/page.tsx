import { eq } from "drizzle-orm";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { CreateBranchForm } from "@/features/onboarding/components/create-branch-form";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/server/db";
import { branches } from "@/server/db/schema/branches";
import { restaurantMembers } from "@/server/db/schema/restaurant-members";
import { restaurants } from "@/server/db/schema/restaurants";

type BranchOnboardingPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function BranchOnboardingPage({
  params,
}: BranchOnboardingPageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const t = await getTranslations({
    locale,
    namespace: "BranchOnboarding",
  });

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/sign-in`);
  }

  const [membership] = await db
    .select({
      restaurantId: restaurantMembers.restaurantId,
      restaurantName: restaurants.name,
      country: restaurants.country,
      timezone: restaurants.timezone,
    })
    .from(restaurantMembers)
    .innerJoin(
      restaurants,
      eq(restaurantMembers.restaurantId, restaurants.id),
    )
    .where(eq(restaurantMembers.userId, user.id))
    .limit(1);

  if (!membership) {
    redirect(`/${locale}/onboarding`);
  }

  const [existingBranch] = await db
    .select({
      id: branches.id,
      name: branches.name,
    })
    .from(branches)
    .where(eq(branches.restaurantId, membership.restaurantId))
    .limit(1);

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
              {t("description", {
                restaurant: membership.restaurantName,
              })}
            </p>
          </div>

          <SignOutButton
            label={t("signOut")}
            locale={locale}
          />
        </div>

        <div className="mt-8">
          {existingBranch ? (
            <div
              className="rounded-lg border border-blue-300 bg-blue-50 p-5 text-blue-900"
              role="status"
            >
              <h2 className="font-semibold">
                {t("existingTitle")}
              </h2>

              <p className="mt-2 text-sm">
                {t("existingDescription", {
                  branch: existingBranch.name,
                })}
              </p>
            </div>
          ) : (
            <CreateBranchForm
              defaultCountry={membership.country}
              defaultTimezone={membership.timezone}
              restaurantId={membership.restaurantId}
            />
          )}
        </div>
      </section>
    </main>
  );
}