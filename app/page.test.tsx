import { render, screen } from '@testing-library/react';

import HomePage from './page';

describe('HomePage', () => {
  it('renders the hero title and welcome message', () => {
    render(<HomePage />);

    expect(
      screen.getByRole('heading', {
        name: 'Move Cargo Across Cameroon. Faster. Safer. Smarter.',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Connect with verified transporters, track shipments in real time, ' +
          'and manage deliveries from pickup to destination all through one ' +
          'powerful logistics platform.',
      ),
    ).toBeInTheDocument();
  });

  it('renders the primary calls to action', () => {
    render(<HomePage />);

    expect(
      screen.getByRole('button', { name: 'Request Transport' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Become A Driver' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Get Started' }),
    ).toBeInTheDocument();
  });
});
