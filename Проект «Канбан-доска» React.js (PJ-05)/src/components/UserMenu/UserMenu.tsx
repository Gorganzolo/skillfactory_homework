import React, { useState, useEffect, useRef } from 'react';
import styles from './UserMenu.module.css';

const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={styles.userMenu} ref={menuRef}>
      <div className={styles.avatarContainer} onClick={toggleMenu}>
        {/* Placeholder for SVG avatar */}
        <div className={styles.avatarPlaceholder}>
           <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="20" fill="white"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M14.6148 15.6885C14.6148 12.7132 17.0264 10.3015 20 10.3015C22.9735 10.3015 25.3852 12.7132 25.3852 15.6885C25.3852 18.6637 22.9735 21.0754 20 21.0754C17.0264 21.0754 14.6148 18.6637 14.6148 15.6885ZM23.0769 22.6138C26.1118 22.6138 29.8462 24.1685 29.8462 25.6908V28.7677H10.1538V25.6908C10.1538 24.1685 13.8883 22.6138 16.9231 22.6138H23.0769Z" fill="black"/>
            </svg>
        </div>
        <div className={`${styles.arrow} ${isOpen ? styles.up : styles.down}`}></div>
      </div>
      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownArrow}></div>
          <ul className={styles.menuList}>
            <li className={styles.menuItem}>Профиль</li>
            <li className={styles.menuItem}>Выйти</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
