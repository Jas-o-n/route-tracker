import { z } from "zod";

// Database model schema (dates as Date objects)
export const placeModelSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  full_address: z.string().min(1),
  addressLine1: z.string().nullable(),
  addressLine2: z.string().nullable(),
  city: z.string().nullable(),
  region: z.string().nullable(),
  postcode: z.string().nullable(),
  country: z.string().nullable(),
  latitude: z.string(),
  longitude: z.string(),
  userID: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// API/Frontend schema (dates as ISO strings, optional fields as undefined)
export const placeSchema = placeModelSchema.extend({
  address: z.string().min(1), // Make explicit that this maps from full_address
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  postcode: z.string().optional(),
  country: z.string().optional(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

const contextItemSchema = z.object({
  name: z.string(),
  // Add other properties if needed
});

// Mapbox Search Box API response schema
export const searchBoxFeatureSchema = z.object({
  name: z.string().min(1),
  mapbox_id: z.string().min(1),
  feature_type: z.string().min(1),
  address: z.string().min(1),
  full_address: z.string().min(1),
  place_formatted: z.string().min(1),
  context: z.object({
    country: contextItemSchema,
    region: contextItemSchema,
    postcode: contextItemSchema,
    place: contextItemSchema,
    coordinates: z
      .object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
      })
      .optional(),
    center: z.tuple([
      z.number().min(-180).max(180), // longitude
      z.number().min(-90).max(90)    // latitude
    ]).optional(),
  }),
  language: z.string().optional(),
  maki: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type PlaceModel = z.infer<typeof placeModelSchema>;
export type Place = z.infer<typeof placeSchema>;
export type SearchBoxFeature = z.infer<typeof searchBoxFeatureSchema>;