import { pgTable, text, timestamp, integer, uuid, decimal } from "drizzle-orm/pg-core";

export const routes = pgTable("routes", {
  id: uuid("id").defaultRandom().primaryKey(),
  startLocation: text("start_location").notNull(),
  destination: text("destination").notNull(),
  mileage: integer("mileage").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  notes: text("notes"),
  userID: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const places = pgTable("places", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  full_address: text("full_address").notNull(),
  addressLine1: text("address_line1"),
  addressLine2: text("address_line2"),
  city: text("city"),
  region: text("region"),
  postcode: text("postcode"),
  country: text("country"),
  // High precision coordinates stored as decimal
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  userID: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});