import { useEffect, useState, useTransition } from "react";
import type { Place, SearchBoxFeature } from '@/lib/schemas/places';
import { getPlacesAction, addPlaceAction, deletePlaceAction } from "@/app/places/place-actions";

export function usePlaces() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlaces = async () => {
    setIsLoading(true);
    const data = await getPlacesAction();
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

  const addPlace = async (feature: SearchBoxFeature, placeName: string) => {
    setIsAdding(true);
    setError(null);
    try {
      await addPlaceAction(feature, placeName);
    } catch (e) {
      setError("Failed to add place");
    } finally {
      setIsAdding(false);
    }
  };

  const deletePlace = async (id: string) => {
    setIsDeleting(true);
    setError(null);
    try {
      await deletePlaceAction(id);
    } catch (e) {
      setError("Failed to delete place");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    addPlace,
    deletePlace,
    isAdding,
    isDeleting,
    error,
  };
}
