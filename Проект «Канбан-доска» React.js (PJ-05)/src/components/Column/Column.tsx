import React, { useState } from 'react';
import { Task, TaskStatus } from '../../types';
import TaskCard from '../TaskCard/TaskCard';
import styles from './Column.module.css';
import { v4 as uuidv4 } from 'uuid';

interface ColumnProps {
  title: TaskStatus;
  tasks: Task[];
  allTasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  previousColumnTasks: Task[];
}

const statusTranslations: Record<TaskStatus, string> = {
  'Backlog': 'Бэклог',
  'Ready': 'Готово',
  'In Progress': 'В работе',
  'Finished': 'Завершено'
};

const Column: React.FC<ColumnProps> = ({ title, tasks, allTasks, setTasks, previousColumnTasks }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');

  const handleAddSubmit = () => {
    if (title === 'Backlog') {
      if (newTaskName.trim() !== '') {
        const newTask: Task = {
          id: uuidv4(),
          name: newTaskName.trim(),
          description: '',
          status: 'Backlog',
        };
        setTasks([...allTasks, newTask]);
        setNewTaskName('');
        setIsAdding(false);
      }
    } else {
      if (selectedTaskId !== '') {
        // Find the task and update its status
        const taskToMove = allTasks.find(t => t.id === selectedTaskId);
        if (taskToMove) {
          const updatedTask = { ...taskToMove, status: title };
          // Remove the task from its original position and append it to the end
          const remainingTasks = allTasks.filter(t => t.id !== selectedTaskId);
          setTasks([...remainingTasks, updatedTask]);
        }
        setSelectedTaskId('');
        setIsAdding(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSubmit();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewTaskName('');
      setSelectedTaskId('');
    }
  };

  const isPreviousEmpty = previousColumnTasks.length === 0;

  return (
    <div className={styles.column}>
      <div className={styles.header}>
        <h3 className={styles.title}>{statusTranslations[title]}</h3>
        <span className={styles.badge}>{tasks.length}</span>
      </div>
      
      <div className={styles.taskList}>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      {isAdding ? (
        <div className={styles.addControls}>
          {title === 'Backlog' ? (
            <input
              type="text"
              className={styles.input}
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Название новой задачи..."
              autoFocus
            />
          ) : (
            <select
              className={styles.select}
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              onKeyDown={handleKeyDown}
            >
              <option value="" disabled>Выберите задачу...</option>
              {previousColumnTasks.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}
          <div className={styles.actionButtons}>
            <button className={styles.submitBtn} onClick={handleAddSubmit}>
              Добавить
            </button>
            <button className={styles.cancelBtn} onClick={() => { setIsAdding(false); setNewTaskName(''); setSelectedTaskId(''); }}>
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <button
          className={`${styles.addBtn} ${(title !== 'Backlog' && isPreviousEmpty) ? styles.disabled : ''}`}
          onClick={() => setIsAdding(true)}
          disabled={title !== 'Backlog' && isPreviousEmpty}
        >
          <span className={styles.plus}>+</span> Добавить карточку
        </button>
      )}
    </div>
  );
};

export default Column;
