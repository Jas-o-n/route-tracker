export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      onboardingComplete?: boolean;
      isPro?: boolean; // active paid subscription
    };
  }
}


