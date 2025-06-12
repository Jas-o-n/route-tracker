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
import { usePlaces } from "@/hooks/usePlaces";

interface PlaceSelectProps {
  value: string; // This will be the UUID
  onChange: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeholder?: string;
}

export function PlaceSelect({
  value,
  onChange,
  open,
  onOpenChange,
  placeholder = "Select place",
}: PlaceSelectProps) {
  const { places } = usePlaces();
  const selectedPlace = places.find(place => place.id === value);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
        >
          <div className="flex flex-col items-start text-left">
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 shrink-0" />
              {selectedPlace ? selectedPlace.name : placeholder}
            </div>
            {selectedPlace && (
              <span className="ml-6 text-sm text-muted-foreground">
                {selectedPlace.full_address}
              </span>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Search places..." />
          <CommandEmpty>No place found.</CommandEmpty>
          <CommandGroup>
            {places.map((place) => (
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
