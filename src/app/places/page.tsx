"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { usePlaces, usePlaceMutations } from "@/hooks/usePlaces";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import AddressInput from "@/components/AddressInput";
import { SearchBoxFeature } from "@/hooks/useMapbox";

export default function PlacesPage() {
  const { toast } = useToast();
  const { places, isLoading, isError } = usePlaces();
  const { addPlace, deletePlace, isAdding, isDeleting } = usePlaceMutations();
  const [selectedFeature, setSelectedFeature] = useState<SearchBoxFeature | null>(null);
  const [placeName, setPlaceName] = useState("");

  async function handleAddPlace(e: React.FormEvent) {
    e.preventDefault();
    
    if (!selectedFeature || !placeName) {
      toast({
        title: "Error",
        description: "Please enter a name and select an address",
        variant: "destructive",
      });
      return;
    }

    try {
      const featureWithName = {
        ...selectedFeature,
        name: placeName,
      };

      addPlace(featureWithName);
      
      setSelectedFeature(null);
      setPlaceName("");
      
      toast({
        title: "Success",
        description: "Place added successfully",
      });
    } catch (error) {
      console.error('Error in handleAddPlace:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add place",
        variant: "destructive",
      });
    }
  }

  async function handleDeletePlace(id: string) {
    try {
      await deletePlace(id, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Place deleted successfully",
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to delete place. Please try again.",
            variant: "destructive",
          });
        },
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-5xl py-8 px-4 md:px-6">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Saved Places</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto max-w-5xl py-8 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Saved Places</h1>
        <Card>
          <CardHeader>
            <CardTitle>Add New Place</CardTitle>
            <CardDescription>Save frequently used addresses for quick access when creating routes.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddPlace} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Place name (e.g., Home, Office)"
                  value={placeName}
                  onChange={(e) => setPlaceName(e.target.value)}
                  required
                />
                <AddressInput
                  placeholder="Search for an address"
                  onSelect={(place) => setSelectedFeature(place)}
                />
              </div>
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={!selectedFeature || !placeName || isAdding}
                >
                  {isAdding ? (
                    <>Loading...</>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Place
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {places.map((place) => (
          <Card key={place.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{place.name}</CardTitle>
                  <CardDescription className="mt-1">{place.address}</CardDescription>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Place</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this place? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeletePlace(place.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </main>
  );
}