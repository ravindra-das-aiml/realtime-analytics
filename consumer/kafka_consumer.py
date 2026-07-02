import json
import redis
from kafka import KafkaConsumer

# Upstash Redis
r = redis.Redis(
    host='square-molly-76911.upstash.io',
    port=6379,
    password='gQAAAAAAASxvAAIgcDFiODQ2ZmRhMzA0YWM0NWIzOTA3NWIyYTY2MmE1YTA1Ng',
    ssl=True,
    decode_responses=True
)

consumer = KafkaConsumer(
    'location-events',
    bootstrap_servers='localhost:9092',
    value_deserializer=lambda v: json.loads(v.decode('utf-8')),
    auto_offset_reset='latest',
    group_id='analytics-group-v7',
    fetch_max_bytes=52428800,
    max_poll_records=500
)

print("Consumer started — Redis Pipelining enabled...")

batch = []
count = 0

for message in consumer:
    batch.append(message.value)
    
    if len(batch) >= 100:
        # Redis Pipeline — batch operations (10x faster!)
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
        print(f"✅ {count} events | {city} | Redis Pipeline executed!")
        batch = []