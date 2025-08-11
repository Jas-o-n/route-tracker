"use client";

import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouteMap } from "@/hooks/useRouteMap";

type Coordinates = {
  lat: number;
  lng: number;
};

interface StaticRouteMapProps {
  start: Coordinates;
  end: Coordinates;
}

export default function StaticRouteMap({ start, end }: StaticRouteMapProps) {
  const { data, isLoading, error } = useRouteMap(start, end);

  if (isLoading)
    return (
      <div className="w-full min-h-[400px] h-full">
        <Skeleton className="w-full h-full" />
      </div>
    );
  if (error) return <p>Failed to load map</p>;

  if (!data?.url) return <div role="alert">Map unavailable</div>;

  return (
    <div className="relative w-full min-h-[400px] h-full">
      <Image
        src={data.url}
        alt={`Route map from ${start.lat},${start.lng} to ${end.lat},${end.lng}`}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, 50vw"
        loading="lazy"
        decoding="async"
      />
    </div>
  );}
