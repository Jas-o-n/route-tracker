import type { SearchBoxFeature, Coordinates, AddressComponents } from '@/lib/schemas/places';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

if (!MAPBOX_TOKEN) {
  throw new Error('MAPBOX_TOKEN is required');
}

// Coordinate validation constants
const COORDINATE_LIMITS = {
  MIN_LATITUDE: -90,
  MAX_LATITUDE: 90,
  MIN_LONGITUDE: -180,
  MAX_LONGITUDE: 180,
} as const;

export class MapboxService {
  private sessionToken: string;
  private debug: boolean;

  constructor(debug = false) {
    this.sessionToken = crypto.randomUUID();
    this.debug = debug;
  }

  private log(...args: unknown[]) {
    if (this.debug) {
      console.log('[MapboxService]', ...args);
    }
  }
  private logError(...args: unknown[]) {
    // Ensure objects are properly stringified
    const formattedArgs = args.map(arg => 
      arg instanceof Error ? arg.message :
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) :
      String(arg)
    );
    console.error('[MapboxService]', ...formattedArgs);
  }

  private refreshSessionToken() {
    this.sessionToken = crypto.randomUUID();
  }
  private buildUrl(endpoint: string, params: Record<string, string>): string {
    const searchParams = new URLSearchParams();
    
    // Add passed parameters
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value);
    });

// Add required parameters
searchParams.append('access_token', MAPBOX_TOKEN!);
searchParams.append('session_token', this.sessionToken);

    return `https://api.mapbox.com/geocoding/v5/mapbox.places/${endpoint}.json?${searchParams.toString()}`;
  }

  private validateCoordinates(coords: Coordinates): void {
    if (coords.latitude < COORDINATE_LIMITS.MIN_LATITUDE || coords.latitude > COORDINATE_LIMITS.MAX_LATITUDE) {
      throw new Error(`Invalid latitude: ${coords.latitude}. Must be between ${COORDINATE_LIMITS.MIN_LATITUDE} and ${COORDINATE_LIMITS.MAX_LATITUDE}`);
    }
    if (coords.longitude < COORDINATE_LIMITS.MIN_LONGITUDE || coords.longitude > COORDINATE_LIMITS.MAX_LONGITUDE) {
      throw new Error(`Invalid longitude: ${coords.longitude}. Must be between ${COORDINATE_LIMITS.MIN_LONGITUDE} and ${COORDINATE_LIMITS.MAX_LONGITUDE}`);
    }
  }

  async getSuggestions(query: string, signal?: AbortSignal): Promise<SearchBoxFeature[]> {
    if (!query) {
      throw new Error('Query parameter is required');
    }

    if (query.length < 3) {
      this.log('Query too short, returning empty results');
      return [];
    }    try {
      const encodedQuery = encodeURIComponent(query);
      const url = this.buildUrl(encodedQuery, {
        limit: '5',
        types: 'address',
        language: 'en',
        autocomplete: 'true'
      });

      this.log('Fetching suggestions from:', url);

      const res = await fetch(url, { 
        signal,
        headers: { 'Accept': 'application/json' }
      });
        if (!res.ok) {
        const errorText = await res.text();
        let errorMessage: string;
        let errorDetails: Record<string, unknown>;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = typeof errorJson.message === 'string' ? errorJson.message :
                        typeof errorJson.error === 'string' ? errorJson.error :
                        JSON.stringify(errorJson);
          errorDetails = {
            parsed: errorJson,
            status: res.status,
            statusText: res.statusText,
            headers: Object.fromEntries(res.headers.entries())
          };
        } catch (parseError) {
          errorMessage = errorText || res.statusText;
          errorDetails = {
            raw: errorText,
            status: res.status,
            statusText: res.statusText,
            headers: Object.fromEntries(res.headers.entries())
          };
        }

        this.logError('API error:', errorDetails);
        
        // Handle specific error cases
        switch (res.status) {
          case 401:
            throw new Error('Invalid Mapbox access token');
          case 403:
            throw new Error('Mapbox API access forbidden - check token permissions');
          case 429:
            throw new Error('Rate limit exceeded - please try again later');
          case 400:
            throw new Error(`Bad request: ${errorMessage}`);
          default:
            throw new Error(`Mapbox API error (${res.status}): ${errorMessage}`);
        }
      }
        const data = await res.json();
      this.log('API response:', data);
      
      if (!data.features || !Array.isArray(data.features)) {
        this.log('No features in response');
        return [];
      }

      const suggestions = data.features.map((feature: any) => ({
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

      this.log(`Converted ${data.features.length} features to ${suggestions.length} suggestions`);
      return suggestions;
    } catch (error) {
      // Don't log AbortError as it's an expected error when requests are cancelled
      if (error instanceof Error && error.name !== 'AbortError') {
        this.logError('Suggestion fetch error:', error);
      }
      throw error;
    }
  }

  async retrievePlace(id: string, signal?: AbortSignal): Promise<SearchBoxFeature | null> {
    try {
      const url = this.buildUrl(`retrieve/${id}`, {});

      const res = await fetch(url, { signal });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(`Mapbox API error: ${error.message || res.statusText}`);
      }
      
      const data = await res.json();
      const feature = data.features?.[0];

      // Validate feature has required properties before returning
      if (feature?.id && 
          feature?.properties && 
          (feature?.center || feature?.geometry?.coordinates)) {
        return feature;
      }
      return null;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to retrieve place details');
    }
  }

  extractCoordinates(feature: SearchBoxFeature): Coordinates {
    if (!feature) {
      throw new Error('Feature object is required');
    }

    let coordinates: Coordinates;

    // First try geometry coordinates
    if (feature.geometry?.coordinates?.length === 2) {
      const [longitude, latitude] = feature.geometry.coordinates;
      coordinates = { latitude, longitude };
    }
    // Fallback to center coordinates
    else if (feature.center?.length === 2) {
      const [longitude, latitude] = feature.center;
      coordinates = { latitude, longitude };
    }
    else {
      throw new Error('Invalid or missing coordinates in feature');
    }

    // Validate the coordinates
    this.validateCoordinates(coordinates);
    return coordinates;
  }

  extractAddressComponents(feature: SearchBoxFeature): AddressComponents {
    if (!feature) {
      throw new Error('Feature object is required');
    }
    if (!feature.properties) {
      throw new Error('Feature must have properties object');
    }

    const { properties, place_name = '', text = '' } = feature;
    const context = properties.context || {};

    // Build address components
    const components: AddressComponents = {
      name: properties.name || text || place_name,  // Fallback chain for name
      address: place_name,  // Required by schema
      shortAddress: properties.place_formatted || place_name,
    };

    // Add optional components only if they exist and are non-empty strings
    if (typeof properties.address === 'string' && properties.address.trim()) {
      components.addressLine1 = properties.address;
    }

    // Safely extract nested context properties, checking for non-empty strings
    if (properties.context) {
      if (context.place?.name?.trim()) {
        components.city = context.place.name;
      }
      if (context.region?.name?.trim()) {
        components.region = context.region.name;
      }
      if (context.postcode?.name?.trim()) {
        components.postcode = context.postcode.name;
      }
      if (context.country?.name?.trim()) {
        components.country = context.country.name;
      }
    }

    return components;
  }

  // Call this when you're done with the current session
  endSession() {
    this.refreshSessionToken();
  }
}
