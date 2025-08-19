import { z } from "zod";

// Base route schema with common fields and validation
const baseRouteFields = {
  fromPlaceId: z.string().uuid().nullable(),
  toPlaceId: z.string().uuid().nullable(),
  startMileage: z.number().int().nonnegative(),
  endMileage: z.number().int().nonnegative(),
  date: z.string().datetime(),
  notes: z.string().nullable(),
  isWork: z.boolean().optional().default(false),
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
  fromPlaceId: z.string().uuid().nullable(),
  toPlaceId: z.string().uuid().nullable(),
  startMileage: z.number().int(),
  endMileage: z.number().int(),
  distance: z.number().int(),
  date: z.string().datetime(),
  notes: z.string().nullable(),
  isWork: z.boolean(),
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
const placeNullable = z.preprocess((val) => (val === "" ? null : val), z.string().uuid().nullable());

export const routeFormSchema = validateMileage(
  z
    .object({
      fromPlaceId: placeNullable,
      toPlaceId: placeNullable,
      startMileage: baseRouteFields.startMileage,
      endMileage: baseRouteFields.endMileage,
      date: baseRouteFields.date,
      notes: baseRouteFields.notes,
      isWork: baseRouteFields.isWork,
    })
    .superRefine((data, ctx) => {
      // If this is a work trip (isWork === true) both places must be provided as non-null UUIDs.
      if (data.isWork) {
        if (data.fromPlaceId == null) {
          ctx.addIssue({ path: ["fromPlaceId"], code: z.ZodIssueCode.custom, message: "Start location is required for work trips" });
        }
        if (data.toPlaceId == null) {
          ctx.addIssue({ path: ["toPlaceId"], code: z.ZodIssueCode.custom, message: "Destination is required for work trips" });
        }
      }
    })
);

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
  totalKilometers: z.number().nonnegative(),
  totalKilometersToday: z.number().nonnegative(),
  totalKilometersThisMonth: z.number().nonnegative(),
});

export type RouteModel = z.infer<typeof routeModelSchema>;
export type Route = z.infer<typeof routeSchema>;
export type RouteFormData = z.infer<typeof routeFormSchema>;
export type MostFrequentRoute = z.infer<typeof mostFrequentRouteSchema>;
export type RouteStats = z.infer<typeof routeStatsSchema>;
export type RouteWithStats = z.infer<typeof routeWithStatsSchema>;