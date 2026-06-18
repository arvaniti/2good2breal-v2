"""
Refactor regression test suite for 2good2breal API.
Validates all endpoints after server.py monolith was split into modular routes/.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin2026"
USER_EMAIL = "johanna112@gmail.com"
USER_PASSWORD = "Johanna2026!"


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
    assert "access_token" in data
    assert data["user"]["email"] == USER_EMAIL
    return data["access_token"]


def auth(token):
    return {"Authorization": f"Bearer {token}"}


# ---------- Health ----------
class TestHealth:
    def test_health(self):
        r = requests.get(f"{BASE_URL}/api/health")
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "healthy"
        assert data["database"] == "connected"


# ---------- Auth flows ----------
class TestAuth:
    def test_admin_login_returns_jwt(self, admin_token):
        # JWT format: three dot-separated segments
        assert admin_token.count(".") == 2

    def test_user_login_returns_token_and_user(self, user_token):
        assert user_token.count(".") == 2

    def test_register_existing_email_returns_400(self):
        r = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": USER_EMAIL,
            "password": "Doesntmatter1!",
            "name": "Dup"
        })
        assert r.status_code == 400, f"expected 400, got {r.status_code} body={r.text}"

    def test_forgot_password_returns_success(self):
        r = requests.post(f"{BASE_URL}/api/auth/forgot-password",
                          json={"email": USER_EMAIL})
        assert r.status_code == 200
        data = r.json()
        # generic success messaging (don't leak which emails exist)
        assert "message" in data or "success" in data


# ---------- Admin endpoints ----------
class TestAdmin:
    def test_admin_analyses_list(self, admin_token):
        r = requests.get(f"{BASE_URL}/api/admin/analyses", headers=auth(admin_token))
        assert r.status_code == 200
        data = r.json()
        # could be a list or {analyses: [...]} - validate both
        if isinstance(data, dict) and "analyses" in data:
            data = data["analyses"]
        assert isinstance(data, list)


# ---------- Packages ----------
class TestPackages:
    def test_packages_returns_three(self):
        r = requests.get(f"{BASE_URL}/api/packages")
        assert r.status_code == 200
        data = r.json()
        if isinstance(data, dict) and "packages" in data:
            data = data["packages"]
        assert isinstance(data, list)
        ids = [p.get("id") for p in data]
        for required in ("basic", "comprehensive", "premium"):
            assert required in ids, f"missing package {required}, got {ids}"


# ---------- User-side endpoints ----------
class TestUserEndpoints:
    def test_stats(self, user_token):
        r = requests.get(f"{BASE_URL}/api/stats", headers=auth(user_token))
        assert r.status_code == 200
        data = r.json()
        assert "total_analyses" in data

    def test_credits(self, user_token):
        r = requests.get(f"{BASE_URL}/api/credits", headers=auth(user_token))
        assert r.status_code == 200
        data = r.json()
        # expect breakdown keys
        keys = set(data.keys())
        # accept any of these shapes
        expected_any = {"basic_credits", "comprehensive_credits", "premium_credits",
                        "free_credits", "credits"}
        assert keys & expected_any, f"no credit keys in {keys}"

    def test_filters(self, user_token):
        r = requests.get(f"{BASE_URL}/api/filters", headers=auth(user_token))
        assert r.status_code == 200
        data = r.json()
        if isinstance(data, dict) and "filters" in data:
            data = data["filters"]
        assert isinstance(data, list)


# ---------- Seeker endpoints (admin-protected) ----------
class TestSeeker:
    def test_seeker_profiles(self, admin_token):
        r = requests.get(f"{BASE_URL}/api/seeker/profiles", headers=auth(admin_token))
        assert r.status_code == 200, f"got {r.status_code} body={r.text[:200]}"
        data = r.json()
        if isinstance(data, dict):
            # accept {profiles:[...]} shape
            data = data.get("profiles", data.get("data", []))
        assert isinstance(data, list)

    def test_seeker_comparisons(self, admin_token):
        r = requests.get(f"{BASE_URL}/api/seeker/comparisons", headers=auth(admin_token))
        assert r.status_code == 200, f"got {r.status_code} body={r.text[:200]}"
        data = r.json()
        if isinstance(data, dict):
            data = data.get("comparisons", data.get("data", []))
        assert isinstance(data, list)


# ---------- Unauthorized access ----------
class TestSecurity:
    def test_admin_endpoint_requires_auth(self):
        r = requests.get(f"{BASE_URL}/api/admin/analyses")
        assert r.status_code in (401, 403)

    def test_user_endpoint_requires_auth(self):
        r = requests.get(f"{BASE_URL}/api/stats")
        assert r.status_code in (401, 403)
