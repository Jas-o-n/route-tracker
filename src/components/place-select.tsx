import { Check, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import type { Place } from "@/lib/schemas/places";
import { searchPlacesByName } from "@/lib/search";

interface PlaceSelectProps {
  value: string;
  onChange: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeholder?: string;
  places: Place[];
  optional?: boolean;
}

export function PlaceSelect({
  value,
  onChange,
  open,
  onOpenChange,
  placeholder = "Select place",
  places,
  optional = false,
}: PlaceSelectProps) {
  const selectedPlace = places.find((place: Place) => place.id === value);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 180);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const filteredPlaces = useMemo(() => {
    return searchPlacesByName(places, debouncedQuery, { limit: 200 });
  }, [places, debouncedQuery]);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn("w-full justify-start relative pl-12 pr-3 py-2", optional ? "opacity-60" : "")}
          disabled={optional}
        >
          {/* Absolutely positioned icon */}
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 shrink-0 text-muted-foreground pointer-events-none" />
          <div className="flex flex-col text-left w-full min-w-0">
            <span className={cn("font-medium truncate", optional ? "line-through text-muted-foreground" : "")}>
              {selectedPlace ? selectedPlace.name : placeholder}
            </span>
            {selectedPlace && (
              <span className={cn("text-sm truncate", optional ? "line-through text-muted-foreground" : "text-muted-foreground")}>
                {selectedPlace.full_address}
              </span>
            )}
            {!selectedPlace && optional && (
              <span className="text-sm text-muted-foreground">Not saved for private routes</span>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-[var(--radix-popover-trigger-width)] max-h-[320px] overflow-hidden rounded-md "
        side="bottom"
        align="start"
        avoidCollisions={false}
        style={{ position: "fixed" }}
      >
        <Command>
          <CommandInput
            value={query}
            onValueChange={(v: string) => setQuery(v)}
            placeholder="Search places..."
            className="sticky top-0 z-10 bg-popover px-3 py-2 border-b border-muted/10"
          />
          <CommandEmpty>No place found.</CommandEmpty>
          <CommandGroup className="max-h-[250px] overflow-y-auto">
    {filteredPlaces.map((place: Place) => (
              <CommandItem
                key={place.id}
                value={`${place.name}::${place.id}`}
                onSelect={(selected: string) => {
                  const id = selected.split("::").pop() ?? selected;
                  onChange(id);
      onOpenChange(false);
      // reset the query when a selection is made so next open shows full list
      setQuery("");
                }}
                className="flex items-center gap-3 px-3 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer"
              >
                <Check
                  className={cn(
                    "h-4 w-4 flex-shrink-0 text-primary",
                    value === place.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col min-w-0">
                  <span className="truncate leading-tight">{place.name}</span>
                  <span className="text-sm text-muted-foreground truncate">
                    {place.full_address}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
