import { render, screen } from '@testing-library/react';

import Footer from './Footer';

describe('Footer', () => {
  it('renders company info and links', () => {
    render(<Footer />);

    expect(screen.getByRole('heading', { name: 'Kargoa' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Track Shipment' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toBeVisible();
    expect(screen.getByText('support@kargoa.com')).toBeInTheDocument();
  });

  it('shows the current year in the copyright notice', () => {
    render(<Footer />);

    expect(
      screen.getByText(
        `© ${new Date().getFullYear()} Kargoa. All rights reserved.`,
      ),
    ).toBeInTheDocument();
  });
});
