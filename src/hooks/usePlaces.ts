import { useEffect, useState } from 'react';
import { getPlaces, type Place } from '@/lib/actions/place-actions';

export function usePlaces() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPlaces() {
      try {
        const data = await getPlaces();
        setPlaces(data);
      } catch (error) {
        console.error('Failed to load places:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadPlaces();
  }, []);

  return { places, isLoading };
}
