import { render, screen } from '@testing-library/react';

import Navbar from './Navbar';

describe('Navbar', () => {
  it('renders the brand and navigation links', () => {
    render(<Navbar />);

    expect(screen.getByText('KARGOA')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'How It Works' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Features' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Drivers' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'FAQ' })).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Download App' }),
    ).toBeInTheDocument();
  });
});
