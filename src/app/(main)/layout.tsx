'use client';

import QueryProvider from '@/providers/QueryProvider';
import Header from '@/components/Header';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <main className={inter.className}>
        <Header />
        {children}
      </main>
    </QueryProvider>
  );
}