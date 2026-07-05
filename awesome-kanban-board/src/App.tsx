import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import BoardPage from './pages/BoardPage/BoardPage';
import TaskDetailPage from './pages/TaskDetailPage/TaskDetailPage';
import { loadTasksFromStorage, saveTasksToStorage } from './utils/storage';
import { Task } from './types';

function App() {
  const [tasks, setTasks] = useState<Task[]>(loadTasksFromStorage);

  useEffect(() => {
    if (tasks.length > 0) {
      saveTasksToStorage(tasks);
    }
  }, [tasks]);

  const activeTasksCount = tasks.filter(t => t.status === 'Backlog').length;
  const finishedTasksCount = tasks.filter(t => t.status === 'Finished').length;

  return (
    <Router>
      <Layout activeTasksCount={activeTasksCount} finishedTasksCount={finishedTasksCount}>
        <Routes>
          <Route path="/" element={<BoardPage tasks={tasks} setTasks={setTasks} />} />
          <Route path="/tasks/:id" element={<TaskDetailPage tasks={tasks} setTasks={setTasks} />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
