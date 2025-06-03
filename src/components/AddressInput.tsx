"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { AddressMinimapProps } from '@mapbox/search-js-react';
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { MapPin, Loader2, Plus, Search } from "lucide-react";
import { Button } from "./ui/button";
import { SearchBoxFeature } from "@/lib/schemas/places";
import { useAddressSearch, useRetrievePlace, formatAddress } from '@/hooks/useMapbox';
import type { Feature, Point, GeoJsonProperties } from 'geojson';

// Dynamic import with proper typing
const AddressMinimap = dynamic<any>(
  () => import('@mapbox/search-js-react').then((mod) => mod.AddressMinimap),
  { ssr: false }
);

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

// Convert SearchBoxFeature to GeoJSON Feature
function convertToGeoJSONFeature(feature: SearchBoxFeature): Feature<Point, GeoJsonProperties> {
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: feature.center,
    },
    properties: {
      ...feature.properties,
      mapboxId: feature.mapbox_id,
      placeName: feature.place_name,
    },
  };
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const { 
    data: suggestions = [], 
    isLoading: isSearching,
    error: searchError
  } = useAddressSearch(placeAddress);
  
  const {
    data: placeDetails,
    error: retrieveError
  } = useRetrievePlace(selectedId);

  // Reset active index when suggestions change
  useEffect(() => {
    setActiveIndex(-1);
  }, [suggestions]);

  useEffect(() => {
    if (placeDetails) {
      setMinimapFeature(placeDetails);
      onAddressSelect(placeDetails);
      onPlaceAddressChange(placeDetails.properties.name || placeDetails.place_name);
      setIsSuggestionsOpen(false);
      setSelectedId(null);
    }
  }, [placeDetails, onAddressSelect, onPlaceAddressChange]);

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
    setSelectedId(suggestion.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSuggestionsOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[activeIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsSuggestionsOpen(false);
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.address-input-container')) {
        setIsSuggestionsOpen(false);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

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

      <div className="space-y-2 address-input-container">
        <Label htmlFor="place-address">Address</Label>
        <div className="relative">
          <Input
            id="place-address"
            placeholder="Search for an address"
            value={placeAddress}
            onChange={(e) => handleAddressChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            onFocus={() => setIsSuggestionsOpen(true)}
            className={searchError ? 'border-destructive' : ''}
            aria-expanded={isSuggestionsOpen}
            aria-controls={isSuggestionsOpen ? 'address-suggestions' : undefined}
            aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
            role="combobox"
          />
          {isSearching ? (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground animate-spin" />
          ) : (
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          )}
          
          {isSuggestionsOpen && placeAddress.length >= 3 && (
            <div 
              id="address-suggestions"
              className="absolute w-full mt-1 bg-popover border rounded-md shadow-md z-50 py-1"
              role="listbox"
            >
              {searchError ? (
                <div className="px-4 py-3 text-sm text-destructive">
                  Error loading suggestions. Please try again.
                </div>
              ) : suggestions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  {isSearching ? 'Loading suggestions...' : 'No matching addresses found'}
                </div>
              ) : (
                suggestions.map((suggestion, index) => {
                  try {
                    const { mainText, secondaryText } = formatAddress(suggestion);
                    return (
                        <button
                          key={suggestion.id}
                          id={`suggestion-${index}`}
                          type="button"
                          role="option"
                          aria-selected={index === activeIndex}
                          className={`w-full px-4 py-3 text-left flex items-start gap-3 ${
                          index === activeIndex ? 'bg-accent' : 'hover:bg-accent/50'
                          }`}
                          onClick={() => handleSelectSuggestion(suggestion)}
                          onMouseEnter={() => setActiveIndex(index)}
                        >
                          <MapPin className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                          <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-sm">{mainText}</span>
                          <span className="text-xs text-muted-foreground">{secondaryText}</span>
                          </div>
                        </button>
                    );
                  } catch (error) {
                    console.error('Error rendering suggestion:', error);
                    return null;
                  }
                }).filter(Boolean)
              )}
            </div>
          )}
        </div>
      </div>

      {minimapFeature && (
        <div className="h-[180px] w-full relative mt-4 rounded-md overflow-hidden bg-secondary">
          <AddressMinimap
            {...{
              feature: convertToGeoJSONFeature(minimapFeature),
              show: true,
              satelliteToggle: true,
              canAdjustMarker: true,
              footer: true,
              accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '',
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