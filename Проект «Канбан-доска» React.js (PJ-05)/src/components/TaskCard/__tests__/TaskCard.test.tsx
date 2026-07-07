import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TaskCard from '../TaskCard';
import { Task } from '../../../types';

const mockTask: Task = {
  id: '123',
  name: 'Test Task Name',
  description: 'Test description',
  status: 'Backlog',
};

describe('TaskCard Component', () => {
  it('renders the task name', () => {
    render(
      <BrowserRouter>
        <TaskCard task={mockTask} />
      </BrowserRouter>
    );

    expect(screen.getByText('Test Task Name')).toBeInTheDocument();
  });

  it('links to the correct task details page', () => {
    render(
      <BrowserRouter>
        <TaskCard task={mockTask} />
      </BrowserRouter>
    );

    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', '/tasks/123');
  });
});
