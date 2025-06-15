"use client";

import { useState } from "react";
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

interface ExportRoutesDialogProps {
  onExport: (startDate: Date, endDate: Date) => void;
}

export function ExportRoutesDialog({ onExport }: ExportRoutesDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const handleExport = () => {
    if (dateRange?.from && dateRange?.to) {
      onExport(dateRange.from, dateRange.to);
      setIsOpen(false);
    }
  };

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
                  ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                  : "Select date range"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                autoFocus
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                disabled={(date) => date > new Date()}
                captionLayout="dropdown"
              />
            </PopoverContent>
          </Popover>
        </div>
        <DialogFooter>
          <Button
            onClick={handleExport}
            disabled={!dateRange?.from || !dateRange?.to}
            className="w-full"
          >
            Export CSV
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
