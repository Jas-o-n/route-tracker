"use client";

import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlaces, usePlaceMutations } from "@/hooks/usePlaces";
import { useToast } from "@/hooks/use-toast";
import { AddPlaceForm } from "@/components/AddPlaceForm";
import { PlacesList } from "@/components/PlacesList";
import type { SearchBoxFeature } from "@/lib/schemas/places";

export default function PlacesPage() {
  const { toast } = useToast();
  const { places, isLoading, refetch } = usePlaces();
  const { addPlace, deletePlace, isAdding } = usePlaceMutations();

  async function handleAddPlace(feature: SearchBoxFeature, name: string) {
    try {
      await addPlace(feature, name);
      await refetch();
      toast({ title: "Success", description: "Place added successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add place",
        variant: "destructive",
      });
    }
  }

  async function handleDeletePlace(id: string) {
    try {
      await deletePlace(id);
      await refetch();
      toast({ title: "Success", description: "Place deleted successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete place. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <main className="container mx-auto max-w-5xl py-8 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Saved Places</h1>
        <AddPlaceForm onAddPlace={handleAddPlace} isAdding={isAdding} />
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <PlacesList places={places} handleDeletePlace={handleDeletePlace} />
      )}
    </main>
  );
}