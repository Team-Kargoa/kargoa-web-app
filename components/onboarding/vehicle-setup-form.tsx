'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Car,
  Truck,
  Container,
  UploadCloud,
  Info,
  PlusCircle,
  CheckCircle,
} from 'lucide-react';
import type { VehicleCategory } from '@/lib/api/types';
import { OnboardingHeader } from './onboarding-header';
import { OnboardingFooterNav } from './onboarding-footer-nav';

export type VehicleSetupFormProps = {
  categories: VehicleCategory[];
};

// The design's own category picker is a static MINI/STD/LARGE trio; this
// screen instead renders one option per live category from
// GET /vehicles/categories, so it needs its own icon per real category name
// rather than the design's hardcoded set.
const CATEGORY_ICONS: Record<string, typeof Car> = {
  Pickup: Car,
  'Mini Truck': Truck,
  'Standard Truck': Truck,
  'Large Truck': Container,
};

let nextVehicleId = 1;

type VehicleEntry = {
  id: number;
  plate: string;
  categoryId: string;
  insuranceFileName: string | null;
};

function newVehicleEntry(defaultCategoryId: string): VehicleEntry {
  return {
    id: nextVehicleId++,
    plate: '',
    categoryId: defaultCategoryId,
    insuranceFileName: null,
  };
}

export function VehicleSetupForm({ categories }: VehicleSetupFormProps) {
  const router = useRouter();
  const defaultCategoryId = categories[0]?.id ?? '';
  const [vehicles, setVehicles] = useState<VehicleEntry[]>([
    newVehicleEntry(defaultCategoryId),
  ]);

  function updateVehicle(id: number, patch: Partial<VehicleEntry>) {
    setVehicles((current) =>
      current.map((vehicle) =>
        vehicle.id === id ? { ...vehicle, ...patch } : vehicle,
      ),
    );
  }

  function handleAddVehicle() {
    setVehicles((current) => [...current, newVehicleEntry(defaultCategoryId)]);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push('/fleet');
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <OnboardingHeader trackingLabel="FLEET_ONBOARDING" />

      <main className="flex-grow pt-24 pb-24 px-4 md:px-8 max-w-2xl mx-auto w-full">
        <section className="mb-8">
          <div className="flex justify-between items-end mb-2">
            <div>
              <span className="font-mono text-primary uppercase block mb-1 text-xs">
                Step 3 of 3
              </span>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-primary">
                Vehicle Registration
              </h2>
            </div>
            <span className="font-mono text-success-momo">100% Ready</span>
          </div>
          <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="h-full w-full bg-primary-container" />
          </div>
        </section>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {vehicles.map((vehicle, index) => (
            <VehicleEntryCard
              key={vehicle.id}
              index={index}
              vehicle={vehicle}
              categories={categories}
              onChange={(patch) => updateVehicle(vehicle.id, patch)}
            />
          ))}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface-container p-4 rounded-xl border border-border flex items-start gap-3">
              <Info aria-hidden="true" className="h-5 w-5 text-primary" />
              <p className="text-text-secondary text-sm">
                Vehicle details must match the physical registration document
                for Yaound&eacute; regulatory compliance.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddVehicle}
              className="w-full h-14 flex items-center justify-center gap-2 border-2 border-primary text-primary font-sans font-semibold rounded-xl hover:bg-primary/5 active:scale-95 transition-all"
            >
              <PlusCircle aria-hidden="true" className="h-5 w-5" />
              Add Another Vehicle
            </button>
          </div>

          <div className="pt-8">
            <button
              type="submit"
              className="w-full h-14 bg-primary-container text-primary-container-foreground font-sans font-semibold text-lg rounded-xl shadow-lg hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Finish Setup
              <CheckCircle aria-hidden="true" className="h-5 w-5" />
            </button>
            <p className="text-center mt-4 text-text-secondary text-sm">
              By finishing, you agree to our{' '}
              <a href="/terms" className="text-primary underline">
                Fleet Terms of Service
              </a>
              .
            </p>
          </div>
        </form>
      </main>

      <OnboardingFooterNav />
    </div>
  );
}

function VehicleEntryCard({
  index,
  vehicle,
  categories,
  onChange,
}: {
  index: number;
  vehicle: VehicleEntry;
  categories: VehicleCategory[];
  onChange: (patch: Partial<VehicleEntry>) => void;
}) {
  const plateId = `plate-${vehicle.id}`;

  function handleInsuranceSelect(event: ChangeEvent<HTMLInputElement>) {
    onChange({ insuranceFileName: event.target.files?.[0]?.name ?? null });
  }

  return (
    <div className="border border-border rounded-xl p-6 shadow-sm relative overflow-hidden bg-surface">
      <div className="absolute top-0 right-0 p-2">
        <span className="bg-surface-container text-text-secondary font-mono text-xs px-2 py-1 rounded">
          VEHICLE_{String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <div className="space-y-6 pt-4">
        <div className="grid gap-2">
          <label htmlFor={plateId} className="font-sans text-text-secondary">
            License Plate Number
          </label>
          <div className="relative">
            <Car
              aria-hidden="true"
              className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary"
            />
            <input
              id={plateId}
              type="text"
              required
              placeholder="LT-XXX-XX"
              className="w-full h-14 pl-12 pr-4 bg-surface border-2 border-border rounded-lg font-mono uppercase"
              value={vehicle.plate}
              onChange={(event) => onChange({ plate: event.target.value })}
            />
          </div>
          <p className="text-[12px] text-text-secondary italic">
            Format: Region Code - Numbers - Letters (e.g., LT-123-AA)
          </p>
        </div>

        <div className="grid gap-2">
          <span className="font-sans text-text-secondary">
            Vehicle Category
          </span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map((category) => {
              const Icon = CATEGORY_ICONS[category.name] ?? Truck;
              const checked = vehicle.categoryId === category.id;
              return (
                <label key={category.id} className="cursor-pointer">
                  <input
                    type="radio"
                    className="sr-only"
                    name={`category-${vehicle.id}`}
                    value={category.id}
                    checked={checked}
                    onChange={() => onChange({ categoryId: category.id })}
                  />
                  <div
                    className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${
                      checked
                        ? 'border-primary-container bg-surface-container-low'
                        : 'border-border'
                    }`}
                  >
                    <Icon aria-hidden="true" className="h-6 w-6 mb-1" />
                    <span className="font-mono text-xs text-center">
                      {category.name}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="grid gap-2">
          <span className="font-sans text-text-secondary">
            Insurance Document (PDF/JPG)
          </span>
          <div className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl hover:border-primary-container transition-colors cursor-pointer overflow-hidden">
            <input
              accept=".pdf,.jpg,.jpeg"
              type="file"
              aria-label={`Upload insurance document for vehicle ${index + 1}`}
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleInsuranceSelect}
            />
            <div className="text-center pointer-events-none">
              {vehicle.insuranceFileName ? (
                <p className="text-success-momo font-sans text-sm flex items-center gap-2">
                  <CheckCircle aria-hidden="true" className="h-5 w-5" />
                  {vehicle.insuranceFileName}
                </p>
              ) : (
                <>
                  <UploadCloud
                    aria-hidden="true"
                    className="h-8 w-8 text-text-secondary mb-2 mx-auto"
                  />
                  <p className="text-text-secondary text-sm">
                    Click to upload or drag &amp; drop
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
