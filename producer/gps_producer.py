import json
import time
import random
from kafka import KafkaProducer
from faker import Faker

fake = Faker('en_IN')

producer = KafkaProducer(
    bootstrap_servers='localhost:9092',
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

CITIES = {
    'Mumbai':    {'lat': (18.89, 19.26), 'lng': (72.77, 72.98)},
    'Delhi':     {'lat': (28.40, 28.88), 'lng': (76.84, 77.35)},
    'Bangalore': {'lat': (12.83, 13.14), 'lng': (77.46, 77.75)},
    'Patna':     {'lat': (25.55, 25.65), 'lng': (85.08, 85.22)},
    'Hyderabad': {'lat': (17.30, 17.50), 'lng': (78.35, 78.55)},
}

def generate_event():
    city = random.choice(list(CITIES.keys()))
    bounds = CITIES[city]
    return {
        'driver_id': f"DRV{random.randint(1000, 9999)}",
        'city': city,
        'lat': round(random.uniform(*bounds['lat']), 6),
        'lng': round(random.uniform(*bounds['lng']), 6),
        'speed_kmh': round(random.uniform(0, 95), 1),
        'status': random.choice(['delivering', 'idle', 'returning']),
        'timestamp': int(time.time() * 1000)
    }

print("Producer started — sending events to Kafka...")
count = 0
while True:
    event = generate_event()
    producer.send('location-events', value=event)
    count += 1
    if count % 100 == 0:
        print(f"{count} events sent | {event['driver_id']} in {event['city']} @ {event['speed_kmh']} km/h")
    time.sleep(0.01)