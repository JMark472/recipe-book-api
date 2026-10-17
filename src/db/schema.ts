import { pgTable, pgEnum, uuid, text, timestamp, integer, index } from "drizzle-orm/pg-core";

export const role = pgEnum("Role", ["USER", "ADMIN"]);
export const tokenType = pgEnum("TokenType", ["REFRESH", "EMAIL_VERIFY"]);

export const users = pgTable("user", {
  id: uuid().defaultRandom().primaryKey(),
  email: text().unique(), password: text(), name: text(),
  emailVerified: timestamp("email_verified", { withTimezone: true, mode: "string" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow().notNull().$onUpdate(() => new Date().toISOString()),
  role: role().default("USER").notNull(),
});

export const recipes = pgTable("recipe", {
  id: uuid().defaultRandom().primaryKey(), name: text().notNull(), cuisine: text().notNull(),
  mealType: text().array().notNull(), difficulty: text().notNull(), cookTimeMinutes: integer().notNull(),
  tags: text().array().notNull(), image: text().notNull(), ingredients: text().array().notNull(), instructions: text().array().notNull(),
  userId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
}, (table) => [index("recipe_owner_idx").on(table.userId)]);

export const tokens = pgTable("token", {
  id: uuid().defaultRandom().primaryKey(), type: tokenType().notNull(), token: text().unique().notNull(),
  expiresAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
  consumedAt: timestamp("consumed_at", { withTimezone: true, mode: "string" }),
  revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "string" }),
  userId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
}, (table) => [index("token_owner_type_idx").on(table.userId, table.type)]);
