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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

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
  const [open, setOpen] = useState(false);
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
    debouncedFetchRef.current?.(value);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && query) {
      debouncedFetchRef.current?.(query);
    }
  };

  const handleSelect = (place: any) => {
    setQuery(place.place_name);
    setResults([]);
    setOpen(false);
    onSelect(place);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
        >
          <div className="flex items-center">
            <MapPin className="mr-2 h-4 w-4 shrink-0" />
            {query || placeholder}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" sideOffset={4}>
        <Command shouldFilter={false}> {/* Prevent Command from filtering results */}
          <CommandInput
            placeholder={placeholder}
            value={query}
            onValueChange={handleInputChange}
          />
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
            {results.map((place: any) => (
              <CommandItem
                key={place.id}
                onSelect={() => handleSelect(place)}
              >
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 shrink-0" />
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
      </PopoverContent>
    </Popover>
  );
}
