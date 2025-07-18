import { useEffect, useState, useTransition } from "react";
import type { Route, RouteFormData, RouteStats } from '@/lib/schemas/routes';
import { getAllRoutes, deleteRoute as deleteRouteServer, createRoute, getRouteById, updateRoute } from "@/app/routes/_actions/crud";
import { getRouteStats } from "@/app/routes/_actions/stats";
import { getRecentRoutes } from "@/app/routes/_actions/recent";

export function useRoutes() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setIsLoading(true);
    getAllRoutes().then((data: Route[]) => {
      setRoutes(data);
      setIsLoading(false);
    });
  }, []);

  const deleteRoute = async (id: string) => {
    setIsDeleting(true);
    setDeletingId(id);
    try {
      await deleteRouteServer(id);
      // Refresh routes after deletion
      const data = await getAllRoutes();
      setRoutes(data);
    } catch (error) {
      // Log or handle the error as needed
      console.error('Failed to delete route:', error);
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  return {
    routes,
    isLoading,
    isDeleting,
    deletingId,
    deleteRoute,
  };
}

export function useAddRoute() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const addRoute = async (data: RouteFormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await createRoute(data);
      } catch (e) {
        setError("Failed to add route");
      }
    });
  };

  return { addRoute, isPending, error };
}

export function useRouteStats() {
  const [data, setData] = useState<RouteStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getRouteStats().then((stats: RouteStats) => {
      setData(stats);
      setIsLoading(false);
    });
  }, []);

  return { data, isLoading };
}

export function useRecentRoutes(limit = 3) {
  const [data, setData] = useState<Route[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getRecentRoutes(limit).then((routes: Route[]) => {
      setData(routes);
      setIsLoading(false);
    });
  }, [limit]);

  return { data, isLoading };
}

export function useRoute(id: string) {
  const [data, setData] = useState<Route | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setIsError(false);
    getRouteById(id)
      .then((route: Route | null) => {
        setData(route);
        setIsLoading(false);
      })
      .catch(() => {
        setIsError(true);
        setIsLoading(false);
      });
  }, [id]);

  return { data, isLoading, isError };
}

export function useEditRoute(id: string) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateRouteData = async (data: Partial<RouteFormData>) => {
    setIsUpdating(true);
    setError(null);
    try {
      await updateRoute(id, data);
    } catch (e) {
      setError("Failed to update route");
    } finally {
      setIsUpdating(false);
    }
  };
  return { updateRoute: updateRouteData, isUpdating, error };
}