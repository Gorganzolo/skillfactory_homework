import { Task } from '../types';

const STORAGE_KEY = 'awesome-kanban-board-tasks';

export const mockTasks: Task[] = [
  {
    id: '1',
    name: 'Login page – performance issues',
    description: 'Investigate and resolve performance issues on the login page.',
    status: 'Backlog',
  },
  {
    id: '2',
    name: 'Sprint bugfix',
    description: 'Fix bugs from the previous sprint.',
    status: 'Backlog',
  },
  {
    id: '3',
    name: 'Shop page – performance issues',
    description: '',
    status: 'Ready',
  },
  {
    id: '4',
    name: 'Checkout bugfix',
    description: '',
    status: 'Ready',
  },
  {
    id: '5',
    name: 'User page – performance issues',
    description: '',
    status: 'In Progress',
  },
  {
    id: '6',
    name: 'Auth bugfix',
    description: '',
    status: 'In Progress',
  },
  {
    id: '7',
    name: 'Main page – performance issues',
    description: '',
    status: 'Finished',
  },
  {
    id: '8',
    name: 'Main page bugfix',
    description: '',
    status: 'Finished',
  },
];

export const loadTasksFromStorage = (): Task[] => {
  try {
    const serializedTasks = localStorage.getItem(STORAGE_KEY);
    if (serializedTasks === null) {
      return mockTasks;
    }
    return JSON.parse(serializedTasks);
  } catch (err) {
    console.error('Error loading tasks from localStorage', err);
    return mockTasks;
  }
};

export const saveTasksToStorage = (tasks: Task[]): void => {
  try {
    const serializedTasks = JSON.stringify(tasks);
    localStorage.setItem(STORAGE_KEY, serializedTasks);
  } catch (err) {
    console.error('Error saving tasks to localStorage', err);
  }
};
