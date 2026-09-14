import { getTranslations } from "next-intl/server";

import { SignInForm } from "@/features/auth/components/sign-in-form";
import { Link } from "@/i18n/navigation";

type SignInPageProps = {
  searchParams: Promise<{
    confirmation?: string;
  }>;
};

export default async function SignInPage({
  searchParams,
}: SignInPageProps) {
  const t = await getTranslations("SignIn");
  const { confirmation } = await searchParams;

  const confirmationStatus =
    confirmation === "success"
      ? "success"
      : confirmation === "error"
        ? "error"
        : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <section className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">
            {t("title")}
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            {t("description")}
          </p>
        </header>

        <SignInForm
          confirmationStatus={confirmationStatus}
        />

        <p className="mt-6 text-center text-sm text-gray-600">
          {t("noAccount")}{" "}
          <Link
            className="font-medium text-black underline"
            href="/sign-up"
          >
            {t("createAccount")}
          </Link>
        </p>
      </section>
    </main>
  );
}