"use client";

import {
  useActionState,
  useEffect,
  useState,
} from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import {
  saveBusinessHours,
  type SaveBusinessHoursState,
} from "../actions/save-business-hours";
import {
  daysOfWeek,
  type DayOfWeek,
} from "../business-hours";

const initialState: SaveBusinessHoursState = {};

const initialClosedDays: Record<DayOfWeek, boolean> = {
  monday: false,
  tuesday: false,
  wednesday: false,
  thursday: false,
  friday: false,
  saturday: false,
  sunday: true,
};

type BusinessHoursFormProps = {
  branchId: string;
};

export function BusinessHoursForm({
  branchId,
}: BusinessHoursFormProps) {
  const t = useTranslations("HoursOnboarding");
  const router = useRouter();
  const [closedDays, setClosedDays] =
    useState(initialClosedDays);

  const [state, formAction, pending] = useActionState(
    saveBusinessHours,
    initialState,
  );

    useEffect(() => {
        if (state.success) {
        toast.success(t("toast.saved"));
        router.replace("/dashboard");
        return;
        }

        if (state.message) {
        toast.error(t(`toast.${state.message}`));
        }
    }, [router, state.success, state.message, t]);

  function changeClosedStatus(
    day: DayOfWeek,
    isClosed: boolean,
  ) {
    setClosedDays((current) => ({
      ...current,
      [day]: isClosed,
    }));
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

  return (
    <form action={formAction} className="space-y-6">
      <input
        name="branchId"
        type="hidden"
        value={branchId}
      />

      <div className="hidden grid-cols-[1fr_110px_110px_90px] gap-4 px-3 text-sm font-medium text-gray-500 sm:grid">
        <span>{t("day")}</span>
        <span>{t("openTime")}</span>
        <span>{t("closeTime")}</span>
        <span>{t("closed")}</span>
      </div>

      <div className="space-y-3">
        {daysOfWeek.map((day) => {
          const isClosed = closedDays[day];
          const dayLabel = t(`days.${day}`);

          return (
            <div
              className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_110px_110px_90px] sm:items-center"
              key={day}
            >
              <p className="font-medium">
                {dayLabel}
              </p>

              <div>
                <label
                  className="mb-1 block text-xs text-gray-500 sm:sr-only"
                  htmlFor={`${day}-openTime`}
                >
                  {t("openTimeFor", {
                    day: dayLabel,
                  })}
                </label>

                <input
                  aria-label={t("openTimeFor", {
                    day: dayLabel,
                  })}
                  className="w-full rounded-md border px-2 py-2 disabled:bg-gray-100 disabled:text-gray-400"
                  defaultValue="09:00"
                  disabled={isClosed}
                  id={`${day}-openTime`}
                  name={`${day}.openTime`}
                  required={!isClosed}
                  type="time"
                />
              </div>

              <div>
                <label
                  className="mb-1 block text-xs text-gray-500 sm:sr-only"
                  htmlFor={`${day}-closeTime`}
                >
                  {t("closeTimeFor", {
                    day: dayLabel,
                  })}
                </label>

                <input
                  aria-label={t("closeTimeFor", {
                    day: dayLabel,
                  })}
                  className="w-full rounded-md border px-2 py-2 disabled:bg-gray-100 disabled:text-gray-400"
                  defaultValue="17:00"
                  disabled={isClosed}
                  id={`${day}-closeTime`}
                  name={`${day}.closeTime`}
                  required={!isClosed}
                  type="time"
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  checked={isClosed}
                  name={`${day}.isClosed`}
                  onChange={(event) =>
                    changeClosedStatus(
                      day,
                      event.target.checked,
                    )
                  }
                  type="checkbox"
                />

                {t("closed")}
              </label>
            </div>
          );
        })}
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