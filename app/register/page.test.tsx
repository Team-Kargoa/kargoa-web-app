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
    ['I am an Admin', 'Request Admin Access', '/signin'],
    ['I am a Fleet Owner', 'Register Fleet', '/register/fleet'],
  ])('offers the %s path', (title, cta, href) => {
    render(<RegisterPage />);
    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: new RegExp(cta) })).toHaveAttribute(
      'href',
      href,
    );
  });

  it('renders exactly the two role cards and drops Corporate Client', () => {
    render(<RegisterPage />);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2);
    expect(
      screen.queryByRole('heading', { name: 'I am a Corporate Client' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /Open Business Account/ }),
    ).not.toBeInTheDocument();
  });

  it('shows the network statistics', () => {
    render(<RegisterPage />);
    expect(screen.getByText('TRUCKS ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('500+')).toBeInTheDocument();
  });

  it('renders its own footer', () => {
    render(<RegisterPage />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Terms of Service' }),
    ).toHaveAttribute('href', '/terms');
  });
});
