import os
import sys

# Add backend directory to sys.path to allow imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.llm import generate_answer

def test_ollama():
    try:
        print("Testing generate_answer directly...")
        answer = generate_answer("What is the capital of France? Please keep it short.")
        print(f"Success! Answer: {answer}")
    except Exception as e:
        print(f"Error: {type(e).__name__} - {e}")

if __name__ == "__main__":
    test_ollama()
