import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PlatformConfigForm } from './platform-config-form';
import { updatePlatformConfigAction } from './actions';
import type { PlatformConfig } from '@/lib/api/admin';

jest.mock('./actions', () => ({
  updatePlatformConfigAction: jest.fn(),
}));

const mockedAction = updatePlatformConfigAction as jest.MockedFunction<
  typeof updatePlatformConfigAction
>;

const CONFIG: PlatformConfig = {
  key: 'max_active_trips',
  value: '5',
  value_type: 'integer',
  description: 'Max concurrent active trips per driver',
  updated_at: '2026-08-01T10:00:00Z',
  updated_by: null,
};

describe('PlatformConfigForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAction.mockResolvedValue({ error: null });
  });

  it('renders the config key, description and value_type', () => {
    render(<PlatformConfigForm config={CONFIG} />);
    expect(screen.getByText('max_active_trips')).toBeInTheDocument();
    expect(
      screen.getByText('Max concurrent active trips per driver'),
    ).toBeInTheDocument();
    expect(screen.getByText('integer')).toBeInTheDocument();
  });

  it('renders the current value in an editable input', () => {
    render(<PlatformConfigForm config={CONFIG} />);
    expect(screen.getByDisplayValue('5')).toBeInTheDocument();
  });

  it('shows the last-updated date without an updater when updated_by is null', () => {
    render(<PlatformConfigForm config={CONFIG} />);
    expect(screen.getByText(/last updated aug 1, 2026/i)).toBeInTheDocument();
    expect(screen.queryByText(/ by /i)).not.toBeInTheDocument();
  });

  it('shows the updater phone number in font-mono when updated_by is set', () => {
    render(
      <PlatformConfigForm
        config={{ ...CONFIG, updated_by: '+237691234567' }}
      />,
    );
    const updater = screen.getByText('+237 6 91 23 45 67');
    expect(updater).toHaveClass('font-mono');
  });

  it('disables Save until the value is changed', () => {
    render(<PlatformConfigForm config={CONFIG} />);
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });

  it('enables Save once the value changes, h-14 rounded-xl primary button', () => {
    render(<PlatformConfigForm config={CONFIG} />);
    fireEvent.change(screen.getByDisplayValue('5'), {
      target: { value: '7' },
    });
    const save = screen.getByRole('button', { name: /save/i });
    expect(save).toBeEnabled();
    expect(save).toHaveClass('h-14', 'rounded-xl');
  });

  it('submits the new value, calling the bound action with this config key', async () => {
    render(<PlatformConfigForm config={CONFIG} />);
    fireEvent.change(screen.getByDisplayValue('5'), {
      target: { value: '7' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(mockedAction).toHaveBeenCalledTimes(1));
    const [key, , formData] = mockedAction.mock.calls[0];
    expect(key).toBe('max_active_trips');
    expect((formData as FormData).get('value')).toBe('7');
  });

  it('surfaces the returned error message', async () => {
    mockedAction.mockResolvedValue({ error: 'Validation failed.' });
    render(<PlatformConfigForm config={CONFIG} />);
    fireEvent.change(screen.getByDisplayValue('5'), {
      target: { value: '7' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText('Validation failed.')).toBeInTheDocument();
  });

  it('caps the input at 255 characters, matching the server limit', () => {
    render(<PlatformConfigForm config={CONFIG} />);
    expect(screen.getByDisplayValue('5')).toHaveAttribute('maxLength', '255');
  });
});
