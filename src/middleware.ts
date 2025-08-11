import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",              // landing
  "/onboarding",    // onboarding flow remains accessible
  "/sign-in(.*)",   // Clerk sign-in
  "/sign-up(.*)",   // Clerk sign-up
]);

// API and TRPC routes should not redirect; return JSON errors instead
const isApiRoute = createRouteMatcher([
  "/api(.*)",
  "/trpc(.*)",
]);
export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();

  // If unauthenticated and not on a public route
  if (!userId && !isPublicRoute(req)) {
    if (isApiRoute(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // If authenticated but onboarding not complete or no active subscription, force onboarding
  const { has } = await auth();
  const hasActiveSubscription = has({ plan: 'pro'});

  if (userId && !hasActiveSubscription) {
    if (isApiRoute(req)) {
      return NextResponse.json({ error: "Subscription required" }, { status: 403 });
    }
    if (req.nextUrl.pathname !== "/onboarding") {
      const onboardingUrl = new URL("/onboarding", req.url);
      return NextResponse.redirect(onboardingUrl);
    }
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)', // Always run for API routes
  ],
};