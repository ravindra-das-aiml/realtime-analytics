import json
import redis
import asyncio
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Real-Time Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

r = redis.Redis(host='localhost', port=6379, decode_responses=True)

CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Patna', 'Hyderabad']

def get_city_stats():
    stats = []
    for city in CITIES:
        total = int(r.get(f"city:{city}:total_events") or 0)
        speeds = r.lrange(f"city:{city}:speeds", 0, -1)
        avg_speed = round(sum(float(s) for s in speeds) / len(speeds), 1) if speeds else 0
        delivering = int(r.get(f"city:{city}:status:delivering") or 0)
        idle = int(r.get(f"city:{city}:status:idle") or 0)
        returning = int(r.get(f"city:{city}:status:returning") or 0)
        stats.append({
            "city": city,
            "total_events": total,
            "avg_speed": avg_speed,
            "delivering": delivering,
            "idle": idle,
            "returning": returning
        })
    return stats

# REST Endpoint
@app.get("/api/stats")
def get_stats():
    return {"cities": get_city_stats()}

# WebSocket — live data every 2 seconds
@app.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = get_city_stats()
            await websocket.send_text(json.dumps(data))
            await asyncio.sleep(2)
    except:
        pass