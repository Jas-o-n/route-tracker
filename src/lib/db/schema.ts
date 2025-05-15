import { pgTable, text, timestamp, serial, integer, uuid } from "drizzle-orm/pg-core";

export const routes = pgTable("routes", {
  id: uuid("id").defaultRandom().primaryKey(),
  startLocation: text("start_location").notNull(),
  destination: text("destination").notNull(),
  mileage: integer("mileage").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  notes: text("notes"),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});