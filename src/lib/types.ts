// Database model type (matches schema exactly)
export interface RouteModel {
  id: string;
  startLocation: string;
  destination: string;
  mileage: number;
  date: Date;
  notes: string | null;
  userID: string;
  createdAt: Date;
  updatedAt: Date;
}

// API/Frontend type (dates as ISO strings)
export interface Route {
  id: string;
  startLocation: string;
  destination: string;
  mileage: number;
  date: string;
  notes: string | null;
  userID: string;
  createdAt: string;
  updatedAt: string;
}

export interface RouteWithStats extends Route {
  stats: {
    timesDriven: number;
    avgMileage: number;
    lastDriven: string;
  };
}

// Input type for creating new routes
export type CreateRouteInput = Omit<Route, 'id' | 'createdAt' | 'updatedAt'>;

// Input type for updating routes
export type UpdateRouteInput = Partial<CreateRouteInput>;

// New type specifically for the form
export type RouteFormData = {
  startLocation: string;
  destination: string;
  mileage: number;
  date: string;
  notes?: string;
};

export interface MostFrequentRoute {
  from: string;
  to: string;
  count: number;
}

export interface RouteStats {
  totalRoutes: number;
  totalMiles: number;
  avgMileagePerRoute: number;
  mostFrequentRoute: MostFrequentRoute | null;
}