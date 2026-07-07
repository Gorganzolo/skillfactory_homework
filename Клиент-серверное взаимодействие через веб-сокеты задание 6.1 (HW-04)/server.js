const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON requests
app.use(express.json());

// Serve static client files
app.use(express.static(path.join(__dirname, 'public')));

// Store news history in memory (optional, but nice for clients connecting later)
const newsHistory = [
  {
    id: 1,
    title: 'Добро пожаловать в службу новостей!',
    content: 'Это пример первой новости, которая уже была в системе при вашем подключении. Все последующие новости будут приходить в реальном времени через веб-сокеты.',
    timestamp: new Date().toISOString()
  }
];

// Broadcast helper
function broadcast(messageObject) {
  const serialized = JSON.stringify(messageObject);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(serialized);
    }
  });
}

// REST Endpoint to publish new news
app.post('/news', (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Поля "title" и "content" обязательны для заполнения.' });
  }

  const newsItem = {
    id: Date.now(),
    title: title.trim(),
    content: content.trim(),
    timestamp: new Date().toISOString()
  };

  // Save to local history
  newsHistory.push(newsItem);
  if (newsHistory.length > 50) {
    newsHistory.shift(); // Keep history size reasonable
  }

  // Broadcast to all connected WebSocket clients
  broadcast({
    type: 'news',
    data: newsItem
  });

  console.log(`[REST] Получена и разослана новость: "${newsItem.title}"`);
  return res.status(201).json({ success: true, message: 'Новость успешно разослана.', data: newsItem });
});

// WebSocket connection handling
wss.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress;
  console.log(`[WS] Новое подключение от клиента: ${ip}`);

  // Send current news history to the newly connected client
  ws.send(JSON.stringify({
    type: 'history',
    data: newsHistory
  }));

  // Handle messages from the client
  ws.on('message', (message) => {
    try {
      const parsed = JSON.parse(message);
      
      // Ping check to monitor connection health without modifying state
      if (parsed.type === 'ping') {
        ws.send(JSON.stringify({
          type: 'pong',
          id: parsed.id // Echo back client token/timestamp to measure latency
        }));
      }
    } catch (err) {
      console.error('[WS] Ошибка разбора сообщения от клиента:', err.message);
    }
  });

  ws.on('close', () => {
    console.log(`[WS] Соединение закрыто клиентом: ${ip}`);
  });

  ws.on('error', (err) => {
    console.error(`[WS] Ошибка соединения:`, err.message);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`=====================================================`);
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(` WebSocket server is active on ws://localhost:${PORT}`);
  console.log(` Publish news via: POST http://localhost:${PORT}/news`);
  console.log(`=====================================================`);
});
