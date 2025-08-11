import { getPlaces } from "@/lib/db/queries";
import NewRouteClientPage from "@/components/NewRouteClientPage";

export default async function NewRoutePage() {
  const places = await getPlaces();
  return <NewRouteClientPage places={places} />;
}