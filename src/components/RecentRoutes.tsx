"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getRecentRoutes } from "@/lib/actions/route-actions";
import { Route } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function RecentRoutes() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRoutes() {
      try {
        const recentRoutes = await getRecentRoutes();
        setRoutes(recentRoutes);
      } catch (error) {
        console.error("Failed to load recent routes:", error);
      } finally {
        setLoading(false);
      }
    }

    loadRoutes();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="h-48 bg-muted"></div>
            </CardContent>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (routes.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground mb-4">You haven't added any routes yet.</p>
        <Button asChild>
          <Link href="/routes/new">Add Your First Route</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {routes.map((route) => (
        <Card key={route.id} className="overflow-hidden group transition-all hover:shadow-md">
          <CardContent className="px-6 pt-6 pb-4">
            <div className="flex justify-between items-start mb-4">
              <Badge variant="outline" className="text-xs">
                {route.mileage} miles
              </Badge>
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(route.date)}
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex items-start mb-1">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">From</div>
                    <div className="text-sm">{route.startLocation}</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">To</div>
                    <div className="text-sm">{route.destination}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="px-6 py-4 bg-muted/40 flex justify-end">
            <Button variant="ghost" size="sm" asChild className="group-hover:text-primary">
              <Link href={`/routes/${route.id}`}>
                View Details
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}