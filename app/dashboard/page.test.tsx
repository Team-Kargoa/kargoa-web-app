import { render, screen } from '@testing-library/react';

import DashBoardPage from './page';

describe('DashBoardPage', () => {
  it('renders the dashboard placeholder', () => {
    render(<DashBoardPage />);

    expect(screen.getByText('DashBoardPage')).toBeInTheDocument();
  });
});
