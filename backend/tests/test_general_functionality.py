"""
Comprehensive General Functionality Tests for 2good2breal
Tests all major features: Auth, Admin, Submissions, DOCX download, etc.
"""
import pytest
import requests
import os
import json

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://profile-check-9.preview.emergentagent.com')

# Test credentials from environment or test_credentials.md
ADMIN_USERNAME = os.environ.get('TEST_ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.environ.get('TEST_ADMIN_PASSWORD', 'admin2026')
USER_EMAIL = os.environ.get('TEST_USER_EMAIL', 'test@test.com')
USER_PASSWORD = os.environ.get('TEST_USER_PASSWORD', 'Test1234!')


class TestHealthAndBasics:
    """Basic health and connectivity tests"""
    
    def test_health_endpoint(self):
        """Test API health check endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "database" in data
        print(f"✅ Health check passed: {data}")
    
    def test_root_endpoint(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✅ Root endpoint: {data}")
    
    def test_packages_endpoint(self):
        """Test pricing packages endpoint"""
        response = requests.get(f"{BASE_URL}/api/packages")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 3  # basic, comprehensive, premium
        package_ids = [p["id"] for p in data]
        assert "basic" in package_ids
        assert "comprehensive" in package_ids
        assert "premium" in package_ids
        print(f"✅ Packages endpoint: {len(data)} packages found")


class TestUserAuthentication:
    """User authentication flow tests"""
    
    def test_user_login_success(self):
        """Test user login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": USER_EMAIL,
            "password": USER_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == USER_EMAIL
        print(f"✅ User login successful: {data['user']['email']}")
        return data["access_token"]
    
    def test_user_login_invalid_credentials(self):
        """Test user login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@email.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✅ Invalid credentials correctly rejected")
    
    def test_user_registration_duplicate_email(self):
        """Test that duplicate email registration is rejected"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": USER_EMAIL,
            "password": "TestPass123!",
            "name": "Test User"
        })
        assert response.status_code == 400
        print("✅ Duplicate email registration correctly rejected")
    
    def test_get_current_user(self):
        """Test getting current user info with valid token"""
        # First login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": USER_EMAIL,
            "password": USER_PASSWORD
        })
        token = login_response.json()["access_token"]
        
        # Get user info
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == USER_EMAIL
        assert "basic_credits" in data
        assert "comprehensive_credits" in data
        assert "premium_credits" in data
        print(f"✅ Get current user: {data['email']}, credits: basic={data['basic_credits']}, comprehensive={data['comprehensive_credits']}, premium={data['premium_credits']}")


class TestAdminAuthentication:
    """Admin authentication flow tests"""
    
    def test_admin_login_success(self):
        """Test admin login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data.get("is_admin") == True
        print(f"✅ Admin login successful")
        return data["access_token"]
    
    def test_admin_login_invalid_credentials(self):
        """Test admin login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "wrongadmin",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✅ Invalid admin credentials correctly rejected")


class TestAdminDashboard:
    """Admin dashboard functionality tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Admin login failed")
    
    def test_get_all_analyses(self, admin_token):
        """Test getting all analyses as admin"""
        response = requests.get(f"{BASE_URL}/api/admin/analyses", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Admin analyses list: {len(data)} submissions found")
        
        # Check structure of first submission if exists
        if len(data) > 0:
            submission = data[0]
            assert "id" in submission
            assert "profile_name" in submission
            assert "status" in submission
            assert "user_email" in submission
            print(f"  First submission: {submission['profile_name']} - Status: {submission['status']}")
        return data
    
    def test_get_single_analysis(self, admin_token):
        """Test getting a single analysis by ID"""
        # First get list of analyses
        list_response = requests.get(f"{BASE_URL}/api/admin/analyses", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        analyses = list_response.json()
        
        if len(analyses) == 0:
            pytest.skip("No analyses available to test")
        
        analysis_id = analyses[0]["id"]
        response = requests.get(f"{BASE_URL}/api/admin/analyses/{analysis_id}", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == analysis_id
        assert "form_data" in data
        assert "ai_analysis" in data or data.get("ai_analysis") is None
        print(f"✅ Single analysis retrieved: {data['profile_name']}")
    
    def test_admin_analyses_unauthorized(self):
        """Test that admin endpoints require authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/analyses")
        assert response.status_code in [401, 403]
        print("✅ Admin endpoint correctly requires authentication")


class TestDocxDownload:
    """DOCX download functionality tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Admin login failed")
    
    def test_download_submission_docx(self, admin_token):
        """Test downloading submission as DOCX"""
        # First get list of analyses
        list_response = requests.get(f"{BASE_URL}/api/admin/analyses", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        analyses = list_response.json()
        
        if len(analyses) == 0:
            pytest.skip("No analyses available to test DOCX download")
        
        analysis_id = analyses[0]["id"]
        response = requests.get(f"{BASE_URL}/api/admin/analyses/{analysis_id}/submission-docx", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        assert response.status_code == 200
        assert "application/vnd.openxmlformats-officedocument.wordprocessingml.document" in response.headers.get("content-type", "")
        assert len(response.content) > 1000  # DOCX should have substantial content
        print(f"✅ DOCX download successful: {len(response.content)} bytes")
    
    def test_download_report_docx(self, admin_token):
        """Test downloading report as DOCX"""
        # First get list of analyses
        list_response = requests.get(f"{BASE_URL}/api/admin/analyses", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        analyses = list_response.json()
        
        if len(analyses) == 0:
            pytest.skip("No analyses available to test DOCX download")
        
        analysis_id = analyses[0]["id"]
        response = requests.get(f"{BASE_URL}/api/admin/analyses/{analysis_id}/download-docx", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        assert response.status_code == 200
        assert "application/vnd.openxmlformats-officedocument.wordprocessingml.document" in response.headers.get("content-type", "")
        print(f"✅ Report DOCX download successful: {len(response.content)} bytes")
    
    def test_download_submission_pdf(self, admin_token):
        """Test downloading submission as PDF"""
        # First get list of analyses
        list_response = requests.get(f"{BASE_URL}/api/admin/analyses", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        analyses = list_response.json()
        
        if len(analyses) == 0:
            pytest.skip("No analyses available to test PDF download")
        
        analysis_id = analyses[0]["id"]
        response = requests.get(f"{BASE_URL}/api/admin/analyses/{analysis_id}/submission-pdf", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        assert response.status_code == 200
        assert "application/pdf" in response.headers.get("content-type", "")
        print(f"✅ PDF download successful: {len(response.content)} bytes")


class TestUserDashboard:
    """User dashboard functionality tests"""
    
    @pytest.fixture
    def user_token(self):
        """Get user token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": USER_EMAIL,
            "password": USER_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("User login failed")
    
    def test_get_user_analyses(self, user_token):
        """Test getting user's own analyses"""
        response = requests.get(f"{BASE_URL}/api/analyses", headers={
            "Authorization": f"Bearer {user_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ User analyses list: {len(data)} submissions found")
    
    def test_get_user_credits(self, user_token):
        """Test getting user credits"""
        response = requests.get(f"{BASE_URL}/api/credits", headers={
            "Authorization": f"Bearer {user_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert "basic_credits" in data
        assert "comprehensive_credits" in data
        assert "premium_credits" in data
        assert "total_analyses_available" in data
        print(f"✅ User credits: total={data['total_analyses_available']}")
    
    def test_get_user_stats(self, user_token):
        """Test getting user statistics"""
        response = requests.get(f"{BASE_URL}/api/stats", headers={
            "Authorization": f"Bearer {user_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert "total_analyses" in data
        print(f"✅ User stats: total_analyses={data['total_analyses']}")


class TestPasswordReset:
    """Password reset functionality tests"""
    
    def test_forgot_password_endpoint(self):
        """Test forgot password endpoint (should always return success for security)"""
        response = requests.post(f"{BASE_URL}/api/auth/forgot-password", json={
            "email": "nonexistent@email.com"
        })
        # Should return 200 even for non-existent emails (security best practice)
        assert response.status_code == 200
        print("✅ Forgot password endpoint works correctly")
    
    def test_verify_reset_token_invalid(self):
        """Test verifying an invalid reset token"""
        response = requests.get(f"{BASE_URL}/api/auth/verify-reset-token/invalid-token-12345")
        assert response.status_code == 400
        print("✅ Invalid reset token correctly rejected")


class TestFilters:
    """User filters functionality tests"""
    
    @pytest.fixture
    def user_token(self):
        """Get user token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": USER_EMAIL,
            "password": USER_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("User login failed")
    
    def test_get_filters(self, user_token):
        """Test getting user filters"""
        response = requests.get(f"{BASE_URL}/api/filters", headers={
            "Authorization": f"Bearer {user_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ User filters: {len(data)} filters found")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
