"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PlaceSelect } from "@/components/place-select";
import { usePlaces } from "@/hooks/usePlaces";
import { useRoute, useEditRoute } from "@/hooks/useRoutes";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  fromPlaceId: z.string().uuid(),
  toPlaceId: z.string().uuid(),
  startMileage: z.coerce.number().nonnegative(),
  endMileage: z.coerce.number().nonnegative(),
  date: z.string(),
  notes: z.string().optional(),
}).refine(
  (data) => data.endMileage >= data.startMileage,
  {
    message: "End mileage must be greater than or equal to start mileage",
    path: ["endMileage"], // Display error on endMileage field
  }
);

type RouteFormData = z.infer<typeof formSchema>;

export default function EditRoutePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;

  const { isLoading: placesLoading } = usePlaces();
  const { data: route, isLoading: routeLoading } = useRoute(id);
  const { updateRoute, isUpdating } = useEditRoute(id);

  const [openStart, setOpenStart] = useState(false);
  const [openDest, setOpenDest] = useState(false);

  const form = useForm<RouteFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fromPlaceId: "",
      toPlaceId: "",
      startMileage: 0,
      endMileage: 0,
      date: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (route) {
      form.reset({
        fromPlaceId: route.fromPlaceId,
        toPlaceId: route.toPlaceId,
        startMileage: route.startMileage,
        endMileage: route.endMileage,
        date: route.date ? new Date(route.date).toISOString().split("T")[0] : "",
        notes: route.notes ?? "",
      });
    }
  }, [form, route]);

  const onSubmit = async (values: RouteFormData) => {
    try {
      await updateRoute(values);
      toast({
        title: "Success",
        description: "Route updated successfully",
      });
      router.push(`/routes/${id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update route. Please try again.",
        variant: "destructive",
      });
    }
  }

  if (routeLoading || placesLoading) {
    return (
      <div className="container mx-auto max-w-3xl py-8 px-4 md:px-6 flex justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <main className="container mx-auto max-w-5xl py-8 px-4 md:px-6">
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
              {/* Start Location */}
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
                        placeholder="Select start location"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Destination */}
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
                        placeholder="Select destination"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Mileage Fields */}
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
                          placeholder="Enter start mileage"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                          placeholder="Enter end mileage"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Date Field */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full justify-start font-normal"
                          >
                            {field.value ? (
                              new Date(field.value).toLocaleDateString()
                            ) : (
                              "Select date"
                            )}
                            <ChevronDown className="ml-auto h-4 w-4" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              // Ensure we're working with the local date
                              const year = date.getFullYear();
                              const month = String(date.getMonth() + 1).padStart(2, '0');
                              const day = String(date.getDate()).padStart(2, '0');
                              field.onChange(`${year}-${month}-${day}`);
                            } else {
                              field.onChange('');
                            }
                          }}
                          disabled={(date) => date > new Date()}
                          autoFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes Field */}
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
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}