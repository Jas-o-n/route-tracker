"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type RouteFormData, routeFormSchema } from "@/lib/schemas/routes";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { PlaceSelect } from "@/components/place-select";
import { usePlaces } from "@/hooks/usePlaces";
import { useAddRoute } from "@/hooks/useRoutes";
import { useToast } from "@/hooks/use-toast";

export default function NewRoutePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isLoading: isLoadingPlaces } = usePlaces();
  const { addRoute, isAdding } = useAddRoute();
  const [openStart, setOpenStart] = useState(false);
  const [openDest, setOpenDest] = useState(false);

  const form = useForm<RouteFormData>({
    resolver: zodResolver(routeFormSchema),
    defaultValues: {
      fromPlaceId: "",
      toPlaceId: "",
      startMileage: 0,
      endMileage: 0,
      date: new Date().toISOString(),
      notes: "",
    },
  });

  async function onSubmit(data: RouteFormData) {
    try {
      await addRoute(data);
      toast({ title: "Success", description: "Route added successfully" });
      router.push("/routes");
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add route",
        variant: "destructive",
      });
    }
  }

  return (    <main className="container mx-auto max-w-5xl py-8 px-4 md:px-6">
      <div className="mb-8">
        <Link
          href="/routes"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to routes
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">
          Add New Route
        </h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="fromPlaceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Location</FormLabel>
                    <FormControl>
                      <PlaceSelect
                        value={field.value}
                        onChange={field.onChange}
                        open={openStart}
                        onOpenChange={setOpenStart}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="toPlaceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination</FormLabel>
                    <FormControl>
                      <PlaceSelect
                        value={field.value}
                        onChange={field.onChange}
                        open={openDest}
                        onOpenChange={setOpenDest}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startMileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Mileage</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endMileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Mileage</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button
                  type="submit"
                  disabled={isAdding || isLoadingPlaces}
                >
                  {isAdding ? "Adding..." : "Add Route"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}