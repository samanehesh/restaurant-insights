"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const nextLocale = locale === "en" ? "fr" : "en";

  function changeLanguage() {
    startTransition(() => {
      router.replace(pathname, {
        locale: nextLocale,
      });
    });
  }

  return (
    <button
      type="button"
      onClick={changeLanguage}
      disabled={isPending}
      aria-label={
        nextLocale === "fr"
          ? "Passer au français"
          : "Switch to English"
      }
      className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-wait disabled:opacity-60"
    >
      {isPending
        ? "..."
        : nextLocale === "fr"
          ? "Français"
          : "English"}
    </button>
  );
}