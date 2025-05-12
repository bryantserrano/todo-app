from fastapi.testclient import TestClient
from main import app  
import uuid

client = TestClient(app)

def test_read_tasks():
    response = client.get("/tasks")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_task():
    unique_title = f"Test Task {uuid.uuid4()}"
    payload = {
        "title": unique_title,
        "description": "Testing task creation"
    }
    response = client.post("/tasks", json=payload)
    assert response.status_code in (200, 201)
    data = response.json()
    assert "id" in data