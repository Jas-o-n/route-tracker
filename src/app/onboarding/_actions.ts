'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';

export async function markOnboardingComplete() {
  const { userId } = await auth();
  if (!userId) return { error: 'Not signed in' };

  const client = await clerkClient();
  try {
    await client.users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
        isPro: true,
      },
    });
    return { ok: true };
  } catch (e) {
    return { error: 'Failed to update metadata' };
  }
}


