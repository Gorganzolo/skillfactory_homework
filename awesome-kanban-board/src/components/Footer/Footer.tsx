import React from 'react';
import styles from './Footer.module.css';

interface FooterProps {
  activeTasksCount: number;
  finishedTasksCount: number;
}

const Footer: React.FC<FooterProps> = ({ activeTasksCount, finishedTasksCount }) => {
  const name = "Artem Molostvov";
  const year = "2026"; // Explicitly requested in the prompt

  return (
    <footer className={styles.footer}>
      <div className={styles.stats}>
        <span>Active tasks: {activeTasksCount}</span>
        <span>Finished tasks: {finishedTasksCount}</span>
      </div>
      <div className={styles.copy}>
        Kanban board by {name}, {year}
      </div>
    </footer>
  );
};

export default Footer;
