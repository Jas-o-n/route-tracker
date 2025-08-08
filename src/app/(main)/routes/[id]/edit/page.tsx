import { getRouteById, getPlaces } from "@/lib/db/queries";
import EditRouteClientPage from "@/components/EditRouteClientPage";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function EditRoutePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const route = await getRouteById(id);
  const places = await getPlaces();

  if (!route) {
    return (
      <div className="container mx-auto max-w-3xl py-8 px-4 md:px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Route Not Found</h1>
          <p className="mb-6">The route you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link href={`/routes/${id}`}>Back</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <EditRouteClientPage route={route} places={places} />;
}