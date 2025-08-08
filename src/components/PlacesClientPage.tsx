"use client";

import { useState } from "react";
import { useAddPlace, useDeletePlace } from "@/hooks/usePlaces";
import { useToast } from "@/hooks/use-toast";
import { AddPlaceForm } from "@/components/AddPlaceForm";
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

  return (
    <main className="container mx-auto max-w-5xl py-8 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Saved Places</h1>
        <AddPlaceForm onAddPlace={handleAddPlace} isAdding={isAdding} />
      </div>
      <PlacesList places={places} handleDeletePlace={handleDeletePlace} />
    </main>
  );
} 