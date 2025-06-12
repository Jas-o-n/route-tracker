import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPlaces, addPlace, deletePlace, type Place } from '@/lib/actions/place-actions';
import { SearchBoxFeature } from '@/lib/schemas/places';

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

  const addMutation = useMutation({
    mutationFn: ({ feature, placeName }: { feature: SearchBoxFeature; placeName: string }) => {
      console.log('Mutation executing with feature:', feature, 'and name:', placeName);
      return addPlace(feature, placeName);
    },
    onSuccess: () => {
      console.log('Mutation succeeded, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['places'] });
    },
    onError: (error) => {
      console.error('Mutation failed:', error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePlace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
    },
  });

  return {
    addPlace: addMutation.mutate,
    deletePlace: deleteMutation.mutate,
    isAdding: addMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
