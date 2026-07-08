import asyncio
import json
import logging
import os
from datetime import datetime

from aiohttp import web
import aiohttp

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Хранилище новостей и активных подключений
news_history = []
active_websockets = set()

# Путь до файла index.html
STATIC_DIR = os.path.dirname(os.path.abspath(__file__))
INDEX_FILE = os.path.join(STATIC_DIR, "index.html")

async def index_handler(request):
    """
    Обработчик GET /
    Отдает HTML-страницу клиентам.
    """
    try:
        with open(INDEX_FILE, "r", encoding="utf-8") as f:
            content = f.read()
        return web.Response(text=content, content_type="text/html")
    except FileNotFoundError:
        return web.Response(status=404, text="index.html not found")

async def websocket_handler(request):
    """
    Обработчик GET /ws
    Управляет WebSocket-подключениями от браузера.
    Использует параметр heartbeat (в секундах) для периодической проверки (пинг/понг).
    """
    # heartbeat=30 означает, что если в течение 30 секунд нет данных,
    # сервер отправит ping. Это помогает отслеживать "мертвые" соединения.
    ws = web.WebSocketResponse(heartbeat=30.0)
    await ws.prepare(request)

    # Добавляем нового клиента
    active_websockets.add(ws)
    logger.info("Новый клиент подключился. Всего клиентов: %d", len(active_websockets))

    # Сразу отправляем историю новостей новому клиенту
    if news_history:
        try:
            await ws.send_json(news_history)
        except Exception as e:
            logger.error("Ошибка при отправке истории: %s", e)

    try:
        # Слушаем сообщения от клиента.
        # В нашем случае клиент ничего не шлет, но мы должны читать поток,
        # чтобы обрабатывать закрытие соединения.
        async for msg in ws:
            if msg.type == aiohttp.WSMsgType.TEXT:
                logger.debug("Получено сообщение от клиента: %s", msg.data)
            elif msg.type == aiohttp.WSMsgType.ERROR:
                logger.error("Ошибка WebSocket соединения: %s", ws.exception())
    finally:
        # При отключении клиента удаляем его из списка
        active_websockets.discard(ws)
        logger.info("Клиент отключился. Всего клиентов: %d", len(active_websockets))

    return ws

async def post_news_handler(request):
    """
    Обработчик POST /news
    Получает JSON с новостью от другого сервиса и рассылает всем клиентам.
    Ожидаемый формат: {"text": "текст новости"}
    """
    try:
        data = await request.json()
    except json.JSONDecodeError:
        return web.Response(status=400, text="Invalid JSON")

    text = data.get("text")
    if not text:
        return web.Response(status=400, text="Field 'text' is required")

    # Формируем объект новости
    news_item = {
        "text": text,
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    # Сохраняем в историю
    news_history.append(news_item)
    logger.info("Получена новая новость: %s", news_item)

    # Рассылаем всем активным WebSocket клиентам
    # Мы не можем модифицировать set во время итерации, поэтому итерируемся по копии
    for ws in list(active_websockets):
        try:
            await ws.send_json(news_item)
        except Exception as e:
            logger.error("Ошибка отправки сообщения клиенту: %s", e)
            # В случае ошибки удаляем неактивный веб-сокет
            active_websockets.discard(ws)

    return web.json_response({"status": "ok"})


def init_app():
    """Инициализация aiohttp приложения"""
    app = web.Application()

    # Маршруты
    app.router.add_get("/", index_handler)
    app.router.add_get("/ws", websocket_handler)
    app.router.add_post("/news", post_news_handler)

    return app

if __name__ == "__main__":
    app = init_app()
    logger.info("Сервер запускается на http://0.0.0.0:8080")
    web.run_app(app, host="0.0.0.0", port=8080)
