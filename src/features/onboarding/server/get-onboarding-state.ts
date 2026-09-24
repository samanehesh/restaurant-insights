import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/server/db";
import { branches } from "@/server/db/schema/branches";
import { businessHours } from "@/server/db/schema/business-hours";
import { restaurantMembers } from "@/server/db/schema/restaurant-members";
import { restaurants } from "@/server/db/schema/restaurants";

type RestaurantSummary = {
  id: string;
  name: string;
  role: "owner" | "manager" | "staff";
};

type BranchSummary = {
  id: string;
  name: string;
};

export type OnboardingState =
  | {
      stage: "restaurant";
    }
  | {
      stage: "branch";
      restaurant: RestaurantSummary;
    }
  | {
      stage: "hours";
      restaurant: RestaurantSummary;
      branch: BranchSummary;
    }
  | {
      stage: "complete";
      restaurant: RestaurantSummary;
      branch: BranchSummary;
    };

export async function getOnboardingState(
  userId: string,
): Promise<OnboardingState> {
  const [membership] = await db
    .select({
      id: restaurants.id,
      name: restaurants.name,
      role: restaurantMembers.role,
    })
    .from(restaurantMembers)
    .innerJoin(
      restaurants,
      eq(restaurantMembers.restaurantId, restaurants.id),
    )
    .where(eq(restaurantMembers.userId, userId))
    .limit(1);

  if (!membership) {
    return {
      stage: "restaurant",
    };
  }

  const restaurant: RestaurantSummary = {
    id: membership.id,
    name: membership.name,
    role: membership.role,
  };

  const [branchRecord] = await db
    .select({
      id: branches.id,
      name: branches.name,
    })
    .from(branches)
    .where(eq(branches.restaurantId, restaurant.id))
    .limit(1);

  if (!branchRecord) {
    return {
      stage: "branch",
      restaurant,
    };
  }

  const branch: BranchSummary = {
    id: branchRecord.id,
    name: branchRecord.name,
  };

  const savedHours = await db
    .select({
      dayOfWeek: businessHours.dayOfWeek,
    })
    .from(businessHours)
    .where(eq(businessHours.branchId, branch.id));

  const configuredDays = new Set(
    savedHours.map((hour) => hour.dayOfWeek),
  );

  if (configuredDays.size !== 7) {
    return {
      stage: "hours",
      restaurant,
      branch,
    };
  }

  return {
    stage: "complete",
    restaurant,
    branch,
  };
}