import React from 'react';
import { Link } from 'react-router-dom';
import { Task } from '../../types';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  return (
    <Link to={`/tasks/${task.id}`} className={styles.cardLink}>
      <div className={styles.card}>
        <span className={styles.name}>{task.name}</span>
      </div>
    </Link>
  );
};

export default TaskCard;
