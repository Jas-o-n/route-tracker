"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { routes } from "@/lib/db/schema";
import { desc, and, gte, lte, eq } from "drizzle-orm";

export type ExportableRoute = {
  date: string;
  fromPlace: string;
  toPlace: string;
  startMileage: number;
  endMileage: number;
  distance: number;
  notes: string | null;
  type: string;
};

export async function getRoutesForExport(formData: FormData) {
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;

  if (!startDateStr || !endDateStr) {
    throw new Error("Start date and end date are required");
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error("Invalid date format");
  }

  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  // Set the end date to the end of the day (23:59:59.999)
  const endOfDay = new Date(endDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Set the start date to the start of the day (00:00:00.000)
  const startOfDay = new Date(startDate);
  startOfDay.setHours(0, 0, 0, 0);

  const result = await db.query.routes.findMany({
    where: and(
      gte(routes.date, startOfDay),
      lte(routes.date, endOfDay),
      eq(routes.userID, userId)
    ),
    with: {
      fromPlace: {
        columns: {
          name: true,
          full_address: true,
        },
      },
      toPlace: {
        columns: {
          name: true,
          full_address: true,
        },
      },
    },
    orderBy: [desc(routes.date)],
  });

  const exportableRoutes: ExportableRoute[] = result.map((route) => ({
    date: formatDate(route.date),
    fromPlace: route.fromPlace.full_address,
    toPlace: route.toPlace.full_address,
    startMileage: route.startMileage,
    endMileage: route.endMileage,
    distance: route.distance,
    notes: route.notes,
    type: route.isWork ? 'Work' : 'Private',
  }));

  // Convert to CSV
  const headers = ['Date', 'From', 'To', 'Start Mileage', 'End Mileage', 'Distance', 'Notes', 'Type'];
  const rows = exportableRoutes.map(route => [
    route.date,
    route.fromPlace,
    route.toPlace,
    route.startMileage,
    route.endMileage,
    route.distance,
    route.notes || '',
    route.type,
  ]);

  const quote = (cell: unknown) => {
    const str = String(cell).replace(/"/g, '""');     // escape quotes
    return /[",\n\r]/.test(str) ? `"${str}"` : str;   // wrap if needed
  };

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(quote).join(',')),
  ].join('\n');

  return csv;
}
