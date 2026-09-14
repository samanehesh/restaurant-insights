"use server";

import { and, eq } from "drizzle-orm";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/server/db";
import { branches } from "@/server/db/schema/branches";
import { businessHours } from "@/server/db/schema/business-hours";
import { restaurantMembers } from "@/server/db/schema/restaurant-members";

import { daysOfWeek } from "../business-hours";
import { saveBusinessHoursSchema } from "../schemas/save-business-hours";

export type SaveBusinessHoursState = {
  success?: boolean;
  message?:
    | "unauthenticated"
    | "unauthorized"
    | "invalidHours"
    | "saveFailed";
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function saveBusinessHours(
  _previousState: SaveBusinessHoursState,
  formData: FormData,
): Promise<SaveBusinessHoursState> {
  const hours = daysOfWeek.map((day) => {
    const isClosed =
      formData.get(`${day}.isClosed`) === "on";

    return {
      dayOfWeek: day,
      isClosed,
      openTime: isClosed
        ? null
        : String(formData.get(`${day}.openTime`) ?? ""),
      closeTime: isClosed
        ? null
        : String(formData.get(`${day}.closeTime`) ?? ""),
    };
  });

  const validationResult = saveBusinessHoursSchema.safeParse({
    branchId: formData.get("branchId"),
    hours,
  });

  if (!validationResult.success) {
    console.error(
      "Business-hours validation failed:",
      validationResult.error.flatten(),
    );

    return {
      message: "invalidHours",
      fieldErrors:
        validationResult.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      message: "unauthenticated",
    };
  }

  const { branchId } = validationResult.data;

  /*
   * Verify that the branch belongs to a restaurant where the
   * authenticated user is an owner or manager.
   */
  const [authorizedBranch] = await db
    .select({
      branchId: branches.id,
      role: restaurantMembers.role,
    })
    .from(branches)
    .innerJoin(
      restaurantMembers,
      and(
        eq(
          restaurantMembers.restaurantId,
          branches.restaurantId,
        ),
        eq(restaurantMembers.userId, user.id),
      ),
    )
    .where(eq(branches.id, branchId))
    .limit(1);

  if (
    !authorizedBranch ||
    !["owner", "manager"].includes(authorizedBranch.role)
  ) {
    return {
      message: "unauthorized",
    };
  }

  try {
    await db.transaction(async (transaction) => {
      for (const hour of validationResult.data.hours) {
        await transaction
          .insert(businessHours)
          .values({
            branchId,
            dayOfWeek: hour.dayOfWeek,
            isClosed: hour.isClosed,
            openTime: hour.openTime,
            closeTime: hour.closeTime,
          })
          .onConflictDoUpdate({
            target: [
              businessHours.branchId,
              businessHours.dayOfWeek,
            ],
            set: {
              isClosed: hour.isClosed,
              openTime: hour.openTime,
              closeTime: hour.closeTime,
              updatedAt: new Date(),
            },
          });
      }
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Saving business hours failed:", error);

    return {
      message: "saveFailed",
    };
  }
}