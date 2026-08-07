import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RejectDriverForm } from './reject-driver-form';
import { rejectDriverAction } from './actions';

jest.mock('./actions', () => ({
  rejectDriverAction: jest.fn(),
}));

const mockedRejectDriverAction = rejectDriverAction as jest.MockedFunction<
  typeof rejectDriverAction
>;

describe('RejectDriverForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedRejectDriverAction.mockResolvedValue({ error: null });
  });

  it('renders only the Reject Application trigger initially — no reason field visible, no action called', () => {
    render(<RejectDriverForm id="drv-1" />);
    expect(
      screen.getByRole('button', { name: /reject application/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/reason for rejection/i),
    ).not.toBeInTheDocument();
    expect(mockedRejectDriverAction).not.toHaveBeenCalled();
  });

  it('reveals the reason textarea and a disabled confirm button after clicking Reject Application — a single click cannot submit', () => {
    render(<RejectDriverForm id="drv-1" />);
    fireEvent.click(screen.getByRole('button', { name: /reject application/i }));

    expect(screen.getByLabelText(/reason for rejection/i)).toBeInTheDocument();
    const confirm = screen.getByRole('button', { name: /confirm rejection/i });
    expect(confirm).toBeDisabled();
  });

  it('keeps the confirm button disabled for a whitespace-only reason', () => {
    render(<RejectDriverForm id="drv-1" />);
    fireEvent.click(screen.getByRole('button', { name: /reject application/i }));
    fireEvent.change(screen.getByLabelText(/reason for rejection/i), {
      target: { value: '   ' },
    });

    expect(
      screen.getByRole('button', { name: /confirm rejection/i }),
    ).toBeDisabled();
  });

  it('enables the confirm button once a non-blank reason is entered, and submits it', async () => {
    render(<RejectDriverForm id="drv-1" />);
    fireEvent.click(screen.getByRole('button', { name: /reject application/i }));
    fireEvent.change(screen.getByLabelText(/reason for rejection/i), {
      target: { value: 'Blurry documents' },
    });

    const confirm = screen.getByRole('button', { name: /confirm rejection/i });
    expect(confirm).toBeEnabled();
    fireEvent.click(confirm);

    await waitFor(() =>
      expect(mockedRejectDriverAction).toHaveBeenCalledTimes(1),
    );
    const [id, , formData] = mockedRejectDriverAction.mock.calls[0];
    expect(id).toBe('drv-1');
    expect((formData as FormData).get('reason')).toBe('Blurry documents');
  });

  it('the reason textarea is required and capped at 500 characters, matching the server limit', () => {
    render(<RejectDriverForm id="drv-1" />);
    fireEvent.click(screen.getByRole('button', { name: /reject application/i }));
    const textarea = screen.getByLabelText(/reason for rejection/i);
    expect(textarea).toBeRequired();
    expect(textarea).toHaveAttribute('maxLength', '500');
  });

  it('returns to the collapsed trigger when Cancel is clicked, discarding the entered reason', () => {
    render(<RejectDriverForm id="drv-1" />);
    fireEvent.click(screen.getByRole('button', { name: /reject application/i }));
    fireEvent.change(screen.getByLabelText(/reason for rejection/i), {
      target: { value: 'Blurry documents' },
    });
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(
      screen.getByRole('button', { name: /reject application/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/reason for rejection/i),
    ).not.toBeInTheDocument();
  });

  it('surfaces the server 422 validation error returned by the action', async () => {
    mockedRejectDriverAction.mockResolvedValue({ error: 'Validation failed.' });
    render(<RejectDriverForm id="drv-1" />);
    fireEvent.click(screen.getByRole('button', { name: /reject application/i }));
    fireEvent.change(screen.getByLabelText(/reason for rejection/i), {
      target: { value: 'Blurry documents' },
    });
    fireEvent.click(screen.getByRole('button', { name: /confirm rejection/i }));

    expect(await screen.findByText('Validation failed.')).toBeInTheDocument();
  });
});
