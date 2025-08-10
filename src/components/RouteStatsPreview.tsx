"use client";

import { Car, Route as RouteIcon, MapPin, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RouteStats } from "@/lib/schemas/routes";

interface RouteStatsPreviewProps {
  initialStats?: RouteStats | null;
}

export default function RouteStatsPreview({ initialStats }: RouteStatsPreviewProps) {
  if (!initialStats) {
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
      value: initialStats.totalRoutes,
      icon: <RouteIcon className="h-6 w-6" />,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Total Kilometers",
      value: `${initialStats.totalKilometers.toLocaleString()} km`,
      icon: <Car className="h-6 w-6" />,
      color: "text-teal-500",
      bgColor: "bg-teal-50 dark:bg-teal-950",
    },
    {
      title: "Total Today",
      value: `${initialStats.totalKilometersToday.toLocaleString()} km`,
      icon: <MapPin className="h-6 w-6" />,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
    {
      title: "Total This Month",
      value: `${initialStats.totalKilometersThisMonth.toLocaleString()} km`,
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}