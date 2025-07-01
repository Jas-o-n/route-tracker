"use server";

import { getRoutesForExport } from "@/lib/actions/route-actions";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function exportRoutesAction(formData: FormData) {
  const startDate = new Date(formData.get("startDate") as string);
  const endDate = new Date(formData.get("endDate") as string);
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");
  const csv = await getRoutesForExport(startDate, endDate, userId);
  // Optionally revalidate if needed
  // revalidatePath("/routes");
  return csv;
}
