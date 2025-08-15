import React from 'react';
import { MapPin } from 'lucide-react';
import { formatAddress } from '@/hooks/useMapbox';
import { SearchBoxFeature } from '@/lib/schemas/places';

interface SuggestionListProps {
  suggestions: SearchBoxFeature[];
  activeIndex: number;
  onSelect: (suggestion: SearchBoxFeature) => void;
  onHover: (index: number) => void;
}

const SuggestionList: React.FC<SuggestionListProps> = ({
  suggestions,
  activeIndex,
  onSelect,
  onHover,
}) => {
  return (
    <div
      id="address-suggestions"
      className="absolute w-full mt-1 bg-popover border rounded-md shadow-md z-50 py-1"
      role="listbox"
    >
      {suggestions.map((suggestion, index) => {
        try {
          const { mainText, secondaryText } = formatAddress(suggestion);
          return (
            <button
              key={suggestion.id}
              id={`suggestion-${index}`}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              className={`w-full px-4 py-3 text-left flex items-center gap-3 ${
                index === activeIndex ? 'bg-accent' : 'hover:bg-accent/50'
              }`}
              onClick={() => onSelect(suggestion)}
              onMouseEnter={() => onHover(index)}
            >
              <MapPin className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-sm leading-tight">{mainText}</span>
                <span className="text-xs text-muted-foreground">{secondaryText}</span>
              </div>
            </button>
          );
        } catch (error) {
          console.error('Error rendering suggestion:', error);
          return null;
        }
      })}
    </div>
  );
};

export default SuggestionList;
