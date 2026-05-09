from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.manager import ws_manager

router = APIRouter()


@router.websocket("/deploy/{deploy_id}")
async def deploy_logs_ws(websocket: WebSocket, deploy_id: int):
    room = f"deploy:{deploy_id}"
    await ws_manager.connect(websocket, room)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, room)
