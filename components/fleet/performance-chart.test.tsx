import { render, screen, fireEvent } from '@testing-library/react';
import { PerformanceChart } from './performance-chart';
import type { FleetPerformanceDay } from '@/lib/api/fleet';

// recharts does not render in jsdom — it measures itself via ResizeObserver.
// Reduce it to pass-through containers so we only assert what our own
// component renders (day labels, peak highlight), not recharts internals.
// BarChart's `data` prop is captured into a `data-chart-data` attribute
// (JSON-stringified) so tests can assert the exact series that actually
// reaches the chart, not just the parallel label row.
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  BarChart: ({
    children,
    data,
  }: {
    children: React.ReactNode;
    data: unknown;
  }) => (
    <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Bar: () => null,
  Cell: () => null,
  XAxis: () => null,
  Tooltip: () => null,
}));

const DATA: FleetPerformanceDay[] = [
  { day: 'Mon', amount: 120000 },
  { day: 'Tue', amount: 185000 },
  { day: 'Wed', amount: 150000 },
  { day: 'Thu', amount: 240000 },
  { day: 'Fri', amount: 190000 },
  { day: 'Sat', amount: 130000 },
  { day: 'Sun', amount: 90000 },
];

describe('PerformanceChart', () => {
  it('renders the section heading and subtitle', () => {
    render(<PerformanceChart data={DATA} />);
    expect(
      screen.getByRole('heading', { name: 'Fleet Performance' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Weekly revenue trends across all active routes'),
    ).toBeInTheDocument();
  });

  it('passes the exact data series through to the underlying BarChart', () => {
    render(<PerformanceChart data={DATA} />);
    const chart = screen.getByTestId('bar-chart');
    const receivedData = JSON.parse(chart.getAttribute('data-chart-data') ?? 'null');
    expect(receivedData).toEqual(DATA);
  });

  it('renders all seven day labels Mon–Sun', () => {
    render(<PerformanceChart data={DATA} />);
    for (const { day } of DATA) {
      expect(screen.getByText(day)).toBeInTheDocument();
    }
  });

  it('highlights the peak day', () => {
    render(<PerformanceChart data={DATA} />);
    expect(screen.getByText('Thu')).toHaveClass('font-bold');
    expect(screen.getByText(/Peak/)).toBeInTheDocument();
  });

  it('does not mark non-peak days as the peak', () => {
    render(<PerformanceChart data={DATA} />);
    expect(screen.getByText('Mon')).not.toHaveClass('font-bold');
  });

  it('formats the peak amount through formatXaf, not by hand', () => {
    render(<PerformanceChart data={DATA} />);
    expect(screen.getByText('240,000 XAF (Peak)')).toBeInTheDocument();
  });

  it('renders the weekly/monthly toggle with weekly active by default', () => {
    render(<PerformanceChart data={DATA} />);
    expect(screen.getByRole('button', { name: 'Weekly' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Monthly' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('toggles the active range when Monthly is clicked', () => {
    render(<PerformanceChart data={DATA} />);
    fireEvent.click(screen.getByRole('button', { name: 'Monthly' }));
    expect(screen.getByRole('button', { name: 'Monthly' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Weekly' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});
