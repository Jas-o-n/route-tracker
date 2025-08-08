import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { routes, places } from "@/lib/db/schema";
import { eq, desc, and, ne } from "drizzle-orm";
import {
  type Route,
  type RouteModel,
  routeWithStatsSchema,
  routeModelSchema,
  type RouteStats,
  routeStatsSchema,
} from "@/lib/schemas/routes";
import { placeSchema, type Place, type PlaceModel } from "@/lib/schemas/places";
import { asc } from "drizzle-orm";

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

function convertToPlace(model: PlaceModel): Place {
  const place = {
    ...model,
    addressLine2: model.addressLine2 || undefined,
    city: model.city || undefined,
    region: model.region || undefined,
    postcode: model.postcode || undefined,
    country: model.country || undefined,
    // Convert string decimals to numbers
    latitude: model.latitude == null ? undefined : Number(model.latitude),
    longitude: model.longitude == null ? undefined : Number(model.longitude),
    createdAt: model.createdAt.toISOString(),
    updatedAt: model.updatedAt.toISOString(),    address: model.full_address || '',
    displayName: model.name || '',
    shortAddress: model.addressLine1 || '',
  };
  return placeSchema.parse(place);
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
  
  const baseRoute = convertToRoute(validatedRoute);

  const routeWithStats = {
    ...baseRoute,
    stats: {
      timesDriven: allRoutes.length,
      avgMileage: allRoutes.reduce((sum, similarRoute) => sum + (similarRoute.endMileage - similarRoute.startMileage), 0) / allRoutes.length,
      lastDriven: allRoutes
        .map((route) => route.date)
        .reduce((latest, current) => (current > latest ? current : latest), allRoutes[0].date)
        .toISOString(),
    },
  };

  return routeWithStatsSchema.parse(routeWithStats);
} 

export async function getPlaces(): Promise<Place[]> {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const result = await db.query.places.findMany({
    where: (places, { eq }) => eq(places.userID, userId),
    orderBy: [asc(places.name)],
  }) as any as PlaceModel[];

  return result.map(convertToPlace);
} 

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
    totalKilometers,
    mostFrequentRoute,
    avgMileagePerRoute: allRoutes.length ? totalKilometers / allRoutes.length : 0,
  };

  return routeStatsSchema.parse(stats);
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