"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import {
  createRestaurant,
  type CreateRestaurantState,
} from "../actions/create-restaurant";
import {
  countries,
  currencies,
  timezones,
} from "../restaurant-options";

const initialState: CreateRestaurantState = {};

type CreateRestaurantFormProps = {
  locale: string;
};

export function CreateRestaurantForm({
  locale,
}: CreateRestaurantFormProps) {
  const t = useTranslations("RestaurantOnboarding");
  const [state, formAction, pending] = useActionState(
    createRestaurant,
    initialState,
  );
  const router = useRouter();
  useEffect(() => {
    if (state.success) {
      toast.success(t("toast.created"));
      router.replace("/onboarding/branch");
      return;
    }

    if (state.message) {
      toast.error(t(`toast.${state.message}`));
    }
  }, [router, state.success, state.message, t]);

  function getError(field: string) {
    const errorCode = state.fieldErrors?.[field]?.[0];

    return errorCode
      ? t(`validation.${errorCode}`)
      : undefined;
  }

  if (state.success) {
    return (
      <div
        className="rounded-lg border border-green-300 bg-green-50 p-5 text-green-900"
        role="status"
      >
        <h2 className="font-semibold">
          {t("successTitle")}
        </h2>

        <p className="mt-2 text-sm">
          {t("successDescription")}
        </p>
      </div>
    );
  }

  const nameError = getError("name");
  const countryError = getError("country");
  const timezoneError = getError("timezone");
  const currencyError = getError("currency");
  const defaultLocaleError = getError("defaultLocale");

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label
          className="mb-1 block text-sm font-medium"
          htmlFor="name"
        >
          {t("fields.name")}
        </label>

        <input
          aria-describedby={nameError ? "name-error" : undefined}
          aria-invalid={Boolean(nameError)}
          autoComplete="organization"
          className="w-full rounded-md border px-3 py-2"
          id="name"
          maxLength={200}
          name="name"
          placeholder={t("fields.namePlaceholder")}
          required
          type="text"
        />

        {nameError && (
          <p
            className="mt-1 text-sm text-red-600"
            id="name-error"
          >
            {nameError}
          </p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            className="mb-1 block text-sm font-medium"
            htmlFor="country"
          >
            {t("fields.country")}
          </label>

          <select
            aria-describedby={
              countryError ? "country-error" : undefined
            }
            aria-invalid={Boolean(countryError)}
            className="w-full rounded-md border bg-white px-3 py-2"
            defaultValue="CA"
            id="country"
            name="country"
            required
          >
            {countries.map((country) => (
              <option key={country.value} value={country.value}>
                {t(`countries.${country.labelKey}`)}
              </option>
            ))}
          </select>

          {countryError && (
            <p
              className="mt-1 text-sm text-red-600"
              id="country-error"
            >
              {countryError}
            </p>
          )}
        </div>

        <div>
          <label
            className="mb-1 block text-sm font-medium"
            htmlFor="currency"
          >
            {t("fields.currency")}
          </label>

          <select
            aria-describedby={
              currencyError ? "currency-error" : undefined
            }
            aria-invalid={Boolean(currencyError)}
            className="w-full rounded-md border bg-white px-3 py-2"
            defaultValue="CAD"
            id="currency"
            name="currency"
            required
          >
            {currencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>

          {currencyError && (
            <p
              className="mt-1 text-sm text-red-600"
              id="currency-error"
            >
              {currencyError}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          className="mb-1 block text-sm font-medium"
          htmlFor="timezone"
        >
          {t("fields.timezone")}
        </label>

        <select
          aria-describedby={
            timezoneError ? "timezone-error" : undefined
          }
          aria-invalid={Boolean(timezoneError)}
          className="w-full rounded-md border bg-white px-3 py-2"
          defaultValue="America/Vancouver"
          id="timezone"
          name="timezone"
          required
        >
          {timezones.map((timezone) => (
            <option key={timezone} value={timezone}>
              {timezone.replaceAll("_", " ")}
            </option>
          ))}
        </select>

        {timezoneError && (
          <p
            className="mt-1 text-sm text-red-600"
            id="timezone-error"
          >
            {timezoneError}
          </p>
        )}
      </div>

      <div>
        <label
          className="mb-1 block text-sm font-medium"
          htmlFor="defaultLocale"
        >
          {t("fields.defaultLanguage")}
        </label>

        <select
          aria-describedby={
            defaultLocaleError
              ? "defaultLocale-error"
              : undefined
          }
          aria-invalid={Boolean(defaultLocaleError)}
          className="w-full rounded-md border bg-white px-3 py-2"
          defaultValue={locale === "fr" ? "fr" : "en"}
          id="defaultLocale"
          name="defaultLocale"
          required
        >
          <option value="en">
            {t("languages.english")}
          </option>

          <option value="fr">
            {t("languages.french")}
          </option>
        </select>

        {defaultLocaleError && (
          <p
            className="mt-1 text-sm text-red-600"
            id="defaultLocale-error"
          >
            {defaultLocaleError}
          </p>
        )}
      </div>

      {state.message && (
        <p className="text-sm text-red-600" role="alert">
          {t(`errors.${state.message}`)}
        </p>
      )}

      <button
        className="w-full rounded-md bg-black px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}