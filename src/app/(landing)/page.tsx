'use client';

import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background scroll-smooth">
      {/* Navigation Bar */}
      <nav className="w-full flex items-center justify-between px-8 py-4 border-b bg-background/80 sticky top-0 z-10">
        <div className="font-bold text-lg tracking-tight flex items-center gap-1">
          Route<span className="text-xs align-super">®</span>
        </div>
        <div className="flex gap-8 text-muted-foreground font-medium text-sm mx-auto">
          <a href="#hero" className="hover:text-foreground transition">Home</a>
          <a href="#features" className="hover:text-foreground transition">Features</a>
          <a href="#pricing" className="hover:text-foreground transition">Pricing</a>
        </div>
        <div>
          <SignInButton mode="modal">
            <Button variant="outline" className="font-semibold">Sign In</Button>
          </SignInButton>
        </div>
      </nav>

      {/* Hero Section (now includes Problem & Solution text and buttons below) */}
      <section id="hero"className="flex flex-col items-center justify-center flex-1 py-24 px-4 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold mb-2 tracking-tight">Track Your Routes.<br /><span className="text-muted-foreground font-semibold">Simplify Your Journeys.</span></h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mt-6 mb-8">Keeping track of your trips and mileage can be tedious and time-consuming. Our app automates route tracking, calculates distances, and organizes your travel data in one place so you can focus on what matters.</p>
        <div className="flex gap-4 justify-center">
          <SignedOut>
            <SignUpButton mode="modal" forceRedirectUrl="/onboarding">
              <Button size="lg" className="font-semibold">Get Started Now</Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/onboarding">
              <Button size="lg" className="font-semibold">Get Started Now</Button>
            </Link>
          </SignedIn>
          <Button size="lg" variant="outline">Learn More</Button>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="max-w-5xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-8">
        <div className="flex flex-col justify-center">
          <h3 className="text-2xl font-bold mb-2">Track this month’s distance.</h3>
          <p className="text-muted-foreground mb-8">Always see your total mileage for the month, automatically updated.</p>
          <div className="w-full h-64 bg-muted rounded-2xl flex items-center justify-center">
            <div className="w-16 h-16 bg-white rounded-md" />
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <h3 className="text-2xl font-bold mb-2">Detailed stats view.</h3>
          <p className="text-muted-foreground mb-8">Review recent routes, stats, and all route details in a simple dashboard.</p>
          <div className="w-full h-64 bg-muted rounded-2xl flex items-center justify-center">
            <div className="w-16 h-16 bg-white rounded-full" />
          </div>
        </div>
        <div className="flex flex-col justify-center md:col-span-2 md:flex-row gap-8 mt-8">
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-2">Map your journeys.</h3>
            <p className="text-muted-foreground mb-8">Visualize your start and end points on an interactive map.</p>
            <div className="w-full h-64 bg-muted rounded-2xl flex items-center justify-center">
              <div className="w-16 h-16 bg-white" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="max-w-3xl mx-auto px-4 py-12">
        <h3 className="font-bold mb-2">How It Works</h3>
        <p className="text-muted-foreground">Add places with address autocomplete and map pinning. Log routes with start and end locations, mileage, and notes. Instantly see your journeys visualized on a live dashboard.</p>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-center mb-2">Ready to simplify your journeys?</h2>
        <p className="text-xl text-muted-foreground text-center mb-8">Sign up now and start tracking your routes for free.</p>
        <div className="flex justify-center">
          <Card className="p-8 flex flex-col items-center border-2 border-primary max-w-sm w-full">
            <div className="font-bold text-lg mb-2">Premium</div>
            <div className="text-4xl font-bold mb-2">$12.99</div>
            <ul className="text-muted-foreground mb-4 space-y-1 text-center">
              <li>✓ Advanced analytics</li>
              <li>✓ Priority support</li>
              <li>✓ Unlimited history</li>
            </ul>
            <SignedOut>
              <SignUpButton mode="modal" forceRedirectUrl="/onboarding">
                <Button className="w-full font-semibold">Get Started</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/onboarding">
                <Button className="w-full font-semibold">Get Started</Button>
              </Link>
            </SignedIn>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-2">What users say</h2>
        <div className="text-2xl text-muted-foreground text-center mb-8 font-semibold">Loved by early adopters</div>
        <div className="grid md:grid-cols-3 gap-8">
          <TestimonialCard quote="Logging my work trips is finally effortless." name="Alex P." role="Freelancer" />
          <TestimonialCard quote="The map visualization is a game changer." name="Morgan L." role="Consultant" />
          <TestimonialCard quote="Perfect for mileage reimbursements." name="Jamie C." role="Field Agent" />
        </div>
      </section>
    </div>
  );
}

function TestimonialCard({ quote, name, role }: { quote: string; name: string; role: string }) {
  return (
    <Card className="p-6 flex flex-col items-start bg-muted/40">
      <div className="text-lg mb-4">“{quote}”</div>
      <div className="mt-auto">
        <div className="font-semibold">{name}</div>
        <div className="text-sm text-muted-foreground">{role}</div>
      </div>
    </Card>
  );
}
