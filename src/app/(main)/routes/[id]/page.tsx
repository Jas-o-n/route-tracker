"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Edit, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import RouteMap from "@/components/RouteMap";
import { usePlaces } from "@/hooks/usePlaces";
import { DeleteButton } from "@/components/DeleteButton";
import { useRoute, useRoutes } from "@/hooks/useRoutes";

function formatMileage(value: number | undefined | null): string {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0';
  }
  return value.toLocaleString();
}

export default function RouteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { places, isLoading: placesLoading } = usePlaces();
  const { data: route, isLoading: routeLoading, isError } = useRoute(id);
  const { deleteRoute, isDeleting } = useRoutes();

  const handleDeleteRoute = async () => {
    await deleteRoute(id);
    router.push("/routes");
  };
  
  if (routeLoading || placesLoading) {
    return (
      <div className="container mx-auto max-w-3xl py-8 px-4 md:px-6 flex justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (isError || !route) {
    return (
      <div className="container mx-auto max-w-3xl py-8 px-4 md:px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Route Not Found</h1>
          <p className="mb-6">The route you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link href="/routes">Back to Routes</Link>
          </Button>
        </div>
      </div>
    );
  }

  const fromPlace = places.find(p => p.id === route.fromPlaceId);
  const toPlace = places.find(p => p.id === route.toPlaceId);
  const mileage = route.endMileage - route.startMileage;

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/routes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">Route Details</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/routes/${route.id}/edit`}>Edit</Link>
          </Button>
          <DeleteButton 
            onDelete={handleDeleteRoute} 
            isDeleting={isDeleting}
          />
        </div>
      </div>

      {/* Main Content - Updated Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Route Info and Stats */}
        <div className="space-y-6">
          {/* Route Information */}
          <Card>
            <CardHeader>
              <CardTitle>Route Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{formatDate(route.date)}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Start Location</p>
                  <p className="font-medium">{fromPlace?.name}</p>
                  <p className="text-sm text-muted-foreground">{fromPlace?.full_address}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Destination</p>
                  <p className="font-medium">{toPlace?.name}</p>
                  <p className="text-sm text-muted-foreground">{toPlace?.full_address}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Mileage</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Start</p>
                    <p className="font-medium">{formatMileage(route.startMileage)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">End</p>
                    <p className="font-medium">{formatMileage(route.endMileage)}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <Badge variant="secondary">
                    {formatMileage(mileage)} km total
                  </Badge>
                </div>
              </div>

              {route.notes && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Notes</p>
                  <p>{route.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Map */}
        <div className="lg:flex lg:flex-col">
          <Card>
            <CardHeader>
              <CardTitle>Route Map</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[400px]">
                <RouteMap 
                  fromPlace={fromPlace} 
                  toPlace={toPlace} 
                  mileage={mileage}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}