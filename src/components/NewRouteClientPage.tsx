"use client";

import { useEffect, useRef, useState } from "react";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PlaceSelect } from "@/components/place-select";
import { useAddRoute } from "@/hooks/useRoutes";
import { useToast } from "@/hooks/use-toast";
import type { Place } from "@/lib/schemas/places";
import { useQuery,useQueryClient } from "@tanstack/react-query";

interface NewRouteClientPageProps {
  places: Place[];
}

export default function NewRouteClientPage({ places }: NewRouteClientPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { addRoute, isPending } = useAddRoute(
    () => {
      toast({ title: "Success", description: "Route added successfully" });
      queryClient.invalidateQueries({ queryKey: ['recentRoute'] });
      router.push("/routes");
      router.refresh();
    },
    (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add route",
        variant: "destructive",
      });
    }
  );
  const [openStart, setOpenStart] = useState(false);
  const [openDest, setOpenDest] = useState(false);

  const form = useForm<RouteFormData>({
    resolver: zodResolver(routeFormSchema),
    defaultValues: {
      fromPlaceId: "",
      toPlaceId: "",
  date: new Date().toISOString(),
      notes: "",
      isWork: true,
    },
  });

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

  const { data: recent, isLoading: isLoadingRecent } = useQuery({
    queryKey: ['recentRoute'],
    queryFn: async () => {
      const res = await fetch('/api/routes/recent');
      if (!res.ok) throw new Error('Failed to fetch recent route');
      return (await res.json()) as { route: { endMileage?: number; toPlaceId?: string } | null };
    },
  });

  useEffect(() => {
    const currentValue = form.getValues('startMileage');
    if ((currentValue == null) && recent?.route?.endMileage != null) {
      form.setValue('startMileage', recent.route.endMileage, { shouldDirty: false });
    }
  }, [recent, form]);

  useEffect(() => {
    const currentFrom = form.getValues('fromPlaceId');
    if ((currentFrom == null || currentFrom === '') && recent?.route?.toPlaceId) {
      form.setValue('fromPlaceId', recent.route.toPlaceId, { shouldDirty: false });
    }
  }, [recent, form]);
  

  async function onSubmit(data: RouteFormData) {
    await addRoute(data);
  }

  return (
    <main className="container mx-auto max-w-5xl py-8 px-4 md:px-6">
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
                        places={places}
                        optional={!form.getValues('isWork')}
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
                        places={places}
                        optional={!form.getValues('isWork')}
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
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const v = e.currentTarget.value;
                            field.onChange(v === "" ? (undefined as unknown as number) : Number(v));
                          }}
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
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const v = e.currentTarget.value;
                            field.onChange(v === "" ? (undefined as unknown as number) : Number(v));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                                  return d ? `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}` : field.value;
                                }
                                // try ISO datetime
                                const d = new Date(field.value);
                                return isNaN(d.getTime()) ? field.value : `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
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
                              const d = new Date(Date.UTC(
                                date.getFullYear(),
                                date.getMonth(),
                                date.getDate(),
                                12, 0, 0
                              ));
                              field.onChange(d.toISOString());
                            } else {
                              field.onChange('');
                            }
                          }}                          disabled={(date) => date > new Date()}
                          autoFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isWork"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Private trip</FormLabel>
                      <p className="text-sm text-muted-foreground">Toggle on for private, off for work.</p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={!field.value}
                        onCheckedChange={(checked) => {
                          const newIsWork = !checked;
                          field.onChange(newIsWork);
                          if (!newIsWork) {
                            form.setValue('fromPlaceId', '');
                            form.setValue('toPlaceId', '');
                            setOpenStart(false);
                            setOpenDest(false);
                          }
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

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
                  disabled={isPending}
                >
                  {isPending ? "Adding..." : "Add Route"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
} 