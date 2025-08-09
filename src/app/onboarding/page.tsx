'use client';

import { useEffect } from 'react';
import { useAuth, useUser, useClerk, PricingTable } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

export default function OnboardingPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { session } = useClerk();

  return (
    <div className="max-w-lg mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-2">Complete your onboarding</h1>
      <p className="text-muted-foreground mb-6">
        Subscribe to the Premium plan ($12.99/month) to access the app.
      </p>

      <PricingTable />
    </div>
  );
}

