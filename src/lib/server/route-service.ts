import { getRouteStats } from '../actions/route-actions';
import type { RouteStats } from '../types';

export async function getInitialRouteStats(): Promise<RouteStats | null> {
  try {
    return await getRouteStats();
  } catch (error) {
    console.error('Failed to fetch initial route stats:', error);
    return null;
  }
}