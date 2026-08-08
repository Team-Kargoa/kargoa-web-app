// Test fixture for lib/api/vehicles.ts's getCategories() — a LIVE, public
// endpoint (unlike the other files in this directory, which stand in for
// backend routes that don't exist yet). This mirrors the real seeded
// categories returned by GET /vehicles/categories, verified against the
// running backend on 2026-08-06, so page tests stay deterministic without
// hitting the network. Update alongside vehicles.ts if the seed data changes.
import type { VehicleCategory } from '../types';

export const VEHICLE_CATEGORIES_FIXTURE: VehicleCategory[] = [
  {
    id: 'e4f5a439-d9bd-4796-8420-cc8afb04b145',
    name: 'Pickup',
    description: 'Small loads — furniture, appliances, market goods.',
    base_fare: '1500.00',
    per_km_rate: '250.00',
    minimum_fare: '2000.00',
    is_active: true,
  },
  {
    id: '4bf06e81-87e5-4fac-bc08-3e06f475e283',
    name: 'Mini Truck',
    description: 'Medium loads — small moves, bulk goods.',
    base_fare: '2000.00',
    per_km_rate: '350.00',
    minimum_fare: '3000.00',
    is_active: true,
  },
  {
    id: '63e27772-da7e-4b43-9e57-180386c425c9',
    name: 'Standard Truck',
    description: 'Full household moves, commercial freight.',
    base_fare: '3500.00',
    per_km_rate: '500.00',
    minimum_fare: '5000.00',
    is_active: true,
  },
  {
    id: '56b8fae8-b9d3-4e84-aad5-c39b26b0d016',
    name: 'Large Truck',
    description: 'Heavy freight and construction materials.',
    base_fare: '5000.00',
    per_km_rate: '700.00',
    minimum_fare: '8000.00',
    is_active: true,
  },
];
