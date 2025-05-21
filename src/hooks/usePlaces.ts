import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPlaces, addPlace, deletePlace, type Place } from '@/lib/actions/place-actions';

export function usePlaces() {
  const query = useQuery<Place[]>({
    queryKey: ['places'],
    queryFn: getPlaces,
  });

  return {
    places: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

export function usePlaceMutations() {
  const queryClient = useQueryClient();

  const addPlaceMutation = useMutation({
    mutationFn: addPlace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
    },
  });

  const deletePlaceMutation = useMutation({
    mutationFn: deletePlace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
    },
  });

  return {
    addPlace: addPlaceMutation.mutate,
    deletePlace: deletePlaceMutation.mutate,
    isAdding: addPlaceMutation.isPending,
    isDeleting: deletePlaceMutation.isPending,
  };
}
