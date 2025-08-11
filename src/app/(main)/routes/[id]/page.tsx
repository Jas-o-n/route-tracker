import { getRouteById, getPlaces } from "@/lib/db/queries";
import RouteDetailClientPage from "@/components/RouteDetailClientPage";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function RouteDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [route, places] = await Promise.all([
    getRouteById(id),
    getPlaces(),
  ]);

  if (!route) {
    return (
      <div className="container mx-auto max-w-3xl py-8 px-4 md:px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Route Not Found</h1>
          <p className="mb-6">The route you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link href="/routes">Back to Routes</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <RouteDetailClientPage route={route} places={places} />;
}