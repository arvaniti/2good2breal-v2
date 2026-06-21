"""
Refactor regression test suite for 2good2breal API.
Validates all endpoints after server.py monolith was split into modular routes/.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin2026')
USER_EMAIL = os.environ.get('TEST_USER_EMAIL', 'johanna112@gmail.com')
USER_PASSWORD = os.environ.get('TEST_USER_PASSWORD', 'Johanna2026!')


# ---------- shared fixtures ----------
@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{BASE_URL}/api/admin/login",
                      json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "access_token" in data or "token" in data
    return data.get("access_token") or data.get("token")


@pytest.fixture(scope="module")
def user_token():
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": USER_EMAIL, "password": USER_PASSWORD})
    assert r.status_code == 200, f"user login failed: {r.status_code} {r.text}"
    data = r.json()
    return data.get("access_token") or data.get("token")


def auth(token):
    return {"Authorization": f"Bearer {token}"}


# ---------- Health ----------
def test_health():
    r = requests.get(f"{BASE_URL}/api/health")
    assert r.status_code == 200
    d = r.json()
    assert d["status"] == "healthy"
    assert d["database"] == "connected"


# ---------- Auth ----------
def test_admin_login():
    r = requests.post(f"{BASE_URL}/api/admin/login",
                      json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD})
    assert r.status_code == 200
    assert "access_token" in r.json()


def test_user_login():
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": USER_EMAIL, "password": USER_PASSWORD})
    assert r.status_code == 200
    d = r.json()
    assert "access_token" in d
    assert "user" in d


def test_register_duplicate_email():
    r = requests.post(f"{BASE_URL}/api/auth/register",
                      json={"email": USER_EMAIL, "password": "x", "name": "dup"})
    assert r.status_code == 400


def test_forgot_password():
    r = requests.post(f"{BASE_URL}/api/auth/forgot-password",
                      json={"email": USER_EMAIL})
    assert r.status_code == 200


# ---------- Packages ----------
def test_packages():
    r = requests.get(f"{BASE_URL}/api/packages")
    assert r.status_code == 200
    pkgs = r.json()
    assert len(pkgs) == 3
    names = {p["name"] for p in pkgs}
    assert "Basic Verification" in names
    assert "Comprehensive Verification" in names
    assert "Premium Package" in names


# ---------- Admin endpoints ----------
def test_admin_analyses(admin_token):
    r = requests.get(f"{BASE_URL}/api/admin/analyses", headers=auth(admin_token))
    assert r.status_code == 200
    assert isinstance(r.json(), list)


# ---------- Seeker ----------
def test_seeker_profiles(admin_token):
    r = requests.get(f"{BASE_URL}/api/seeker/profiles", headers=auth(admin_token))
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_seeker_comparisons(admin_token):
    r = requests.get(f"{BASE_URL}/api/seeker/comparisons", headers=auth(admin_token))
    assert r.status_code == 200
    assert isinstance(r.json(), list)


# ---------- User endpoints ----------
def test_user_stats(user_token):
    r = requests.get(f"{BASE_URL}/api/stats", headers=auth(user_token))
    assert r.status_code == 200
    d = r.json()
    assert "total_analyses" in d


def test_user_credits(user_token):
    r = requests.get(f"{BASE_URL}/api/credits", headers=auth(user_token))
    assert r.status_code == 200
    d = r.json()
    assert "basic_credits" in d
    assert "comprehensive_credits" in d
    assert "premium_credits" in d


def test_user_filters(user_token):
    r = requests.get(f"{BASE_URL}/api/filters", headers=auth(user_token))
    assert r.status_code == 200
    assert isinstance(r.json(), list)


# ---------- Unauthorized access ----------
def test_admin_analyses_no_auth():
    r = requests.get(f"{BASE_URL}/api/admin/analyses")
    assert r.status_code in (401, 403)


def test_stats_no_auth():
    r = requests.get(f"{BASE_URL}/api/stats")
    assert r.status_code in (401, 403)
