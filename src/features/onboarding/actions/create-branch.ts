"use server";

import { and, eq } from "drizzle-orm";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/server/db";
import { branches } from "@/server/db/schema/branches";
import { restaurantMembers } from "@/server/db/schema/restaurant-members";

import { createBranchSchema } from "../schemas/create-branch";

export type CreateBranchState = {
  success?: boolean;
  branchId?: string;
  message?:
    | "unauthenticated"
    | "unauthorized"
    | "duplicateBranch"
    | "creationFailed";
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function createBranch(
  _previousState: CreateBranchState,
  formData: FormData,
): Promise<CreateBranchState> {
  const validationResult = createBranchSchema.safeParse({
    restaurantId: formData.get("restaurantId"),
    name: formData.get("name"),
    addressLine1: formData.get("addressLine1"),
    addressLine2: formData.get("addressLine2"),
    city: formData.get("city"),
    region: formData.get("region"),
    postalCode: formData.get("postalCode"),
    country: formData.get("country"),
    timezone: formData.get("timezone"),
  });

  if (!validationResult.success) {
    return {
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

  const { restaurantId } = validationResult.data;

  /*
   * The restaurant ID came from a form field, so it cannot be
   * trusted by itself. Verify that the authenticated user is an
   * owner or manager of that specific restaurant.
   */
  const [membership] = await db
    .select({
      role: restaurantMembers.role,
    })
    .from(restaurantMembers)
    .where(
      and(
        eq(restaurantMembers.restaurantId, restaurantId),
        eq(restaurantMembers.userId, user.id),
      ),
    )
    .limit(1);

  if (
    !membership ||
    !["owner", "manager"].includes(membership.role)
  ) {
    return {
      message: "unauthorized",
    };
  }

  const [existingBranch] = await db
    .select({
      id: branches.id,
    })
    .from(branches)
    .where(
      and(
        eq(branches.restaurantId, restaurantId),
        eq(branches.name, validationResult.data.name),
      ),
    )
    .limit(1);

  if (existingBranch) {
    return {
      message: "duplicateBranch",
      branchId: existingBranch.id,
    };
  }

  try {
    const [branch] = await db
      .insert(branches)
      .values({
        restaurantId,
        name: validationResult.data.name,
        addressLine1:
          validationResult.data.addressLine1,
        addressLine2:
          validationResult.data.addressLine2,
        city: validationResult.data.city,
        region: validationResult.data.region,
        postalCode: validationResult.data.postalCode,
        country: validationResult.data.country,
        timezone: validationResult.data.timezone,
      })
      .returning({
        id: branches.id,
      });

    if (!branch) {
      throw new Error(
        "Branch insertion returned no record.",
      );
    }

    return {
      success: true,
      branchId: branch.id,
    };
  } catch (error) {
    console.error("Branch creation failed:", error);

    return {
      message: "creationFailed",
    };
  }
}