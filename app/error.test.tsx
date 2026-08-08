import { render, screen, fireEvent } from '@testing-library/react';
import ErrorPage from './error';

// Non-blocking finding (final whole-branch review): there was no
// app/error.tsx, so any 401/403/500 the live admin API returns (e.g.
// app/admin/drivers/page.tsx and app/admin/settings/page.tsx both let
// ApiError propagate uncaught) showed Next's raw error screen instead of
// an on-brand page. Must be a Client Component with a reset action, per
// Next's error boundary contract, and must never leak error internals
// (message, stack) to the user.
function makeError(message: string): Error & { digest?: string } {
  const error = new Error(message) as Error & { digest?: string };
  error.digest = 'digest-abc123';
  return error;
}

describe('ErrorPage', () => {
  it('renders an on-brand, generic heading without leaking the raw error message', () => {
    render(
      <ErrorPage
        error={makeError('secret backend stack trace: db connection refused')}
        reset={() => {}}
      />,
    );

    expect(
      screen.getByRole('heading', { name: /something went wrong/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/secret backend stack trace/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('digest-abc123')).not.toBeInTheDocument();
  });

  it('calls reset() when the try again action is activated', () => {
    const reset = jest.fn();
    render(<ErrorPage error={makeError('boom')} reset={reset} />);

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('links back to the home page', () => {
    render(<ErrorPage error={makeError('boom')} reset={() => {}} />);
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('hides its decorative icon from assistive tech', () => {
    render(<ErrorPage error={makeError('boom')} reset={() => {}} />);
    const icon = document.querySelector('svg[aria-hidden="true"]');
    expect(icon).not.toBeNull();
  });
});
