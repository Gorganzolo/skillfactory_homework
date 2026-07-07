import { Task } from '../types';

const STORAGE_KEY = 'awesome-kanban-board-tasks';

export const mockTasks: Task[] = [
  {
    id: '1',
    name: 'Страница авторизации – проблемы с производительностью',
    description: 'Исследовать и устранить проблемы с производительностью на странице авторизации.',
    status: 'Backlog',
  },
  {
    id: '2',
    name: 'Исправление ошибок спринта',
    description: 'Исправить ошибки, обнаруженные в ходе предыдущего спринта.',
    status: 'Backlog',
  },
  {
    id: '3',
    name: 'Страница магазина – проблемы с производительностью',
    description: '',
    status: 'Ready',
  },
  {
    id: '4',
    name: 'Исправление ошибок оформления заказа',
    description: '',
    status: 'Ready',
  },
  {
    id: '5',
    name: 'Страница пользователя – проблемы с производительностью',
    description: '',
    status: 'In Progress',
  },
  {
    id: '6',
    name: 'Исправление ошибок авторизации',
    description: '',
    status: 'In Progress',
  },
  {
    id: '7',
    name: 'Главная страница – проблемы с производительностью',
    description: '',
    status: 'Finished',
  },
  {
    id: '8',
    name: 'Исправление ошибок главной страницы',
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
