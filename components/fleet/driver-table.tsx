import { MoreVertical } from 'lucide-react';
import type { FleetDriver, FleetDriverStatus } from '@/lib/api/fleet';

export type DriverTableProps = {
  drivers: FleetDriver[];
};

const STATUS_META: Record<
  FleetDriverStatus,
  { label: string; dotClass: string; textClass: string }
> = {
  'on-trip': {
    label: 'On-Trip',
    dotClass: 'bg-primary-container',
    textClass: 'text-primary',
  },
  online: {
    label: 'Online',
    dotClass: 'bg-success-momo',
    textClass: 'text-success-momo',
  },
  offline: {
    label: 'Offline',
    dotClass: 'bg-outline',
    textClass: 'text-text-secondary',
  },
};

const TABLE_HEAD_CLASS =
  'px-6 py-4 font-mono text-text-secondary uppercase text-xs font-bold';

/** Two-letter avatar fallback (first + last name initial), consistent with
 * the pending-verifications avatar stack (e.g. "JD", "SM", "AA"). */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
  return `${first}${last}`.toUpperCase();
}

export function DriverTable({ drivers }: DriverTableProps) {
  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <h3 className="font-heading text-2xl text-text-primary">
          Active Drivers
        </h3>
        <button
          type="button"
          className="text-primary font-bold text-sm hover:underline"
        >
          View All Drivers
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container">
            <tr>
              <th scope="col" className={TABLE_HEAD_CLASS}>
                Driver Info
              </th>
              <th scope="col" className={TABLE_HEAD_CLASS}>
                Vehicle ID
              </th>
              <th scope="col" className={TABLE_HEAD_CLASS}>
                Current Route
              </th>
              <th scope="col" className={TABLE_HEAD_CLASS}>
                Status
              </th>
              <th scope="col" className={`${TABLE_HEAD_CLASS} text-right`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {drivers.map((driver) => {
              const meta = STATUS_META[driver.status];
              return (
                <tr
                  key={driver.id}
                  className="hover:bg-surface-container transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        aria-hidden="true"
                        className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center font-bold text-text-secondary shrink-0"
                      >
                        {getInitials(driver.name)}
                      </div>
                      <div>
                        <p className="font-bold text-text-primary">
                          {driver.name}
                        </p>
                        <p className="text-xs text-text-secondary font-mono">
                          {driver.verificationStatus} • {driver.location}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-text-secondary text-sm">
                    {driver.vehicleId}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-primary">
                    {driver.route}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className={`w-2.5 h-2.5 rounded-full ${meta.dotClass}`}
                      />
                      <span className={`text-xs font-bold ${meta.textClass}`}>
                        {meta.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      aria-label={`More actions for ${driver.name}`}
                      className="text-text-secondary hover:text-primary transition-colors"
                    >
                      <MoreVertical aria-hidden="true" className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
