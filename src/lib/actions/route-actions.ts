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

export async function getRecentRoutes(limit = 3, userID: string): Promise<Route[]> {
  const result = await db.query.routes.findMany({
    where: (routes, { eq }) => eq(routes.userID, userID),
    orderBy: [desc(routes.date)],
    limit: limit,
  });

  return result.map(model => convertToRoute(routeModelSchema.parse(model)));
}

export async function getAllRoutes(userID: string): Promise<Route[]> {
  const result = await db.query.routes.findMany({
    where: (routes, { eq }) => eq(routes.userID, userID),
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

export async function createRoute(data: RouteFormData, userID: string): Promise<Route> {
  // Validate the form data (does not include userID)
  const validatedData = routeFormSchema.parse(data);
  // Calculate distance
  const distance = validatedData.endMileage - validatedData.startMileage;

  const [newRoute] = await db.insert(routes)
    .values({
      ...validatedData,
      distance,
      date: new Date(validatedData.date),
      userID, // Add userID here
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

export async function getRouteStats(userID: string): Promise<RouteStats> {
  // First, get all places to create a lookup map
  const allPlaces = await db.query.places.findMany({
    where: (places, { eq }) => eq(places.userID, userID),
  });
  const placesMap = new Map(allPlaces.map(place => [place.id, place.name]));
  
  const allRoutes = await getAllRoutes(userID);
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

  // Validate and return the stats object
  return routeStatsSchema.parse(stats);
}

export type ExportableRoute = {
  date: string;
  fromPlace: string;
  toPlace: string;
  startMileage: number;
  endMileage: number;
  distance: number;
  notes: string | null;
};

export async function getRoutesForExport(startDate: Date, endDate: Date, userID: string): Promise<string> {
  // Set the end date to the end of the day (23:59:59.999)
  const endOfDay = new Date(endDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Set the start date to the start of the day (00:00:00.000)
  const startOfDay = new Date(startDate);
  startOfDay.setHours(0, 0, 0, 0);

  const result = await db.query.routes.findMany({
    where: (routes, { and, gte, lte, eq }) =>
      and(
        gte(routes.date, startOfDay),
        lte(routes.date, endOfDay),
        eq(routes.userID, userID)
      ),
    with: {
      fromPlace: {
        columns: {
          name: true,
          full_address: true,
        },
      },
      toPlace: {
        columns: {
          name: true,
          full_address: true,
        },
      },
    },
    orderBy: [desc(routes.date)],
  });

  const exportableRoutes: ExportableRoute[] = result.map((route) => ({
    date: route.date.toISOString().split('T')[0],
    fromPlace: route.fromPlace.full_address,
    toPlace: route.toPlace.full_address,
    startMileage: route.startMileage,
    endMileage: route.endMileage,
    distance: route.distance,
    notes: route.notes,
  }));

  // Convert to CSV
  const headers = ['Date', 'From', 'To', 'Start Mileage', 'End Mileage', 'Distance', 'Notes'];
  const rows = exportableRoutes.map(route => [
    route.date,
    route.fromPlace,
    route.toPlace,
    route.startMileage,
    route.endMileage,
    route.distance,
    route.notes || ''
  ]);

  const quote = (cell: unknown) => {
    const str = String(cell).replace(/"/g, '""');     // escape quotes
    return /[",\n\r]/.test(str) ? `"${str}"` : str;   // wrap if needed
  };

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(quote).join(',')),
  ].join('\n');

  return csv;
}