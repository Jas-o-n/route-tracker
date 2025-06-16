"use client";

import { useState, useEffect, Suspense, useRef } from 'react';
import AddressMinimap from '@/components/AddressMinimapLoader';
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { MapPin, Loader2, Plus, Search } from "lucide-react";
import { Button } from "./ui/button";
import { SearchBoxFeature } from "@/lib/schemas/places";
import { useAddressSearch, formatAddress } from '@/hooks/useMapbox';
import { convertToGeoJSONFeature } from '@/lib/utils';
import SuggestionList from '@/components/SuggestionList';
import { useOutsideClick } from '@/hooks/useOutsideClick';

interface AddressInputProps {
  onAddressSelect: (address: SearchBoxFeature) => void;
  placeAddress?: string;
  onPlaceAddressChange: (address: string) => void;
  placeName: string;
  onPlaceNameChange: (name: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  disabled: boolean;
}

export default function AddressInput({
  onAddressSelect,
  placeAddress = '',
  onPlaceAddressChange,
  placeName,
  onPlaceNameChange,
  onSubmit,
  isLoading,
  disabled
}: AddressInputProps) {
  const [minimapFeature, setMinimapFeature] = useState<SearchBoxFeature | null>(null);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const { 
    data: suggestions = [], 
    isLoading: isSearching,
    error: searchError
  } = useAddressSearch(placeAddress);

  const containerRef = useRef<HTMLDivElement>(null);

  // Reset active index when suggestions change
  useEffect(() => {
    setActiveIndex(-1);
  }, [suggestions]);

  useEffect(() => {
    if (minimapFeature) {
      onAddressSelect(minimapFeature);
      onPlaceAddressChange(minimapFeature.properties.name || minimapFeature.place_name);
      setIsSuggestionsOpen(false);
    }
  }, [minimapFeature, onAddressSelect, onPlaceAddressChange]);

  const handleAddressChange = (value: string) => {
    onPlaceAddressChange(value);
    setMinimapFeature(null);
    setIsSuggestionsOpen(true);
  };

  const handleSelectSuggestion = (suggestion: SearchBoxFeature) => {
    if (!suggestion?.id) {
      console.error('Invalid suggestion selected:', suggestion);
      return;
    }
    setMinimapFeature(suggestion);
    onAddressSelect(suggestion);
    // Use the full formatted address instead of just the name
    onPlaceAddressChange(
      suggestion.properties.place_formatted
        || suggestion.properties.full_address
        || suggestion.properties.description
        || suggestion.place_name      // reliable final fallback
    );
    setIsSuggestionsOpen(false);
  };

  useOutsideClick(containerRef, () => setIsSuggestionsOpen(false));

  return (
    <form onSubmit={onSubmit} className="space-y-4" autoComplete="off">
      <div className="space-y-2">
        <Label htmlFor="place-name">Place Name</Label>
        <Input
          id="place-name"
          placeholder="Home, Office, etc."
          value={placeName}
          onChange={(e) => onPlaceNameChange(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div ref={containerRef} className="space-y-2 address-input-container">
        <Label htmlFor="place-address">Address</Label>
        <div className="relative">
          <Input
            id="place-address"
            placeholder="Search for an address"
            value={placeAddress}
            onChange={(e) => handleAddressChange(e.target.value)}
            disabled={isLoading}
            onFocus={() => setIsSuggestionsOpen(true)}
            className={searchError ? 'border-destructive' : ''}
            aria-expanded={isSuggestionsOpen}
            aria-controls={isSuggestionsOpen ? 'address-suggestions' : undefined}
          />
          {isSearching ? (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground animate-spin" />
          ) : (
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          )}
          
          {isSuggestionsOpen && placeAddress.length >= 3 && (
            <SuggestionList
              suggestions={suggestions}
              activeIndex={activeIndex}
              onSelect={handleSelectSuggestion}
              onHover={setActiveIndex}
            />
          )}
        </div>
      </div>
      {minimapFeature && (
        <div className="h-[180px] w-full relative mt-4 rounded-md overflow-hidden bg-secondary">
          <AddressMinimap
            {...{
              feature: convertToGeoJSONFeature(minimapFeature),
              show: true,
              // satelliteToggle: true,
              // canAdjustMarker: true,
              // footer: true,
              accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? (() => {
                throw new Error('Missing NEXT_PUBLIC_MAPBOX_TOKEN');
 })(),
            }}
          />
        </div>
      )}
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={disabled || !minimapFeature || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add Place
            </>
          )}
        </Button>
      </div>
    </form>
  );
}