import { render, screen } from '@testing-library/react';
import RegisterPage from './page';

describe('partner registration hub', () => {
  it('renders the hub headline', () => {
    render(<RegisterPage />);
    expect(
      screen.getByRole('heading', {
        name: 'The Backbone of Cameroon Logistics',
      }),
    ).toBeInTheDocument();
  });

  it.each([
    ['I am a Fleet Owner', 'Register Fleet', '/register/fleet'],
    ['I am an Admin', 'Request Admin Access', '/signin'],
    ['I am a Corporate Client', 'Open Business Account', '/register/business'],
  ])('offers the %s path', (title, cta, href) => {
    render(<RegisterPage />);
    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: new RegExp(cta) })).toHaveAttribute(
      'href',
      href,
    );
  });

  it('shows the network statistics', () => {
    render(<RegisterPage />);
    expect(screen.getByText('TRUCKS ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('500+')).toBeInTheDocument();
  });
});
