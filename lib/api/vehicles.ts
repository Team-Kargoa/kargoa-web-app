import { apiRequest } from './client';
import type { VehicleCategory } from './types';

export function getCategories(): Promise<VehicleCategory[]> {
  // The live envelope's `data` is { categories: [...] }, not a bare array —
  // verified against the running backend (2026-08-06). apiRequest only
  // unwraps the outer envelope, so this unwraps the one level beneath it.
  return apiRequest<{ categories: VehicleCategory[] }>(
    '/vehicles/categories',
  ).then((result) => result.categories);
}
