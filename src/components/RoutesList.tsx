"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllRoutes } from "@/lib/actions/route-actions";
import { Route } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface RoutesListProps {
  searchQuery: string;
  sortBy: string;
}

export default function RoutesList({ searchQuery, sortBy }: RoutesListProps) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRoutes() {
      try {
        const allRoutes = await getAllRoutes();
        setRoutes(allRoutes);
      } catch (error) {
        console.error("Failed to load routes:", error);
      } finally {
        setLoading(false);
      }
    }

    loadRoutes();
  }, []);

  // Filter and sort routes
  const filteredRoutes = routes
    .filter((route) => {
      if (!searchQuery) return true;
      const search = searchQuery.toLowerCase();
      return (
        route.startLocation.toLowerCase().includes(search) ||
        route.destination.toLowerCase().includes(search) ||
        (route.notes && route.notes.toLowerCase().includes(search))
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "miles-desc":
          return b.mileage - a.mileage;
        case "miles-asc":
          return a.mileage - b.mileage;
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="space-y-4 md:w-2/3">
                  <Skeleton className="h-5 w-48" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
                <div className="mt-4 md:mt-0 flex items-center justify-between md:w-1/3 md:justify-end">
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredRoutes.length === 0) {
    return (
      <Card className="p-6 text-center">
        {searchQuery ? (
          <p className="text-muted-foreground">No routes match your search criteria.</p>
        ) : (
          <>
            <p className="text-muted-foreground mb-4">You haven't added any routes yet.</p>
            <Button asChild>
              <Link href="/routes/new">Add Your First Route</Link>
            </Button>
          </>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {filteredRoutes.map((route) => (
        <Card key={route.id} className="group hover:shadow-md transition-shadow">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between md:justify-start">
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2">
                      {route.mileage} miles
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(route.date)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-muted-foreground">From</div>
                      <div className="font-medium">{route.startLocation}</div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-muted-foreground">To</div>
                      <div className="font-medium">{route.destination}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 md:mt-0 md:ml-4 flex justify-end">
                <Button asChild variant="outline" size="sm" className="group-hover:bg-primary/5">
                  <Link href={`/routes/${route.id}`}>
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}