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
    name: model.name, // Ensure name is the place name
    full_address: model.full_address, // Ensure full_address is the full address
    addressLine1: model.addressLine1 || undefined, // Ensure addressLine1 is populated correctly
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
    address: model.full_address || '', // Ensure address is populated
    displayName: model.name || '', // Ensure displayName is populated
    shortAddress: model.addressLine1 || '', // Ensure shortAddress is populated
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

export async function addPlace(
  feature: SearchBoxFeature, 
  placeName: string
): Promise<Place> {
  const mapboxService = new MapboxService();

  // Extract coordinates using the service
  const coordinates = mapboxService.extractCoordinates(feature);

  // Extract address components using the service
  const addressComponents = mapboxService.extractAddressComponents(feature);

  const placeData = {
    name: placeName, // Use the user-provided place name
    full_address: addressComponents.address || '', // Use the full address from Mapbox
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