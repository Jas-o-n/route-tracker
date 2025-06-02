import { db } from "@/lib/db";
import { places } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Place } from "@/lib/types";



export async function getPlaces(): Promise<Place[]> {
  const result = await db.query.places.findMany({
    orderBy: (places, { asc }) => [asc(places.name)],
  });
  
  return result.map(place => ({
    ...place,
    createdAt: place.createdAt.toISOString(),
    updatedAt: place.updatedAt.toISOString(),
  }));
}

export async function addPlace(data: { name: string; address: string }): Promise<Place> {
  const [newPlace] = await db.insert(places)
    .values({
      name: data.name,
      address: data.address,
      userID: 'default-user', // You'll want to get this from your auth system
    })
    .returning();
    
  return {
    ...newPlace,
    createdAt: newPlace.createdAt.toISOString(),
    updatedAt: newPlace.updatedAt.toISOString(),
  };
}

export async function deletePlace(id: string): Promise<boolean> {
  const result = await db.delete(places)
    .where(eq(places.id, id))
    .returning();
  
  return result.length > 0;
}