"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import RoutesList from "@/components/RoutesList";
import { Input } from "@/components/ui/input";
import { ExportRoutesDialog } from "@/components/ExportRoutesDialog";
import { getRoutesForExport } from "@/lib/actions/route-actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

export default function RoutesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");

const handleExport = async (startDate: Date, endDate: Date) => {
  let blobUrl: string | null = null;
   try {
     const csv = await getRoutesForExport(startDate, endDate, 'default-user');
     // Create a blob and download it
     const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    blobUrl = URL.createObjectURL(blob);
     const link = document.createElement('a');
    link.href = blobUrl;
     link.download = `routes-${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.csv`;
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
   } catch (error) {
     console.error('Failed to export routes:', error);
     toast({
       variant: "destructive",
       description: "Failed to export routes. Please try again."
     });
  } finally {
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
    }
   }
 };

  return (
    <main className="container mx-auto max-w-5xl py-8 px-4 md:px-6">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Your Routes</h1>
        <div className="flex space-x-2">
          <ExportRoutesDialog onExport={handleExport} />
          <Button asChild>
            <Link href="/routes/new">
              <Plus className="mr-2 h-4 w-4" /> Add New Route
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search routes..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="miles-desc">Highest Mileage</SelectItem>
              <SelectItem value="miles-asc">Lowest Mileage</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <RoutesList searchQuery={searchQuery} sortBy={sortBy} />
    </main>
  );
}