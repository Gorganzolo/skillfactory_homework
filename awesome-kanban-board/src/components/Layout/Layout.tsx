import React from 'react';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
  activeTasksCount: number;
  finishedTasksCount: number;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTasksCount, finishedTasksCount }) => {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        {children}
      </main>
      <Footer activeTasksCount={activeTasksCount} finishedTasksCount={finishedTasksCount} />
    </div>
  );
};

export default Layout;
