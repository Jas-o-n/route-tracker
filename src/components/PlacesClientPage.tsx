"use client";

import { useEffect, useState } from "react";
import { useAddPlace, useDeletePlace } from "@/hooks/usePlaces";
import { useToast } from "@/hooks/use-toast";
import { AddPlaceForm } from "@/components/AddPlaceForm";
import PlacesFilterBar from "@/components/PlacesFilterBar";
import { PlacesList } from "@/components/PlacesList";
import type { Place, SearchBoxFeature } from "@/lib/schemas/places";
import { useRouter } from "next/navigation";

interface PlacesClientPageProps {
  places: Place[];
}

export default function PlacesClientPage({ places }: PlacesClientPageProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { addPlace, isAdding } = useAddPlace(
    () => {
      toast({ title: "Success", description: "Place added successfully" });
      router.refresh();
    },
    (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add place",
        variant: "destructive",
      });
    }
  );
  const { deletePlace, isDeleting } = useDeletePlace(
    () => {
      toast({ title: "Success", description: "Place deleted successfully" });
      router.refresh();
    },
    (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete place",
        variant: "destructive",
      });
    }
  );

  async function handleAddPlace(feature: SearchBoxFeature, name: string) {
    await addPlace(feature, name);
  }

  async function handleDeletePlace(id: string) {
    await deletePlace(id);
  }

  // Local filtered list to drive the UI from the search bar
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>(places);

  // Keep filteredPlaces in sync when the source `places` changes (e.g., after add/delete)
  useEffect(() => setFilteredPlaces(places), [places]);

  return (
    <main className="container mx-auto max-w-5xl py-8 px-4 md:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Saved Places</h1>
        <AddPlaceForm onAddPlace={handleAddPlace} isAdding={isAdding} />
      </div>
      <div className="mb-6">
        <PlacesFilterBar places={places} onFiltered={(p) => setFilteredPlaces(p)} />
      </div>
      <PlacesList places={filteredPlaces} handleDeletePlace={handleDeletePlace} />
    </main>
  );
} 