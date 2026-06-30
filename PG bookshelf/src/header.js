export default function initHeader() {
  const cartBadge = document.querySelector('.header__cart-badge');
  const cartIcon = document.querySelector('.header__icon-btn--cart');

  function updateCartBadge() {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (cartBadge) {
        if (cart.length > 0) {
          cartBadge.textContent = cart.length;
          cartBadge.style.display = 'flex';
        } else {
          cartBadge.style.display = 'none';
        }
      }
    } catch (e) {
      console.error('Error reading cart from localStorage', e);
    }
  }

  // Update on initialization
  updateCartBadge();

  // Update when local storage changes (from other tabs or custom events)
  window.addEventListener('cartUpdated', updateCartBadge);
  window.addEventListener('storage', (e) => {
    if (e.key === 'cart') {
      updateCartBadge();
    }
  });
}
