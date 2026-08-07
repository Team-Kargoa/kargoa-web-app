import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation';
import AdminDriversPage from './page';
import { getAccessToken } from '@/lib/session';
import { listDriverApplications } from '@/lib/api/admin';
import type { DriverApplication } from '@/lib/api/admin';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));
jest.mock('@/lib/session');
jest.mock('@/lib/api/admin');

const mockedRedirect = redirect as jest.MockedFunction<typeof redirect>;
const mockedGetAccessToken = getAccessToken as jest.MockedFunction<
  typeof getAccessToken
>;
const mockedListDriverApplications =
  listDriverApplications as jest.MockedFunction<
    typeof listDriverApplications
  >;

const APPLICATIONS: DriverApplication[] = [
  {
    id: 'app-1',
    phone_number: '+237691234567',
    full_name: 'Jean-Paul Ndi',
    verification_status: 'pending',
    rejection_reason: '',
    submitted_at: '2026-08-01T10:00:00Z',
    license_document: 'https://cdn.kargoa.cm/license-1.jpg',
    national_id_document: 'https://cdn.kargoa.cm/id-1.jpg',
    live_selfie: 'https://cdn.kargoa.cm/selfie-1.jpg',
    plate_number: 'LT 123 AB',
    vehicle_category: 'Pickup',
    registration_doc: 'https://cdn.kargoa.cm/reg-1.jpg',
    vehicle_status: 'pending',
  },
  {
    id: 'app-2',
    phone_number: '+237670000000',
    full_name: '',
    verification_status: 'approved',
    rejection_reason: '',
    submitted_at: '2026-07-15T08:30:00Z',
    license_document: 'https://cdn.kargoa.cm/license-2.jpg',
    national_id_document: 'https://cdn.kargoa.cm/id-2.jpg',
    live_selfie: 'https://cdn.kargoa.cm/selfie-2.jpg',
    plate_number: 'CE 551 ZZ',
    vehicle_category: 'Van',
    registration_doc: 'https://cdn.kargoa.cm/reg-2.jpg',
    vehicle_status: 'approved',
  },
];
const META = { count: 2, page: 1, page_size: 20, total_pages: 1 };

function searchParams(params: Record<string, string> = {}) {
  return Promise.resolve(params);
}

describe('AdminDriversPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetAccessToken.mockResolvedValue('jwt-abc');
    mockedListDriverApplications.mockResolvedValue({
      applications: APPLICATIONS,
      meta: META,
    });
  });

  it('redirects to /signin when there is no access token, without calling the API', async () => {
    mockedGetAccessToken.mockResolvedValue(undefined);

    await expect(
      AdminDriversPage({ searchParams: searchParams() }),
    ).rejects.toThrow('NEXT_REDIRECT');

    expect(mockedRedirect).toHaveBeenCalledWith('/signin');
    expect(mockedListDriverApplications).not.toHaveBeenCalled();
  });

  it('fetches applications with the session token and no filters by default', async () => {
    render(await AdminDriversPage({ searchParams: searchParams() }));
    expect(mockedListDriverApplications).toHaveBeenCalledWith('jwt-abc', {
      status: undefined,
      page: undefined,
    });
  });

  it('passes the status query param through to listDriverApplications', async () => {
    render(
      await AdminDriversPage({ searchParams: searchParams({ status: 'pending' }) }),
    );
    expect(mockedListDriverApplications).toHaveBeenCalledWith('jwt-abc', {
      status: 'pending',
      page: undefined,
    });
  });

  it('passes the page query param through to listDriverApplications, parsed as a number', async () => {
    render(await AdminDriversPage({ searchParams: searchParams({ page: '2' }) }));
    expect(mockedListDriverApplications).toHaveBeenCalledWith('jwt-abc', {
      status: undefined,
      page: 2,
    });
  });

  it('renders the queue heading', async () => {
    render(await AdminDriversPage({ searchParams: searchParams() }));
    expect(
      screen.getByRole('heading', { name: 'Driver Verification Queue' }),
    ).toBeInTheDocument();
  });

  it('renders a row per application with name, font-mono phone and plate, vehicle category and status', async () => {
    render(await AdminDriversPage({ searchParams: searchParams() }));

    expect(screen.getByText('Jean-Paul Ndi')).toBeInTheDocument();
    const phone = screen.getByText('+237 6 91 23 45 67');
    expect(phone).toHaveClass('font-mono');
    const plate = screen.getByText('LT 123 AB');
    expect(plate).toHaveClass('font-mono');
    expect(screen.getByText('Pickup')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('falls back to the formatted phone number as the name when full_name is empty', async () => {
    render(await AdminDriversPage({ searchParams: searchParams() }));
    // app-2 has no full_name — its name cell must show the formatted phone.
    const nameCells = screen.getAllByText('+237 6 70 00 00 00');
    expect(nameCells.length).toBeGreaterThan(0);
  });

  it('links each row to its detail screen at /admin/drivers/{id}', async () => {
    render(await AdminDriversPage({ searchParams: searchParams() }));
    expect(screen.getByRole('link', { name: /view jean-paul ndi/i })).toHaveAttribute(
      'href',
      '/admin/drivers/app-1',
    );
    expect(
      screen.getByRole('link', { name: /view \+237 6 70 00 00 00/i }),
    ).toHaveAttribute('href', '/admin/drivers/app-2');
  });

  it('shows the applicant count from meta.count in the SHOWING line', async () => {
    render(await AdminDriversPage({ searchParams: searchParams() }));
    expect(screen.getByText(/SHOWING 1-2 OF 2 APPLICATIONS/i)).toBeInTheDocument();
  });

  it('renders the status filters as links, marking the active one with aria-current', async () => {
    render(
      await AdminDriversPage({ searchParams: searchParams({ status: 'pending' }) }),
    );
    const all = screen.getByRole('link', { name: 'All' });
    const pending = screen.getByRole('link', { name: 'Pending' });
    const approved = screen.getByRole('link', { name: 'Approved' });

    expect(all).toHaveAttribute('href', '/admin/drivers');
    expect(pending).toHaveAttribute('href', '/admin/drivers?status=pending');
    expect(approved).toHaveAttribute('href', '/admin/drivers?status=approved');

    expect(pending).toHaveAttribute('aria-current', 'page');
    expect(all).not.toHaveAttribute('aria-current');
    expect(approved).not.toHaveAttribute('aria-current');
  });

  it('renders an empty-state row when no applications match the filter', async () => {
    mockedListDriverApplications.mockResolvedValue({
      applications: [],
      meta: { count: 0, page: 1, page_size: 20, total_pages: 0 },
    });
    render(await AdminDriversPage({ searchParams: searchParams({ status: 'approved' }) }));
    expect(
      screen.getByText(/no driver applications match this filter/i),
    ).toBeInTheDocument();
  });

  it('disables the previous page control on page 1 and enables next when more pages remain', async () => {
    mockedListDriverApplications.mockResolvedValue({
      applications: APPLICATIONS,
      meta: { count: 40, page: 1, page_size: 20, total_pages: 2 },
    });
    render(await AdminDriversPage({ searchParams: searchParams() }));

    expect(screen.queryByRole('link', { name: /previous page/i })).not.toBeInTheDocument();
    const next = screen.getByRole('link', { name: /next page/i });
    expect(next).toHaveAttribute('href', '/admin/drivers?page=2');
  });

  it('disables the next page control on the last page and enables previous', async () => {
    mockedListDriverApplications.mockResolvedValue({
      applications: APPLICATIONS,
      meta: { count: 40, page: 2, page_size: 20, total_pages: 2 },
    });
    render(await AdminDriversPage({ searchParams: searchParams({ page: '2' }) }));

    expect(screen.queryByRole('link', { name: /next page/i })).not.toBeInTheDocument();
    const prev = screen.getByRole('link', { name: /previous page/i });
    expect(prev).toHaveAttribute('href', '/admin/drivers');
  });

  it('preserves the active status filter when building the next-page link', async () => {
    mockedListDriverApplications.mockResolvedValue({
      applications: APPLICATIONS,
      meta: { count: 40, page: 1, page_size: 20, total_pages: 2 },
    });
    render(
      await AdminDriversPage({ searchParams: searchParams({ status: 'pending' }) }),
    );
    expect(screen.getByRole('link', { name: /next page/i })).toHaveAttribute(
      'href',
      '/admin/drivers?status=pending&page=2',
    );
  });
});
