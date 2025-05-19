"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, MapPin } from "lucide-react";
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
import { getRouteById, updateRoute } from "@/lib/actions/route-actions";
import Link from "next/link";
import { PlaceSelect } from "@/components/place-select";
import { usePlaces } from "@/hooks/usePlaces";

const formSchema = z.object({
  startLocation: z.string().min(2, {
    message: "Start location must be at least 2 characters.",
  }),
  destination: z.string().min(2, {
    message: "Destination must be at least 2 characters.",
  }),
  mileage: z.coerce.number().positive({
    message: "Mileage must be a positive number.",
  }),
  date: z.string(),
  notes: z.string().optional(),
});

export default function EditRoutePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { places, isLoading: placesLoading } = usePlaces();
  const [openStart, setOpenStart] = useState(false);
  const [openDest, setOpenDest] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startLocation: "",
      destination: "",
      mileage: undefined,
      date: "",
      notes: "",
    },
  });

  useEffect(() => {
    async function loadRoute() {
      try {
        const route = await getRouteById(id);
        if (route) {
          form.reset({
            startLocation: route.startLocation,
            destination: route.destination,
            mileage: route.mileage,
            date: new Date(route.date).toISOString().split("T")[0],
            notes: route.notes || "",
          });
        }
      } catch (error) {
        console.error("Failed to load route:", error);
      } finally {
        setLoading(false);
      }
    }

    loadRoute();
  }, [id, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await updateRoute(id, values);
      router.push(`/routes/${id}`);
    } catch (error) {
      console.error("Failed to update route:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading || placesLoading) {
    return (
      <div className="container mx-auto max-w-3xl py-8 px-4 md:px-6 flex justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <main className="container mx-auto max-w-3xl py-8 px-4 md:px-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-4">
          <Link href={`/routes/${id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Route</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="startLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Location</FormLabel>
                      <FormControl>
                        <PlaceSelect
                          value={field.value}
                          onChange={field.onChange}
                          places={places}
                          open={openStart}
                          onOpenChange={setOpenStart}
                          placeholder="Select start location"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="destination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination</FormLabel>
                      <FormControl>
                        <PlaceSelect
                          value={field.value}
                          onChange={field.onChange}
                          places={places}
                          open={openDest}
                          onOpenChange={setOpenDest}
                          placeholder="Select destination"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="mileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Mileage</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter current mileage"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The current reading from your odometer
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
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
                      <Textarea
                        placeholder="Add any notes about this route (optional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button variant="outline" asChild>
                  <Link href={`/routes/${id}`}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}