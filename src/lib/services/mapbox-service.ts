import type { SearchBoxFeature, Coordinates, AddressComponents } from '@/lib/schemas/places';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

if (!MAPBOX_TOKEN) {
  throw new Error('MAPBOX_TOKEN is required');
}

export class MapboxService {
  private buildUrl(endpoint: string, params: Record<string, string> = {}): string {
    const searchParams = new URLSearchParams(params);
    searchParams.append('access_token', MAPBOX_TOKEN!);
    return `https://api.mapbox.com/geocoding/v5/mapbox.places/${endpoint}.json?${searchParams.toString()}`;
  }

  async getSuggestions(query: string, signal?: AbortSignal): Promise<SearchBoxFeature[]> {
    if (!query || query.length < 3) return [];

    try {
      const params = {
        limit: '5',
        types: 'address',
        language: 'en',
        autocomplete: 'true'
      };

      const res = await fetch(this.buildUrl(encodeURIComponent(query), params), { 
        signal,
        headers: { 'Accept': 'application/json' }
      });

      const payload = await res
        .clone()          // avoid body-consumed issues
        .json()
        .catch(() => null);

      if (!res.ok || !payload) {
        throw new Error(
          (payload as any)?.message || res.statusText || 'Failed to fetch suggestions'
        );
      }

      const data = payload;
      if (!data.features?.length) return [];

      return data.features.map((feature: any) => ({
        id: feature.id,
        text: feature.text || feature.place_name,
        place_name: feature.place_name,
        center: feature.center,
        geometry: feature.geometry,
        properties: {
          ...feature.properties,
          address: feature.address,
          place_formatted: feature.place_name,
          context: feature.context?.reduce((acc: any, ctx: any) => {
            if (ctx.id?.startsWith('place')) acc.place = { name: ctx.text };
            if (ctx.id?.startsWith('region')) acc.region = { name: ctx.text };
            if (ctx.id?.startsWith('postcode')) acc.postcode = { name: ctx.text };
            if (ctx.id?.startsWith('country')) acc.country = { name: ctx.text };
            return acc;
          }, {})
        }
      }));
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Mapbox suggestion error:', error);
      }
      throw error;
    }
  }

  extractCoordinates(feature: SearchBoxFeature): Coordinates {
    if (!feature) throw new Error('Feature object is required');

    // Try geometry coordinates first, then fall back to center
    const coords = feature.geometry?.coordinates || feature.center;
    if (!coords?.length) throw new Error('No coordinates found in feature');

    return {
      latitude: coords[1],
      longitude: coords[0]
    };
  }

  extractAddressComponents(feature: SearchBoxFeature): AddressComponents {
    if (!feature?.properties) {
      throw new Error('Invalid feature object');
    }

    const { properties, place_name = '', text = '' } = feature;
    const context = properties.context || {};

    const components: AddressComponents = {
      name: text || properties.name,
      address: place_name,
      addressLine1: text,
      addressLine2: properties.address,
      city: context.place?.name,
      region: context.region?.name,
      postcode: context.postcode?.name,
      country: context.country?.name,
    };

    // Set short address
    components.shortAddress = [components.addressLine2, components.addressLine1]
      .filter(Boolean)
      .join(' ');

    return components;
  }
}
