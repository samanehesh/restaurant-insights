"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  createBranch,
  type CreateBranchState,
} from "../actions/create-branch";
import {
  countries,
  timezones,
} from "../restaurant-options";

const initialState: CreateBranchState = {};

type CreateBranchFormProps = {
  restaurantId: string;
  defaultCountry: string;
  defaultTimezone: string;
};

export function CreateBranchForm({
  restaurantId,
  defaultCountry,
  defaultTimezone,
}: CreateBranchFormProps) {
  const t = useTranslations("BranchOnboarding");

  const [state, formAction, pending] = useActionState(
    createBranch,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      toast.success(t("toast.created"));
      return;
    }

    if (state.message) {
      toast.error(t(`toast.${state.message}`));
    }
  }, [state.success, state.message, t]);

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

  const fields = [
    "name",
    "addressLine1",
    "addressLine2",
    "city",
    "region",
    "postalCode",
  ] as const;

  const errors = Object.fromEntries(
    fields.map((field) => [field, getError(field)]),
  );

  const countryError = getError("country");
  const timezoneError = getError("timezone");

  return (
    <form action={formAction} className="space-y-5">
      <input
        name="restaurantId"
        type="hidden"
        value={restaurantId}
      />

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="name">
          {t("fields.name")}
        </label>

        <input
          aria-describedby={errors.name ? "name-error" : undefined}
          aria-invalid={Boolean(errors.name)}
          className="w-full rounded-md border px-3 py-2"
          id="name"
          maxLength={150}
          name="name"
          placeholder={t("fields.namePlaceholder")}
          required
        />

        {errors.name && (
          <p className="mt-1 text-sm text-red-600" id="name-error">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label
          className="mb-1 block text-sm font-medium"
          htmlFor="addressLine1"
        >
          {t("fields.addressLine1")}
        </label>

        <input
          aria-describedby={
            errors.addressLine1 ? "addressLine1-error" : undefined
          }
          aria-invalid={Boolean(errors.addressLine1)}
          autoComplete="address-line1"
          className="w-full rounded-md border px-3 py-2"
          id="addressLine1"
          maxLength={200}
          name="addressLine1"
          required
        />

        {errors.addressLine1 && (
          <p
            className="mt-1 text-sm text-red-600"
            id="addressLine1-error"
          >
            {errors.addressLine1}
          </p>
        )}
      </div>

      <div>
        <label
          className="mb-1 block text-sm font-medium"
          htmlFor="addressLine2"
        >
          {t("fields.addressLine2")}
        </label>

        <input
          aria-describedby={
            errors.addressLine2 ? "addressLine2-error" : undefined
          }
          aria-invalid={Boolean(errors.addressLine2)}
          autoComplete="address-line2"
          className="w-full rounded-md border px-3 py-2"
          id="addressLine2"
          maxLength={200}
          name="addressLine2"
        />

        {errors.addressLine2 && (
          <p
            className="mt-1 text-sm text-red-600"
            id="addressLine2-error"
          >
            {errors.addressLine2}
          </p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="city">
            {t("fields.city")}
          </label>

          <input
            aria-describedby={errors.city ? "city-error" : undefined}
            aria-invalid={Boolean(errors.city)}
            autoComplete="address-level2"
            className="w-full rounded-md border px-3 py-2"
            id="city"
            maxLength={100}
            name="city"
            required
          />

          {errors.city && (
            <p className="mt-1 text-sm text-red-600" id="city-error">
              {errors.city}
            </p>
          )}
        </div>

        <div>
          <label
            className="mb-1 block text-sm font-medium"
            htmlFor="region"
          >
            {t("fields.region")}
          </label>

          <input
            aria-describedby={
              errors.region ? "region-error" : undefined
            }
            aria-invalid={Boolean(errors.region)}
            autoComplete="address-level1"
            className="w-full rounded-md border px-3 py-2"
            id="region"
            maxLength={100}
            name="region"
            required
          />

          {errors.region && (
            <p
              className="mt-1 text-sm text-red-600"
              id="region-error"
            >
              {errors.region}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            className="mb-1 block text-sm font-medium"
            htmlFor="postalCode"
          >
            {t("fields.postalCode")}
          </label>

          <input
            aria-describedby={
              errors.postalCode ? "postalCode-error" : undefined
            }
            aria-invalid={Boolean(errors.postalCode)}
            autoComplete="postal-code"
            className="w-full rounded-md border px-3 py-2"
            id="postalCode"
            maxLength={20}
            name="postalCode"
            required
          />

          {errors.postalCode && (
            <p
              className="mt-1 text-sm text-red-600"
              id="postalCode-error"
            >
              {errors.postalCode}
            </p>
          )}
        </div>

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
            defaultValue={defaultCountry}
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
          defaultValue={defaultTimezone}
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