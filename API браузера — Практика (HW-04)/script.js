const wsUrl = 'wss://echo-ws-service.herokuapp.com';
const fallbackWsUrl = 'wss://echo.websocket.org/';

const inputElement = document.querySelector('.chat-app__input');
const btnSend = document.querySelector('.chat-app__btn--send');
const btnGeo = document.querySelector('.chat-app__btn--geo');
const messagesContainer = document.querySelector('.chat-app__messages');

let websocket;

// Инициализация WebSocket
function initWebSocket() {
  websocket = new WebSocket(wsUrl);

  websocket.onopen = () => {
    console.log('Соединение установлено');
  };

  websocket.onmessage = (event) => {
    const serverMessage = event.data;

    // Игнорируем сообщения, которые начинаются с метки геолокации, чтобы не дублировать их
    if (serverMessage.startsWith('GEO_COORDS:')) {
      return;
    }

    displayMessage(serverMessage, 'server');
  };

  websocket.onerror = () => {
    // Если основной URL не работает, пробуем запасной
    if (!websocket.url.includes('echo.websocket.org')) {
      console.log('Основной сервер недоступен, пробуем резервный...');
      websocket = new WebSocket(fallbackWsUrl);

      websocket.onopen = () => console.log('Соединение с резервным сервером установлено');

      websocket.onmessage = (event) => {
        const serverMessage = event.data;
        if (serverMessage.startsWith('GEO_COORDS:')) return;
        displayMessage(serverMessage, 'server');
      };

      websocket.onerror = () => {
        displayMessage('Ошибка соединения с сервером', 'error');
      };
    } else {
        displayMessage('Ошибка соединения с сервером', 'error');
    }
  };

  websocket.onclose = () => {
      console.log('Соединение закрыто');
  }
}

// Функция вывода сообщения на экран
function displayMessage(text, type, isLink = false, linkHref = '') {
  const messageEl = document.createElement('div');
  messageEl.classList.add('chat-message');

  if (type === 'user') {
    messageEl.classList.add('chat-message--user');
    messageEl.textContent = text;
  } else if (type === 'server') {
    messageEl.classList.add('chat-message--server');
    messageEl.textContent = text;
  } else if (type === 'geo') {
    messageEl.classList.add('chat-message--geo');
    const linkEl = document.createElement('a');
    linkEl.href = linkHref;
    linkEl.textContent = text;
    linkEl.target = '_blank';
    linkEl.rel = 'noopener noreferrer';
    linkEl.classList.add('chat-message__link');
    messageEl.appendChild(linkEl);
  } else if (type === 'error') {
    messageEl.classList.add('chat-message--error');
    messageEl.textContent = text;
  }

  messagesContainer.appendChild(messageEl);
  // Прокручиваем вниз к последнему сообщению
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Обработчик отправки текстового сообщения
btnSend.addEventListener('click', () => {
  const messageText = inputElement.value.trim();

  if (!messageText) {
    return;
  }

  if (websocket && websocket.readyState === WebSocket.OPEN) {
    displayMessage(messageText, 'user');
    websocket.send(messageText);
    inputElement.value = '';
  } else {
    displayMessage('Нет соединения с сервером', 'error');
  }
});

// Обработчик отправки по Enter
inputElement.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        btnSend.click();
    }
});

// Обработчик кнопки Геолокация
btnGeo.addEventListener('click', () => {
  if (!navigator.geolocation) {
    displayMessage('Geolocation не поддерживается вашим браузером', 'error');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      const geoTextForServer = `GEO_COORDS: Latitude: ${latitude}, Longitude: ${longitude}`;
      const mapLink = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;

      if (websocket && websocket.readyState === WebSocket.OPEN) {
        // Отправляем на сервер с меткой, чтобы игнорировать при получении обратно
        websocket.send(geoTextForServer);
        displayMessage('Моя геолокация', 'geo', true, mapLink);
      } else {
         displayMessage('Нет соединения с сервером', 'error');
      }
    },
    (error) => {
      displayMessage('Невозможно получить ваше местоположение', 'error');
    }
  );
});

// Запускаем инициализацию при загрузке
initWebSocket();
