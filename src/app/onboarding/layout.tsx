import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

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

  return <>{children}</>;
}


