import { useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";

type Coordinates = {
  lat: number;
  lng: number;
};

async function fetchRouteMap(start: Coordinates, end: Coordinates, theme: "light" | "dark") {
  const params = new URLSearchParams({
    startLat: start.lat.toString(),
    startLng: start.lng.toString(),
    endLat: end.lat.toString(),
    endLng: end.lng.toString(),
    theme,
  });

  const res = await fetch(`/api/map/routeMap?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch map");

  return res.json() as Promise<{ url: string }>;
}

export function useRouteMap(start: Coordinates, end: Coordinates) {
  const { resolvedTheme } = useTheme();
  const theme = (resolvedTheme === "dark" ? "dark" : "light") as "light" | "dark";

  return useQuery({
    queryKey: ["routeMap", start, end, theme],
    queryFn: () => fetchRouteMap(start, end, theme),
    staleTime: Infinity,
  });
}
