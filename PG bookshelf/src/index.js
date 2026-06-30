import './styles/main.scss';
import initSlider from './slider';
import initHeader from './header';
import { categories, renderCategories } from './categories';
import { BookshelfManager } from './bookshelf';

document.addEventListener('DOMContentLoaded', () => {
  initSlider();
  initHeader();

  const categoryContainer = document.querySelector('.category-list');
  const gridContainer = document.querySelector('.bookshelf__grid');
  const loadMoreBtn = document.querySelector('.bookshelf__load-more');

  if (categoryContainer && gridContainer && loadMoreBtn) {
    const manager = new BookshelfManager(gridContainer, loadMoreBtn);

    // Render categories and set up callback
    renderCategories(categoryContainer, (selectedCategory) => {
      manager.setCategory(selectedCategory);
    });

    // Initialize with the first category
    if (categories.length > 0) {
      manager.setCategory(categories[0]);
    }
  }
});
