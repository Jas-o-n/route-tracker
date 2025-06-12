import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as routeActions from '@/lib/actions/route-actions';
import type { Route, RouteFormData, RouteWithStats, RouteModel } from '@/lib/schemas/routes';

interface DeleteOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface AddOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useRoutes() {
  const queryClient = useQueryClient();

  const routes = useQuery<Route[]>({
    queryKey: ['routes'],
    queryFn: routeActions.getAllRoutes,
  });

  const deleteRouteMutation = useMutation({
    mutationFn: routeActions.deleteRoute,
    onSuccess: (_, __, context: { onSuccess?: () => void } | undefined) => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      queryClient.invalidateQueries({ queryKey: ['routeStats'] });
      context?.onSuccess?.();
    },
  });

  return {
    routes: routes.data ?? [],
    isLoading: routes.isLoading,
    isError: routes.isError,
    deleteRoute: async (id: string, options?: DeleteOptions) => {
      await deleteRouteMutation.mutateAsync(id, { onSuccess: options?.onSuccess });
    },
    deletingId: deleteRouteMutation.isPending ? deleteRouteMutation.variables as string : null,
    isDeleting: deleteRouteMutation.isPending,
  };
}

export function useAddRoute() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: RouteFormData) => routeActions.createRoute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      queryClient.invalidateQueries({ queryKey: ['routeStats'] });
    },
  });

  return {
    addRoute: async (data: RouteFormData, options?: AddOptions) => {
      try {
        await mutation.mutateAsync(data);
        options?.onSuccess?.();
      } catch (error) {
        options?.onError?.(error instanceof Error ? error : new Error('Failed to add route'));
        throw error;
      }
    },
    isAdding: mutation.isPending,
  };
}

export function useRoute(id: string) {
  return useQuery({
    queryKey: ['route', id],
    queryFn: () => routeActions.getRouteById(id),
    enabled: !!id,
  });
}

export function useRecentRoutes() {
  return useQuery<Route[]>({
    queryKey: ['routes', 'recent'],
    queryFn: () => routeActions.getRecentRoutes(),
  });
}

export function useRouteStats() {
  return useQuery({
    queryKey: ['routeStats'],
    queryFn: routeActions.getRouteStats,
    staleTime: 5 * 60 * 1000, // Consider stats stale after 5 minutes
  });
}