import type { Place } from "./schemas/places";

export interface SearchOptions {
  limit?: number;
}

// Simple case-insensitive substring search over place.name.
// Returns at most `limit` results. Pure function with no side effects so it
// can be used in different components and easily tested.
export function searchPlacesByName(
  places: Place[],
  query: string,
  options: SearchOptions = {}
): Place[] {
  const limit = options.limit ?? 200;
  const q = query.trim().toLowerCase();
  if (!q) return places.slice(0, limit);
  const matches: Place[] = [];
  for (const p of places) {
    const name = (p.name ?? "").toLowerCase();
    if (name.includes(q)) matches.push(p);
    if (matches.length >= limit) break;
  }
  return matches;
}

export default searchPlacesByName;
