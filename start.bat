@echo off
echo Starting Real-Time Analytics Engine...

echo Starting Docker containers...
cd "C:\Users\RAVINDRA DAS\realtime-analytics"
docker-compose up -d

echo Waiting for Kafka to be ready...
timeout /t 15

echo Starting Producer...
start cmd /k "cd C:\Users\RAVINDRA DAS\realtime-analytics\producer && python gps_producer.py"

echo Starting Consumer...
start cmd /k "cd C:\Users\RAVINDRA DAS\realtime-analytics\consumer && python kafka_consumer.py"

echo Starting API...
start cmd /k "cd C:\Users\RAVINDRA DAS\realtime-analytics\api && python -m uvicorn main:app --reload --port 8000"

echo Starting Frontend...
start cmd /k "cd C:\Users\RAVINDRA DAS\realtime-analytics\frontend && npm start"

echo All services started!
echo Dashboard: http://localhost:3000
pause