import { z } from "zod";

// Base route schema with common fields and validation
const baseRouteFields = {
  fromPlaceId: z.string().uuid(),
  toPlaceId: z.string().uuid(),
  startMileage: z.number().int().nonnegative(),
  endMileage: z.number().int().nonnegative(),
  date: z.string().datetime(),
  notes: z.string().nullable(),
};

// Validation refinement function
const validateMileage = (schema: any) =>
  schema.refine(
    (data: any) => data.endMileage > data.startMileage,
    {
      message: "End mileage must be greater than start mileage",
      path: ["endMileage"],
    }
  );

// Database model schema (with Date objects)
export const routeModelSchema = validateMileage(
  z.object({
    id: z.string().uuid(),
    ...baseRouteFields,
    date: z.date(), // Override date type for DB
    distance: z.number().int(),
    userID: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
);

// API/Frontend schema (with ISO strings)
export const routeSchema = z.object({
  id: z.string().uuid(),
  fromPlaceId: z.string().uuid(),
  toPlaceId: z.string().uuid(),
  startMileage: z.number().int(),
  endMileage: z.number().int(),
  distance: z.number().int(),
  date: z.string().datetime(),
  notes: z.string().nullable(),
  userID: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const routeWithStatsSchema = routeSchema.extend({
  stats: z.object({
    timesDriven: z.number().int().positive(),
    avgMileage: z.number().nonnegative(),
    lastDriven: z.string().datetime(),
  }),
});

// Form data schema
export const routeFormSchema = validateMileage(z.object({ ...baseRouteFields }));

// Update route schema (all fields optional)
export const updateRouteSchema = z.object({
  ...Object.fromEntries(
    Object.entries(baseRouteFields).map(([key, schema]) => [key, schema.optional()])
  ),
});

// Most Frequent Route schema
export const mostFrequentRouteSchema = z.object({
  fromPlaceId: z.string().uuid(),
  toPlaceId: z.string().uuid(),
  fromName: z.string(),
  toName: z.string(),
  count: z.number().int().positive(),
});

// Complete Route Stats schema
export const routeStatsSchema = z.object({
  totalRoutes: z.number().int().nonnegative(),
  totalMiles: z.number().nonnegative(),
  avgMileagePerRoute: z.number().nonnegative(),
  mostFrequentRoute: mostFrequentRouteSchema.nullable(),
});

export type RouteModel = z.infer<typeof routeModelSchema>;
export type Route = z.infer<typeof routeSchema>;
export type RouteFormData = z.infer<typeof routeFormSchema>;
export type MostFrequentRoute = z.infer<typeof mostFrequentRouteSchema>;
export type RouteStats = z.infer<typeof routeStatsSchema>;
export type RouteWithStats = z.infer<typeof routeWithStatsSchema>;