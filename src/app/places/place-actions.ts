"use server";

import { getPlaces, addPlace, deletePlace } from "@/lib/actions/place-actions";
import { auth } from "@clerk/nextjs/server";

export async function getPlacesAction() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");
  return await getPlaces(userId);
}

import type { SearchBoxFeature } from "@/lib/schemas/places";

export async function addPlaceAction(feature: SearchBoxFeature, placeName: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");
  const result = await addPlace(feature, placeName, userId);
  return result;
}
export async function deletePlaceAction(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");
  const result = await deletePlace(id, userId);
  return result;
}