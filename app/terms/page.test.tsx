import { render, screen } from '@testing-library/react';
import TermsPage from './page';

describe('TermsPage', () => {
  it('renders the Terms of Service heading', () => {
    render(<TermsPage />);
    expect(
      screen.getByRole('heading', { name: 'Terms of Service' }),
    ).toBeInTheDocument();
  });

  it('states the document is not yet published', () => {
    render(<TermsPage />);
    expect(screen.getByText(/not yet published/i)).toBeInTheDocument();
  });

  it('links back to the home page', () => {
    render(<TermsPage />);
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute(
      'href',
      '/',
    );
  });
});
