import { pgTable, text, serial, integer, boolean, jsonb, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

// Perfumes table
export const perfumes = pgTable("perfumes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  rating: real("rating").notNull().default(0),
  reviews: integer("reviews").notNull().default(0),
  gender: text("gender").array().notNull(),
  fragrance_type: text("fragrance_type").array().notNull(),
  occasions: text("occasions").array().notNull(),
  image_url: text("image_url"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertPerfumeSchema = createInsertSchema(perfumes).pick({
  name: true,
  brand: true,
  description: true,
  price: true,
  rating: true,
  reviews: true,
  gender: true,
  fragrance_type: true,
  occasions: true,
  image_url: true,
});

// User preferences table
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id),
  gender: text("gender"),
  age_range: text("age_range"),
  fragrance_types: text("fragrance_types").array(),
  occasions: text("occasions").array(),
  intensity: integer("intensity"),
  budget: text("budget"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).pick({
  user_id: true,
  gender: true,
  age_range: true,
  fragrance_types: true,
  occasions: true,
  intensity: true,
  budget: true,
  notes: true,
});

// Email subscriptions table
export const emailSubscriptions = pgTable("email_subscriptions", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  consented: boolean("consented").notNull().default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertEmailSubscriptionSchema = createInsertSchema(emailSubscriptions).pick({
  email: true,
  consented: true,
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  preferences: many(userPreferences),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.user_id],
    references: [users.id],
  }),
}));

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPerfume = z.infer<typeof insertPerfumeSchema>;
export type Perfume = typeof perfumes.$inferSelect;

export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;

export type InsertEmailSubscription = z.infer<typeof insertEmailSubscriptionSchema>;
export type EmailSubscription = typeof emailSubscriptions.$inferSelect;
