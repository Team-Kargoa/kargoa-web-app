import { apiRequest } from './client';
import type { VehicleCategory } from './types';

export function getCategories(): Promise<VehicleCategory[]> {
  return apiRequest<VehicleCategory[]>('/vehicles/categories');
}
