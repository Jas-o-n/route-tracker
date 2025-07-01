import { useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import AddressInput from "@/components/AddressInput";
import type { SearchBoxFeature } from "@/lib/schemas/places";
import React from "react";

interface AddPlaceFormProps {
  onAddPlace: (feature: SearchBoxFeature, name: string) => Promise<void>;
  isAdding: boolean;
}

const AddPlaceForm: React.FC<AddPlaceFormProps> = React.memo(function AddPlaceForm({ onAddPlace, isAdding }) {
  const [selectedFeature, setSelectedFeature] = useState<SearchBoxFeature | null>(null);
  const [placeName, setPlaceName] = useState("");
  const [placeAddress, setPlaceAddress] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedFeature || !placeName) return;
      await onAddPlace(selectedFeature, placeName);
      setSelectedFeature(null);
      setPlaceName("");
      setPlaceAddress("");
    },
    [selectedFeature, placeName, onAddPlace]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Place</CardTitle>
        <CardDescription>
          Save frequently used addresses for quick access when creating routes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AddressInput
          onAddressSelect={setSelectedFeature}
          placeAddress={placeAddress}
          onPlaceAddressChange={setPlaceAddress}
          placeName={placeName}
          onPlaceNameChange={setPlaceName}
          onSubmit={handleSubmit}
          isLoading={isAdding}
          disabled={!selectedFeature || !placeName}
        />
      </CardContent>
    </Card>
  );
});

export { AddPlaceForm };
