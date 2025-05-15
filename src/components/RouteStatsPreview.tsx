"use client";

import { useEffect, useState } from "react";
import { Car, Route as RouteIcon, MapPin, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getRouteStats } from "@/lib/actions/route-actions";
import { Skeleton } from "@/components/ui/skeleton";

interface RouteStats {
  totalRoutes: number;
  totalMiles: number;
  mostFrequentRoute: {
    from: string;
    to: string;
    count: number;
  } | null;
  avgMileagePerRoute: number;
}

export default function RouteStatsPreview() {
  const [stats, setStats] = useState<RouteStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const routeStats = await getRouteStats();
        setStats(routeStats);
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-10 w-10 rounded-full mb-4" />
              <Skeleton className="h-7 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No route statistics available yet.</p>
        </CardContent>
      </Card>
    );
  }

  const statCards = [
    {
      title: "Total Routes",
      value: stats.totalRoutes,
      icon: <RouteIcon className="h-6 w-6" />,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Total Miles",
      value: `${stats.totalMiles.toLocaleString()} mi`,
      icon: <Car className="h-6 w-6" />,
      color: "text-teal-500",
      bgColor: "bg-teal-50 dark:bg-teal-950",
    },
    {
      title: "Most Frequent Route",
      value: stats.mostFrequentRoute
        ? `${stats.mostFrequentRoute.from} → ${stats.mostFrequentRoute.to}`
        : "N/A",
      subtitle: stats.mostFrequentRoute ? `${stats.mostFrequentRoute.count} times` : "",
      icon: <MapPin className="h-6 w-6" />,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
    {
      title: "Avg. Miles per Route",
      value: `${stats.avgMileagePerRoute.toFixed(1)} mi`,
      icon: <TrendingUp className="h-6 w-6" />,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="overflow-hidden transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div
              className={`rounded-full w-12 h-12 flex items-center justify-center mb-4 ${stat.bgColor} ${stat.color}`}
            >
              {stat.icon}
            </div>
            <h3 className="text-lg font-medium">{stat.title}</h3>
            <p className="text-2xl font-bold">{stat.value}</p>
            {stat.subtitle && <p className="text-sm text-muted-foreground">{stat.subtitle}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}