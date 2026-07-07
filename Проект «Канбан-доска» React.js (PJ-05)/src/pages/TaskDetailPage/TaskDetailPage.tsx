import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Task } from '../../types';
import styles from './TaskDetailPage.module.css';

interface TaskDetailPageProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const TaskDetailPage: React.FC<TaskDetailPageProps> = ({ tasks, setTasks }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const task = tasks.find((t) => t.id === id);

  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(task?.description || '');

  if (!task) {
    return <div className={styles.notFound}>Задача не найдена</div>;
  }

  const handleSave = () => {
    const updatedTasks = tasks.map((t) =>
      t.id === id ? { ...t, description } : t
    );
    setTasks(updatedTasks);
    setIsEditing(false);
  };

  return (
    <div className={styles.container}>
      <button className={styles.closeBtn} onClick={() => navigate('/')}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <h2 className={styles.title}>{task.name}</h2>

      <div className={styles.content}>
        {isEditing ? (
          <div className={styles.editMode}>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Введите описание задачи..."
              autoFocus
            />
            <div className={styles.actions}>
              <button className={styles.saveBtn} onClick={handleSave}>Сохранить</button>
              <button className={styles.cancelBtn} onClick={() => setIsEditing(false)}>Отмена</button>
            </div>
          </div>
        ) : (
          <div className={styles.viewMode}>
            <p className={styles.description}>
              {task.description || 'У этой задачи нет описания'}
            </p>
            <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
              Редактировать описание
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailPage;
