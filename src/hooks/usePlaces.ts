import { useEffect, useState, useTransition } from "react";
import type { Place, SearchBoxFeature } from '@/lib/schemas/places';
import { getPlaces, addPlace, deletePlace } from "@/app/(main)/places/_actions/crud";

export function usePlaces() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlaces = async () => {
    setIsLoading(true);
    const data = await getPlaces();
    setPlaces(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  return {
    places,
    isLoading,
    refetch: fetchPlaces,
    isError: false, // You can add error handling if needed
  };
}

export function usePlaceMutations() {
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addPlaceItem = async (feature: SearchBoxFeature, placeName: string) => {
    setIsAdding(true);
    setError(null);
    try {
      const result = await addPlace(feature, placeName);
      if (!result) throw new Error("Failed to add place");
      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add place");
      throw e;
    } finally {
      setIsAdding(false);
    }
  };

  const deletePlaceItem = async (id: string) => {
    setIsDeleting(true);
    setError(null);
    try {
      const result = await deletePlace(id);
      if (!result) throw new Error("Failed to delete place");
      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete place");
      throw e;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    addPlace: addPlaceItem,
    deletePlace: deletePlaceItem,
    isAdding,
    isDeleting,
    error,
  };
}
