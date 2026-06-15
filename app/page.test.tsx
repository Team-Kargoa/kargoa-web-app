import { render, screen } from '@testing-library/react';

import HomePage from './page';

describe('HomePage', () => {
  it('renders the dashboard title and welcome message', () => {
    render(<HomePage />);

    expect(
      screen.getByRole('heading', { name: 'Kargoa Admin Dashboard' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Manage driver onboarding, fleet verification, financial ' +
          'ledgers, and disputes.',
      ),
    ).toBeInTheDocument();
  });
});
