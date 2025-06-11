import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { SearchBoxFeature } from '@/lib/schemas/places';
import type { Feature, Point, GeoJsonProperties } from 'geojson';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date from YYYY-MM-DD to more readable format
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

// Convert SearchBoxFeature to GeoJSON Feature
export function convertToGeoJSONFeature(feature: SearchBoxFeature): Feature<Point, GeoJsonProperties> {
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: feature.center,
    },
    properties: {
      ...feature.properties,
      mapboxId: feature.mapbox_id,
      placeName: feature.place_name,
    },
  };
}