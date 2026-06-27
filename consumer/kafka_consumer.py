import json
import redis
from kafka import KafkaConsumer

# Redis connection
r = redis.Redis(host='localhost', port=6379, decode_responses=True)

# Kafka Consumer
consumer = KafkaConsumer(
    'location-events',
    bootstrap_servers='localhost:9092',
    value_deserializer=lambda v: json.loads(v.decode('utf-8')),
    auto_offset_reset='latest',
    group_id='analytics-group'
)

print("Consumer started — listening to Kafka...")

for message in consumer:
    event = message.value
    city = event['city']
    speed = event['speed_kmh']
    status = event['status']

    # City wise driver count
    r.incr(f"city:{city}:total_events")

    # Speed tracking (running average)
    r.lpush(f"city:{city}:speeds", speed)
    r.ltrim(f"city:{city}:speeds", 0, 99)  # Last 100 speeds only

    # Status count
    r.incr(f"city:{city}:status:{status}")

    # Print every 100 messages
    total = int(r.get(f"city:{city}:total_events") or 0)
    if total % 100 == 0:
        speeds = r.lrange(f"city:{city}:speeds", 0, -1)
        avg_speed = sum(float(s) for s in speeds) / len(speeds)
        print(f"City: {city} | Total Events: {total} | Avg Speed: {avg_speed:.1f} km/h")