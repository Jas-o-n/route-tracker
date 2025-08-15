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

  const { data: recent, isLoading: isLoadingRecent } = useQuery({
    queryKey: ['recentRoute'],
    queryFn: async () => {
      const res = await fetch('/api/routes/recent');
      if (!res.ok) throw new Error('Failed to fetch recent route');
      return (await res.json()) as { route: { endMileage: number } | null };
    },
  });

  useEffect(() => {
    const currentValue = form.getValues('startMileage');
    if ((currentValue == null) && recent?.route?.endMileage != null) {
      form.setValue('startMileage', recent.route.endMileage, { shouldDirty: false });
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
                name="isWork"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Work trip</FormLabel>
                      <p className="text-sm text-muted-foreground">Toggle on for work, off for private.</p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
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