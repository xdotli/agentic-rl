"""
Test script for the streaming API (SSE-based).
Demonstrates real-time task generation with Server-Sent Events.
"""

import json

import requests


def test_stream_generation():
    """Test the streaming generation endpoint."""
    API_BASE = "http://localhost:8000/api"

    print("=" * 60)
    print("Testing Streaming API")
    print("=" * 60)

    # Step 1: Submit scenario
    print("\n1. Submitting scenario...")
    response = requests.post(
        f"{API_BASE}/submit-scenario",
        json={"scenario": "Create API integration tasks"},
    )
    print(f"   Status: {response.status_code}")

    # Step 2: Start streaming generation
    print("\n2. Starting streaming task generation...")
    response = requests.post(
        f"{API_BASE}/generate-tasks-stream",
        json={"num_tasks": 2, "model": "gpt-5"},
        stream=True,  # Enable streaming
    )

    if response.status_code != 200:
        print(f"   Error: {response.status_code} - {response.text}")
        return False

    print("\n3. Receiving real-time progress updates:\n")

    # Process SSE stream
    for line in response.iter_lines():
        if line:
            line = line.decode("utf-8")
            if line.startswith("data: "):
                data_str = line[6:]  # Remove "data: " prefix
                try:
                    data = json.loads(data_str)
                    msg_type = data.get("type", "unknown")
                    message = data.get("message", "")

                    # Format output based on type
                    if msg_type == "start":
                        print(f"   🎨 {message} (Total: {data.get('total')} tasks)")
                    elif msg_type == "progress":
                        print(f"   [{data.get('current')}/{data.get('total')}] {message}")
                    elif msg_type == "success":
                        task = data.get("task", {})
                        print(
                            f"   ✅ {task.get('name')} ({task.get('difficulty')}) - {task.get('category')}"
                        )
                    elif msg_type == "error":
                        print(f"   ❌ {message}")
                    elif msg_type == "complete":
                        print(
                            f"\n   🎉 {message} ({data.get('generated')}/{data.get('total')} tasks)"
                        )
                    else:
                        print(f"   {message}")

                except json.JSONDecodeError:
                    print(f"   [RAW] {data_str}")

    print("\n" + "=" * 60)
    print("✅ Streaming completed!")
    print("=" * 60)
    return True


if __name__ == "__main__":
    test_stream_generation()

