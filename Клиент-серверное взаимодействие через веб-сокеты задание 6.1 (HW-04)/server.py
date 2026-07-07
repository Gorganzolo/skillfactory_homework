import os
import json
import datetime
import asyncio
from aiohttp import web

# Store connected websocket clients
websockets = set()

# Store news history (in-memory cache)
news_history = [
    {
        "id": 1,
        "title": "Добро пожаловать в службу новостей aiohttp!",
        "content": "Этот сервер написан на Python с использованием aiohttp. Новости рассылаются через WebSockets в реальном времени.",
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }
]

# Helper to broadcast messages to all connected clients
async def broadcast(message_data):
    if not websockets:
        return
    
    serialized = json.dumps(message_data)
    # Broadcast asynchronously to all active connections
    await asyncio.gather(
        *[ws.send_str(serialized) for ws in websockets],
        return_exceptions=True
    )

# REST Endpoint: Publish new news
async def post_news(request):
    try:
        data = await request.json()
    except Exception:
        return web.json_response({"error": "Неверный формат JSON. Пожалуйста, отправьте валидный JSON."}, status=400)
    
    title = data.get("title")
    content = data.get("content")
    
    if not title or not content:
        return web.json_response({"error": "Поля 'title' и 'content' обязательны для заполнения."}, status=400)
    
    news_item = {
        "id": int(datetime.datetime.now().timestamp() * 1000),
        "title": title.strip(),
        "content": content.strip(),
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }
    
    # Save to history (keep last 50 entries)
    news_history.append(news_item)
    if len(news_history) > 50:
        news_history.pop(0)
    
    # Broadcast to all websocket connections
    await broadcast({
        "type": "news",
        "data": news_item
    })
    
    print(f"[REST] Получена и разослана новость: \"{news_item['title']}\"")
    return web.json_response({
        "success": True, 
        "message": "Новость успешно разослана.", 
        "data": news_item
    }, status=201)

# WebSocket connection handler
async def websocket_handler(request):
    ws = web.WebSocketResponse()
    await ws.prepare(request)
    
    websockets.add(ws)
    peername = request.transport.get_extra_info('peername')
    ip = peername[0] if peername else "Unknown"
    print(f"[WS] Новое подключение от клиента {ip}. Всего клиентов: {len(websockets)}")
    
    # Send current history
    await ws.send_str(json.dumps({
        "type": "history",
        "data": news_history
    }))
    
    try:
        async for msg in ws:
            if msg.type == web.WSMsgType.TEXT:
                try:
                    parsed = json.loads(msg.data)
                    # Connection check (ping/pong) that does not modify state
                    if parsed.get("type") == "ping":
                        await ws.send_str(json.dumps({
                            "type": "pong",
                            "id": parsed.get("id")
                        }))
                except Exception as e:
                    print(f"[WS] Ошибка разбора сообщения от клиента: {e}")
            elif msg.type == web.WSMsgType.ERROR:
                print(f"[WS] Соединение прервано с ошибкой: {ws.exception()}")
    finally:
        websockets.remove(ws)
        print(f"[WS] Соединение закрыто для {ip}. Всего клиентов: {len(websockets)}")
        
    return ws

# Create application
app = web.Application()

# Routes setup
app.router.add_post('/news', post_news)
app.router.add_get('/ws', websocket_handler)

# Serve client static assets
public_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'public')
app.router.add_static('/', path=public_dir, show_index=True)

if __name__ == '__main__':
    print("=====================================================")
    print(" Starting aiohttp WebSocket News Server...")
    print(" REST news post:  POST http://localhost:3000/news")
    print(" WS connection:   ws://localhost:3000/ws")
    print(" Frontend dashboard: http://localhost:3000/")
    print("=====================================================")
    web.run_app(app, host='0.0.0.0', port=3000)
