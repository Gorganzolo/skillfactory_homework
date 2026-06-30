export const categories = [
  'Architecture',
  'Art & Fashion',
  'Biography',
  'Business',
  'Crafts & Hobbies',
  'Drama',
  'Fiction',
  'Food & Drink',
  'Health & Wellbeing',
  'History & Politics',
  'Humor',
  'Poetry',
  'Psychology',
  'Science',
  'Technology',
  'Travel & Maps'
];

export function renderCategories(container, onSelectCategory) {
  container.innerHTML = '';

  categories.forEach((cat, index) => {
    const li = document.createElement('li');
    li.classList.add('category-list__item');

    const btn = document.createElement('button');
    btn.classList.add('category-list__btn');
    if (index === 0) {
      btn.classList.add('category-list__btn--active');
    }
    btn.type = 'button';
    btn.textContent = cat;

    btn.addEventListener('click', () => {
      // Remove active class from all
      const allBtns = container.querySelectorAll('.category-list__btn');
      allBtns.forEach(b => b.classList.remove('category-list__btn--active'));

      // Add active class to clicked
      btn.classList.add('category-list__btn--active');

      onSelectCategory(cat);
    });

    li.appendChild(btn);
    container.appendChild(li);
  });
}
