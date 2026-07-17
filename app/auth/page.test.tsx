import { fireEvent, render, screen } from '@testing-library/react';

import Login from './page';
import { verifyCredentials } from './actions';

jest.mock('./actions', () => ({
  verifyCredentials: jest.fn(),
}));

const push = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

const mockVerifyCredentials = verifyCredentials as jest.MockedFunction<
  typeof verifyCredentials
>;

function fillAndSubmit() {
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'admin@kargoa.com' },
  });
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: 'secret' },
  });
  fireEvent.submit(screen.getByRole('button', { name: 'Login' }));
}

describe('Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the login form', () => {
    render(<Login />);

    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('redirects to the dashboard on successful login', async () => {
    mockVerifyCredentials.mockResolvedValue({ success: true });
    render(<Login />);

    fillAndSubmit();

    expect(await screen.findByRole('button', { name: 'Login' })).toBeVisible();
    expect(push).toHaveBeenCalledWith('/dashboard');
  });

  it('shows the error returned for invalid credentials', async () => {
    mockVerifyCredentials.mockResolvedValue({
      success: false,
      error: 'Invalid email or password',
    });
    render(<Login />);

    fillAndSubmit();

    expect(
      await screen.findByText('Invalid email or password'),
    ).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it('shows a fallback error when no message is returned', async () => {
    mockVerifyCredentials.mockResolvedValue({ success: false });
    render(<Login />);

    fillAndSubmit();

    expect(await screen.findByText('Something went wrong')).toBeInTheDocument();
  });
});
