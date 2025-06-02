import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

interface MapboxFeature {
  id: string;
  place_name: string;
  text: string;
  center: [number, number];
}

interface MapboxResponse {
  features: MapboxFeature[];
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

async function searchAddress(query: string, signal?: AbortSignal) {
  if (!query || query.length < 2) {
    return [];
  }

  if (!MAPBOX_TOKEN) {
    throw new Error("Address autocomplete is not available - API token not configured");
  }

  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true`,
    { signal }
  );

  if (!res.ok) {
    throw new Error(`Mapbox API error: ${res.statusText}`);
  }

  const data: MapboxResponse = await res.json();
  return data.features;
}

export function useAddressSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  return useQuery({
    queryKey: ['address-search', debouncedQuery],
    queryFn: ({ signal }) => searchAddress(debouncedQuery, signal),
    enabled: debouncedQuery.length >= 2,
    staleTime: 1000 * 60 * 5, // Cache results for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: false,
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

export type { MapboxFeature };