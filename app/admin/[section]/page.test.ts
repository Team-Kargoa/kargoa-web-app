import AdminModulePage, { generateStaticParams } from './page';
import { ModuleShell } from '@/components/admin/module-shell';
import { notFound } from 'next/navigation';

jest.mock('@/components/admin/module-shell', () => ({
  ModuleShell: jest.fn(() => null),
}));

jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

const mockNotFound = notFound as jest.MockedFunction<typeof notFound>;

describe('AdminModulePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('generates a static route for every supported admin section', () => {
    expect(generateStaticParams()).toEqual([
      { section: 'operations' },
      { section: 'drivers' },
      { section: 'vehicles' },
      { section: 'customers' },
      { section: 'trips' },
      { section: 'payments' },
      { section: 'wallets' },
      { section: 'disputes' },
      { section: 'reviews' },
      { section: 'analytics' },
      { section: 'settings' },
      { section: 'audit' },
      { section: 'administrators' },
    ]);
  });

  it('renders the module shell for a supported section', async () => {
    const page = await AdminModulePage({
      params: Promise.resolve({ section: 'drivers' }),
    });

    expect(mockNotFound).not.toHaveBeenCalled();
    expect(page.type).toBe(ModuleShell);
    expect(page.props).toEqual({ section: 'drivers' });
  });

  it('uses Next.js notFound for an unsupported section', async () => {
    await expect(
      AdminModulePage({ params: Promise.resolve({ section: 'unknown' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');

    expect(mockNotFound).toHaveBeenCalledTimes(1);
  });
});
