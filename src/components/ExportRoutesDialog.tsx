"use client";

import { useState, useTransition } from "react";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Download, ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getRoutesForExport } from "@/app/(main)/routes/_actions/export";
import { useMediaQuery } from "@uidotdev/usehooks";

export function ExportRoutesDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const handleExport = () => {
    if (dateRange?.from && dateRange?.to) {
      const formData = new FormData();
      formData.append("startDate", dateRange.from.toISOString());
      formData.append("endDate", dateRange.to.toISOString());
      startTransition(async () => {
        const csv = await getRoutesForExport(formData);
        // Download CSV
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        const ddmmyyyy = (d: Date) => `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
        link.download = `routes-${ddmmyyyy(dateRange.from!)}_to_${ddmmyyyy(dateRange.to!)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        setIsOpen(false);
      });
    }
  };

  const isMobile = useMediaQuery("(max-width: 639px)");

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" /> Export Routes
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Routes</DialogTitle>
          <DialogDescription>
            Select a date range to export routes as CSV.
          </DialogDescription>
        </DialogHeader>
        <div className="px-1 py-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between font-normal"
              >
                {dateRange?.from && dateRange?.to
                  ? `${String(dateRange.from.getDate()).padStart(2,'0')}/${String(dateRange.from.getMonth()+1).padStart(2,'0')}/${dateRange.from.getFullYear()} - ${String(dateRange.to.getDate()).padStart(2,'0')}/${String(dateRange.to.getMonth()+1).padStart(2,'0')}/${dateRange.to.getFullYear()}`
                  : "Select date range"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-full max-w-[95vw] sm:max-w-lg max-h-[80vh] overflow-y-auto p-0"
              align="start"
              aria-label="Select date range calendar"
            >
              <Calendar
                autoFocus
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={isMobile ? 1 : 2}
                disabled={(date) => date > new Date()}
                captionLayout="dropdown"
              />
            </PopoverContent>
          </Popover>
        </div>
        <DialogFooter>
          <Button
            onClick={handleExport}
            disabled={!dateRange?.from || !dateRange?.to || isPending}
            className="w-full"
          >
            {isPending ? "Exporting..." : "Export CSV"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
