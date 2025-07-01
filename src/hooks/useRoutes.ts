import { useEffect, useState, useTransition } from "react";
import type { Route, RouteFormData, RouteStats } from '@/lib/schemas/routes';
import { getAllRoutesAction, deleteRouteAction, createRouteAction, getRouteByIdAction, updateRouteAction } from "@/app/routes/route-actions";
import { getRouteStatsAction } from "@/app/routes/route-stats-action";
import { getRecentRoutesAction } from "@/app/routes/recent-routes-action";

export function useRoutes() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setIsLoading(true);
    getAllRoutesAction().then((data) => {
      setRoutes(data);
      setIsLoading(false);
    });
  }, []);

  const deleteRoute = async (id: string) => {
    setIsDeleting(true);
    setDeletingId(id);
    await deleteRouteAction(id);
    // Refresh routes after deletion
    const data = await getAllRoutesAction();
    setRoutes(data);
    setIsDeleting(false);
    setDeletingId(null);
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
        await createRouteAction(data);
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
    getRouteStatsAction().then((stats) => {
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
    getRecentRoutesAction(limit).then((routes) => {
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
    getRouteByIdAction(id)
      .then((route) => {
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

  const updateRoute = async (data: any) => {
    setIsUpdating(true);
    setError(null);
    try {
      await updateRouteAction(id, data);
    } catch (e) {
      setError("Failed to update route");
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateRoute, isUpdating, error };
}