import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ApproveDriverForm } from './approve-driver-form';
import { approveDriverAction } from './actions';

jest.mock('./actions', () => ({
  approveDriverAction: jest.fn(),
}));

const mockedApproveDriverAction = approveDriverAction as jest.MockedFunction<
  typeof approveDriverAction
>;

describe('ApproveDriverForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedApproveDriverAction.mockResolvedValue({ error: null });
  });

  it('renders the Approve Driver button as an h-14 rounded-xl primary control with a visible label and hidden icon', () => {
    render(<ApproveDriverForm id="drv-1" />);
    const button = screen.getByRole('button', { name: /approve driver/i });
    expect(button).toHaveClass('h-14', 'rounded-xl');
    expect(button.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
  });

  it('submits, calling the bound action with the driver id', async () => {
    render(<ApproveDriverForm id="drv-1" />);
    fireEvent.click(screen.getByRole('button', { name: /approve driver/i }));

    await waitFor(() =>
      expect(mockedApproveDriverAction).toHaveBeenCalledTimes(1),
    );
    const [id] = mockedApproveDriverAction.mock.calls[0];
    expect(id).toBe('drv-1');
  });

  it('shows the returned error message and does not throw when approval fails', async () => {
    mockedApproveDriverAction.mockResolvedValue({
      error: 'Application already approved.',
    });
    render(<ApproveDriverForm id="drv-1" />);
    fireEvent.click(screen.getByRole('button', { name: /approve driver/i }));

    expect(
      await screen.findByText('Application already approved.'),
    ).toBeInTheDocument();
  });

  it('renders no error text before any submission', () => {
    render(<ApproveDriverForm id="drv-1" />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
