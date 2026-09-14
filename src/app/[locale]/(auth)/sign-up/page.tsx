import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SignUpForm } from "@/features/auth/components/sign-up-form";

export default async function SignUpPage() {
  const t = await getTranslations("SignUp");

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

        <SignUpForm />
        <p className="mt-6 text-center text-sm text-gray-600">
            {t("hasAccount")}{" "}
            <Link
                className="font-medium text-black underline"
                href="/sign-in"
            >
                {t("signIn")}
            </Link>
        </p>
      </section>
    </main>
  );
}