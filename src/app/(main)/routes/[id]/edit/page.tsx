import { getRouteById, getPlaces } from "@/lib/db/queries";
import EditRouteClientPage from "@/components/EditRouteClientPage";
import { notFound } from "next/navigation";

export default async function EditRoutePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [route, places] = await Promise.all([getRouteById(id), getPlaces()]);

  if (!route) {
    notFound();
  }

  return <EditRouteClientPage route={route} places={places} />;
}