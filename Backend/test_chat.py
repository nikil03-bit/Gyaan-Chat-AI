import requests

def test_chat():
    url = "http://127.0.0.1:8000/chat/"
    payload = {
        "tenant_id": "test_tenant",
        "question": "What is the capital of France?"
    }
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_chat()
