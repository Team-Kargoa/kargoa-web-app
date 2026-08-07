import { render, screen } from '@testing-library/react';
import ContactPage from './page';

describe('ContactPage', () => {
  it('renders the Contact Support heading', () => {
    render(<ContactPage />);
    expect(
      screen.getByRole('heading', { name: 'Contact Support' }),
    ).toBeInTheDocument();
  });

  it('gives the engineering support email', () => {
    render(<ContactPage />);
    expect(
      screen.getByRole('link', { name: 'engineering@kmercargo.cm' }),
    ).toHaveAttribute('href', 'mailto:engineering@kmercargo.cm');
  });

  it('links back to the home page', () => {
    render(<ContactPage />);
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute(
      'href',
      '/',
    );
  });
});
