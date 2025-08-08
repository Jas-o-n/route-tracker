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
  return routeModelSchema.parse(newRoute);
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
  return routeModelSchema.parse(updatedRoute);
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
