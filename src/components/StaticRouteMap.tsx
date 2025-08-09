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
      <div className="w-[600px] h-[400px]">
        <Skeleton className="w-full h-full" />
      </div>
    );
  if (error) return <p>Failed to load map</p>;

  if (!data?.url) return <div role="alert">Map unavailable</div>;

  return (
    <Image
      src={data.url}
      alt={`Route map from ${start.lat},${start.lng} to ${end.lat},${end.lng}`}
      width={600}
      height={400}
      className="max-w-full h-auto"
      sizes="(max-width: 640px) 100vw, 600px"
      loading="lazy"
      decoding="async"
    />
  );}
