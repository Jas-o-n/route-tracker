import { getRouteById, getPlaces } from "@/lib/db/queries";
import EditRouteClientPage from "@/components/EditRouteClientPage";
import { notFound } from "next/navigation";

export default async function EditRoutePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [route, places] = await Promise.all([getRouteById(id), getPlaces()]);

  if (!route) {
    notFound();
  }

  return <EditRouteClientPage route={route} places={places} />;
}