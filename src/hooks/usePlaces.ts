import { useState } from "react";
import type { SearchBoxFeature } from '@/lib/schemas/places';
import { addPlace, deletePlace } from "@/app/(main)/places/_actions/crud";

export function useAddPlace(onSuccess?: () => void, onError?: (err: Error) => void) {
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addPlaceItem = async (feature: SearchBoxFeature, placeName: string) => {
    setIsAdding(true);
    setError(null);
    try {
      await addPlace(feature, placeName);
      onSuccess?.();
    } catch (e) {
      setError("Failed to add place");
      onError?.(e as Error);
    } finally {
      setIsAdding(false);
    }
  };

  return { addPlace: addPlaceItem, isAdding, error };
}

export function useDeletePlace(onSuccess?: () => void, onError?: (err: Error) => void) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deletePlaceItem = async (id: string) => {
    setIsDeleting(true);
    setError(null);
    try {
      await deletePlace(id);
      onSuccess?.();
    } catch (e) {
      setError("Failed to delete place");
      onError?.(e as Error);
    } finally {
      setIsDeleting(false);
    }
  };

  return { deletePlace: deletePlaceItem, isDeleting, error };
}
