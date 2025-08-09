"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { routes } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { type RouteStats, routeStatsSchema } from "@/lib/schemas/routes";
import type { RouteModel } from "@/lib/schemas/routes";

export async function getRouteStats(): Promise<RouteStats> {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  // First, get all places to create a lookup map
  const allPlaces = await db.query.places.findMany({
    where: (places, { eq }) => eq(places.userID, userId),
  });
  const placesMap = new Map(allPlaces.map(place => [place.id, place.name]));
  
  const allRoutes = await db.query.routes.findMany({
    where: (routes, { eq }) => eq(routes.userID, userId),
    orderBy: [desc(routes.date)],
  });

  const totalKilometers = allRoutes.reduce((sum, r) => sum + (r.distance || 0), 0);

  // Date boundaries
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const totalKilometersToday = allRoutes
    .filter(r => r.date >= startOfToday && r.date <= endOfToday)
    .reduce((sum, r) => sum + (r.distance || 0), 0);

  const totalKilometersThisMonth = allRoutes
    .filter(r => r.date >= startOfMonth && r.date <= endOfMonth)
    .reduce((sum, r) => sum + (r.distance || 0), 0);

  const stats = {
    totalRoutes: allRoutes.length,
    totalKilometers,
    totalKilometersToday,
    totalKilometersThisMonth,
  };

  return routeStatsSchema.parse(stats);
}
