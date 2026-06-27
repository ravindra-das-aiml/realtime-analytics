import json
import redis
from kafka import KafkaConsumer
from pymongo import MongoClient
from datetime import datetime

r = redis.Redis(host='localhost', port=6379, decode_responses=True)

MONGO_URL = "mongodb+srv://ravindramalhotra09_db_user:Ravindramalhotra7250@realtime-analytics.t7hliq4.mongodb.net/analytics?appName=realtime-analytics"

mongo = MongoClient(MONGO_URL)
db = mongo['analytics']
events_collection = db['events']

consumer = KafkaConsumer(
    'location-events',
    bootstrap_servers='localhost:9092',
    value_deserializer=lambda v: json.loads(v.decode('utf-8')),
    auto_offset_reset='latest',
    group_id='analytics-group-v3'
)

print("Consumer started — saving to MongoDB Atlas...")

batch = []
count = 0

for message in consumer:
    event = message.value
    city = event['city']
    speed = event['speed_kmh']
    status = event['status']

    r.incr(f"city:{city}:total_events")
    r.lpush(f"city:{city}:speeds", speed)
    r.ltrim(f"city:{city}:speeds", 0, 99)
    r.incr(f"city:{city}:status:{status}")

    event['saved_at'] = datetime.utcnow()
    batch.append(event)

    if len(batch) >= 100:
        events_collection.insert_many(batch)
        batch = []

    count += 1
    if count % 500 == 0:
        print(f"✅ {count} events | {city} | MongoDB Atlas mein save!")