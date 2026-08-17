import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation';
import AdminAuditLogsPage from './page';
import { getAccessToken } from '@/lib/session';
import { listAuditLogs } from '@/lib/api/admin';
import type { AuditLogEntry } from '@/lib/api/admin';

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
const mockedListAuditLogs = listAuditLogs as jest.MockedFunction<
  typeof listAuditLogs
>;

const LOGS: AuditLogEntry[] = [
  {
    id: 'log-1',
    admin: '+237670000300',
    action: 'driver.approve',
    entity_type: 'DriverProfile',
    entity_id: 'driver-1',
    before: { verification_status: 'pending' },
    after: { verification_status: 'approved' },
    ip_address: '127.0.0.1',
    created_at: '2026-08-01T10:00:00Z',
  },
];
const META = { count: 1, page: 1, page_size: 20, total_pages: 1 };

function searchParams(params: Record<string, string> = {}) {
  return Promise.resolve(params);
}

describe('AdminAuditLogsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetAccessToken.mockResolvedValue('jwt-abc');
    mockedListAuditLogs.mockResolvedValue({ logs: LOGS, meta: META });
  });

  it('redirects to /signin when there is no access token, without calling the API', async () => {
    mockedGetAccessToken.mockResolvedValue(undefined);

    await expect(
      AdminAuditLogsPage({ searchParams: searchParams() }),
    ).rejects.toThrow('NEXT_REDIRECT');

    expect(mockedRedirect).toHaveBeenCalledWith('/signin');
    expect(mockedListAuditLogs).not.toHaveBeenCalled();
  });

  it('fetches logs with the session token and no filter by default', async () => {
    render(await AdminAuditLogsPage({ searchParams: searchParams() }));
    expect(mockedListAuditLogs).toHaveBeenCalledWith('jwt-abc', {
      page: undefined,
      adminId: undefined,
      action: undefined,
      entityType: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    });
  });

  it('passes the page query param through, parsed as a number', async () => {
    render(
      await AdminAuditLogsPage({ searchParams: searchParams({ page: '2' }) }),
    );
    expect(mockedListAuditLogs).toHaveBeenCalledWith('jwt-abc', {
      page: 2,
      adminId: undefined,
      action: undefined,
      entityType: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    });
  });

  it('passes the adminId filter through', async () => {
    render(
      await AdminAuditLogsPage({
        searchParams: searchParams({ adminId: 'admin-1' }),
      }),
    );
    expect(mockedListAuditLogs).toHaveBeenCalledWith('jwt-abc', {
      page: undefined,
      adminId: 'admin-1',
      action: undefined,
      entityType: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    });
  });

  it('passes the action filter through', async () => {
    render(
      await AdminAuditLogsPage({
        searchParams: searchParams({ action: 'driver.approve' }),
      }),
    );
    expect(mockedListAuditLogs).toHaveBeenCalledWith('jwt-abc', {
      page: undefined,
      adminId: undefined,
      action: 'driver.approve',
      entityType: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    });
  });

  it('passes the entityType filter through', async () => {
    render(
      await AdminAuditLogsPage({
        searchParams: searchParams({ entityType: 'DriverProfile' }),
      }),
    );
    expect(mockedListAuditLogs).toHaveBeenCalledWith('jwt-abc', {
      page: undefined,
      adminId: undefined,
      action: undefined,
      entityType: 'DriverProfile',
      dateFrom: undefined,
      dateTo: undefined,
    });
  });

  it('passes date range filters through', async () => {
    render(
      await AdminAuditLogsPage({
        searchParams: searchParams({
          dateFrom: '2026-08-01',
          dateTo: '2026-08-31',
        }),
      }),
    );
    expect(mockedListAuditLogs).toHaveBeenCalledWith('jwt-abc', {
      page: undefined,
      adminId: undefined,
      action: undefined,
      entityType: undefined,
      dateFrom: '2026-08-01',
      dateTo: '2026-08-31',
    });
  });

  it('passes all filters through when provided', async () => {
    render(
      await AdminAuditLogsPage({
        searchParams: searchParams({
          page: '1',
          adminId: 'admin-1',
          action: 'config.update',
          entityType: 'PlatformConfig',
          dateFrom: '2026-08-01',
          dateTo: '2026-08-17',
        }),
      }),
    );
    expect(mockedListAuditLogs).toHaveBeenCalledWith('jwt-abc', {
      page: 1,
      adminId: 'admin-1',
      action: 'config.update',
      entityType: 'PlatformConfig',
      dateFrom: '2026-08-01',
      dateTo: '2026-08-17',
    });
  });

  it('renders the heading and a row per log entry', async () => {
    render(await AdminAuditLogsPage({ searchParams: searchParams() }));

    expect(
      screen.getByRole('heading', { name: 'Audit Log' }),
    ).toBeInTheDocument();
    expect(screen.getByText('driver.approve')).toBeInTheDocument();
    expect(screen.getByText('DriverProfile/driver-1')).toBeInTheDocument();
    expect(
      screen.getByText('verification_status: pending → approved'),
    ).toBeInTheDocument();
  });

  it('shows "System" for a null admin (an automated action)', async () => {
    mockedListAuditLogs.mockResolvedValue({
      logs: [{ ...LOGS[0], admin: null }],
      meta: META,
    });

    render(await AdminAuditLogsPage({ searchParams: searchParams() }));

    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('renders an empty-state row when there are no log entries', async () => {
    mockedListAuditLogs.mockResolvedValue({
      logs: [],
      meta: { count: 0, page: 1, page_size: 20, total_pages: 0 },
    });

    render(await AdminAuditLogsPage({ searchParams: searchParams() }));

    expect(
      screen.getByText(/no admin actions have been recorded yet/i),
    ).toBeInTheDocument();
  });

  it('shows the entry count from meta.count in the SHOWING line', async () => {
    render(await AdminAuditLogsPage({ searchParams: searchParams() }));
    expect(screen.getByText(/Showing 1-1 of 1 entries/i)).toBeInTheDocument();
  });

  it('paginates using meta.total_pages', async () => {
    mockedListAuditLogs.mockResolvedValue({
      logs: LOGS,
      meta: { count: 40, page: 1, page_size: 20, total_pages: 2 },
    });

    render(await AdminAuditLogsPage({ searchParams: searchParams() }));

    expect(
      screen.queryByRole('link', { name: /previous page/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /next page/i })).toHaveAttribute(
      'href',
      '/admin/audit-logs?page=2',
    );
  });
});
