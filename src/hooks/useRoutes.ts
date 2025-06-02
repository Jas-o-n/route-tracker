import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as routeActions from '@/lib/actions/route-actions';
import { Route, RouteFormData, RouteWithStats, UpdateRouteInput } from '@/lib/schemas/routes';

interface DeleteOptions {
  onSuccess?: () => void;
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
    routes,
    deleteRoute: async (id: string, options?: DeleteOptions) => {
      await deleteRouteMutation.mutateAsync(id, { onSuccess: options?.onSuccess });
    },
    deletingId: deleteRouteMutation.isPending ? deleteRouteMutation.variables as string : null,
    isDeleting: deleteRouteMutation.isPending,
  };
}

export function useRoute(id: string) {
  return useQuery<RouteWithStats | null>({
    queryKey: ['route', id],
    queryFn: () => routeActions.getRouteById(id),
  });
}

export function useRouteStats() {
  return useQuery({
    queryKey: ['routeStats'],
    queryFn: routeActions.getRouteStats,
    staleTime: 5 * 60 * 1000, // Consider stats stale after 5 minutes
  });
}

export function useRecentRoutes() {
  return useQuery({
    queryKey: ['recentRoutes'],
    queryFn: () => routeActions.getRecentRoutes(),
    staleTime: 30 * 1000, // Consider recent routes stale after 30 seconds
  });
}

export function useEditRoute(id: string) {
  const queryClient = useQueryClient();

  const editMutation = useMutation({
    mutationFn: (data: UpdateRouteInput) => routeActions.updateRoute(id, data),
    onSuccess: (updatedRoute) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      queryClient.invalidateQueries({ queryKey: ['route', id] });
      
      // Update route in cache immediately
      queryClient.setQueryData(['route', id], updatedRoute);
    },
  });

  return {
    updateRoute: editMutation.mutate,
    isUpdating: editMutation.isPending,
    error: editMutation.error,
  };
}

export function useAddRoute() {
  const queryClient = useQueryClient();
  
  const addRouteMutation = useMutation({
    mutationFn: (data: RouteFormData) => routeActions.addRoute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      queryClient.invalidateQueries({ queryKey: ['routeStats'] });
    },
  });

  return {
    addRoute: addRouteMutation.mutate,
    isAdding: addRouteMutation.isPending,
    error: addRouteMutation.error,
  };
}