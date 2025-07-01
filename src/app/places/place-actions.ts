"use server";

import { getPlaces, addPlace, deletePlace } from "@/lib/actions/place-actions";
import { auth } from "@clerk/nextjs/server";

export async function getPlacesAction() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");
  return await getPlaces(userId);
}

export async function addPlaceAction(feature: any, placeName: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");
  const result = await addPlace(feature, placeName, userId);
  return result;
}

export async function deletePlaceAction(id: string) {
  const result = await deletePlace(id);
  return result;
}
