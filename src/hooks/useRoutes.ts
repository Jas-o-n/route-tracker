import { useState, useTransition } from "react";
import type { RouteFormData } from '@/lib/schemas/routes';
import { createRoute, updateRoute, deleteRoute } from "@/app/(main)/routes/_actions/crud";

export function useAddRoute(onSuccess?: () => void, onError?: (err: Error) => void) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const addRoute = async (data: RouteFormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await createRoute(data);
        onSuccess?.();
      } catch (e) {
        setError("Failed to add route");
        onError?.(e as Error);
      }
    });
  };

  return { addRoute, isPending, error };
}

export function useEditRoute(id: string, onSuccess?: () => void, onError?: (err: Error) => void) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateRouteData = async (data: Partial<RouteFormData>) => {
    setIsUpdating(true);
    setError(null);
    try {
      await updateRoute(id, data);
      onSuccess?.();
    } catch (e) {
      setError("Failed to update route");
      onError?.(e as Error);
    } finally {
      setIsUpdating(false);
    }
  };
  return { updateRoute: updateRouteData, isUpdating, error };
}

export function useDeleteRoute(onSuccess?: () => void, onError?: (err: Error) => void) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteRouteById = async (id: string) => {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteRoute(id);
      onSuccess?.();
    } catch (e) {
      setError("Failed to delete route");
      onError?.(e as Error);
    } finally {
      setIsDeleting(false);
    }
  };
  return { deleteRoute: deleteRouteById, isDeleting, error };
}