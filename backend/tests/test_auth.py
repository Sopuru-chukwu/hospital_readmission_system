import sys
from pathlib import Path
from fastapi.testclient import TestClient

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.append(str(backend_dir))

from main import app

client = TestClient(app)

def test_login_demo_physician():
    """Test login with pre-seeded demo physician credentials."""
    payload = {
        "email": "dr.babatunde@hospital.ng",
        "password": "password123"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "dr.babatunde@hospital.ng"
    assert data["user"]["role"] == "Physician"

def test_login_invalid_password():
    """Test login with wrong password."""
    payload = {
        "email": "dr.babatunde@hospital.ng",
        "password": "wrongpassword"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401

def test_get_me_endpoint():
    """Test GET /api/v1/auth/me with valid Bearer token."""
    # 1. Login
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "dr.babatunde@hospital.ng",
        "password": "password123"
    })
    token = login_resp.json()["access_token"]

    # 2. Get ME profile
    headers = {"Authorization": f"Bearer {token}"}
    me_resp = client.get("/api/v1/auth/me", headers=headers)
    assert me_resp.status_code == 200
    user_data = me_resp.json()
    assert user_data["full_name"] == "Dr. Babatunde Ogunlesi"
    assert user_data["role"] == "Physician"
