import Link from 'next/link';

import type { AuditLogEntry, PaginationMeta } from '@/lib/api/admin';
import { formatDate, formatPhone } from '@/lib/format';

export type AuditLogListProps = {
  logs: AuditLogEntry[];
  meta: PaginationMeta;
};

function buildHref(page: number | undefined) {
  const params = new URLSearchParams();
  if (page && page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `/admin/audit-logs?${query}` : '/admin/audit-logs';
}

function adminName(entry: AuditLogEntry): string {
  return entry.admin ? formatPhone(entry.admin) : 'System';
}

/** A short, human-scannable summary of what changed — every value in
 * `after` that differs from (or is absent from) `before`, joined. Falls
 * back to a generic label rather than dumping raw JSON: an admin scanning
 * a hundred rows needs "verification_status: pending -> approved", not a
 * blob to parse themselves. */
function summarizeChange(entry: AuditLogEntry): string {
  const keys = new Set([
    ...Object.keys(entry.before),
    ...Object.keys(entry.after),
  ]);
  const changes: string[] = [];
  for (const key of keys) {
    const from = entry.before[key];
    const to = entry.after[key];
    if (from === to) continue;
    changes.push(`${key}: ${String(from)} → ${String(to)}`);
  }
  return changes.length > 0
    ? changes.join(', ')
    : 'No field-level change recorded';
}

export function AuditLogList({ logs, meta }: AuditLogListProps) {
  const start = meta.count === 0 ? 0 : (meta.page - 1) * meta.page_size + 1;
  const end = Math.min(meta.page * meta.page_size, meta.count);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Audit Log
        </h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Every admin action on the platform, append-only — nothing here can be
          edited or deleted.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Admin
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Action
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Entity
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Change
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  When
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-sm text-muted-foreground"
                  >
                    No admin actions have been recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((entry) => (
                  <tr key={entry.id} className="hover:bg-muted/40">
                    <td className="px-6 py-4 font-mono text-sm text-foreground">
                      {adminName(entry)}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {entry.action}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                      {entry.entity_type}/{entry.entity_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {summarizeChange(entry)}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {formatDate(entry.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
            Showing {start}-{end} of {meta.count} entries
          </p>
          <div className="flex items-center gap-2">
            {meta.page > 1 ? (
              <Link
                href={buildHref(meta.page - 1)}
                aria-label="Previous page"
                className="rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Previous
              </Link>
            ) : null}
            {meta.page < meta.total_pages ? (
              <Link
                href={buildHref(meta.page + 1)}
                aria-label="Next page"
                className="rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Next
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
