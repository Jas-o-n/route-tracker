import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { SearchBoxFeature } from '@/lib/schemas/places';
import type { Feature, Point, GeoJsonProperties } from 'geojson';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date from ISO string or Date object to more readable format
export function formatDate(date: string | Date | undefined | null): string {
  if (!date) {
    return 'No date';
  }
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(dateObj);
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