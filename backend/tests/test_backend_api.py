"""
Backend API tests for PocketBill
Tests the /api/status endpoints
"""
import pytest
import requests
import os

# Get backend URL from environment
BASE_URL = os.environ.get('EXPO_PUBLIC_BACKEND_URL')
if not BASE_URL:
    raise ValueError("EXPO_PUBLIC_BACKEND_URL environment variable not set")
BASE_URL = BASE_URL.rstrip('/')

class TestBackendAPI:
    """Test backend API endpoints"""

    def test_root_endpoint(self):
        """Test GET /api/ returns Hello World"""
        try:
            response = requests.get(f"{BASE_URL}/api/", timeout=10)
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            
            data = response.json()
            assert "message" in data, "Response should contain 'message' field"
            assert data["message"] == "Hello World", f"Expected 'Hello World', got {data['message']}"
            print("✓ Root endpoint test passed")
        except Exception as e:
            print(f"✗ Root endpoint test failed: {str(e)}")
            raise

    def test_create_status_check(self):
        """Test POST /api/status creates a status check"""
        try:
            payload = {"client_name": "TEST_PocketBill_Client"}
            response = requests.post(f"{BASE_URL}/api/status", json=payload, timeout=10)
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            
            data = response.json()
            assert "id" in data, "Response should contain 'id' field"
            assert "client_name" in data, "Response should contain 'client_name' field"
            assert data["client_name"] == payload["client_name"], f"Expected {payload['client_name']}, got {data['client_name']}"
            assert "timestamp" in data, "Response should contain 'timestamp' field"
            
            print(f"✓ Create status check test passed - ID: {data['id']}")
        except Exception as e:
            print(f"✗ Create status check test failed: {str(e)}")
            raise

    def test_get_status_checks(self):
        """Test GET /api/status returns list of status checks"""
        try:
            # First create a status check
            payload = {"client_name": "TEST_PocketBill_GetTest"}
            create_response = requests.post(f"{BASE_URL}/api/status", json=payload, timeout=10)
            assert create_response.status_code == 200, "Failed to create test status check"
            created_id = create_response.json()["id"]
            
            # Now get all status checks
            response = requests.get(f"{BASE_URL}/api/status", timeout=10)
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            
            data = response.json()
            assert isinstance(data, list), "Response should be a list"
            assert len(data) > 0, "Should have at least one status check"
            
            # Verify the created status check is in the list
            found = any(item["id"] == created_id for item in data)
            assert found, f"Created status check with ID {created_id} not found in list"
            
            print(f"✓ Get status checks test passed - Found {len(data)} status checks")
        except Exception as e:
            print(f"✗ Get status checks test failed: {str(e)}")
            raise

    def test_status_check_persistence(self):
        """Test that status checks persist in database"""
        try:
            # Create a status check
            payload = {"client_name": "TEST_PocketBill_Persistence"}
            create_response = requests.post(f"{BASE_URL}/api/status", json=payload, timeout=10)
            assert create_response.status_code == 200
            created_data = create_response.json()
            created_id = created_data["id"]
            
            # Get all status checks and verify it exists
            get_response = requests.get(f"{BASE_URL}/api/status", timeout=10)
            assert get_response.status_code == 200
            
            all_checks = get_response.json()
            persisted_check = next((item for item in all_checks if item["id"] == created_id), None)
            
            assert persisted_check is not None, f"Status check {created_id} not found after creation"
            assert persisted_check["client_name"] == payload["client_name"], "Client name mismatch"
            # Timestamps may differ slightly due to MongoDB precision, just verify both exist
            assert "timestamp" in persisted_check, "Persisted check should have timestamp"
            assert "timestamp" in created_data, "Created data should have timestamp"
            
            print(f"✓ Status check persistence test passed - ID: {created_id}")
        except Exception as e:
            print(f"✗ Status check persistence test failed: {str(e)}")
            raise
