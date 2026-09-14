import { getTranslations } from "next-intl/server";
export default async function HomePage() {
  const t = await getTranslations("HomePage");

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-50 px-6">

      <section className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          {t("title")}
        </h1>

        <p className="mt-4 text-lg text-slate-600">
          {t("description")}
        </p>

        <button
          className="mt-8 rounded-lg bg-slate-900 px-5 py-3 font-medium text-white"
          type="button"
        >
          {t("getStarted")}
        </button>
      </section>
    </main>
  );
}