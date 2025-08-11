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
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
}

// Safe for filenames: uses hyphens instead of slashes
export function formatDateForFilename(date: string | Date | undefined | null): string {
  if (!date) {
    return 'dd-mm-yyyy';
  }
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) {
    return 'dd-mm-yyyy';
  }
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${day}-${month}-${year}`;
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