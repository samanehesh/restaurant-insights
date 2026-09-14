"use client";

import { useActionState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  signUp,
  type SignUpState,
} from "../actions/sign-up";

const initialState: SignUpState = {};

export function SignUpForm() {
  const locale = useLocale();
  const t = useTranslations("SignUp");

  const [state, formAction, pending] = useActionState(
    signUp,
    initialState,
  );
    useEffect(() => {
        if (state.success) {
        toast.success(t("toast.success"));
        return;
        }

        if (state.message) {
        toast.error(t("toast.signupFailed"));
        }
    }, [state.success, state.message, t]);

  function getError(field: string) {
    const errorCode = state.fieldErrors?.[field]?.[0];

    return errorCode ? t(`validation.${errorCode}`) : undefined;
  }

  if (state.success) {
    return (
      <div
        className="rounded-lg border border-green-300 bg-green-50 p-4 text-green-800"
        role="status"
      >
        <h2 className="font-semibold">
          {t("successTitle")}
        </h2>

        <p className="mt-1 text-sm">
          {t("successMessage")}
        </p>
      </div>
    );
  }

  const fullNameError = getError("fullName");
  const emailError = getError("email");
  const passwordError = getError("password");
  const confirmPasswordError = getError("confirmPassword");

  return (
    <form action={formAction} className="space-y-5">
      <input name="locale" type="hidden" value={locale} />

      <div>
        <label
          className="mb-1 block text-sm font-medium"
          htmlFor="fullName"
        >
          {t("fullName")}
        </label>

        <input
          aria-describedby={
            fullNameError ? "fullName-error" : undefined
          }
          aria-invalid={Boolean(fullNameError)}
          autoComplete="name"
          className="w-full rounded-md border px-3 py-2"
          id="fullName"
          name="fullName"
          required
          type="text"
        />

        {fullNameError && (
          <p
            className="mt-1 text-sm text-red-600"
            id="fullName-error"
          >
            {fullNameError}
          </p>
        )}
      </div>

      <div>
        <label
          className="mb-1 block text-sm font-medium"
          htmlFor="email"
        >
          {t("email")}
        </label>

        <input
          aria-describedby={emailError ? "email-error" : undefined}
          aria-invalid={Boolean(emailError)}
          autoComplete="email"
          className="w-full rounded-md border px-3 py-2"
          id="email"
          name="email"
          required
          type="email"
        />

        {emailError && (
          <p className="mt-1 text-sm text-red-600" id="email-error">
            {emailError}
          </p>
        )}
      </div>

      <div>
        <label
          className="mb-1 block text-sm font-medium"
          htmlFor="password"
        >
          {t("password")}
        </label>

        <input
          aria-describedby={
            passwordError ? "password-error" : undefined
          }
          aria-invalid={Boolean(passwordError)}
          autoComplete="new-password"
          className="w-full rounded-md border px-3 py-2"
          id="password"
          name="password"
          required
          type="password"
        />

        {passwordError && (
          <p
            className="mt-1 text-sm text-red-600"
            id="password-error"
          >
            {passwordError}
          </p>
        )}
      </div>

      <div>
        <label
          className="mb-1 block text-sm font-medium"
          htmlFor="confirmPassword"
        >
          {t("confirmPassword")}
        </label>

        <input
          aria-describedby={
            confirmPasswordError
              ? "confirmPassword-error"
              : undefined
          }
          aria-invalid={Boolean(confirmPasswordError)}
          autoComplete="new-password"
          className="w-full rounded-md border px-3 py-2"
          id="confirmPassword"
          name="confirmPassword"
          required
          type="password"
        />

        {confirmPasswordError && (
          <p
            className="mt-1 text-sm text-red-600"
            id="confirmPassword-error"
          >
            {confirmPasswordError}
          </p>
        )}
      </div>

      {state.message && (
        <p className="text-sm text-red-600" role="alert">
          {t(state.message)}
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