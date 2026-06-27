import json
import redis
from kafka import KafkaConsumer
from pymongo import MongoClient
from datetime import datetime

# Redis connection
r = redis.Redis(host='localhost', port=6379, decode_responses=True)

# MongoDB connection
mongo = MongoClient('mongodb://localhost:27017/')
db = mongo['analytics']
events_collection = db['events']

# Kafka Consumer
consumer = KafkaConsumer(
    'location-events',
    bootstrap_servers='localhost:9092',
    value_deserializer=lambda v: json.loads(v.decode('utf-8')),
    auto_offset_reset='latest',
    group_id='analytics-group-v2'
)

print("Consumer started — listening to Kafka...")

batch = []
count = 0

for message in consumer:
    event = message.value
    city = event['city']
    speed = event['speed_kmh']
    status = event['status']

    # Redis live stats
    r.incr(f"city:{city}:total_events")
    r.lpush(f"city:{city}:speeds", speed)
    r.ltrim(f"city:{city}:speeds", 0, 99)
    r.incr(f"city:{city}:status:{status}")

    # MongoDB batch insert
    event['saved_at'] = datetime.utcnow()
    batch.append(event)

    # Insert every 100 events
    if len(batch) >= 100:
        events_collection.insert_many(batch)
        batch = []

    count += 1
    if count % 500 == 0:
        total = int(r.get(f"city:{city}:total_events") or 0)
        speeds = r.lrange(f"city:{city}:speeds", 0, -1)
        avg_speed = sum(float(s) for s in speeds) / len(speeds)
        print(f"✅ {count} events | {city} | Avg Speed: {avg_speed:.1f} km/h | MongoDB saved!")