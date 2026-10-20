"""
Simple test script to verify backend is working
Run after starting the backend server
"""

import requests
import json

# Configuration
API_URL = "http://localhost:8000"  # Change to 5000 for Flask

def test_health():
    """Test health endpoint"""
    print("\n=== Testing Health Endpoint ===")
    try:
        response = requests.get(f"{API_URL}/health", timeout=5)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_generate_questions():
    """Test question generation"""
    print("\n=== Testing Question Generation ===")
    payload = {
        "topic": "Python Programming",
        "difficulty": "medium",
        "count": 3
    }
    
    try:
        response = requests.post(
            f"{API_URL}/generate-questions",
            json=payload,
            timeout=120
        )
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Success: {data.get('success')}")
        print(f"Questions generated: {data.get('count')}")
        
        if data.get('questions'):
            print("\nSample question:")
            print(f"  {data['questions'][0]['question']}")
        
        return response.status_code == 200 and data.get('success')
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_get_hint():
    """Test hint generation"""
    print("\n=== Testing Hint Generation ===")
    payload = {
        "question": "What is the difference between a list and a tuple in Python?"
    }
    
    try:
        response = requests.post(
            f"{API_URL}/get-hint",
            json=payload,
            timeout=60
        )
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Success: {data.get('success')}")
        
        if data.get('hint'):
            print(f"Hint: {data['hint']}")
        
        return response.status_code == 200 and data.get('success')
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_get_answer():
    """Test answer generation"""
    print("\n=== Testing Answer Generation ===")
    payload = {
        "question": "What is the difference between a list and a tuple in Python?"
    }
    
    try:
        response = requests.post(
            f"{API_URL}/get-answer",
            json=payload,
            timeout=60
        )
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Success: {data.get('success')}")
        
        if data.get('answer'):
            print(f"Answer: {data['answer']}")
            print(f"Explanation: {data['explanation']}")
        
        return response.status_code == 200 and data.get('success')
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print(f"Testing backend at: {API_URL}")
    print("=" * 50)
    
    results = {
        "Health Check": test_health(),
        "Generate Questions": test_generate_questions(),
        "Get Hint": test_get_hint(),
        "Get Answer": test_get_answer()
    }
    
    print("\n" + "=" * 50)
    print("Test Results:")
    for test_name, passed in results.items():
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"  {test_name}: {status}")
    
    all_passed = all(results.values())
    print("\n" + ("All tests passed! ✓" if all_passed else "Some tests failed ✗"))
