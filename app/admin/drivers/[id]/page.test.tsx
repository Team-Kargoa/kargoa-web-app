import { render, screen } from '@testing-library/react';
import { notFound, redirect } from 'next/navigation';
import AdminDriverDetailPage from './page';
import { getAccessToken } from '@/lib/session';
import { getDriverApplication } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import type { DriverApplication } from '@/lib/api/admin';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));
jest.mock('@/lib/session');
jest.mock('@/lib/api/admin');
// Approve/Reject render real client components with their own coverage in
// approve-driver-form.test.tsx / reject-driver-form.test.tsx; stubbing them
// here keeps this page test focused on data wiring and 404/redirect
// handling instead of duplicating that coverage.
jest.mock('./approve-driver-form', () => ({
  ApproveDriverForm: ({ id }: { id: string }) => (
    <div data-testid="approve-form">{id}</div>
  ),
}));
jest.mock('./reject-driver-form', () => ({
  RejectDriverForm: ({ id }: { id: string }) => (
    <div data-testid="reject-form">{id}</div>
  ),
}));

const mockedRedirect = redirect as jest.MockedFunction<typeof redirect>;
const mockedNotFound = notFound as jest.MockedFunction<typeof notFound>;
const mockedGetAccessToken = getAccessToken as jest.MockedFunction<
  typeof getAccessToken
>;
const mockedGetDriverApplication = getDriverApplication as jest.MockedFunction<
  typeof getDriverApplication
>;

const APPLICATION: DriverApplication = {
  id: 'cebfe6e2-e769-4d87-a7fb-41972db8f78c',
  phone_number: '+237600000000',
  full_name: '',
  verification_status: 'pending',
  rejection_reason: '',
  submitted_at: '2026-08-01T10:00:00Z',
  license_document: 'https://cdn.kargoa.cm/license.jpg',
  national_id_document: 'https://cdn.kargoa.cm/national-id.jpg',
  live_selfie: 'https://cdn.kargoa.cm/selfie.jpg',
  plate_number: 'LT 123 AB',
  vehicle_category: 'Pickup',
  registration_doc: 'https://cdn.kargoa.cm/registration.jpg',
  vehicle_status: 'pending',
};

function paramsWith(id: string) {
  return Promise.resolve({ id });
}

describe('AdminDriverDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetAccessToken.mockResolvedValue('jwt-abc');
    mockedGetDriverApplication.mockResolvedValue(APPLICATION);
  });

  it('redirects to /signin without calling the API when there is no session token', async () => {
    mockedGetAccessToken.mockResolvedValue(undefined);

    await expect(
      AdminDriverDetailPage({ params: paramsWith(APPLICATION.id) }),
    ).rejects.toThrow('NEXT_REDIRECT');

    expect(mockedRedirect).toHaveBeenCalledWith('/signin');
    expect(mockedGetDriverApplication).not.toHaveBeenCalled();
  });

  it('fetches the application with the session token and the route id', async () => {
    render(await AdminDriverDetailPage({ params: paramsWith(APPLICATION.id) }));
    expect(mockedGetDriverApplication).toHaveBeenCalledWith(
      'jwt-abc',
      APPLICATION.id,
    );
  });

  it('calls notFound for a 404 from getDriverApplication', async () => {
    mockedGetDriverApplication.mockRejectedValue(
      new ApiError('Not found.', 404),
    );

    await expect(
      AdminDriverDetailPage({ params: paramsWith('does-not-exist') }),
    ).rejects.toThrow('NEXT_NOT_FOUND');

    expect(mockedNotFound).toHaveBeenCalledTimes(1);
  });

  it('re-throws a non-404 error instead of masking it as not-found', async () => {
    mockedGetDriverApplication.mockRejectedValue(
      new ApiError('Server error.', 500),
    );

    await expect(
      AdminDriverDetailPage({ params: paramsWith(APPLICATION.id) }),
    ).rejects.toMatchObject({ status: 500 });

    expect(mockedNotFound).not.toHaveBeenCalled();
  });

  it('renders the applicant name (falling back to formatted phone), phone and plate in font-mono, and vehicle category', async () => {
    render(await AdminDriverDetailPage({ params: paramsWith(APPLICATION.id) }));

    // full_name is "" on the fixture, so the name falls back to the
    // formatted phone — appears twice (name + phone fields).
    const phoneMatches = screen.getAllByText('+237 6 00 00 00 00');
    expect(phoneMatches.length).toBeGreaterThanOrEqual(2);
    phoneMatches.forEach((el) => expect(el).toHaveClass('font-mono'));

    const plate = screen.getByText('LT 123 AB');
    expect(plate).toHaveClass('font-mono');
    expect(screen.getByText('Pickup')).toBeInTheDocument();
  });

  it('renders all four documents as links to their real URLs', async () => {
    render(await AdminDriverDetailPage({ params: paramsWith(APPLICATION.id) }));

    expect(screen.getByRole('link', { name: /license document/i })).toHaveAttribute(
      'href',
      APPLICATION.license_document,
    );
    expect(
      screen.getByRole('link', { name: /national id document/i }),
    ).toHaveAttribute('href', APPLICATION.national_id_document);
    expect(screen.getByRole('link', { name: /live selfie/i })).toHaveAttribute(
      'href',
      APPLICATION.live_selfie,
    );
    expect(
      screen.getByRole('link', { name: /registration document/i }),
    ).toHaveAttribute('href', APPLICATION.registration_doc);
  });

  it('renders a link back to the driver queue that resolves to a real route', async () => {
    render(await AdminDriverDetailPage({ params: paramsWith(APPLICATION.id) }));
    expect(screen.getByRole('link', { name: /back to queue/i })).toHaveAttribute(
      'href',
      '/admin/drivers',
    );
  });

  it('renders the approve and reject controls, wired to this application id', async () => {
    render(await AdminDriverDetailPage({ params: paramsWith(APPLICATION.id) }));
    expect(screen.getByTestId('approve-form')).toHaveTextContent(
      APPLICATION.id,
    );
    expect(screen.getByTestId('reject-form')).toHaveTextContent(
      APPLICATION.id,
    );
  });

  it('shows the rejection reason when the application was previously rejected', async () => {
    mockedGetDriverApplication.mockResolvedValue({
      ...APPLICATION,
      verification_status: 'rejected',
      rejection_reason: 'Blurry documents',
    });
    render(await AdminDriverDetailPage({ params: paramsWith(APPLICATION.id) }));
    expect(screen.getByText('Blurry documents')).toBeInTheDocument();
  });

  it('does not render a rejection reason section when there is none', async () => {
    render(await AdminDriverDetailPage({ params: paramsWith(APPLICATION.id) }));
    expect(screen.queryByText(/rejection reason/i)).not.toBeInTheDocument();
  });
});
