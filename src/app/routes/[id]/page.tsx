"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Edit, MapPin, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { getRouteById, deleteRoute } from "@/lib/actions/route-actions";
import { RouteWithStats } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import RouteMap from "@/components/RouteMap";

export default function RouteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [route, setRoute] = useState<RouteWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadRoute() {
      try {
        const routeData = await getRouteById(id);
        setRoute(routeData);
      } catch (error) {
        console.error("Failed to load route:", error);
      } finally {
        setLoading(false);
      }
    }

    loadRoute();
  }, [id]);

  async function handleDeleteRoute() {
    setIsDeleting(true);
    try {
      await deleteRoute(id);
      router.push("/routes");
    } catch (error) {
      console.error("Failed to delete route:", error);
      setIsDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-3xl py-8 px-4 md:px-6 flex justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!route) {
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

  return (
    <main className="container mx-auto max-w-4xl py-8 px-4 md:px-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-4">
            <Link href="/routes">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Route Details</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/routes/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this route and remove it from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteRoute}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Route Map</CardTitle>
            </CardHeader>
            <CardContent>
              <RouteMap route={route} />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Route Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Date</h3>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{formatDate(route.date)}</span>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Start Location</h3>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{route.startLocation}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Destination</h3>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{route.destination}</span>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Mileage</h3>
                  <div className="flex items-center">
                    <Badge variant="outline" className="text-base font-medium">
                      {route.mileage} miles
                    </Badge>
                  </div>
                </div>

                {route.notes && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Notes</h3>
                      <p className="text-sm">{route.notes}</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Times Driven</span>
                  <span className="font-medium">{route.stats?.timesDriven || 1}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Average Mileage</span>
                  <span className="font-medium">{route.stats?.avgMileage || route.mileage} miles</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Last Driven</span>
                  <span className="font-medium">{formatDate(route.date)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}