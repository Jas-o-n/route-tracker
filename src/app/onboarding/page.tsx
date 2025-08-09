'use client';

import { PricingTable } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
export default function OnboardingPage() {
  const appearance = {
    baseTheme: dark,
    variables: {
      colorPrimary: 'hsl(var(--primary))',
      colorText: 'hsl(var(--foreground))',
      colorBackground: 'transparent',
      colorInputBackground: 'hsl(var(--muted))',
      borderRadius: '0.75rem',
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
    },
    elements: {
      // Best-effort keys used across Clerk components; ignored if not applicable
      formButtonPrimary: {
        borderRadius: '0.5rem',
        fontWeight: 600,
        padding: '0.625rem 0.875rem',
      },
    },
  };

  return (
    <main className="container mx-auto max-w-3xl py-12 px-4 md:px-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Complete your onboarding</h1>
        <p className="text-muted-foreground">Subscribe to the Premium plan to access the app.</p>
      </div>

      <Card className="p-4 md:p-6">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Premium</CardTitle>
          <CardDescription>$12.99/month · Cancel anytime</CardDescription>
        </CardHeader>
        <CardContent>
          <PricingTable appearance={appearance} />
        </CardContent>
        <CardFooter className="justify-center text-xs text-muted-foreground">
          Secure checkout
        </CardFooter>
      </Card>
    </main>
  );
}

