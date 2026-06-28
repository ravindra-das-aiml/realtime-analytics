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
    group_id='analytics-group-v6'
)

print("Consumer started — saving to Upstash Redis...")

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

    count += 1
    if count % 500 == 0:
        print(f"✅ {count} events | {city} | Upstash Redis mein save!")