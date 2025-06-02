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
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  postcode: z.string().optional(),
  country: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const contextItemSchema = z.object({
  name: z.string(),
  // Add other properties if needed
});

// Mapbox Search Box API response schema
export const searchBoxFeatureSchema = z.object({
  name: z.string(),
  mapbox_id: z.string(),
  feature_type: z.string(),
  address: z.string(),
  full_address: z.string(),
  place_formatted: z.string(),
  context: z.object({
    country: contextItemSchema,
    region: contextItemSchema,
    postcode: contextItemSchema,
    place: contextItemSchema,
    coordinates: z
      .object({
        latitude: z.number(),
        longitude: z.number(),
      })
      .optional(),
    center: z.array(z.number()).length(2).optional(),
  }),
  language: z.string().optional(),
  maki: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type PlaceModel = z.infer<typeof placeModelSchema>;
export type Place = z.infer<typeof placeSchema>;
export type SearchBoxFeature = z.infer<typeof searchBoxFeatureSchema>;