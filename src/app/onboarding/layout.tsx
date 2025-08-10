import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ThemeProvider } from "@/providers/ThemeProvider";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { has } = await auth();
  const hasActiveSubscription = has({ plan: 'pro'});

  if (hasActiveSubscription) {
    redirect("/dashboard");
  }

  return (
    <ThemeProvider attribute="class" forcedTheme="dark" enableSystem={false}>
      <div className="dark min-h-dvh bg-background text-foreground">
        {children}
      </div>
    </ThemeProvider>
  );
}


