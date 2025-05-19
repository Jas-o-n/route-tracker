"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { addPlace, deletePlace, getPlaces, type Place } from "@/lib/actions/place-actions";
import { useEffect } from "react";

export default function PlacesPage() {
  const router = useRouter();
  const [places, setPlaces] = useState<Place[]>([]);
  const [newPlace, setNewPlace] = useState({ name: "", address: "" });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlaces();
  }, []);

  async function loadPlaces() {
    try {
      const data = await getPlaces();
      setPlaces(data);
    } catch (error) {
      console.error("Failed to load places:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddPlace(e: React.FormEvent) {
    e.preventDefault();
    try {
      const place = await addPlace(newPlace);
      setPlaces([...places, place]);
      setNewPlace({ name: "", address: "" });
    } catch (error) {
      console.error("Failed to add place:", error);
    }
  }

  async function handleDeletePlace(id: string) {
    try {
      await deletePlace(id);
      setPlaces(places.filter(place => place.id !== id));
    } catch (error) {
      console.error("Failed to delete place:", error);
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-5xl py-8 px-4 md:px-6">
        <div className="flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
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
                  value={newPlace.name}
                  onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
                  required
                />
                <Input
                  placeholder="Address"
                  value={newPlace.address}
                  onChange={(e) => setNewPlace({ ...newPlace, address: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Place
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
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
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