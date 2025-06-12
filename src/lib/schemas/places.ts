import { z } from "zod";

// Coordinate validation - for internal use
const coordinateSchema = {
  latitude: z.number()
    .min(-90).max(90)
    .describe("Latitude must be between -90 and 90 degrees"),
  longitude: z.number()
    .min(-180).max(180)
    .describe("Longitude must be between -180 and 180 degrees"),
};

// Database model schema with decimal string coordinates
export const placeModelSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  full_address: z.string().min(1, "Address is required"),
  addressLine1: z.string().nullable(),
  addressLine2: z.string().nullable(),
  city: z.string().nullable(),
  region: z.string().nullable(),
  postcode: z.string().nullable(),
  country: z.string().nullable(),
  // Database stores coordinates as decimal strings
  latitude: z.string().or(z.number()).transform(val => val.toString()),
  longitude: z.string().or(z.number()).transform(val => val.toString()),
  userID: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Frontend display schema with numeric coordinates
export const placeSchema = placeModelSchema.extend({
  // Formatted address for display
  address: z.string().min(1),
  // Optional formatted components
  displayName: z.string(),
  shortAddress: z.string(),
  // Optional components (undefined instead of null for frontend)
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  postcode: z.string().optional(),
  country: z.string().optional(),
  // Convert string decimals to numbers for the frontend
  ...coordinateSchema,
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

const contextItemSchema = z.object({
  name: z.string(),
});

// Mapbox API types
const mapboxContextItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  mapbox_id: z.string(),
  address: z.string().optional(),
  wikidata: z.string().optional(),
  short_code: z.string().optional(),
});

export const searchBoxContextSchema = z.object({
  country: mapboxContextItemSchema.optional(),
  region: mapboxContextItemSchema.optional(),
  postcode: mapboxContextItemSchema.optional(),
  place: mapboxContextItemSchema.optional(),
  district: mapboxContextItemSchema.optional(),
  locality: mapboxContextItemSchema.optional(),
  neighborhood: mapboxContextItemSchema.optional(),
  street: mapboxContextItemSchema.optional(),
  address: mapboxContextItemSchema.optional(),
});

// SearchBox API response schema
export const searchBoxFeatureSchema = z.object({
  id: z.string(),
  mapbox_id: z.string(),
  type: z.enum(["feature", "Feature"]),
  place_type: z.array(z.string()),
  relevance: z.number(),
  properties: z.object({
    name: z.string(),
    mapbox_id: z.string(),
    feature_type: z.string(),
    address: z.string().optional(),
    full_address: z.string().optional(),
    description: z.string().optional(),
    place_formatted: z.string().optional(),
    context: z.object({
      country: z.object({
        id: z.string(),
        name: z.string(),
        mapbox_id: z.string(),
      }).optional(),
      region: z.object({
        id: z.string(),
        name: z.string(),
        mapbox_id: z.string(),
      }).optional(),
      postcode: z.object({
        id: z.string(),
        name: z.string(),
        mapbox_id: z.string(),
      }).optional(),
      place: z.object({
        id: z.string(),
        name: z.string(),
        mapbox_id: z.string(),
      }).optional(),
    }).optional(),
  }),
  text: z.string(),
  place_name: z.string(),
  center: z.tuple([
    z.number().min(-180).max(180), // longitude
    z.number().min(-90).max(90)    // latitude
  ]),
  geometry: z.object({
    type: z.literal("Point"),
    coordinates: z.tuple([
      z.number().min(-180).max(180), // longitude
      z.number().min(-90).max(90)    // latitude
    ]),
  }).optional(),
});

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface AddressComponents {
  name: string;
  address: string;
  shortAddress?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  region?: string;
  postcode?: string;
  country?: string;
  full_address?: string;
}

export const isValidCoordinates = (coords: Coordinates): boolean => {
  return (
    coords.latitude >= -90 &&
    coords.latitude <= 90 &&
    coords.longitude >= -180 &&
    coords.longitude <= 180
  );
};

export type PlaceModel = z.infer<typeof placeModelSchema>;
export type Place = z.infer<typeof placeSchema>;
export type SearchBoxFeature = z.infer<typeof searchBoxFeatureSchema>;