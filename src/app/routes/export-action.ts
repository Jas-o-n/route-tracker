"use server";

import { getRoutesForExport } from "@/lib/actions/route-actions";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function exportRoutesAction(formData: FormData) {
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;

  if (!startDateStr || !endDateStr) {
    throw new Error("Start date and end date are required");
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error("Invalid date format");
  }  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");
  const csv = await getRoutesForExport(startDate, endDate, userId);
  // Optionally revalidate if needed
  // revalidatePath("/routes");
  return csv;
}
