import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://colabrise-bold.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"


@pytest.fixture
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# Root welcome
def test_root_welcome(client):
    r = client.get(f"{API}/")
    assert r.status_code == 200
    data = r.json()
    assert "message" in data
    assert "ColabRise" in data["message"]


# POST /api/leads happy path
def test_create_lead_success(client):
    payload = {
        "name": "TEST_Ada Lovelace",
        "email": "test_ada@example.com",
        "company": "TEST_Brand Co",
        "budget": "$5k–$15k/mo",
        "message": "TEST launch campaign",
    }
    r = client.post(f"{API}/leads", json=payload)
    assert r.status_code == 201, r.text
    data = r.json()
    assert data["name"] == payload["name"]
    assert data["email"] == payload["email"]
    assert data["company"] == payload["company"]
    assert data["budget"] == payload["budget"]
    assert data["message"] == payload["message"]
    assert "id" in data and isinstance(data["id"], str) and len(data["id"]) > 0
    assert "created_at" in data
    # ISO timestamp check
    from datetime import datetime
    datetime.fromisoformat(data["created_at"].replace("Z", "+00:00"))


# Invalid email -> 422
def test_create_lead_invalid_email(client):
    r = client.post(f"{API}/leads", json={
        "name": "TEST_Bad", "email": "notanemail"
    })
    assert r.status_code == 422


# Missing name -> 422
def test_create_lead_missing_name(client):
    r = client.post(f"{API}/leads", json={"email": "test_missing@example.com"})
    assert r.status_code == 422


# GET /api/leads contains newly created lead sorted desc
def test_list_leads_contains_new(client):
    payload = {
        "name": "TEST_SortCheck",
        "email": "test_sort@example.com",
    }
    cr = client.post(f"{API}/leads", json=payload)
    assert cr.status_code == 201
    new_id = cr.json()["id"]

    lr = client.get(f"{API}/leads")
    assert lr.status_code == 200
    leads = lr.json()
    assert isinstance(leads, list) and len(leads) >= 1
    ids = [l["id"] for l in leads]
    assert new_id in ids

    # sorted desc by created_at
    ts = [l["created_at"] for l in leads]
    assert ts == sorted(ts, reverse=True)
