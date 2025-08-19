"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { routes } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  type Route,
  type RouteFormData,
  type RouteModel,
  routeWithStatsSchema,
  routeFormSchema,
  routeModelSchema,
} from "@/lib/schemas/routes";

function convertModelToRoute(model: RouteModel): Route {
  return {
    id: model.id,
    fromPlaceId: model.fromPlaceId,
    toPlaceId: model.toPlaceId,
    startMileage: model.startMileage,
    endMileage: model.endMileage,
    distance: model.distance,
    date: model.date.toISOString(),
    notes: model.notes,
    isWork: model.isWork ?? false,
    userID: model.userID,
    createdAt: model.createdAt.toISOString(),
    updatedAt: model.updatedAt.toISOString(),
  };
}

export async function createRoute(data: RouteFormData): Promise<Route> {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const validatedData = routeFormSchema.parse(data);
  const distance = validatedData.endMileage - validatedData.startMileage;

  // Convert empty-string place ids (used by private trips) to null for DB
  const dbData: any = {
    ...validatedData,
    fromPlaceId: validatedData.isWork === false ? null : (validatedData.fromPlaceId === "" ? null : validatedData.fromPlaceId),
    toPlaceId: validatedData.isWork === false ? null : (validatedData.toPlaceId === "" ? null : validatedData.toPlaceId),
    distance,
    date: new Date(validatedData.date),
    userID: userId,
  };

  const [newRoute] = await db.insert(routes)
    .values(dbData)
    .returning();

  revalidatePath("/routes");
  const validated = routeModelSchema.parse(newRoute);
  return convertModelToRoute(validated);
}

export async function updateRoute(id: string, data: Partial<RouteFormData>): Promise<Route> {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const existingRoute = await db.query.routes.findFirst({
    where: eq(routes.id, id),
  });

  if (!existingRoute) {
    throw new Error("Route not found");
  }

  if (existingRoute.userID !== userId) {
    throw new Error("Unauthorized: You do not own this route");
  }

  const updateData: Partial<RouteModel> = {
    ...data,
    ...(data.date && { date: new Date(data.date) }),
  };

  if (data.startMileage !== undefined || data.endMileage !== undefined) {
    const start = data.startMileage ?? existingRoute.startMileage;
    const end = data.endMileage ?? existingRoute.endMileage;
    updateData.distance = end - start;
  }

  const willBePrivate = (updateData.isWork === false) || (updateData.isWork === undefined && existingRoute.isWork === false);

  const setData: any = { ...updateData };
  if (willBePrivate) {
    setData.fromPlaceId = null;
    setData.toPlaceId = null;
  } else {
    if ((updateData as any).fromPlaceId !== undefined) {
      setData.fromPlaceId = (updateData as any).fromPlaceId === "" ? null : (updateData as any).fromPlaceId;
    }
    if ((updateData as any).toPlaceId !== undefined) {
      setData.toPlaceId = (updateData as any).toPlaceId === "" ? null : (updateData as any).toPlaceId;
    }
  }

  const [updatedRoute] = await db.update(routes)
    .set(setData)
    .where(eq(routes.id, id))
    .returning();

  revalidatePath("/routes");
  revalidatePath(`/routes/${id}`);
  const validated = routeModelSchema.parse(updatedRoute);
  return convertModelToRoute(validated);
}

export async function deleteRoute(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const route = await db.query.routes.findFirst({
    where: eq(routes.id, id),
  });

  if (!route) throw new Error("Route not found");
  if (route.userID !== userId) throw new Error("Unauthorized: You do not own this route");

  const result = await db.delete(routes)
    .where(eq(routes.id, id))
    .returning();
  
  revalidatePath("/routes");
  return result.length > 0;
}
