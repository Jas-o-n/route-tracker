// Database model type (matches schema exactly)
export interface RouteModel {
  id: string;
  startLocation: string;
  destination: string;
  mileage: number;
  date: Date;
  notes: string | null;
  userId: string;
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
  userId: string;
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