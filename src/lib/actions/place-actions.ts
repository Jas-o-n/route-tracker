import { db } from "@/lib/db";
import { places } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  placeSchema,
  placeModelSchema,
  searchBoxFeatureSchema,
  type Place,
  type PlaceModel,
  type SearchBoxFeature,
} from "@/lib/schemas/places";

function convertToPlace(model: PlaceModel): Place {
  const place = {
    ...model,
    address: model.full_address,
    addressLine1: model.addressLine1 || undefined,
    addressLine2: model.addressLine2 || undefined,
    city: model.city || undefined,
    region: model.region || undefined,
    postcode: model.postcode || undefined,
    country: model.country || undefined,
    createdAt: model.createdAt.toISOString(),
    updatedAt: model.updatedAt.toISOString(),
  };

  return placeSchema.parse(place);
}

export async function getPlaces(): Promise<Place[]> {
  const result = await db.query.places.findMany({
    orderBy: (places, { asc }) => [asc(places.name)],
  }) as PlaceModel[];

  return result.map(convertToPlace);
}

export async function addPlace(feature: SearchBoxFeature): Promise<Place> {
  // Extract coordinates from the correct location in the response
  const coordinates = feature.context?.coordinates || {
    latitude: feature.context?.center ? Number(feature.context.center[1]) : 0,
    longitude: feature.context?.center ? Number(feature.context.center[0]) : 0
  };

  const placeData = {
    name: feature.name,
    full_address: feature.full_address,
    addressLine1: feature.address || null,
    addressLine2: null,
    city: feature.context.place.name || null,
    region: feature.context.region.name || null,
    postcode: feature.context.postcode.name || null,
    country: feature.context.country.name || null,
    latitude: coordinates.latitude.toString(),
    longitude: coordinates.longitude.toString(),
    userID: 'default-user',
  };

  const [newPlace] = await db.insert(places)
    .values(placeData)
    .returning();

  return convertToPlace(newPlace);
}

export async function deletePlace(id: string): Promise<boolean> {
  const result = await db.delete(places)
    .where(eq(places.id, id))
    .returning();
  
  return result.length > 0;
}