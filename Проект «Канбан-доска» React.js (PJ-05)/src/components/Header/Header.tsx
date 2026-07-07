import React from 'react';
import styles from './Header.module.css';
import UserMenu from '../UserMenu/UserMenu';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logoLink}>
        <h1 className={styles.title}>Awesome Kanban Board</h1>
      </Link>
      <UserMenu />
    </header>
  );
};

export default Header;
