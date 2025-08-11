import { getAllRoutes, getPlaces } from "@/lib/db/queries";
import RoutesClientPage from "@/components/RoutesClientPage";

export default async function RoutesPage() {
  const [routes, places] = await Promise.all([
    getAllRoutes(),
    getPlaces(),
  ]);
  return <RoutesClientPage routes={routes} places={places} />;
}