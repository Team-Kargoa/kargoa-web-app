import { render, screen } from '@testing-library/react';
import HelpPage from './page';

describe('HelpPage', () => {
  it('renders the Help heading', () => {
    render(<HelpPage />);
    expect(screen.getByRole('heading', { name: 'Help' })).toBeInTheDocument();
  });

  it('states help documentation is not yet published', () => {
    render(<HelpPage />);
    expect(screen.getByText(/not yet published/i)).toBeInTheDocument();
  });

  it('links back to the home page', () => {
    render(<HelpPage />);
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute(
      'href',
      '/',
    );
  });
});
