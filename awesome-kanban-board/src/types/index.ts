export type TaskStatus = 'Backlog' | 'Ready' | 'In Progress' | 'Finished';

export interface Task {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
}
