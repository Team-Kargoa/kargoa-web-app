import { render, screen } from '@testing-library/react';
import ContactPage from './page';

// SUPPORT_EMAIL is sourced from lib/config.ts (see its own test suite for
// the env var/default/override behavior); mocked here so this suite proves
// ContactPage renders whatever the config module hands it, rather than a
// value hardcoded in page.tsx.
jest.mock('@/lib/config', () => ({ SUPPORT_EMAIL: 'support@kargoa.example' }));

describe('ContactPage', () => {
  it('renders the Contact Support heading', () => {
    render(<ContactPage />);
    expect(
      screen.getByRole('heading', { name: 'Contact Support' }),
    ).toBeInTheDocument();
  });

  it('renders the support email supplied by lib/config', () => {
    render(<ContactPage />);
    expect(
      screen.getByRole('link', { name: 'support@kargoa.example' }),
    ).toHaveAttribute('href', 'mailto:support@kargoa.example');
  });

  it('links back to the home page', () => {
    render(<ContactPage />);
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute(
      'href',
      '/',
    );
  });
});
