import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/providers/ThemeProvider';
import QueryProvider from '@/providers/QueryProvider';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RouteTracker - Track Your Driving Routes',
  description: 'Log your trips, monitor your mileage, and get insights on your driving patterns.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryProvider>
            <Header />
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}