'use client';

import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-b from-background to-muted">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Track Your Routes with{" "}
            <span className="text-primary">Precision</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simple, efficient route tracking for professionals. Log your trips,
            monitor mileage, and manage your destinations all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignInButton mode="modal">
              <Button size="lg" className="font-semibold">
                Get Started Free
              </Button>
            </SignInButton>
            <Button size="lg" variant="outline">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need to track your routes
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              title="Easy Route Logging"
              description="Quickly log your routes with our intuitive interface. Add stops, track distance, and save your favorite destinations."
            />
            <FeatureCard
              title="Real-time Updates"
              description="Get instant updates on your route progress. Track time spent, distance covered, and estimated arrival times."
            />
            <FeatureCard
              title="Detailed Analytics"
              description="View comprehensive reports of your routes. Analyze patterns, optimize paths, and save time and fuel."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">
            Ready to streamline your route tracking?
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of professionals who trust RouteTracker
          </p>
          <SignInButton mode="modal">
            <Button size="lg" className="font-semibold">
              Start Tracking Now
            </Button>
          </SignInButton>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
