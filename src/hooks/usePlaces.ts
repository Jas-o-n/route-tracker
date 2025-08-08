import { useCallback, useState } from "react";
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
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const deletePlaceItem = useCallback(async (id: string) => {
    setError(null);
    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    try {
      await deletePlace(id);
      onSuccess?.();
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message);
      onError?.(e as Error);
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [onSuccess, onError]);

  const isDeleting = deletingIds.size > 0;
  return { deletePlace: deletePlaceItem, isDeleting, error };
}
