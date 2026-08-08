import { render, screen } from '@testing-library/react';
import PrivacyPage from './page';

describe('PrivacyPage', () => {
  it('renders the Privacy Policy heading', () => {
    render(<PrivacyPage />);
    expect(
      screen.getByRole('heading', { name: 'Privacy Policy' }),
    ).toBeInTheDocument();
  });

  it('states the document is not yet published', () => {
    render(<PrivacyPage />);
    expect(screen.getByText(/not yet published/i)).toBeInTheDocument();
  });

  it('links back to the home page', () => {
    render(<PrivacyPage />);
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute(
      'href',
      '/',
    );
  });
});
