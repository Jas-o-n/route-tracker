"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
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
import { useEditRoute } from "@/hooks/useRoutes";
import { useToast } from "@/hooks/use-toast";
import type { Route } from "@/lib/schemas/routes";
import type { Place } from "@/lib/schemas/places";

function isYYYYMMDD(dateString: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateString);
}

function parseYMDToLocalDate(dateString: string): Date | null {
  if (!isYYYYMMDD(dateString)) return null;
  const [yearStr, monthStr, dayStr] = dateString.split("-");
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;
  const day = Number(dayStr);
  return new Date(year, monthIndex, day);
}

const formSchema = z.object({
  fromPlaceId: z.string().uuid(),
  toPlaceId: z.string().uuid(),
  startMileage: z.coerce.number().nonnegative(),
  endMileage: z.coerce.number().nonnegative(),
  date: z
    .string()
    .min(1, "Date is required")
    .refine((value) => isYYYYMMDD(value), {
      message: "Invalid date format. Use YYYY-MM-DD",
    })
    .refine((value) => {
      const parsed = parseYMDToLocalDate(value);
      if (!parsed) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      parsed.setHours(0, 0, 0, 0);
      return parsed.getTime() <= today.getTime();
    }, {
      message: "Date cannot be in the future",
    }),
  notes: z.string().optional(),
}).refine(
  (data) => data.endMileage >= data.startMileage,
  {
    message: "End mileage must be greater than or equal to start mileage",
    path: ["endMileage"],
  }
);

type RouteFormData = z.infer<typeof formSchema>;

interface Props {
  route: Route;
  places: Place[];
}

export default function EditRouteClientPage({ route, places }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const { updateRoute, isUpdating } = useEditRoute(route.id, () => {
    toast({ title: "Success", description: "Route updated successfully" });
    router.push(`/routes/${route.id}`);
  });

  const [openStart, setOpenStart] = useState(false);
  const [openDest, setOpenDest] = useState(false);

  const form = useForm<RouteFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fromPlaceId: route.fromPlaceId,
      toPlaceId: route.toPlaceId,
      startMileage: route.startMileage,
      endMileage: route.endMileage,
      date: route.date
        ? (isYYYYMMDD(route.date)
            ? route.date
            : (() => {
                const d = new Date(route.date);
                return isNaN(d.getTime())
                  ? ""
                  : d.toLocaleDateString('sv-SE'); // yyyy-mm-dd without timezone shift
              })()
          )
        : "",
      notes: route.notes ?? "",
    },
  });

  const onSubmit = async (values: RouteFormData) => {
    await updateRoute(values);
  };

  return (
    <main className="container mx-auto max-w-5xl py-8 px-4 md:px-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-4">
          <Link href={`/routes/${route.id}`}>
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
                        places={places}
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
                        places={places}
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
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
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
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
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
                              (() => {
                                if (isYYYYMMDD(field.value)) {
                                  const d = parseYMDToLocalDate(field.value);
                                  return d ? d.toLocaleDateString() : field.value;
                                }
                                const d = new Date(field.value);
                                return isNaN(d.getTime()) ? field.value : d.toLocaleDateString();
                              })()
                            ) : (
                              "Select date"
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value
                            ? (isYYYYMMDD(field.value)
                                ? parseYMDToLocalDate(field.value) ?? undefined
                                : new Date(field.value))
                            : undefined}
                          onSelect={(date) => {
                            if (date) {
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
                  <Link href={`/routes/${route.id}`}>Cancel</Link>
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
