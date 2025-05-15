export interface Route {
  id: string;
  startLocation: string;
  destination: string;
  mileage: number;
  date: string;
  notes?: string;
}

export interface RouteWithStats extends Route {
  stats?: {
    timesDriven: number;
    avgMileage: number;
    lastDriven: string;
  };
}