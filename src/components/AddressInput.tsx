import { useState } from "react";
import { MapPin } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { useAddressSearch, type MapboxFeature } from "@/hooks/useMapbox";

interface AddressInputProps {
  onSelect: (place: MapboxFeature) => void;
  placeholder?: string;
}

export default function AddressInput({ onSelect, placeholder = "Enter address" }: AddressInputProps) {
  const [query, setQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { data: results = [], isLoading, error } = useAddressSearch(query);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setInputValue(value);
    setIsOpen(!!value);
  };

  const handleSelect = (place: MapboxFeature) => {
    setInputValue(place.place_name);
    setQuery("");
    setIsOpen(false);
    onSelect(place);
  };

  return (
    <div className="relative">
      <div className="flex items-center relative z-20">
        <input
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder={placeholder}
          value={inputValue}
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
                <span className="text-destructive">{error instanceof Error ? error.message : 'Error loading results'}</span>
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
