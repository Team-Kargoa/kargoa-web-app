import { render, screen } from '@testing-library/react';
import { Truck } from 'lucide-react';
import { StatCard } from './stat-card';

describe('StatCard', () => {
  it('renders the label and value', () => {
    render(<StatCard label="Active Trucks" value="8" icon={Truck} />);
    expect(screen.getByText('Active Trucks')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('renders the value in font-mono', () => {
    render(<StatCard label="Active Trucks" value="8" icon={Truck} />);
    expect(screen.getByText('8')).toHaveClass('font-mono');
  });

  it('renders an optional value suffix', () => {
    render(
      <StatCard
        label="Active Trucks"
        value="8"
        valueSuffix="/ 12"
        icon={Truck}
      />,
    );
    expect(screen.getByText('/ 12')).toBeInTheDocument();
    expect(screen.getByText('/ 12')).toHaveClass('font-mono');
  });

  it('omits the value suffix when not provided', () => {
    render(<StatCard label="Active Trucks" value="8" icon={Truck} />);
    expect(screen.queryByText('/ 12')).not.toBeInTheDocument();
  });

  it('marks the decorative icon as aria-hidden', () => {
    const { container } = render(
      <StatCard label="Active Trucks" value="8" icon={Truck} />,
    );
    expect(container.querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('renders a trend badge when provided', () => {
    render(
      <StatCard
        label="Total Fleet Earnings"
        value="1,240,000 XAF"
        icon={Truck}
        trend="+12.4% vs last week"
      />,
    );
    expect(screen.getByText('+12.4% vs last week')).toBeInTheDocument();
  });

  it('omits the trend badge when not provided', () => {
    render(<StatCard label="Active Trucks" value="8" icon={Truck} />);
    expect(screen.queryByText(/vs last week/)).not.toBeInTheDocument();
  });

  it('renders a progress bar reflecting current/max when provided', () => {
    render(
      <StatCard
        label="Active Trucks"
        value="8"
        icon={Truck}
        progress={{ current: 8, max: 12 }}
      />,
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '8',
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuemax',
      '12',
    );
  });

  it('omits the progress bar when not provided', () => {
    render(<StatCard label="Active Trucks" value="8" icon={Truck} />);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('guards the progress bar width against a zero max instead of dividing by zero', () => {
    render(
      <StatCard
        label="Active Trucks"
        value="0"
        icon={Truck}
        progress={{ current: 0, max: 0 }}
      />,
    );
    const fill = screen.getByRole('progressbar').firstChild as HTMLElement;
    expect(fill).toHaveStyle({ width: '0%' });
  });

  it('renders a footnote when provided', () => {
    render(
      <StatCard
        label="Active Trucks"
        value="8"
        icon={Truck}
        footnote="4 Vehicles currently offline for maintenance"
      />,
    );
    expect(
      screen.getByText('4 Vehicles currently offline for maintenance'),
    ).toBeInTheDocument();
  });

  it('omits the footnote when not provided', () => {
    render(<StatCard label="Active Trucks" value="8" icon={Truck} />);
    expect(
      screen.queryByText(/offline for maintenance/),
    ).not.toBeInTheDocument();
  });

  it('renders a badge pill when provided', () => {
    render(
      <StatCard
        label="Pending Verifications"
        value="03"
        tone="danger"
        badge="Requires Action"
      />,
    );
    expect(screen.getByText('Requires Action')).toBeInTheDocument();
  });

  it('omits the badge pill when not provided', () => {
    render(<StatCard label="Active Trucks" value="8" icon={Truck} />);
    expect(screen.queryByText('Requires Action')).not.toBeInTheDocument();
  });

  it('renders an avatar stack when provided', () => {
    render(
      <StatCard
        label="Pending Verifications"
        value="03"
        tone="danger"
        avatars={[
          { initials: 'JD', tone: 'primary' },
          { initials: 'SM', tone: 'secondary' },
          { initials: 'AA', tone: 'tertiary' },
        ]}
      />,
    );
    expect(screen.getByText('JD')).toBeInTheDocument();
    expect(screen.getByText('SM')).toBeInTheDocument();
    expect(screen.getByText('AA')).toBeInTheDocument();
  });

  it('omits the avatar stack when not provided', () => {
    render(<StatCard label="Active Trucks" value="8" icon={Truck} />);
    expect(screen.queryByText('JD')).not.toBeInTheDocument();
  });

  it('omits the icon wrap entirely when no icon is provided', () => {
    const { container } = render(
      <StatCard label="Pending Verifications" value="03" tone="danger" />,
    );
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('applies the danger tone to the value text', () => {
    render(<StatCard label="Pending Verifications" value="03" tone="danger" />);
    expect(screen.getByText('03')).toHaveClass('text-error');
  });

  it('applies the gradient tone card background', () => {
    const { container } = render(
      <StatCard
        label="Total Fleet Earnings"
        value="1,240,000 XAF"
        icon={Truck}
        tone="gradient"
      />,
    );
    expect(container.firstChild).toHaveClass('from-primary');
  });

  it('renders the sample data badge when isSample is true', () => {
    render(<StatCard label="Active Trucks" value="8" icon={Truck} isSample />);
    expect(screen.getByText('Sample data')).toBeInTheDocument();
  });

  it('omits the sample data badge when isSample is false or omitted', () => {
    render(<StatCard label="Active Trucks" value="8" icon={Truck} />);
    expect(screen.queryByText('Sample data')).not.toBeInTheDocument();
  });
});
