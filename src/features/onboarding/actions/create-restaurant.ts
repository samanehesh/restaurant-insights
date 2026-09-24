"use server";

import { eq, sql } from "drizzle-orm";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/server/db";
import { restaurantMembers } from "@/server/db/schema/restaurant-members";
import { restaurants } from "@/server/db/schema/restaurants";

import { createRestaurantSchema } from "../schemas/create-restaurant";

export type CreateRestaurantState = {
  success?: boolean;
  restaurantId?: string;
  message?:
    | "unauthenticated"
    | "alreadyHasRestaurant"
    | "creationFailed";
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function createRestaurant(
  _previousState: CreateRestaurantState,
  formData: FormData,
): Promise<CreateRestaurantState> {
  const validationResult = createRestaurantSchema.safeParse({
    name: formData.get("name"),
    country: formData.get("country"),
    timezone: formData.get("timezone"),
    currency: formData.get("currency"),
    defaultLocale: formData.get("defaultLocale"),
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

  try {
    const transactionResult = await db.transaction(
      async (transaction) => {
        /*
         * Prevent two nearly simultaneous submissions from
         * creating two first restaurants for the same user.
         * The lock is automatically released when this
         * transaction finishes.
         */
        await transaction.execute(
          sql`select pg_advisory_xact_lock(hashtext(${user.id}))`,
        );

        const [existingMembership] = await transaction
          .select({
            restaurantId: restaurantMembers.restaurantId,
          })
          .from(restaurantMembers)
          .where(eq(restaurantMembers.userId, user.id))
          .limit(1);

        if (existingMembership) {
          return {
            alreadyExists: true as const,
            restaurantId:
              existingMembership.restaurantId,
          };
        }

        const [restaurant] = await transaction
          .insert(restaurants)
          .values({
            name: validationResult.data.name,
            country: validationResult.data.country,
            timezone: validationResult.data.timezone,
            currency: validationResult.data.currency,
            defaultLocale:
              validationResult.data.defaultLocale,
          })
          .returning({
            id: restaurants.id,
          });

        if (!restaurant) {
          throw new Error(
            "Restaurant insertion returned no record.",
          );
        }

        await transaction.insert(restaurantMembers).values({
          restaurantId: restaurant.id,
          userId: user.id,
          role: "owner",
        });

        return {
          alreadyExists: false as const,
          restaurantId: restaurant.id,
        };
      },
    );

    if (transactionResult.alreadyExists) {
      return {
        message: "alreadyHasRestaurant",
        restaurantId: transactionResult.restaurantId,
      };
    }

    return {
      success: true,
      restaurantId: transactionResult.restaurantId,
    };
  } catch (error) {
    console.error("Restaurant creation failed:", error);

    return {
      message: "creationFailed",
    };
  }
}