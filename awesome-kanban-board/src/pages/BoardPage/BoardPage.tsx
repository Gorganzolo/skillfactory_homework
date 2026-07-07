import React from 'react';
import { Task } from '../../types';
import Board from '../../components/Board/Board';

interface BoardPageProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const BoardPage: React.FC<BoardPageProps> = ({ tasks, setTasks }) => {
  return (
    <Board tasks={tasks} setTasks={setTasks} />
  );
};

export default BoardPage;
