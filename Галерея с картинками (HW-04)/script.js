const loadBtn = document.getElementById('load-btn');
const loader = document.getElementById('loader');
const errorMsg = document.getElementById('error-msg');
const galleryContainer = document.getElementById('gallery-container');

// Эндпоинт для загрузки картинок
const API_URL = 'https://jsonplaceholder.typicode.com/photos?_start=0&_limit=60';

// Функция для создания карточки с картинкой
const createCard = (item) => {
  const card = document.createElement('article');
  card.className = 'gallery__card';

  const img = document.createElement('img');
  img.src = item.url;
  img.alt = item.title;
  img.className = 'gallery__image';
  // Использование loading="lazy" для оптимизации
  img.loading = 'lazy';

  const title = document.createElement('p');
  title.className = 'gallery__card-title';
  title.textContent = item.title;

  card.appendChild(img);
  card.appendChild(title);

  return card;
};

// Функция для очистки галереи и скрытия ошибок
const resetGalleryState = () => {
  galleryContainer.innerHTML = '';
  errorMsg.textContent = '';
  errorMsg.classList.add('gallery__error--hidden');
};

// Функция для показа/скрытия лоадера и блокировки кнопки
const toggleLoadingState = (isLoading) => {
  if (isLoading) {
    loader.classList.remove('gallery__loader--hidden');
    loadBtn.disabled = true;
    loadBtn.textContent = 'Загрузка...';
  } else {
    loader.classList.add('gallery__loader--hidden');
    loadBtn.disabled = false;
    loadBtn.textContent = 'Загрузить картинки';
  }
};

// Главная функция загрузки данных
const fetchImages = async () => {
  resetGalleryState();
  toggleLoadingState(true);

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    const data = await response.json();

    // Рендеринг карточек
    const fragment = document.createDocumentFragment();
    data.forEach(item => {
      const card = createCard(item);
      fragment.appendChild(card);
    });

    galleryContainer.appendChild(fragment);

  } catch (error) {
    console.error('Ошибка при загрузке изображений:', error);
    errorMsg.textContent = 'Не удалось загрузить картинки. Пожалуйста, попробуйте позже.';
    errorMsg.classList.remove('gallery__error--hidden');
  } finally {
    toggleLoadingState(false);
  }
};

// Навешиваем обработчик на кнопку
loadBtn.addEventListener('click', fetchImages);
