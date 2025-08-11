import { pgTable, text, timestamp, integer, uuid, decimal, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

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

export const routes = pgTable("routes", {
  id: uuid("id").defaultRandom().primaryKey(),
  fromPlaceId: uuid("from_place_id").references(() => places.id).notNull(),
  toPlaceId: uuid("to_place_id").references(() => places.id).notNull(),
  startMileage: integer("start_mileage").notNull(),
  endMileage: integer("end_mileage").notNull(),
  // We'll calculate the distance in the application layer
  distance: integer("distance").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  notes: text("notes"),
  isWork: boolean("is_work").notNull().default(false),
  userID: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const routesRelations = relations(routes, ({ one }) => ({
  fromPlace: one(places, {
    fields: [routes.fromPlaceId],
    references: [places.id],
  }),
  toPlace: one(places, {
    fields: [routes.toPlaceId],
    references: [places.id],
  }),
}));