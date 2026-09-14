"use client";

import { useActionState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";

import {
  signIn,
  type SignInState,
} from "../actions/sign-in";

const initialState: SignInState = {};

type SignInFormProps = {
  confirmationStatus?: "success" | "error";
};

export function SignInForm({
  confirmationStatus,
}: SignInFormProps) {
  const t = useTranslations("SignIn");
  const router = useRouter();
  const confirmationToastShown = useRef(false);

  const [state, formAction, pending] = useActionState(
    signIn,
    initialState,
  );

  useEffect(() => {
    if (
      confirmationToastShown.current ||
      !confirmationStatus
    ) {
      return;
    }

    confirmationToastShown.current = true;

    if (confirmationStatus === "success") {
      toast.success(t("toast.emailConfirmed"));
    } else {
      toast.error(t("toast.confirmationFailed"));
    }
  }, [confirmationStatus, t]);

  useEffect(() => {
    if (!state.success) {
      return;
    }

    toast.success(t("toast.signedIn"));
    router.replace("/");
    router.refresh();
  }, [router, state.success, t]);

  useEffect(() => {
    if (state.message) {
      toast.error(t(`toast.${state.message}`));
    }
  }, [state.message, t]);

  function getError(field: string) {
    const errorCode = state.fieldErrors?.[field]?.[0];

    return errorCode
      ? t(`validation.${errorCode}`)
      : undefined;
  }

  const emailError = getError("email");
  const passwordError = getError("password");

  return (
    <form action={formAction} className="space-y-5">
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
          <p
            className="mt-1 text-sm text-red-600"
            id="email-error"
          >
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
          autoComplete="current-password"
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