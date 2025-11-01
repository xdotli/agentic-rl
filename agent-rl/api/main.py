from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import asyncio
# from evaluator import evaluate_traces  # Module not available
import json
import pandas as pd
from typing import Dict, List
import os
from pipeline_api import router as pipeline_router

app = FastAPI(title="Agentic RL")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include pipeline router
app.include_router(pipeline_router)

MODEL_CONFIGS = {
    "Model A": {"model": "Llama-3.3-8B-Fine-Tuned", "temperature": 0.3},
    "Model B": {"model": "gpt-4o-", "temperature": 0.3},
    "Model C": {"model": "claude-3.5", "temperature": 0.3},
    "Model D": {"model": "Llama-3.3-70B-Fine-Base", "temperature": 0.3},
}

# @app.post("/evaluate")
# async def evaluate_models():
#     # Commented out: requires evaluator module which is not available
#     pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
