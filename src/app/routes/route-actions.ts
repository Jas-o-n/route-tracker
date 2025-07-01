"use server";

import { getAllRoutes, deleteRoute, createRoute, getRouteById, updateRoute } from "@/lib/actions/route-actions";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function getAllRoutesAction() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");
  return await getAllRoutes(userId);
}

export async function deleteRouteAction(id: string) {
  const result = await deleteRoute(id);
  revalidatePath("/routes");
  return result;
}

export async function createRouteAction(data: any) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");
  const result = await createRoute(data, userId);
  revalidatePath("/routes");
  return result;
}

export async function getRouteByIdAction(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");
  // Optionally, you could check that the route belongs to the user in getRouteById
  return await getRouteById(id);
}

export async function updateRouteAction(id: string, data: any) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");
  // Optionally, you could check that the route belongs to the user in updateRoute
  return await updateRoute(id, data);
}
