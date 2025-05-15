// This file would typically interact with the database
// For demonstration purposes, we'll use mock data

import { Route, RouteWithStats } from "@/lib/types";
import { z } from "zod";

// Mock data
let routes: Route[] = [
  {
    id: "1",
    startLocation: "Home",
    destination: "Work",
    mileage: 12.5,
    date: "2025-03-15",
    notes: "Regular commute, light traffic",
  },
  {
    id: "2",
    startLocation: "Home",
    destination: "Grocery Store",
    mileage: 3.2,
    date: "2025-03-14",
  },
  {
    id: "3",
    startLocation: "Work",
    destination: "Gym",
    mileage: 5.7,
    date: "2025-03-13",
    notes: "Stopped for gas on the way",
  },
  {
    id: "4",
    startLocation: "Home",
    destination: "Parent's House",
    mileage: 45.3,
    date: "2025-03-10",
    notes: "Weekend visit",
  },
  {
    id: "5",
    startLocation: "Home",
    destination: "Work",
    mileage: 12.3,
    date: "2025-03-08",
    notes: "Heavy traffic due to accident",
  },
];

export async function getRecentRoutes(limit = 3): Promise<Route[]> {
  // Sort by date (newest first) and take the specified limit
  return [...routes]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export async function getAllRoutes(): Promise<Route[]> {
  return routes;
}

export async function getRouteById(id: string): Promise<RouteWithStats | null> {
  const route = routes.find((r) => r.id === id);
  
  if (!route) {
    return null;
  }
  
  // Calculate some stats for this route
  const similarRoutes = routes.filter(
    (r) => 
      r.startLocation === route.startLocation && 
      r.destination === route.destination
  );
  
  const stats = {
    timesDriven: similarRoutes.length,
    avgMileage: similarRoutes.reduce((sum, r) => sum + r.mileage, 0) / similarRoutes.length,
    lastDriven: similarRoutes
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date,
  };
  
  return {
    ...route,
    stats,
  };
}

export async function addRoute(routeData: any): Promise<Route> {
  const newRoute: Route = {
    id: Date.now().toString(),
    startLocation: routeData.startLocation,
    destination: routeData.destination,
    mileage: routeData.mileage,
    date: routeData.date,
    notes: routeData.notes,
  };
  
  routes.push(newRoute);
  return newRoute;
}

export async function updateRoute(id: string, routeData: any): Promise<Route | null> {
  const index = routes.findIndex((r) => r.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const updatedRoute = {
    ...routes[index],
    startLocation: routeData.startLocation,
    destination: routeData.destination,
    mileage: routeData.mileage,
    date: routeData.date,
    notes: routeData.notes,
  };
  
  routes[index] = updatedRoute;
  return updatedRoute;
}

export async function deleteRoute(id: string): Promise<boolean> {
  const initialLength = routes.length;
  routes = routes.filter((r) => r.id !== id);
  return routes.length < initialLength;
}

export async function getRouteStats(): Promise<any> {
  // Calculate mock stats
  const totalRoutes = routes.length;
  const totalMiles = routes.reduce((sum, route) => sum + route.mileage, 0);
  
  // Find most frequent route
  const routeCounts: Record<string, { from: string; to: string; count: number }> = {};
  
  routes.forEach((route) => {
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
  
  let mostFrequentRoute = null;
  let maxCount = 0;
  
  Object.values(routeCounts).forEach((routeInfo) => {
    if (routeInfo.count > maxCount) {
      mostFrequentRoute = routeInfo;
      maxCount = routeInfo.count;
    }
  });
  
  return {
    totalRoutes,
    totalMiles,
    mostFrequentRoute,
    avgMileagePerRoute: totalMiles / totalRoutes,
  };
}