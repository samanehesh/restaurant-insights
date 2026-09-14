"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("LanguageSwitcher");

  const [isPending, startTransition] = useTransition();

  const nextLocale = locale === "en" ? "fr" : "en";

  function changeLanguage() {
    startTransition(() => {
      router.replace(pathname, {
        locale: nextLocale,
      });
    });
  }

  const buttonLabel =
    nextLocale === "fr"
      ? t("switchToFrench")
      : t("switchToEnglish");

  const languageName =
    nextLocale === "fr"
      ? t("french")
      : t("english");

  return (
    <button
      aria-label={buttonLabel}
      className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-wait disabled:opacity-60"
      disabled={isPending}
      onClick={changeLanguage}
      type="button"
    >
      {isPending ? t("changing") : languageName}
    </button>
  );
}