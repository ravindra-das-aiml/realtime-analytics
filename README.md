# Real-Time Analytics Engine 🚀

A production-grade real-time data analytics platform inspired by Uber/Zomato architecture. Processes 100+ events/second from multiple Indian cities using distributed systems.

## 🌐 Live Demo
- **Dashboard:** https://realtime-analytics-dashboard-jet.vercel.app
- **API:** https://realtime-analytics-api.onrender.com/docs
- **Login:** admin / admin123

## 🏗️ System Architecture

**Step 1:** GPS Simulator generates fake delivery events (Mumbai, Delhi, Bangalore, Patna, Hyderabad)

**Step 2:** Events are sent to Apache Kafka (Message Queue)

**Step 3:** Kafka Consumer reads events and saves to:
- Upstash Redis — for live real-time stats
- MongoDB Atlas — for permanent storage

**Step 4:** FastAPI reads from Redis and serves REST API + WebSocket

**Step 5:** React.js Dashboard shows live data every 3 seconds

## ⚡ Tech Stack

| Layer | Technology |
|-------|-----------|
| Message Queue | Apache Kafka |
| Cache | Upstash Redis (Cloud) |
| Database | MongoDB Atlas (Cloud) |
| Backend | Python + FastAPI |
| Authentication | JWT Token |
| Frontend | React.js + Recharts |
| DevOps | Docker + Docker Compose |
| Deployment | Render + Vercel |

## 🚀 Features

- ⚡ Real-time GPS event processing (100+ events/sec)
- 🏙️ Live city-wise driver tracking (Mumbai, Delhi, Bangalore, Patna, Hyderabad)
- 🔐 JWT Authentication — Login/Logout system
- 🗺️ Live SVG City Map — event bubbles
- 📊 Bar Chart — Driver status by city
- 🥧 Pie Chart — Total events distribution
- 📈 Line Chart — Speed trend over time
- 🚨 Sound Alert System — triggers on high speed (60+ km/h)
- 📱 Mobile Responsive Design
- 🗄️ MongoDB Indexing — optimized queries

## 📦 Quick Start

### Prerequisites
- Docker Desktop
- Python 3.x
- Node.js

### Run the project

**Step 1: Start all services**
```bash
docker-compose up -d
```

**Step 2: Start Producer**
```bash
cd producer
python gps_producer.py
```

**Step 3: Start Consumer**
```bash
cd consumer
python kafka_consumer.py
```

**Step 4: Start API**
```bash
cd api
python -m uvicorn main:app --reload --port 8000
```

**Step 5: Start Dashboard**
```bash
cd frontend
npm start
```

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /token | Login — get JWT token |
| GET | /api/stats | Protected — live city stats |
| GET | /api/public/stats | Public — live city stats |
| GET | /api/history | Speed history for line chart |
| WS | /ws/live | WebSocket live stream |
| GET | /docs | Swagger API docs |

## 🗄️ Database Optimization

MongoDB compound indexes for fast queries:
- city + timestamp — city-wise historical queries
- status — filter by driver status

## 👨‍💻 Author
**Ravindra Das** — B.Tech CSE
- GitHub: https://github.com/ravindra-das-aiml
- Project: https://github.com/ravindra-das-aiml/realtime-analytics