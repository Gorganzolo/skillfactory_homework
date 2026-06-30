import { fetchBooks } from './api';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));
}

function toggleCartItem(book) {
  const cart = getCart();
  const existingIndex = cart.findIndex(item => item.id === book.id);

  if (existingIndex !== -1) {
    cart.splice(existingIndex, 1);
  } else {
    cart.push(book);
  }

  saveCart(cart);
}

function renderStars(rating, ratingsCount) {
  if (!rating) return '';

  let starsHtml = '';
  const fullStars = Math.floor(rating);
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      starsHtml += '<span style="color: #F2C94C;">★</span>';
    } else {
      starsHtml += '<span style="color: #EFEFEF;">★</span>';
    }
  }

  return `
    <div class="book-card__rating">
      <div class="book-card__stars">${starsHtml}</div>
      <span>${ratingsCount ? `${ratingsCount} review${ratingsCount !== 1 ? 's' : ''}` : ''}</span>
    </div>
  `;
}

function renderBookCard(book) {
  const volumeInfo = book.volumeInfo;
  const saleInfo = book.saleInfo;

  const coverUrl = volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/212x300.png?text=No+Cover';
  const authors = volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author';
  const title = volumeInfo.title || 'Unknown Title';
  const rating = volumeInfo.averageRating;
  const ratingsCount = volumeInfo.ratingsCount;

  let desc = volumeInfo.description || '';

  let priceHtml = '';
  if (saleInfo && saleInfo.retailPrice) {
    const currency = saleInfo.retailPrice.currencyCode === 'RUB' ? '₽' : saleInfo.retailPrice.currencyCode;
    priceHtml = `<div class="book-card__price">${currency} ${saleInfo.retailPrice.amount}</div>`;
  } else if (saleInfo && saleInfo.listPrice) {
      const currency = saleInfo.listPrice.currencyCode === 'RUB' ? '₽' : saleInfo.listPrice.currencyCode;
      priceHtml = `<div class="book-card__price">${currency} ${saleInfo.listPrice.amount}</div>`;
  }

  const cart = getCart();
  const inCart = cart.some(item => item.id === book.id);

  const div = document.createElement('div');
  div.className = 'book-card';
  div.innerHTML = `
    <div class="book-card__cover-wrapper">
      <img src="${coverUrl}" alt="Cover of ${title.replace(/"/g, '&quot;')}" class="book-card__cover">
    </div>
    <div class="book-card__author">${authors}</div>
    <div class="book-card__title" title="${title.replace(/"/g, '&quot;')}">${title}</div>
    ${renderStars(rating, ratingsCount)}
    <div class="book-card__desc">${desc}</div>
    ${priceHtml}
    <button class="book-card__buy-btn ${inCart ? 'book-card__buy-btn--in-cart' : ''}" type="button">
      ${inCart ? 'IN THE CART' : 'BUY NOW'}
    </button>
  `;

  const buyBtn = div.querySelector('.book-card__buy-btn');
  buyBtn.addEventListener('click', () => {
    toggleCartItem(book);
    const updatedInCart = getCart().some(item => item.id === book.id);
    if (updatedInCart) {
      buyBtn.classList.add('book-card__buy-btn--in-cart');
      buyBtn.textContent = 'IN THE CART';
    } else {
      buyBtn.classList.remove('book-card__buy-btn--in-cart');
      buyBtn.textContent = 'BUY NOW';
    }
  });

  return div;
}

export class BookshelfManager {
  constructor(gridContainer, loadMoreBtn) {
    this.gridContainer = gridContainer;
    this.loadMoreBtn = loadMoreBtn;
    this.currentCategory = null;
    this.startIndex = 0;
    this.loading = false;

    // Add error container
    this.errorContainer = document.createElement('div');
    this.errorContainer.className = 'bookshelf__error';
    this.errorContainer.style.display = 'none';
    this.errorContainer.style.color = 'red';
    this.errorContainer.style.padding = '20px 0';
    this.gridContainer.parentNode.insertBefore(this.errorContainer, this.gridContainer);

    this.loadMoreBtn.addEventListener('click', () => this.loadMoreBooks());
  }

  async setCategory(category) {
    this.currentCategory = category;
    this.startIndex = 0;
    this.gridContainer.innerHTML = '';
    this.errorContainer.style.display = 'none';
    this.loadMoreBtn.style.display = 'none';
    await this.loadMoreBooks();
  }

  async loadMoreBooks() {
    if (this.loading || !this.currentCategory) return;

    this.loading = true;
    this.errorContainer.style.display = 'none';
    const originalText = this.loadMoreBtn.textContent;
    this.loadMoreBtn.textContent = 'LOADING...';

    try {
      const books = await fetchBooks(this.currentCategory, this.startIndex, 6);

      if (books.length > 0) {
        books.forEach(book => {
          this.gridContainer.appendChild(renderBookCard(book));
        });
        this.startIndex += 6;
        this.loadMoreBtn.style.display = 'block';
      } else {
        if (this.startIndex === 0) {
          this.errorContainer.textContent = 'No books found in this category.';
          this.errorContainer.style.display = 'block';
        }
        this.loadMoreBtn.style.display = 'none';
      }
    } catch (error) {
      console.error(error);
      this.errorContainer.textContent = 'Failed to load books. Please check your API key or network connection.';
      this.errorContainer.style.display = 'block';
      this.loadMoreBtn.style.display = 'block'; // Allow retry
    } finally {
      this.loading = false;
      this.loadMoreBtn.textContent = originalText;
    }
  }
}
