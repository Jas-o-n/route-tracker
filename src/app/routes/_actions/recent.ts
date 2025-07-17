"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { routes } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { type Route, routeModelSchema } from "@/lib/schemas/routes";
import type { RouteModel } from "@/lib/schemas/routes";

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

export async function getRecentRoutes(limit = 3) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const result: RouteModel[] = await db.query.routes.findMany({
    where: (routes, { eq }) => eq(routes.userID, userId),
    orderBy: [desc(routes.date)],
    limit: limit,
  });

  return result.map(model => convertToRoute(routeModelSchema.parse(model)));
}
