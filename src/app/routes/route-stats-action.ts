"use server";

import { getRouteStats } from "@/lib/actions/route-actions";
import { auth } from "@clerk/nextjs/server";

export async function getRouteStatsAction() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");
  return await getRouteStats(userId);
}
