'use client';

import { useState } from 'react';
import {
  User,
  Car,
  Phone,
  Wallet,
  MessageSquare,
  Truck,
  MoreVertical,
  Plus,
} from 'lucide-react';
import type {
  FleetDriverProfile,
  FleetVehicle,
  DriverDutyStatus,
  VehicleOperationalStatus,
} from '@/lib/api/fleet';
import { formatPhone } from '@/lib/format';
import { SampleDataBadge } from '@/components/sample-data-badge';

export type DriverVehicleManagerProps = {
  drivers: FleetDriverProfile[];
  vehicles: FleetVehicle[];
  /** Shows the shared SampleDataBadge on the Drivers tab when `drivers`
   * came from a lib/api fallback fixture rather than the real endpoint. */
  isDriversSample?: boolean;
  /** Same, but for the Vehicles tab. */
  isVehiclesSample?: boolean;
};

type Tab = 'drivers' | 'vehicles';

const DUTY_META: Record<
  DriverDutyStatus,
  { label: string; className: string }
> = {
  'on-duty': {
    label: 'ON DUTY',
    className: 'bg-success-momo/20 text-success-momo',
  },
  'off-duty': {
    label: 'OFF DUTY',
    className: 'bg-surface-high text-text-secondary',
  },
};

const VEHICLE_STATUS_META: Record<
  VehicleOperationalStatus,
  { label: string; className: string }
> = {
  active: {
    label: 'Active',
    className: 'bg-success-momo/10 text-success-momo border-success-momo/20',
  },
  maintenance: {
    label: 'Maintenance',
    className:
      'bg-primary-container/20 text-primary-container-foreground border-primary-container/30',
  },
  'needs-paperwork': {
    label: 'Needs Paperwork',
    className: 'bg-error-container text-error border-error/20',
  },
};

const TAB_BUTTON_BASE =
  'px-8 py-4 font-sans font-semibold transition-all flex items-center gap-2 whitespace-nowrap border-b-4';
const TAB_BUTTON_ACTIVE = 'border-primary text-primary';
const TAB_BUTTON_INACTIVE =
  'border-transparent text-text-secondary hover:bg-surface-container';

export function DriverVehicleManager({
  drivers,
  vehicles,
  isDriversSample,
  isVehiclesSample,
}: DriverVehicleManagerProps) {
  const [tab, setTab] = useState<Tab>('drivers');
  const isSample = tab === 'drivers' ? isDriversSample : isVehiclesSample;

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <h2 className="font-heading text-2xl md:text-3xl text-text-primary">
            Manage Fleet
          </h2>
          {isSample && <SampleDataBadge />}
        </div>
        <p className="text-text-secondary">
          Real-time oversight of your assets and workforce across the hub.
        </p>
      </header>

      <div
        className="flex border-b border-border mb-8 overflow-x-auto"
        role="tablist"
        aria-label="Fleet management sections"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'drivers'}
          className={`${TAB_BUTTON_BASE} ${tab === 'drivers' ? TAB_BUTTON_ACTIVE : TAB_BUTTON_INACTIVE}`}
          onClick={() => setTab('drivers')}
        >
          <User aria-hidden="true" className="h-5 w-5" />
          Drivers
          <span className="ml-1 bg-primary-container text-primary-container-foreground px-2 py-0.5 rounded-full text-[10px]">
            {drivers.length}
          </span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'vehicles'}
          className={`${TAB_BUTTON_BASE} ${tab === 'vehicles' ? TAB_BUTTON_ACTIVE : TAB_BUTTON_INACTIVE}`}
          onClick={() => setTab('vehicles')}
        >
          <Car aria-hidden="true" className="h-5 w-5" />
          Vehicles
          <span className="ml-1 bg-surface-highest text-text-secondary px-2 py-0.5 rounded-full text-[10px]">
            {vehicles.length}
          </span>
        </button>
      </div>

      {tab === 'drivers' ? (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {drivers.map((driver) => {
            const meta = DUTY_META[driver.dutyStatus];
            return (
              <div
                key={driver.id}
                className="bg-surface border border-border rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-heading text-xl text-text-primary">
                      {driver.name}
                    </h3>
                    <p className="text-sm text-text-secondary flex items-center gap-1 mt-1">
                      <Phone aria-hidden="true" className="h-3.5 w-3.5" />
                      {formatPhone(driver.phone)}
                    </p>
                  </div>
                  <span
                    className={`font-mono text-xs px-3 py-1 rounded-full font-bold ${meta.className}`}
                  >
                    {meta.label}
                  </span>
                </div>

                <div className="bg-surface-container p-4 rounded-lg flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                      Assigned Plate
                    </p>
                    <p className="font-mono text-primary tracking-widest bg-surface px-2 py-1 rounded border border-border">
                      {driver.assignedPlate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                      Weekly Trips
                    </p>
                    <p className="font-heading text-2xl text-text-primary">
                      {driver.weeklyTrips}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    className="flex-1 h-14 bg-primary-container text-primary-container-foreground font-sans font-semibold rounded-xl flex items-center justify-center gap-2 hover:brightness-95 active:scale-95 transition-all"
                  >
                    <Wallet aria-hidden="true" className="h-5 w-5" />
                    View Earnings
                  </button>
                  <button
                    type="button"
                    aria-label={`Message ${driver.name}`}
                    className="w-14 h-14 border-2 border-border text-text-secondary rounded-xl flex items-center justify-center hover:bg-surface-container transition-colors"
                  >
                    <MessageSquare aria-hidden="true" className="h-5 w-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      ) : (
        <section className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-high border-b border-border">
                  <th
                    scope="col"
                    className="p-4 font-mono text-xs text-text-secondary"
                  >
                    VEHICLE INFO
                  </th>
                  <th
                    scope="col"
                    className="p-4 font-mono text-xs text-text-secondary"
                  >
                    CATEGORY
                  </th>
                  <th
                    scope="col"
                    className="p-4 font-mono text-xs text-text-secondary"
                  >
                    ASSIGNED DRIVER
                  </th>
                  <th
                    scope="col"
                    className="p-4 font-mono text-xs text-text-secondary"
                  >
                    STATUS
                  </th>
                  <th
                    scope="col"
                    className="p-4 font-mono text-xs text-text-secondary text-right"
                  >
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {vehicles.map((vehicle) => {
                  const meta = VEHICLE_STATUS_META[vehicle.status];
                  return (
                    <tr
                      key={vehicle.id}
                      className="hover:bg-surface-container transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            aria-hidden="true"
                            className="w-10 h-10 rounded bg-primary-container/20 flex items-center justify-center"
                          >
                            <Truck className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-mono font-bold text-text-primary">
                              {vehicle.plate}
                            </p>
                            <p className="text-sm text-text-secondary">
                              {vehicle.model}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm bg-surface-container text-text-secondary px-2 py-1 rounded">
                          {vehicle.category}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-text-primary">
                        {vehicle.assignedDriverName ?? (
                          <span className="italic text-text-secondary">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-xs border px-2 py-1 rounded ${meta.className}`}
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          aria-label={`More actions for ${vehicle.plate}`}
                          className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors"
                        >
                          <MoreVertical
                            aria-hidden="true"
                            className="h-5 w-5"
                          />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <button
        type="button"
        aria-label="Add Vehicle/Driver"
        className="fixed bottom-24 right-6 md:bottom-12 md:right-12 w-16 h-16 bg-primary-container text-primary-container-foreground rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-50"
      >
        <Plus aria-hidden="true" className="h-7 w-7" />
      </button>
    </div>
  );
}
