import { db } from "@/lib/db";
import { places } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import {
  placeSchema,
  placeModelSchema,
  searchBoxFeatureSchema,
  type Place,
  type PlaceModel,
  type SearchBoxFeature,
  type Coordinates,
} from "@/lib/schemas/places";
import { MapboxService } from "@/lib/services/mapbox-service";

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
    // Convert string decimals to numbers
    latitude: parseFloat(model.latitude.toString()),
    longitude: parseFloat(model.longitude.toString()),
    createdAt: model.createdAt.toISOString(),
    updatedAt: model.updatedAt.toISOString(),
  };

  return placeSchema.parse(place);
}

export async function getPlaces(): Promise<Place[]> {
  // Cast the result to handle decimal string conversion
  const result = await db.query.places.findMany({
    orderBy: (places, { asc }) => [asc(places.name)],
  }) as any as PlaceModel[];

  return result.map(convertToPlace);
}

export async function addPlace(feature: SearchBoxFeature): Promise<Place> {
  const mapboxService = new MapboxService();
  
  // Extract coordinates using the service
  const coordinates = mapboxService.extractCoordinates(feature);
  
  // Extract address components using the service
  const addressComponents = mapboxService.extractAddressComponents(feature);

  const placeData = {
    name: addressComponents.name,
    full_address: addressComponents.address,
    addressLine1: addressComponents.addressLine1 || null,
    addressLine2: addressComponents.addressLine2 || null,
    city: addressComponents.city || null,
    region: addressComponents.region || null,
    postcode: addressComponents.postcode || null,
    country: addressComponents.country || null,
    // Convert numbers to SQL decimal literals
    latitude: sql`${coordinates.latitude}::decimal(10,7)`,
    longitude: sql`${coordinates.longitude}::decimal(10,7)`,
    userID: 'default-user',
  };

  // Cast the result to handle decimal string conversion
  const [newPlace] = await db.insert(places)
    .values(placeData)
    .returning() as any as PlaceModel[];

  return convertToPlace(newPlace);
}

export async function deletePlace(id: string): Promise<boolean> {
  const result = await db.delete(places)
    .where(eq(places.id, id))
    .returning();
  
  return result.length > 0;
}