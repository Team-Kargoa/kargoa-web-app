import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import OnboardingBusinessPage from './page';

jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));

const mockBack = jest.fn();
const mockPush = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ back: mockBack, push: mockPush });
});

describe('OnboardingBusinessPage', () => {
  it('renders the KmerCargo header and a go-back control', () => {
    render(<OnboardingBusinessPage />);
    expect(screen.getByText('KmerCargo')).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: /go back/i }).length,
    ).toBeGreaterThan(0);
  });

  it('navigates back when the header back control is clicked', () => {
    render(<OnboardingBusinessPage />);
    fireEvent.click(screen.getAllByRole('button', { name: /go back/i })[0]);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('renders the step indicator and starting progress', () => {
    render(<OnboardingBusinessPage />);
    expect(screen.getByText('STEP 02 OF 03')).toBeInTheDocument();
    expect(screen.getByText('66% COMPLETE')).toBeInTheDocument();
  });

  it('renders the Company & Verification heading and subtitle', () => {
    render(<OnboardingBusinessPage />);
    expect(
      screen.getByRole('heading', { name: 'Company & Verification' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Provide your legal business details to start managing your fleet on KmerCargo.',
      ),
    ).toBeInTheDocument();
  });

  it('renders the Business Identity card fields', () => {
    render(<OnboardingBusinessPage />);
    expect(
      screen.getByRole('heading', { name: 'Business Identity' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Company Name')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('e.g. Douala Express Logistics'),
    ).toBeInTheDocument();

    const taxId = screen.getByLabelText('Tax ID (NIU)');
    expect(taxId).toBeInTheDocument();
    expect(taxId).toHaveClass('font-mono');
    expect(
      screen.getByText("Your 14-character Numéro d'Identifiant Unique."),
    ).toBeInTheDocument();

    const fleetSize = screen.getByLabelText('Number of Vehicles');
    expect(fleetSize).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: '1 - 5 Vehicles' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: '6 - 20 Vehicles' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: '21 - 50 Vehicles' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'More than 50' }),
    ).toBeInTheDocument();
  });

  it('increases the completion percentage as fields are filled in', () => {
    render(<OnboardingBusinessPage />);
    fireEvent.change(screen.getByLabelText('Company Name'), {
      target: { value: 'Douala Express Logistics' },
    });
    // 6 tracked fields; 1 filled -> 66 + round((1/6) * 33) = 72.
    expect(screen.getByText('72% COMPLETE')).toBeInTheDocument();
    expect(screen.queryByText('66% COMPLETE')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Tax ID (NIU)'), {
      target: { value: 'M000000000000X' },
    });
    fireEvent.change(screen.getByLabelText('Number of Vehicles'), {
      target: { value: '1-5' },
    });
    // 3 filled -> 66 + round((3/6) * 33) = 66 + 17 = 83.
    expect(screen.getByText('83% COMPLETE')).toBeInTheDocument();
  });

  it('renders the Business Registration upload card and reflects a selected file', () => {
    render(<OnboardingBusinessPage />);
    expect(
      screen.getByRole('heading', { name: 'Business Registration' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Upload a clear PDF or JPG of your Commerce Register (RCCM).',
      ),
    ).toBeInTheDocument();

    const input = screen.getByLabelText('Select Business Registration file');
    const file = new File(['x'], 'rccm.pdf', { type: 'application/pdf' });
    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText('rccm.pdf')).toBeInTheDocument();
  });

  it('renders the Owner Identity Card upload card and reflects a selected file', () => {
    render(<OnboardingBusinessPage />);
    expect(
      screen.getByRole('heading', { name: 'Owner Identity Card' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'A high-quality scan of your CNI or Passport (both sides).',
      ),
    ).toBeInTheDocument();

    const input = screen.getByLabelText('Select Owner Identity Card file');
    const file = new File(['x'], 'owner-id.jpg', { type: 'image/jpeg' });
    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText('owner-id.jpg')).toBeInTheDocument();
  });

  it('renders the terms checkbox with a link to the Terms of Service', () => {
    render(<OnboardingBusinessPage />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();

    // /terms doesn't exist yet, so it must not be a real link (dead-href
    // regression guard — see task-3.3 fix-round-1).
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Terms of Service' }),
    ).not.toBeInTheDocument();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('renders the Back and Submit for Verification footer actions', () => {
    render(<OnboardingBusinessPage />);
    expect(
      screen.getByRole('button', { name: 'Submit for Verification' }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: 'Back' }).length,
    ).toBeGreaterThan(0);
  });

  it('navigates back when the footer Back button is clicked', () => {
    render(<OnboardingBusinessPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('advances to the vehicle setup step on submit', () => {
    render(<OnboardingBusinessPage />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Submit for Verification' }),
    );
    expect(mockPush).toHaveBeenCalledWith('/onboarding/vehicle');
  });

  it('renders the contextual footer nav with Registration, Support and Help, none of them real links', () => {
    render(<OnboardingBusinessPage />);
    expect(screen.getByText('Registration')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
    expect(screen.getByText('Help')).toBeInTheDocument();
    expect(
      screen.queryAllByRole('link', { name: /support|help/i }),
    ).toHaveLength(0);
  });
});
