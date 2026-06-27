\## ⚡ Tech Stack



| Layer | Technology |

|-------|-----------|

| Message Queue | Apache Kafka |

| Cache | Redis |

| Database | MongoDB |

| Backend | Python + FastAPI |

| Frontend | React.js + Recharts |

| DevOps | Docker + Docker Compose |



\## 🚀 Features



\- Real-time GPS event processing (100 events/sec)

\- Live city-wise driver tracking (Mumbai, Delhi, Bangalore, Patna, Hyderabad)

\- WebSocket live dashboard — updates every 2 seconds

\- Persistent storage in MongoDB

\- REST API + Interactive Swagger docs



\## 📦 Quick Start



\### Prerequisites

\- Docker Desktop

\- Python 3.x

\- Node.js



\### Run the project



\*\*Step 1: Start all services\*\*

```bash

docker-compose up -d

```



\*\*Step 2: Start Producer\*\*

```bash

cd producer

python gps\_producer.py

```



\*\*Step 3: Start Consumer\*\*

```bash

cd consumer

python kafka\_consumer.py

```



\*\*Step 4: Start API\*\*

```bash

cd api

python -m uvicorn main:app --reload --port 8000

```



\*\*Step 5: Start Dashboard\*\*

```bash

cd frontend

npm start

```



\## 📊 API Endpoints



| Method | Endpoint | Description |

|--------|----------|-------------|

| GET | /api/stats | Live city statistics |

| WS | /ws/live | WebSocket live stream |

| GET | /docs | Swagger API docs |



\## 👨‍💻 Author

Ravindra Das — B.Tech CSE

GitHub: github.com/ravindra-das-aiml

