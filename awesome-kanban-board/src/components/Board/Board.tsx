import React from 'react';
import { Task, TaskStatus } from '../../types';
import Column from '../Column/Column';
import styles from './Board.module.css';

interface BoardProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const STATUSES: TaskStatus[] = ['Backlog', 'Ready', 'In Progress', 'Finished'];

const Board: React.FC<BoardProps> = ({ tasks, setTasks }) => {
  return (
    <div className={styles.board}>
      {STATUSES.map((status, index) => {
        const columnTasks = tasks.filter((t) => t.status === status);
        const previousStatus = index > 0 ? STATUSES[index - 1] : null;
        const previousColumnTasks = previousStatus
          ? tasks.filter((t) => t.status === previousStatus)
          : [];

        return (
          <Column
            key={status}
            title={status}
            tasks={columnTasks}
            allTasks={tasks}
            setTasks={setTasks}
            previousColumnTasks={previousColumnTasks}
          />
        );
      })}
    </div>
  );
};

export default Board;
