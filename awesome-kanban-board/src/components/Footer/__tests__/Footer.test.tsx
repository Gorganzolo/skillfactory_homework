import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

describe('Footer Component', () => {
  it('renders correct active and finished task counts', () => {
    render(<Footer activeTasksCount={5} finishedTasksCount={12} />);

    expect(screen.getByText('Active tasks: 5')).toBeInTheDocument();
    expect(screen.getByText('Finished tasks: 12')).toBeInTheDocument();
  });

  it('renders the correct creator info', () => {
    render(<Footer activeTasksCount={0} finishedTasksCount={0} />);

    expect(screen.getByText('Kanban board by Artem Molostvov, 2026')).toBeInTheDocument();
  });
});
