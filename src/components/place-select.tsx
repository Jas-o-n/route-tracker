import { Check, MapPin } from "lucide-react";
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

interface PlaceSelectProps {
  value: string; // This will be the UUID
  onChange: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeholder?: string;
  places: Place[]; // Now required
}

export function PlaceSelect({
  value,
  onChange,
  open,
  onOpenChange,
  placeholder = "Select place",
  places,
}: PlaceSelectProps) {
  const selectedPlace = places.find((place: Place) => place.id === value);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between relative pl-14"
        >
          {/* Absolutely positioned icon */}
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 shrink-0 text-muted-foreground pointer-events-none" />
          <div className="flex flex-col text-left w-full">
            <span className="font-medium truncate">{selectedPlace ? selectedPlace.name : placeholder}</span>
            {selectedPlace && (
              <span className="text-sm text-muted-foreground truncate">
                {selectedPlace.full_address}
              </span>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)] max-h-[300px]">
        <Command>
          <CommandInput placeholder="Search places..." className="sticky top-0 z-10" />
          <CommandEmpty>No place found.</CommandEmpty>
          <CommandGroup className="max-h-[250px] overflow-y-auto">
            {places.map((place: Place) => (
              <CommandItem
                key={place.id}
                onSelect={() => {
                  onChange(place.id);
                  onOpenChange(false);
                }}
              >
                <div className="flex items-center">
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === place.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{place.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {place.full_address}
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
