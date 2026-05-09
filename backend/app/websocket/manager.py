from fastapi import WebSocket
from typing import Dict, List
from loguru import logger


class WebSocketManager:
    def __init__(self):
        self._rooms: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room: str):
        await websocket.accept()
        if room not in self._rooms:
            self._rooms[room] = []
        self._rooms[room].append(websocket)
        logger.info(f"WebSocket connected to room: {room}")

    def disconnect(self, websocket: WebSocket, room: str):
        if room in self._rooms:
            self._rooms[room] = [ws for ws in self._rooms[room] if ws != websocket]
            if not self._rooms[room]:
                del self._rooms[room]
        logger.info(f"WebSocket disconnected from room: {room}")

    async def broadcast(self, room: str, message: dict):
        if room in self._rooms:
            disconnected = []
            for ws in self._rooms[room]:
                try:
                    await ws.send_json(message)
                except Exception:
                    disconnected.append(ws)
            for ws in disconnected:
                self.disconnect(ws, room)


ws_manager = WebSocketManager()
