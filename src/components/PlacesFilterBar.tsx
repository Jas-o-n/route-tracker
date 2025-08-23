"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import type { Place } from "@/lib/schemas/places";
import { searchPlacesByName } from "@/lib/search";

interface PlacesFilterBarProps {
  places: Place[];
  onFiltered: (filtered: Place[]) => void;
  className?: string;
}

export function PlacesFilterBar({ places, onFiltered, className }: PlacesFilterBarProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      const results = searchPlacesByName(places, query, { limit: 1000 });
      onFiltered(results);
    }, 180);
    return () => clearTimeout(t);
  }, [query, places, onFiltered]);

  return (
    <div className={cn("flex items-center gap-2 w-full", className)}>
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          placeholder="Search places by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
}

export default PlacesFilterBar;
