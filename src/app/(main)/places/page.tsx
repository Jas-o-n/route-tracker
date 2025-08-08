export const dynamic = "force-dynamic";

import { getPlaces } from "@/lib/db/queries";
import PlacesClientPage from "@/components/PlacesClientPage";

export default async function PlacesPage() {
  const places = await getPlaces();
  return <PlacesClientPage places={places} />;
}