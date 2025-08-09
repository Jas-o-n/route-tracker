'use client';

import { useEffect } from 'react';
import { SignedIn, useAuth, useUser, useClerk, PricingTable } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { session } = useClerk();

  useEffect(() => {
    if (!isSignedIn) return;
    const hasActiveSubscription = session?.checkAuthorization({ plan: 'pro' });
    if (hasActiveSubscription) {
      router.replace('/dashboard');
    }
  }, [isSignedIn, router]);

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

