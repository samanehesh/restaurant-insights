import { relations } from "drizzle-orm";

import { aiRecommendations } from "./ai-recommendations";
import { branches } from "./branches";
import { businessHours } from "./business-hours";
import {
  menuCategories,
  menuCategoryTranslations,
} from "./menu-categories";
import { menuImports } from "./menu-imports";
import {
  menuItems,
  menuItemTranslations,
} from "./menu-items";
import { profiles } from "./profiles";
import { restaurantMembers } from "./restaurant-members";
import { restaurants } from "./restaurants";

export const profilesRelations = relations(
  profiles,
  ({ many }) => ({
    restaurantMemberships: many(restaurantMembers),
    menuImports: many(menuImports),
    reviewedRecommendations: many(aiRecommendations),
  }),
);

export const restaurantsRelations = relations(
  restaurants,
  ({ many }) => ({
    members: many(restaurantMembers),
    branches: many(branches),
    menuCategories: many(menuCategories),
    menuItems: many(menuItems),
    menuImports: many(menuImports),
    aiRecommendations: many(aiRecommendations),
  }),
);

export const restaurantMembersRelations = relations(
  restaurantMembers,
  ({ one }) => ({
    restaurant: one(restaurants, {
      fields: [restaurantMembers.restaurantId],
      references: [restaurants.id],
    }),

    user: one(profiles, {
      fields: [restaurantMembers.userId],
      references: [profiles.id],
    }),
  }),
);

export const branchesRelations = relations(
  branches,
  ({ one, many }) => ({
    restaurant: one(restaurants, {
      fields: [branches.restaurantId],
      references: [restaurants.id],
    }),

    businessHours: many(businessHours),
  }),
);

export const businessHoursRelations = relations(
  businessHours,
  ({ one }) => ({
    branch: one(branches, {
      fields: [businessHours.branchId],
      references: [branches.id],
    }),
  }),
);

export const menuCategoriesRelations = relations(
  menuCategories,
  ({ one, many }) => ({
    restaurant: one(restaurants, {
      fields: [menuCategories.restaurantId],
      references: [restaurants.id],
    }),

    translations: many(menuCategoryTranslations),
    items: many(menuItems),
  }),
);

export const menuCategoryTranslationsRelations = relations(
  menuCategoryTranslations,
  ({ one }) => ({
    category: one(menuCategories, {
      fields: [menuCategoryTranslations.categoryId],
      references: [menuCategories.id],
    }),
  }),
);

export const menuItemsRelations = relations(
  menuItems,
  ({ one, many }) => ({
    restaurant: one(restaurants, {
      fields: [menuItems.restaurantId],
      references: [restaurants.id],
    }),

    category: one(menuCategories, {
      fields: [
        menuItems.categoryId,
        menuItems.restaurantId,
      ],
      references: [
        menuCategories.id,
        menuCategories.restaurantId,
      ],
    }),

    translations: many(menuItemTranslations),
    recommendations: many(aiRecommendations),
  }),
);

export const menuItemTranslationsRelations = relations(
  menuItemTranslations,
  ({ one }) => ({
    menuItem: one(menuItems, {
      fields: [menuItemTranslations.menuItemId],
      references: [menuItems.id],
    }),
  }),
);

export const menuImportsRelations = relations(
  menuImports,
  ({ one }) => ({
    restaurant: one(restaurants, {
      fields: [menuImports.restaurantId],
      references: [restaurants.id],
    }),

    importer: one(profiles, {
      fields: [menuImports.importedBy],
      references: [profiles.id],
    }),
  }),
);

export const aiRecommendationsRelations = relations(
  aiRecommendations,
  ({ one }) => ({
    restaurant: one(restaurants, {
      fields: [aiRecommendations.restaurantId],
      references: [restaurants.id],
    }),

    menuItem: one(menuItems, {
      fields: [aiRecommendations.menuItemId],
      references: [menuItems.id],
    }),

    reviewer: one(profiles, {
      fields: [aiRecommendations.reviewedBy],
      references: [profiles.id],
    }),
  }),
);