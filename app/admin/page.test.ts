import AdminPage from './page';
import { DashboardOverview } from '@/components/admin/dashboard-overview';

jest.mock('@/components/admin/dashboard-overview', () => ({
  DashboardOverview: jest.fn(() => null),
}));

describe('AdminPage', () => {
  it('delegates rendering to the dashboard overview', () => {
    const page = AdminPage();

    expect(page.type).toBe(DashboardOverview);
    expect(page.props).toEqual({});
  });
});
