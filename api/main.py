import json
import asyncio
import redis
import certifi
from datetime import datetime
from fastapi import FastAPI, WebSocket, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pymongo import MongoClient
from auth import verify_password, create_access_token, verify_token, USERS_DB

app = FastAPI(title="Real-Time Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Upstash Redis
r = redis.Redis(
    host='square-molly-76911.upstash.io',
    port=6379,
    password='gQAAAAAAASxvAAIgcDFiODQ2ZmRhMzA0YWM0NWIzOTA3NWIyYTY2MmE1YTA1Ng',
    ssl=True,
    decode_responses=True
)

# MongoDB Atlas
MONGO_URL = "mongodb+srv://ravindramalhotra09_db_user:Ravindramalhotra7250@realtime-analytics.t7hliq4.mongodb.net/analytics?appName=realtime-analytics"
mongo = MongoClient(MONGO_URL, tlsCAFile=certifi.where())
db = mongo['analytics']

CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Patna', 'Hyderabad']

# History storage for line chart
history_data = []
MAX_HISTORY = 20

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme)):
    username = verify_token(token)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token")
    return username

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

def update_history():
    stats = get_city_stats()
    entry = {"time": datetime.now().strftime("%H:%M:%S")}
    for s in stats:
        entry[s["city"]] = s["avg_speed"]
    history_data.append(entry)
    if len(history_data) > MAX_HISTORY:
        history_data.pop(0)
    return stats

@app.get("/")
def root():
    return {"message": "Real-Time Analytics Engine is Live!"}

# Login endpoint
@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = USERS_DB.get(form_data.username)
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    token = create_access_token({"sub": form_data.username})
    return {"access_token": token, "token_type": "bearer"}

# Protected endpoint
@app.get("/api/stats")
def get_stats(current_user: str = Depends(get_current_user)):
    return {"cities": update_history(), "user": current_user}

# Public endpoint
@app.get("/api/public/stats")
def get_public_stats():
    return {"cities": update_history()}

# History endpoint for line chart
@app.get("/api/history")
def get_history():
    return {"history": history_data}

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