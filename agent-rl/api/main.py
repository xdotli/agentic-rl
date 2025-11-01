import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from pipeline_api import router as pipeline_router

# Load environment variables from .env file
env_path = Path(__file__).parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
    print(f"✅ Loaded environment variables from {env_path}")
    # Check if required key is set
    if os.getenv("OPENAI_API_KEY"):
        print("   ✓ OPENAI_API_KEY is set")
    else:
        print("   ⚠️  OPENAI_API_KEY not found")
else:
    print(f"⚠️  .env file not found at {env_path}")
    print("   API keys should be set via environment variables")

app = FastAPI(title="Agentic RL")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],  # Allow both localhost and 127.0.0.1
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Explicitly include OPTIONS
    allow_headers=["*"],
    expose_headers=["*"],  # Expose all response headers
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Include pipeline router (SSE streaming)
app.include_router(pipeline_router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
