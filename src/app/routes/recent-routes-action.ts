"use server";

import { getRecentRoutes } from "@/lib/actions/route-actions";
import { auth } from "@clerk/nextjs/server";

export async function getRecentRoutesAction(limit = 3) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");
  return await getRecentRoutes(limit, userId);
}
