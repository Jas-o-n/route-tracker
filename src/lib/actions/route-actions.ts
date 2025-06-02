import { 
  routeSchema, 
  routeWithStatsSchema, 
  routeFormSchema,
  routeModelSchema,
  type Route,
  type RouteWithStats,
  type RouteFormData,
  type RouteModel,
} from "@/lib/schemas/routes";
import { db } from "@/lib/db";
import { routes } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

function convertToRoute(model: RouteModel): Route {
  // Validate the model first
  const validatedModel = routeModelSchema.parse(model);
  
  const route = {
    ...validatedModel,
    date: validatedModel.date.toISOString(),
    createdAt: validatedModel.createdAt.toISOString(),
    updatedAt: validatedModel.updatedAt.toISOString(),
  };
  
  return routeSchema.parse(route);
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
    where: eq(routes.id, id),
  });
  
  if (!route) {
    return null;
  }

  const validatedRoute = routeModelSchema.parse(route);
  
  const similarRoutes = await db.query.routes.findMany({
    where: (routes, { and, eq }) => and(
      eq(routes.startLocation, validatedRoute.startLocation),
      eq(routes.destination, validatedRoute.destination)
    ),
  });

  const validatedSimilarRoutes = similarRoutes.map(r => routeModelSchema.parse(r));
  
  const stats = {
    timesDriven: validatedSimilarRoutes.length,
    avgMileage: validatedSimilarRoutes.reduce((sum, r) => sum + r.mileage, 0) / validatedSimilarRoutes.length,
    lastDriven: validatedSimilarRoutes
      .sort((a, b) => b.date.getTime() - a.date.getTime())[0]
      .date.toISOString(),
  };
  
  return routeWithStatsSchema.parse({
    ...convertToRoute(validatedRoute),
    stats,
  });
}

export async function addRoute(data: RouteFormData): Promise<Route> {
  // Validate input
  const validatedData = routeFormSchema.parse(data);

  const [newRoute] = await db.insert(routes)
    .values({
      startLocation: validatedData.startLocation,
      destination: validatedData.destination,
      mileage: validatedData.mileage,
      date: new Date(validatedData.date),
      notes: validatedData.notes ?? null,
      userID: 'default-user',
    })
    .returning();
  
  return convertToRoute(newRoute);
}

export async function updateRoute(id: string, data: Partial<RouteFormData>): Promise<Route | null> {
  // Partial validation of input
  const validatedData = routeFormSchema.partial().parse(data);

  const [updatedRoute] = await db.update(routes)
    .set({
      ...validatedData,
      date: validatedData.date ? new Date(validatedData.date) : undefined,
      updatedAt: new Date(),
    })
    .where(eq(routes.id, id))
    .returning();
    
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