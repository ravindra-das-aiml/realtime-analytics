import json
import time
import random
import threading
from kafka import KafkaProducer
from faker import Faker

fake = Faker('en_IN')

CITIES = {
    'Mumbai':    {'lat': (18.89, 19.26), 'lng': (72.77, 72.98)},
    'Delhi':     {'lat': (28.40, 28.88), 'lng': (76.84, 77.35)},
    'Bangalore': {'lat': (12.83, 13.14), 'lng': (77.46, 77.75)},
    'Patna':     {'lat': (25.55, 25.65), 'lng': (85.08, 85.22)},
    'Hyderabad': {'lat': (17.30, 17.50), 'lng': (78.35, 78.55)},
}

def create_producer():
    return KafkaProducer(
        bootstrap_servers='localhost:9092',
        value_serializer=lambda v: json.dumps(v).encode('utf-8'),
        batch_size=16384,
        linger_ms=5,
        compression_type='gzip'
    )

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

# Counter shared across threads
counter = {'count': 0}
lock = threading.Lock()

def producer_thread(thread_id):
    producer = create_producer()
    while True:
        event = generate_event()
        producer.send('location-events', value=event)
        with lock:
            counter['count'] += 1

def main():
    print("🚀 High-Performance Producer starting — Target: 10,000 events/sec")
    
    # 10 threads — each sending 1000 events/sec = 10,000 total
    num_threads = 10
    threads = []
    for i in range(num_threads):
        t = threading.Thread(target=producer_thread, args=(i,), daemon=True)
        t.start()
        threads.append(t)
    
    print(f"✅ {num_threads} producer threads started!")
    
    # Print stats every second
    while True:
        time.sleep(1)
        with lock:
            count = counter['count']
            counter['count'] = 0
        print(f"⚡ Events/sec: {count:,} | Total threads: {num_threads}")

if __name__ == '__main__':
    main()