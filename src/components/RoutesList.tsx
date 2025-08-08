"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { DeleteButton } from "@/components/DeleteButton";
import { type Route } from "@/lib/schemas/routes";
import { type Place } from "@/lib/schemas/places";
import { useDeleteRoute } from "@/hooks/useRoutes";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface RoutesListProps {
  routes: Route[];
  places: Place[];
  searchQuery: string;
  sortBy: string;
}

export default function RoutesList({ routes, places, searchQuery, sortBy }: RoutesListProps) {
  // Create a Map for O(1) place lookups
  const placesMap = new Map(places.map(place => [place.id, place]));

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();
  const { deleteRoute, isDeleting } = useDeleteRoute(
    () => {
      router.refresh();
      setDeletingId(null);
    },
    () => setDeletingId(null)
  );

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
                onDelete={async () => {
                  setDeletingId(route.id);
                  await deleteRoute(route.id);
                }}
                isDeleting={isDeleting && deletingId === route.id}
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