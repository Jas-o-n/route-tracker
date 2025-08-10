'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ThemeProvider } from '@/providers/ThemeProvider';

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.replace('/dashboard');
    }
  }, [isSignedIn, router]);

  if (isSignedIn) {
    return null;
  }

  return (
    <ThemeProvider attribute="class" forcedTheme="dark" enableSystem={false}>
      <div className="dark min-h-dvh bg-background text-foreground">
        {children}
      </div>
    </ThemeProvider>
  );
}
