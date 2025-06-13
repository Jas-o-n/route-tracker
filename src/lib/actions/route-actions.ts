import { 
  routeSchema, 
  routeWithStatsSchema, 
  routeFormSchema,
  routeModelSchema,
  routeStatsSchema,
  type Route,
  type RouteWithStats,
  type RouteFormData,
  type RouteModel,
  type RouteStats,
} from "@/lib/schemas/routes";
import { db } from "@/lib/db";
import { routes } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

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

export async function getRecentRoutes(limit = 3): Promise<Route[]> {
  const result = await db.query.routes.findMany({
    orderBy: [desc(routes.date)],
    limit: limit,
  });

  return result.map(model => convertToRoute(routeModelSchema.parse(model)));
}

export async function getAllRoutes(): Promise<Route[]> {
  const result = await db.query.routes.findMany({
    orderBy: [desc(routes.date)],
  });

  return result.map(model => convertToRoute(routeModelSchema.parse(model)));
}

export async function getRouteById(id: string): Promise<RouteWithStats | null> {
  const route = await db.query.routes.findFirst({
    where: (routes, { eq }) => eq(routes.id, id),
  });

  if (!route) return null;

  const validatedRoute = routeModelSchema.parse(route);
  
const similarRoutes = await db.query.routes.findMany({
  where: (routes, { and, eq, ne }) => and(
    eq(routes.fromPlaceId, validatedRoute.fromPlaceId),
    eq(routes.toPlaceId, validatedRoute.toPlaceId),
   ne(routes.id, validatedRoute.id)
 ),
});

  const validatedSimilarRoutes = similarRoutes.map(r => routeModelSchema.parse(r));
  const allRoutes = [validatedRoute, ...validatedSimilarRoutes];
  
  // Convert base route data
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

  // Add stats
  const routeWithStats = {
    ...baseRoute,
    stats: {
      timesDriven: allRoutes.length,
      avgMileage: allRoutes.reduce((sum, r) => sum + (r.endMileage - r.startMileage), 0) / allRoutes.length,
      lastDriven: validatedRoute.date.toISOString(),
    },
  };

  // Validate the final object
  return routeWithStatsSchema.parse(routeWithStats);
}

export async function createRoute(data: RouteFormData): Promise<Route> {
  // Validate the form data
  const validatedData = routeFormSchema.parse(data);
  
  // Calculate distance
  const distance = validatedData.endMileage - validatedData.startMileage;

  const [newRoute] = await db.insert(routes)
    .values({
      fromPlaceId: validatedData.fromPlaceId,
      toPlaceId: validatedData.toPlaceId,
      startMileage: validatedData.startMileage,
      endMileage: validatedData.endMileage,
      distance,
      date: new Date(validatedData.date),
      notes: validatedData.notes,
      userID: 'default-user', // TODO: Replace with actual user ID
    })
    .returning();

  return convertToRoute(routeModelSchema.parse(newRoute));
}

export async function updateRoute(id: string, data: Partial<RouteFormData>): Promise<Route> {
  const existingRoute = await db.query.routes.findFirst({
    where: eq(routes.id, id),
  });

  if (!existingRoute) {
    throw new Error('Route not found');
  }

  // Prepare update data
  const updateData: Partial<RouteModel> = {
    ...data,
    // Convert date string to Date object if present
    ...(data.date && { date: new Date(data.date) }),
  };

  // If both mileages are provided, recalculate distance
if (data.startMileage !== undefined || data.endMileage !== undefined) {
  const start = data.startMileage ?? existingRoute.startMileage;
  const end   = data.endMileage   ?? existingRoute.endMileage;
  updateData.distance = end - start;
}

  const [updatedRoute] = await db.update(routes)
    .set(updateData)
    .where(eq(routes.id, id))
    .returning();

  return convertToRoute(routeModelSchema.parse(updatedRoute));
}

export async function deleteRoute(id: string): Promise<boolean> {
  const result = await db.delete(routes)
    .where(eq(routes.id, id))
    .returning();
  
  return result.length > 0;
}

export async function getRouteStats(): Promise<RouteStats> {
  // First, get all places to create a lookup map
  const allPlaces = await db.query.places.findMany();
  const placesMap = new Map(allPlaces.map(place => [place.id, place.name]));
  
  const allRoutes = await getAllRoutes();
  const totalMiles = allRoutes.reduce((sum, r) => sum + r.distance, 0);
  
  // Find most frequent route
  const routeCounts: Record<string, { from: string; to: string; fromName: string; toName: string; count: number }> = {};
  
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
  
  const mostFrequentRoute =
  Object.values(routeCounts).reduce(
    (max, current) => current.count > max.count ? current : max,
    { count: 0, from: "", to: "", fromName: "", toName: "" }
  );

  const stats = {
    totalRoutes: allRoutes.length,
    totalMiles,
    mostFrequentRoute: mostFrequentRoute ? {
      fromPlaceId: mostFrequentRoute.from,
      toPlaceId: mostFrequentRoute.to,
      fromName: mostFrequentRoute.fromName,
      toName: mostFrequentRoute.toName,
      count: mostFrequentRoute.count
    } : null,
    avgMileagePerRoute: allRoutes.length ? totalMiles / allRoutes.length : 0,
  };

  // Validate and return the stats object
  return routeStatsSchema.parse(stats);
}