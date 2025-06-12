"use client";

import { useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { RouteWithStats } from "@/lib/schemas/routes";
import { Place } from "@/lib/schemas/places";

interface RouteMapProps {
  fromPlace?: Place;
  toPlace?: Place;
  mileage?: number;
}

export default function RouteMap({ fromPlace, toPlace, mileage }: RouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!mapContainerRef.current || !fromPlace || !toPlace) return;
    
    // Clear any previous content
    mapContainerRef.current.innerHTML = "";
    
    // Create route visualization
    const mapContainer = document.createElement("div");
    mapContainer.className = "w-full h-full flex flex-col items-center justify-center relative";
    
    // Start location
    const startPoint = document.createElement("div");
    startPoint.className = "absolute top-1/4 left-1/4 flex items-center";
    
    const startMarker = document.createElement("div");
    startMarker.className = "w-6 h-6 rounded-full bg-muted flex items-center justify-center border-2 border-background shadow-md z-10";
    startMarker.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-foreground"><path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" fill="currentColor" stroke="currentColor"></path><path d="M12 22C17 18 21 14 21 10C21 6.13401 17.866 3 14 3C12.134 3 10 4 8.5 5.5"></path></svg>`;
    
    const startLabel = document.createElement("div");
    startLabel.className = "ml-2 px-3 py-1 bg-background rounded-md shadow text-sm";
    startLabel.textContent = fromPlace.name;
    
    startPoint.appendChild(startMarker);
    startPoint.appendChild(startLabel);
    
    // End location
    const endPoint = document.createElement("div");
    endPoint.className = "absolute bottom-1/4 right-1/4 flex items-center";
    
    const endMarker = document.createElement("div");
    endMarker.className = "w-6 h-6 rounded-full bg-primary flex items-center justify-center border-2 border-background shadow-md z-10";
    endMarker.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary-foreground"><path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" fill="currentColor" stroke="currentColor"></path><path d="M12 22C17 18 21 14 21 10C21 6.13401 17.866 3 14 3C12.134 3 10 4 8.5 5.5"></path></svg>`;
    
    const endLabel = document.createElement("div");
    endLabel.className = "mr-2 px-3 py-1 bg-background rounded-md shadow text-sm order-first";
    endLabel.textContent = toPlace.name;
    
    endPoint.appendChild(endLabel);
    endPoint.appendChild(endMarker);
    
    // Route path
    const routePath = document.createElement("div");
    routePath.className = "absolute w-1/2 h-1/2 top-1/4 left-1/4 overflow-visible";
    
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("class", "overflow-visible");
    
    // Create a curved path between start and end points
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M0,0 C30,40 70,60 100,100");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("stroke-dasharray", "4 2");
    path.setAttribute("class", "text-primary");
    
    svg.appendChild(path);
    routePath.appendChild(svg);
    
    // Assemble the map
    mapContainer.appendChild(routePath);
    mapContainer.appendChild(startPoint);
    mapContainer.appendChild(endPoint);
    
    // Add a subtle background
    const background = document.createElement("div");
    background.className = "absolute inset-0 bg-muted/20 rounded-md -z-10";
    mapContainer.appendChild(background);
    
    // Add mileage label
    const mileageLabel = document.createElement("div");
    mileageLabel.className = "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-background rounded-full shadow-md text-sm font-medium";
    mileageLabel.textContent = `${mileage?.toLocaleString() ?? 0} miles`;
    mapContainer.appendChild(mileageLabel);
    
    mapContainerRef.current.appendChild(mapContainer);
  }, [fromPlace, toPlace, mileage]);

  if (!fromPlace || !toPlace) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  return (
    <div ref={mapContainerRef} className="h-[400px]" />
  );
}