// This file would typically interact with the database
// For demonstration purposes, we'll use mock data

import { Route, RouteModel, RouteWithStats, CreateRouteInput, UpdateRouteInput } from "@/lib/types";
import { db } from "@/lib/db";
import { routes } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

// Helper function to convert database model to API response
function convertToRoute(model: RouteModel): Route {
  return {
    ...model,
    date: model.date.toISOString(),
    createdAt: model.createdAt.toISOString(),
    updatedAt: model.updatedAt.toISOString(),
  };
}

export async function getRecentRoutes(limit = 3): Promise<Route[]> {
  const result = await db.query.routes.findMany({
    orderBy: [desc(routes.date)],
    limit: limit,
  }) as RouteModel[];
  return result.map(convertToRoute);
}

export async function getAllRoutes(): Promise<Route[]> {
  const result = await db.query.routes.findMany({
    orderBy: [desc(routes.date)],
  }) as RouteModel[];
  return result.map(convertToRoute);
}

export async function getRouteById(id: string): Promise<RouteWithStats | null> {
  const route = await db.query.routes.findFirst({
    where: eq(routes.id, id),
  }) as RouteModel | null;
  
  if (!route) {
    return null;
  }
  
  // Get similar routes for stats
  const similarRoutes = await db.query.routes.findMany({
    where: (routes, { and, eq }) => and(
      eq(routes.startLocation, route.startLocation),
      eq(routes.destination, route.destination)
    ),
  }) as RouteModel[];
  
  const stats = {
    timesDriven: similarRoutes.length,
    avgMileage: similarRoutes.reduce((sum, r) => sum + Number(r.mileage), 0) / similarRoutes.length,
    lastDriven: similarRoutes
      .sort((a, b) => b.date.getTime() - a.date.getTime())[0].date.toISOString(),
  };
  
  return {
    ...convertToRoute(route),
    stats,
  };
}

export async function addRoute(routeData: Omit<Route, "id">): Promise<Route> {
  const [newRoute] = await db.insert(routes)
    .values({
      startLocation: routeData.startLocation,
      destination: routeData.destination,
      mileage: routeData.mileage,
      date: new Date(routeData.date),
      notes: routeData.notes,
      userID: 'default-user', // You'll want to get this from your auth system
    })
    .returning() as RouteModel[];
  
  return convertToRoute(newRoute);
}

export async function updateRoute(id: string, routeData: Partial<Route>): Promise<Route | null> {
  const [updatedRoute] = await db.update(routes)
    .set({
      startLocation: routeData.startLocation,
      destination: routeData.destination,
      mileage: routeData.mileage,
      date: routeData.date ? new Date(routeData.date) : undefined,
      notes: routeData.notes,
      updatedAt: new Date(),
    })
    .where(eq(routes.id, id))
    .returning() as RouteModel[];
    
  return updatedRoute ? convertToRoute(updatedRoute) : null;
}

export async function deleteRoute(id: string): Promise<boolean> {
  const result = await db.delete(routes)
    .where(eq(routes.id, id))
    .returning();
  
  return result.length > 0;
}

export async function getRouteStats(): Promise<any> {
  const allRoutes = await getAllRoutes();
  
  const totalRoutes = allRoutes.length;
  const totalMiles = allRoutes.reduce((sum, route) => sum + Number(route.mileage), 0);
  
  // Find most frequent route
  const routeCounts: Record<string, { from: string; to: string; count: number }> = {};
  
  allRoutes.forEach((route) => {
    const key = `${route.startLocation}-${route.destination}`;
    if (!routeCounts[key]) {
      routeCounts[key] = {
        from: route.startLocation,
        to: route.destination,
        count: 0,
      };
    }
    routeCounts[key].count++;
  });
  
  const mostFrequentRoute = Object.values(routeCounts)
    .reduce((max, current) => current.count > max.count ? current : max);
  
  return {
    totalRoutes,
    totalMiles,
    mostFrequentRoute,
    avgMileagePerRoute: totalMiles / totalRoutes,
  };
}