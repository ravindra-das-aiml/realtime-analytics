import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

# Test 1: Root endpoint
def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Real-Time Analytics Engine is Live!"}

# Test 2: Public stats endpoint
def test_public_stats():
    response = client.get("/api/public/stats")
    assert response.status_code == 200
    data = response.json()
    assert "cities" in data
    assert len(data["cities"]) == 5

# Test 3: History endpoint
def test_history():
    response = client.get("/api/history")
    assert response.status_code == 200
    assert "history" in response.json()

# Test 4: Protected endpoint without token
def test_stats_without_token():
    response = client.get("/api/stats")
    assert response.status_code == 401

# Test 5: Login with wrong credentials
def test_login_wrong_credentials():
    response = client.post("/token", data={"username": "wrong", "password": "wrong"})
    assert response.status_code == 400

# Test 6: Login with correct credentials
def test_login_correct():
    response = client.post("/token", data={"username": "admin", "password": "admin123"})
    assert response.status_code == 200
    assert "access_token" in response.json()