import { z } from "zod";

// Database model schema (with Date objects)
export const routeModelSchema = z.object({
  id: z.string().uuid(),
  startLocation: z.string().min(1),
  destination: z.string().min(1),
  mileage: z.number().int().positive(),
  date: z.date(),
  notes: z.string().nullable(),
  userID: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// API/Frontend schema (with ISO strings)
export const routeSchema = z.object({
  id: z.string().uuid(),
  startLocation: z.string().min(1),
  destination: z.string().min(1),
  mileage: z.number().int().positive(),
  date: z.string().datetime(),
  notes: z.string().nullable(),
  userID: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Form data schema
export const routeFormSchema = z.object({
  startLocation: z.string().min(1),
  destination: z.string().min(1),
  mileage: z.number().int().positive(),
  date: z.string().datetime(),
  notes: z.string().nullable(),
});

// Most Frequent Route schema
export const mostFrequentRouteSchema = z.object({
  from: z.string(),
  to: z.string(),
  count: z.number().int().positive(),
});

// Complete Route Stats schema
export const routeStatsSchema = z.object({
  totalRoutes: z.number().int().nonnegative(),
  totalMiles: z.number().nonnegative(),
  avgMileagePerRoute: z.number().nonnegative(),
  mostFrequentRoute: mostFrequentRouteSchema.nullable(),
});

export const routeWithStatsSchema = routeSchema.extend({
  stats: routeStatsSchema,
});

// Schema for route updates (all fields optional)
export const updateRouteSchema = routeFormSchema.partial();

// Export all types
export type RouteModel = z.infer<typeof routeModelSchema>;
export type Route = z.infer<typeof routeSchema>;
export type RouteWithStats = z.infer<typeof routeWithStatsSchema>;
export type RouteFormData = z.infer<typeof routeFormSchema>;
export type RouteStats = z.infer<typeof routeStatsSchema>;
export type MostFrequentRoute = z.infer<typeof mostFrequentRouteSchema>;
export type UpdateRouteInput = z.infer<typeof updateRouteSchema>;