import { z } from "zod";

import { daysOfWeek } from "../business-hours";

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const businessHourSchema = z
  .object({
    dayOfWeek: z.enum(daysOfWeek),
    isClosed: z.boolean(),
    openTime: z.string().nullable(),
    closeTime: z.string().nullable(),
  })
  .superRefine((value, context) => {
    if (value.isClosed) {
      if (value.openTime !== null || value.closeTime !== null) {
        context.addIssue({
          code: "custom",
          message: "closedDayHasTimes",
        });
      }

      return;
    }

    if (!value.openTime || !timePattern.test(value.openTime)) {
      context.addIssue({
        code: "custom",
        message: "invalidOpenTime",
        path: ["openTime"],
      });
    }

    if (!value.closeTime || !timePattern.test(value.closeTime)) {
      context.addIssue({
        code: "custom",
        message: "invalidCloseTime",
        path: ["closeTime"],
      });
    }

    if (
      value.openTime &&
      value.closeTime &&
      value.openTime === value.closeTime
    ) {
      context.addIssue({
        code: "custom",
        message: "sameOpenAndCloseTime",
        path: ["closeTime"],
      });
    }
  });

export const saveBusinessHoursSchema = z.object({
  branchId: z.string().uuid("invalidBranch"),

  hours: z
    .array(businessHourSchema)
    .length(7, "sevenDaysRequired")
    .superRefine((hours, context) => {
      const submittedDays = new Set(
        hours.map((hour) => hour.dayOfWeek),
      );

      for (const day of daysOfWeek) {
        if (!submittedDays.has(day)) {
          context.addIssue({
            code: "custom",
            message: "sevenDaysRequired",
          });

          return;
        }
      }
    }),
});