import json
import random
import asyncio
from datetime import datetime
from fastapi import FastAPI, WebSocket, Request
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Real-Time Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Patna', 'Hyderabad']

city_data = {
    city: {
        "total_events": random.randint(100000, 500000),
        "avg_speed": round(random.uniform(35, 55), 1),
        "delivering": random.randint(10000, 50000),
        "idle": random.randint(10000, 50000),
        "returning": random.randint(10000, 50000),
    }
    for city in CITIES
}

history_data = []

def update_data():
    for city in CITIES:
        city_data[city]["total_events"] += random.randint(100, 500)
        city_data[city]["avg_speed"] = round(random.uniform(35, 65), 1)
        city_data[city]["delivering"] += random.randint(-50, 100)
        city_data[city]["idle"] += random.randint(-50, 100)
        city_data[city]["returning"] += random.randint(-50, 100)

def get_stats():
    update_data()
    return [
        {
            "city": city,
            "total_events": city_data[city]["total_events"],
            "avg_speed": city_data[city]["avg_speed"],
            "delivering": max(0, city_data[city]["delivering"]),
            "idle": max(0, city_data[city]["idle"]),
            "returning": max(0, city_data[city]["returning"]),
        }
        for city in CITIES
    ]

def update_history():
    stats = get_stats()
    entry = {"time": datetime.now().strftime("%H:%M:%S")}
    for s in stats:
        entry[s["city"]] = s["avg_speed"]
    history_data.append(entry)
    if len(history_data) > 20:
        history_data.pop(0)
    return stats

@app.get("/")
def root():
    return {"message": "Real-Time Analytics Engine is Live!"}

@app.post("/token")
async def login(request: Request):
    form = await request.form()
    username = form.get("username")
    password = form.get("password")
    if username == "admin" and password == "admin123":
        return {"access_token": "demo-token-admin", "token_type": "bearer"}
    from fastapi import HTTPException
    raise HTTPException(status_code=400, detail="Invalid credentials")

@app.get("/api/public/stats")
def get_public_stats():
    return {"cities": update_history()}

@app.get("/api/history")
def get_history():
    return {"history": history_data}

@app.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = get_stats()
            await websocket.send_text(json.dumps(data))
            await asyncio.sleep(2)
    except:
        pass