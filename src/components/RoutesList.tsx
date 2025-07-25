"use client";

import Link from "next/link";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { DeleteButton } from "@/components/DeleteButton";
import { useRoutes } from "@/hooks/useRoutes";
import { usePlaces } from "@/hooks/usePlaces";

interface RoutesListProps {
  searchQuery: string;
  sortBy: string;
}

export default function RoutesList({ searchQuery, sortBy }: RoutesListProps) {
  const { routes, isLoading, deleteRoute, isDeleting } = useRoutes();
  const { places } = usePlaces();

  // Create a Map for O(1) place lookups
  const placesMap = new Map(places.map(place => [place.id, place]));

  // Filter and sort routes
  const filteredRoutes = routes
    .filter((route) => {
      if (!searchQuery) return true;
      const search = searchQuery.toLowerCase();
      const fromPlace = placesMap.get(route.fromPlaceId);
      const toPlace = placesMap.get(route.toPlaceId);
      return (
        fromPlace?.name.toLowerCase().includes(search) ||
        toPlace?.name.toLowerCase().includes(search) ||
        (route.notes && route.notes.toLowerCase().includes(search))
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "kilometer-desc":
          return (
            b.endMileage - b.startMileage - (a.endMileage - a.startMileage)
          );
        case "kilometer-asc":
          return (
            a.endMileage - a.startMileage - (b.endMileage - b.startMileage)
          );
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

  if (isLoading) {
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

  if (!routes?.length) {
    return (
      <Card className="p-6 text-center">
        {searchQuery ? (
          <p className="text-muted-foreground">
            No routes match your search criteria.
          </p>
        ) : (
          <>
            <p className="text-muted-foreground mb-4">
              You haven't added any routes yet.
            </p>
            <Button asChild>
              <Link href="/routes/new">Add Your First Route</Link>
            </Button>
          </>
        )}
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredRoutes.map((route) => {
        const fromPlace = places.find((p) => p.id === route.fromPlaceId);
        const toPlace = places.find((p) => p.id === route.toPlaceId);
        const mileage = route.endMileage - route.startMileage;

        return (
          <Card
            key={route.id}
            className="flex flex-col justify-between h-full rounded-2xl shadow-md border border-muted bg-background/80 p-6 relative"
          >
            <div className="absolute top-3 right-3 z-10">
              <DeleteButton
                onDelete={() => deleteRoute(route.id)}
                isDeleting={isDeleting}
              />
            </div>
            <div>
              <div className="text-2xl font-bold mb-2">{mileage} km</div>
              <div className="flex items-center text-base font-medium mb-4 flex-wrap min-w-0">
                <span className="text-primary font-semibold mr-2 truncate max-w-[6rem] min-w-0">{fromPlace?.name}</span>
                <span className="mx-1 text-xl text-muted-foreground shrink-0">→</span>
                <span className="flex items-center text-muted-foreground mr-2 min-w-0">
                  <span className="sr-only">To</span>
                </span>
                <span className="text-primary font-semibold truncate max-w-[6rem] min-w-0">{toPlace?.name}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="text-muted-foreground text-lg">{formatDate(route.date)}</div>
              <Button variant="outline" size="lg" className="text-lg font-semibold px-6 py-2" asChild>
                <Link href={`/routes/${route.id}`}>View Details</Link>
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}