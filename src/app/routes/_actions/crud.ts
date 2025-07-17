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

function convertToRoute(model: RouteModel): Route {
  return {
    id: model.id,
    fromPlaceId: model.fromPlaceId,
    toPlaceId: model.toPlaceId,
    startMileage: model.startMileage,
    endMileage: model.endMileage,
    distance: model.distance,
    date: model.date.toISOString(),
    notes: model.notes,
    userID: model.userID,
    createdAt: model.createdAt.toISOString(),
    updatedAt: model.updatedAt.toISOString(),
  };
}

export async function getAllRoutes() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const result: RouteModel[] = await db.query.routes.findMany({
    where: (routes, { eq }) => eq(routes.userID, userId),
    orderBy: [desc(routes.date)],
  });

  return result.map(model => convertToRoute(routeModelSchema.parse(model)));
}

export async function getRouteById(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const route = await db.query.routes.findFirst({
    where: (route, { eq }) => eq(route.id, id),
  });

  if (!route) return null;
  if (route.userID !== userId) throw new Error("Unauthorized: You do not own this route");

  const validatedRoute = routeModelSchema.parse(route);
  
  const similarRoutes = await db.query.routes.findMany({
    where: (routes, { and, eq, ne }) => and(
      eq(routes.fromPlaceId, validatedRoute.fromPlaceId),
      eq(routes.toPlaceId, validatedRoute.toPlaceId),
      ne(routes.id, validatedRoute.id),
      eq(routes.userID, userId)
    ),
  });

  const validatedSimilarRoutes = similarRoutes.map(route => routeModelSchema.parse(route));
  const allRoutes = [validatedRoute, ...validatedSimilarRoutes];
  
  const baseRoute = {
    id: validatedRoute.id,
    fromPlaceId: validatedRoute.fromPlaceId,
    toPlaceId: validatedRoute.toPlaceId,
    startMileage: validatedRoute.startMileage,
    endMileage: validatedRoute.endMileage,
    distance: validatedRoute.endMileage - validatedRoute.startMileage,
    date: validatedRoute.date.toISOString(),
    notes: validatedRoute.notes,
    userID: validatedRoute.userID,
    createdAt: validatedRoute.createdAt.toISOString(),
    updatedAt: validatedRoute.updatedAt.toISOString(),
  };

  const routeWithStats = {
    ...baseRoute,
    stats: {
      timesDriven: allRoutes.length,
      avgMileage: allRoutes.reduce((sum, similarRoute) => sum + (similarRoute.endMileage - similarRoute.startMileage), 0) / allRoutes.length,
      lastDriven: validatedRoute.date.toISOString(),
    },
  };

  return routeWithStatsSchema.parse(routeWithStats);
}

export async function createRoute(data: RouteFormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const validatedData = routeFormSchema.parse(data);
  const distance = validatedData.endMileage - validatedData.startMileage;

  const [newRoute] = await db.insert(routes)
    .values({
      ...validatedData,
      distance,
      date: new Date(validatedData.date),
      userID: userId,
    })
    .returning();

  revalidatePath("/routes");
  return convertToRoute(routeModelSchema.parse(newRoute));
}

export async function updateRoute(id: string, data: Partial<RouteFormData>) {
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

  const [updatedRoute] = await db.update(routes)
    .set(updateData)
    .where(eq(routes.id, id))
    .returning();

  revalidatePath("/routes");
  revalidatePath(`/routes/${id}`);
  return convertToRoute(routeModelSchema.parse(updatedRoute));
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
