import json
import redis
from kafka import KafkaConsumer

# Local Redis
r = redis.Redis(
    host='localhost',
    port=6379,
    decode_responses=True
)

consumer = KafkaConsumer(
    'location-events',
    bootstrap_servers='localhost:9092',
    value_deserializer=lambda v: json.loads(v.decode('utf-8')),
    auto_offset_reset='latest',
    group_id='analytics-group-v9',
    fetch_max_bytes=52428800,
    max_poll_records=500
)

print("Consumer started — Local Redis Pipelining enabled...")

batch = []
count = 0

for message in consumer:
    batch.append(message.value)
    
    if len(batch) >= 100:
        pipe = r.pipeline()
        for event in batch:
            city = event['city']
            speed = event['speed_kmh']
            status = event['status']
            pipe.incr(f"city:{city}:total_events")
            pipe.lpush(f"city:{city}:speeds", speed)
            pipe.ltrim(f"city:{city}:speeds", 0, 99)
            pipe.incr(f"city:{city}:status:{status}")
        pipe.execute()
        
        count += len(batch)
        city = batch[-1]['city']
        print(f"✅ {count} events | {city} | Local Redis Pipeline executed!")
        batch = []