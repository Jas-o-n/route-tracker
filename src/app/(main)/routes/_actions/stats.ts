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

  const totalMiles = allRoutes.reduce((sum, r) => sum + (r.distance || 0), 0);
  
  // Find most frequent route
  const routeCounts: Record<string, { 
    from: string; 
    to: string; 
    fromName: string; 
    toName: string; 
    count: number 
  }> = {};
  
  allRoutes.forEach((route) => {
    const key = `${route.fromPlaceId}-${route.toPlaceId}`;
    if (!routeCounts[key]) {
      routeCounts[key] = {
        from: route.fromPlaceId,
        to: route.toPlaceId,
        fromName: placesMap.get(route.fromPlaceId) || 'Unknown Place',
        toName: placesMap.get(route.toPlaceId) || 'Unknown Place',
        count: 0,
      };
    }
    routeCounts[key].count++;
  });
  
  const mostFrequentRouteRaw = Object.values(routeCounts).reduce(
    (max, current) => current.count > max.count ? current : max,
    { count: 0, from: "", to: "", fromName: "", toName: "" }
  );

  let mostFrequentRoute = null;
  if (
    mostFrequentRouteRaw.count > 0 &&
    mostFrequentRouteRaw.from &&
    mostFrequentRouteRaw.to &&
    /^[0-9a-fA-F-]{36}$/.test(mostFrequentRouteRaw.from) &&
    /^[0-9a-fA-F-]{36}$/.test(mostFrequentRouteRaw.to)
  ) {
    mostFrequentRoute = {
      fromPlaceId: mostFrequentRouteRaw.from,
      toPlaceId: mostFrequentRouteRaw.to,
      fromName: mostFrequentRouteRaw.fromName,
      toName: mostFrequentRouteRaw.toName,
      count: mostFrequentRouteRaw.count
    };
  }

  const stats = {
    totalRoutes: allRoutes.length,
    totalMiles,
    mostFrequentRoute,
    avgMileagePerRoute: allRoutes.length ? totalMiles / allRoutes.length : 0,
  };

  return routeStatsSchema.parse(stats);
}
