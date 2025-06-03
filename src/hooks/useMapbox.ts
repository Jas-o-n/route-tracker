import { useQuery } from '@tanstack/react-query';
import { useEffect, useState, useMemo } from 'react';
import type { SearchBoxFeature } from '@/lib/schemas/places';
import { MapboxService } from '@/lib/services/mapbox-service';

interface AddressDisplay {
  mainText: string;
  secondaryText: string;
}

const useMapboxService = () => {
  // Create a memoized instance of MapboxService
  return useMemo(() => new MapboxService(), []);
};

export function useAddressSearch(query: string) {
  const mapboxService = useMapboxService();
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return useQuery({
    queryKey: ['address-search', debouncedQuery],
    queryFn: ({ signal }) => mapboxService.getSuggestions(debouncedQuery, signal),
    enabled: debouncedQuery.length >= 3,
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useRetrievePlace(id: string | null) {
  const mapboxService = useMapboxService();

  return useQuery({
    queryKey: ['place-details', id],
    queryFn: ({ signal }) => mapboxService.retrievePlace(id!, signal),
    enabled: !!id,
    staleTime: Infinity,
  });
}

export function formatAddress(feature: SearchBoxFeature): AddressDisplay {
  try {
    const components = new MapboxService().extractAddressComponents(feature);
    return {
      mainText: components.name || 'Unnamed Location',
      secondaryText: components.shortAddress || components.address || '',
    };
  } catch (error) {
    console.error('Error formatting address:', error);
    return {
      mainText: feature.text || 'Unnamed Location',
      secondaryText: feature.place_name || '',
    };
  }
}

export type { SearchBoxFeature, AddressDisplay };