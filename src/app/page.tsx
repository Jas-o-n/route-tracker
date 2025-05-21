import Link from 'next/link';
import { MoveRight } from 'lucide-react';
import RouteStatsPreview from '@/components/RouteStatsPreview';
import RecentRoutes from '@/components/RecentRoutes';
import { Button } from '@/components/ui/button';
import { getInitialRouteStats } from '@/lib/server/route-service';

export default async function Home() {
  const initialStats = await getInitialRouteStats();

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary/10 to-secondary/10 py-24 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col items-start space-y-6 md:w-2/3">
            <h1 className="text-4xl font-bold tracking-tighter md:text-5xl lg:text-6xl">
              Track Your <span className="text-primary">Driving Routes</span> With Ease
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              Log your trips, monitor your mileage, and get insights on your driving patterns.
            </p>
            <div className="flex gap-4">
              <Button asChild size="lg">
                <Link href="/routes/new">
                  Add New Route <MoveRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/routes">View All Routes</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-5xl">
          <h2 className="mb-8 text-3xl font-bold tracking-tight">Your Driving Summary</h2>
          <RouteStatsPreview initialStats={initialStats} />
        </div>
      </section>

      {/* Recent Routes */}
      <section className="py-16 px-6 bg-muted/50">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Recent Routes</h2>
            <Button variant="outline" asChild>
              <Link href="/routes">View All</Link>
            </Button>
          </div>
          <RecentRoutes />
        </div>
      </section>
    </main>
  );
}