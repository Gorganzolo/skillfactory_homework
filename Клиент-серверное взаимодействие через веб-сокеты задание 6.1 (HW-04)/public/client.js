let socket = null;
let pingIntervalId = null;
let lastPingTime = null;
let pingStartTimes = {}; // Map to track RTT for multiple parallel pings

// DOM Elements
const headerStatusDot = document.getElementById('header-status-dot');
const headerStatusText = document.getElementById('header-status-text');
const statusBadge = document.getElementById('status-badge');
const latencyVal = document.getElementById('latency-val');
const lastPingTimeEl = document.getElementById('last-ping-time');
const manualPingBtn = document.getElementById('manual-ping-btn');
const simulatorForm = document.getElementById('simulator-form');
const newsTitleInput = document.getElementById('news-title');
const newsContentInput = document.getElementById('news-content');
const submitNewsBtn = document.getElementById('submit-news-btn');
const simStatusMsg = document.getElementById('sim-status-msg');
const newsFeed = document.getElementById('news-feed');
const emptyFeed = document.getElementById('empty-feed');
const newsCounter = document.getElementById('news-count');

// Helper to format timestamps nicely
function formatTimestamp(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// Update connection status in UI
function setConnectionStatus(status) {
  // Reset classes
  headerStatusDot.className = 'dot';
  statusBadge.className = 'badge';

  if (status === 'connected') {
    headerStatusDot.classList.add('connected');
    headerStatusText.textContent = 'Подключен';
    statusBadge.classList.add('connected');
    statusBadge.textContent = 'Подключено';
    manualPingBtn.disabled = false;
  } else if (status === 'connecting') {
    headerStatusDot.classList.add('connecting');
    headerStatusText.textContent = 'Подключение...';
    statusBadge.classList.add('connecting');
    statusBadge.textContent = 'Подключение...';
    manualPingBtn.disabled = true;
    latencyVal.textContent = '- ms';
  } else {
    headerStatusDot.classList.add('disconnected');
    headerStatusText.textContent = 'Отключен';
    statusBadge.classList.add('disconnected');
    statusBadge.textContent = 'Отключено';
    manualPingBtn.disabled = true;
    latencyVal.textContent = '- ms';
    clearInterval(pingIntervalId);
  }
}

// Connect to WebSocket Server
function connect() {
  setConnectionStatus('connecting');

  // Determine WebSocket URL dynamically based on location
  const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
  const wsUrl = `${protocol}${window.location.host}/ws`;

  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log('[WS] Соединение установлено!');
    setConnectionStatus('connected');
    
    // Start periodic connection testing (every 5 seconds)
    sendPing();
    pingIntervalId = setInterval(sendPing, 5000);
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      
      if (message.type === 'history') {
        renderNewsFeed(message.data, true);
      } else if (message.type === 'news') {
        addNewsCard(message.data, false);
      } else if (message.type === 'pong') {
        handlePong(message.id);
      }
    } catch (err) {
      console.error('[WS] Ошибка разбора входящего сообщения:', err);
    }
  };

  socket.onclose = () => {
    console.log('[WS] Соединение закрыто. Попытка переподключения через 3 секунды...');
    setConnectionStatus('disconnected');
    setTimeout(connect, 3000);
  };

  socket.onerror = (err) => {
    console.error('[WS] Ошибка сокета:', err);
    setConnectionStatus('disconnected');
  };
}

// Send Ping request to test connection without changing server state
function sendPing() {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;

  const pingId = Date.now().toString();
  pingStartTimes[pingId] = Date.now();
  
  socket.send(JSON.stringify({
    type: 'ping',
    id: pingId
  }));
}

// Handle Pong response and calculate Round-Trip Time
function handlePong(pingId) {
  const startTime = pingStartTimes[pingId];
  if (!startTime) return;

  const rtt = Date.now() - startTime;
  delete pingStartTimes[pingId]; // Clean up

  // Update UI stats
  latencyVal.textContent = `${rtt} ms`;
  
  // Highlight latency coloring for high visual feedback
  if (rtt < 30) {
    latencyVal.style.color = 'var(--success-color)';
  } else if (rtt < 100) {
    latencyVal.style.color = 'var(--warning-color)';
  } else {
    latencyVal.style.color = 'var(--danger-color)';
  }

  lastPingTime = new Date();
  lastPingTimeEl.textContent = lastPingTime.toLocaleTimeString('ru-RU');
}

// Add a news card to the DOM
function addNewsCard(newsItem, appendToBottom = false) {
  // Remove empty state if present
  if (emptyFeed) {
    emptyFeed.style.display = 'none';
  }

  // Create news card structure
  const card = document.createElement('article');
  card.className = 'card news-card';
  card.innerHTML = `
    <div class="news-card-header">
      <h3>${escapeHtml(newsItem.title)}</h3>
      <span class="news-time">${formatTimestamp(newsItem.timestamp)}</span>
    </div>
    <div class="news-card-body">
      <p>${escapeHtml(newsItem.content).replace(/\n/g, '<br>')}</p>
    </div>
  `;

  if (appendToBottom) {
    newsFeed.appendChild(card);
  } else {
    newsFeed.insertBefore(card, newsFeed.firstChild);
  }

  // Update news counter
  updateCounter();
}

// Render complete news feed list
function renderNewsFeed(newsItems, reset = false) {
  if (reset) {
    // Clear feed excluding empty placeholder template
    newsFeed.innerHTML = '';
  }

  if (!newsItems || newsItems.length === 0) {
    if (emptyFeed) {
      newsFeed.appendChild(emptyFeed);
      emptyFeed.style.display = 'flex';
    }
    updateCounter();
    return;
  }

  // Add items
  newsItems.forEach(item => addNewsCard(item, true));
}

// Update news counter display
function updateCounter() {
  const count = newsFeed.querySelectorAll('.news-card').length;
  newsCounter.textContent = count;
}

// Helper to sanitize HTML tags
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Send manual Ping test
manualPingBtn.addEventListener('click', () => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    sendPing();
    
    // Add micro-animation effect on click
    manualPingBtn.style.transform = 'scale(0.98)';
    setTimeout(() => {
      manualPingBtn.style.transform = 'none';
    }, 100);
  }
});

// Publish news via REST API simulator form
simulatorForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const title = newsTitleInput.value;
  const content = newsContentInput.value;

  // UI state updates: disabling form during process
  submitNewsBtn.disabled = true;
  simStatusMsg.className = 'form-feedback';
  simStatusMsg.textContent = 'Отправка...';
  simStatusMsg.classList.remove('hidden');

  try {
    const response = await fetch('/news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, content })
    });

    const result = await response.json();

    if (response.ok) {
      simStatusMsg.classList.add('success');
      simStatusMsg.textContent = 'Новость успешно опубликована через POST-запрос и разослана всем сокетам!';
      
      // Clear fields
      newsTitleInput.value = '';
      newsContentInput.value = '';
      
      // Hide feedback message after 4 seconds
      setTimeout(() => {
        simStatusMsg.classList.add('hidden');
      }, 4000);
    } else {
      throw new Error(result.error || 'Неизвестная ошибка на сервере');
    }
  } catch (err) {
    simStatusMsg.classList.add('error');
    simStatusMsg.textContent = `Ошибка при отправке: ${err.message}`;
  } finally {
    submitNewsBtn.disabled = false;
  }
});

// Launch socket connection on load
connect();
