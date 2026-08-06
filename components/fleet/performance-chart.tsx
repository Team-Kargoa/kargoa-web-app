'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  Cell,
  ResponsiveContainer,
  XAxis,
  Tooltip,
} from 'recharts';
import { formatXaf } from '@/lib/format';
import type { FleetPerformanceDay } from '@/lib/api/fleet';

export type PerformanceChartProps = {
  data: FleetPerformanceDay[];
};

type Range = 'weekly' | 'monthly';

const RANGES: { key: Range; label: string }[] = [
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
];

export function PerformanceChart({ data }: PerformanceChartProps) {
  const [range, setRange] = useState<Range>('weekly');
  const peakAmount = Math.max(...data.map((entry) => entry.amount));

  return (
    <div className="bg-surface border border-border rounded-xl p-6 md:p-8 mb-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h3 className="font-heading text-2xl text-text-primary">
            Fleet Performance
          </h3>
          <p className="text-text-secondary text-sm">
            Weekly revenue trends across all active routes
          </p>
        </div>
        <div
          role="group"
          aria-label="Chart range"
          className="flex bg-surface-container p-1 rounded-lg border border-border w-fit"
        >
          {RANGES.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              aria-pressed={range === key}
              onClick={() => setRange(key)}
              className={
                range === key
                  ? 'px-4 py-1.5 rounded-md text-xs font-bold bg-surface shadow-sm text-primary'
                  : 'px-4 py-1.5 rounded-md text-xs font-bold text-text-secondary'
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="24%">
            <XAxis
              dataKey="day"
              tick={false}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip formatter={(value) => formatXaf(Number(value))} />
            <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
              {data.map((entry) => (
                <Cell
                  key={entry.day}
                  fill={
                    entry.amount === peakAmount
                      ? 'var(--color-primary)'
                      : 'var(--color-surface-container)'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1 px-2 md:px-4">
        {data.map((entry) => {
          const isPeak = entry.amount === peakAmount;
          return (
            <div key={entry.day} className="flex flex-col items-center gap-1">
              {isPeak && (
                <span className="font-mono text-[10px] font-bold text-primary text-center">
                  {formatXaf(entry.amount)} (Peak)
                </span>
              )}
              <span
                className={
                  isPeak
                    ? 'font-mono text-xs font-bold text-text-primary'
                    : 'font-mono text-xs text-text-secondary'
                }
              >
                {entry.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
