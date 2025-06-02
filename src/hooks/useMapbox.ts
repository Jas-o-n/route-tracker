import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import type { SearchBoxFeature } from '@/lib/schemas/places';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface SearchBoxResponse {
  suggestions: SearchBoxFeature[];
}

const sessionToken = crypto.randomUUID();

async function searchAddress(query: string, signal?: AbortSignal): Promise<SearchBoxFeature[]> {
  if (!query || query.length < 2) return [];

  if (!MAPBOX_TOKEN) {
    throw new Error("Address autocomplete is not available - API token not configured");
  }

  const res = await fetch(
    `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(query)}&access_token=${MAPBOX_TOKEN}&session_token=${sessionToken}&language=en&limit=5`,
    { signal }
  );

  if (!res.ok) {
    throw new Error(`Mapbox API error: ${res.statusText}`);
  }

  const data: SearchBoxResponse = await res.json();
  return data.suggestions;
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
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: false,
    gcTime: 1000 * 60 * 60,
  });
}

export type { SearchBoxFeature };