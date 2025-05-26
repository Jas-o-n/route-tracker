import { useState, useCallback, useEffect, useRef } from "react";
import debounce from "lodash.debounce";
import { MapPin } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface MapboxFeature {
  id: string;
  place_name: string;
  text: string;
  center: [number, number];
}

interface AddressInputProps {
  onSelect: (place: MapboxFeature) => void;
  placeholder?: string;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface MapboxResponse {
  features: MapboxFeature[];
}

export default function AddressInput({ onSelect, placeholder = "Enter address" }: AddressInputProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MapboxFeature[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedFetchRef = useRef<ReturnType<typeof debounce>>();

  const setupDebouncedFetch = useCallback(() => {
    debouncedFetchRef.current = debounce(async (value: string) => {
      if (!value || value.length < 2) {
        setResults([]);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        if (!MAPBOX_TOKEN) return;

        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true`
        );

        if (!res.ok) {
          throw new Error(`Mapbox API error: ${res.statusText}`);
        }

        const data: MapboxResponse = await res.json();
        setResults(data.features);
      } catch (error) {
        setResults([]);
        setError(error instanceof Error ? error.message : 'Failed to fetch suggestions');
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, []);

  useEffect(() => {
    setupDebouncedFetch();
    return () => {
      debouncedFetchRef.current?.cancel();
    };
  }, [setupDebouncedFetch]);

  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      setError("Address autocomplete is not available - API token not configured");
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setIsOpen(!!value);
    debouncedFetchRef.current?.(value);
  };

  const handleSelect = (place: MapboxFeature) => {
    setQuery(place.place_name);
    setResults([]);
    setIsOpen(false);
    onSelect(place);
  };

  return (
    <div className="relative">
      <div className="flex items-center relative z-20">
        <input
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
        />
      </div>

      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] w-full z-10 rounded-md border bg-popover shadow-md">
          <Command>
            <CommandEmpty>
              {isLoading ? (
                'Loading...'
              ) : error ? (
                <span className="text-destructive">{error}</span>
              ) : (
                'No results found.'
              )}
            </CommandEmpty>
            <CommandGroup>
              {results.map((place) => (
                <CommandItem
                  key={place.id}
                  onSelect={() => handleSelect(place)}
                >
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span>{place.text}</span>
                      <span className="text-sm text-muted-foreground">
                        {place.place_name}
                      </span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </div>
      )}
    </div>
  );
}
