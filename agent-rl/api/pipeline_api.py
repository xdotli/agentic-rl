"""
Pipeline API for Agentic RL
Provides endpoints for scenario submission, seed task generation, and training control
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, Field
from typing import Optional, Dict, List, Any
import asyncio
import random
import time
from datetime import datetime
from pathlib import Path
import shutil

router = APIRouter(prefix="/api", tags=["pipeline"])

# In-memory state (would be replaced with database in production)
pipeline_state = {
    "scenario": None,
    "config": None,
    "seed_tasks_uploaded": False,
    "generation_status": "idle",  # idle, running, completed, failed
    "generation_progress": 0,
    "generated_tasks": [],
    "training_status": "idle",  # idle, running, completed, failed
    "training_progress": 0,
    "training_metrics": {},
    "logs": []
}


class ScenarioSubmission(BaseModel):
    """Agent task scenario submission"""
    scenario: str = Field(..., description="Description of the RL task scenario")
    config: Dict[str, Any] = Field(
        default_factory=lambda: {
            "multiplier": 3,
            "num_agents": 20,
            "max_iterations": 100
        },
        description="Configuration for data generation"
    )


class TrainingConfig(BaseModel):
    """Training configuration"""
    learning_rate: float = Field(default=3e-4, description="Learning rate for training")
    batch_size: int = Field(default=32, description="Batch size")
    num_epochs: int = Field(default=10, description="Number of training epochs")
    use_wandb: bool = Field(default=False, description="Enable Weights & Biases logging")


@router.post("/submit-scenario")
async def submit_scenario(submission: ScenarioSubmission):
    """Submit agent task scenario and configuration"""
    pipeline_state["scenario"] = submission.scenario
    pipeline_state["config"] = submission.config
    pipeline_state["logs"].append({
        "timestamp": datetime.now().isoformat(),
        "level": "info",
        "message": f"Scenario submitted: {submission.scenario[:50]}..."
    })

    return {
        "status": "success",
        "message": "Scenario submitted successfully",
        "scenario_id": f"scenario_{int(time.time())}"
    }


@router.post("/upload-seed-tasks")
async def upload_seed_tasks(file: UploadFile = File(...)):
    """Upload seed tasks zip file"""
    if not file.filename.endswith('.zip'):
        raise HTTPException(status_code=400, detail="Only .zip files are accepted")

    # Mock: Save uploaded file (in production, extract and process)
    upload_dir = Path("/tmp/agent-rl-uploads")
    upload_dir.mkdir(exist_ok=True)

    file_path = upload_dir / file.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    pipeline_state["seed_tasks_uploaded"] = True
    pipeline_state["logs"].append({
        "timestamp": datetime.now().isoformat(),
        "level": "info",
        "message": f"Seed tasks uploaded: {file.filename}"
    })

    return {
        "status": "success",
        "message": f"Uploaded {file.filename}",
        "file_size": file_path.stat().st_size
    }


@router.post("/generate-seed-tasks")
async def generate_seed_tasks():
    """Start seed task generation process"""
    if pipeline_state["generation_status"] == "running":
        raise HTTPException(status_code=400, detail="Generation already in progress")

    if not pipeline_state["scenario"]:
        raise HTTPException(status_code=400, detail="Please submit a scenario first")

    # Start background task
    asyncio.create_task(_mock_generate_tasks())

    return {
        "status": "started",
        "message": "Seed task generation started"
    }


async def _mock_generate_tasks():
    """Mock task generation with simulated progress"""
    pipeline_state["generation_status"] = "running"
    pipeline_state["generation_progress"] = 0
    pipeline_state["generated_tasks"] = []

    pipeline_state["logs"].append({
        "timestamp": datetime.now().isoformat(),
        "level": "info",
        "message": "🎨 Starting Idea Generation Agents..."
    })

    # Simulate generating 50 tasks
    num_tasks = 50
    for i in range(1, num_tasks + 1):
        await asyncio.sleep(0.5)  # Simulate work

        # Generate mock task
        task = {
            "id": f"task_{i:03d}",
            "name": f"Generated Task {i}",
            "type": random.choice(["Software Engineering", "Security", "Data Processing", "Debugging"]),
            "status": "generated",
            "created_at": datetime.now().isoformat()
        }
        pipeline_state["generated_tasks"].append(task)
        pipeline_state["generation_progress"] = int((i / num_tasks) * 100)

        # Add periodic logs
        if i % 10 == 0:
            pipeline_state["logs"].append({
                "timestamp": datetime.now().isoformat(),
                "level": "info",
                "message": f"✅ Generated {i}/{num_tasks} tasks"
            })

    pipeline_state["generation_status"] = "completed"
    pipeline_state["logs"].append({
        "timestamp": datetime.now().isoformat(),
        "level": "success",
        "message": f"🎉 Task generation completed! Generated {num_tasks} tasks"
    })


@router.get("/generation-status")
async def get_generation_status():
    """Get current generation status"""
    return {
        "status": pipeline_state["generation_status"],
        "progress": pipeline_state["generation_progress"],
        "tasks_generated": len(pipeline_state["generated_tasks"]),
        "total_tasks": 50,
        "tasks": pipeline_state["generated_tasks"][-10:]  # Return last 10 tasks
    }


@router.post("/start-training")
async def start_training(config: TrainingConfig):
    """Start RL training process"""
    if pipeline_state["training_status"] == "running":
        raise HTTPException(status_code=400, detail="Training already in progress")

    if pipeline_state["generation_status"] != "completed":
        raise HTTPException(status_code=400, detail="Please complete task generation first")

    # Start background training
    asyncio.create_task(_mock_training(config))

    return {
        "status": "started",
        "message": "Training started",
        "config": config.model_dump()
    }


async def _mock_training(config: TrainingConfig):
    """Mock training with simulated progress and metrics"""
    pipeline_state["training_status"] = "running"
    pipeline_state["training_progress"] = 0
    pipeline_state["training_metrics"] = {
        "epoch": 0,
        "loss": 0.0,
        "reward": 0.0,
        "test_pass_rate": 0.0
    }

    pipeline_state["logs"].append({
        "timestamp": datetime.now().isoformat(),
        "level": "info",
        "message": "🚀 Starting RL Training..."
    })

    # Simulate training epochs
    for epoch in range(1, config.num_epochs + 1):
        await asyncio.sleep(2)  # Simulate epoch time

        # Simulate improving metrics
        loss = 2.0 * (1 - epoch / config.num_epochs) + random.uniform(-0.1, 0.1)
        reward = 0.3 + (0.6 * epoch / config.num_epochs) + random.uniform(-0.05, 0.05)
        test_pass_rate = 0.2 + (0.7 * epoch / config.num_epochs) + random.uniform(-0.03, 0.03)

        pipeline_state["training_metrics"] = {
            "epoch": epoch,
            "loss": round(loss, 4),
            "reward": round(reward, 4),
            "test_pass_rate": round(test_pass_rate, 4)
        }
        pipeline_state["training_progress"] = int((epoch / config.num_epochs) * 100)

        pipeline_state["logs"].append({
            "timestamp": datetime.now().isoformat(),
            "level": "info",
            "message": f"📊 Epoch {epoch}/{config.num_epochs} - Loss: {loss:.4f}, Reward: {reward:.4f}, Pass Rate: {test_pass_rate:.2%}"
        })

    pipeline_state["training_status"] = "completed"
    pipeline_state["logs"].append({
        "timestamp": datetime.now().isoformat(),
        "level": "success",
        "message": "🎉 Training completed successfully!"
    })


@router.get("/training-status")
async def get_training_status():
    """Get current training status"""
    return {
        "status": pipeline_state["training_status"],
        "progress": pipeline_state["training_progress"],
        "metrics": pipeline_state["training_metrics"]
    }


@router.get("/logs")
async def get_logs(limit: int = 50):
    """Get recent logs"""
    return {
        "logs": pipeline_state["logs"][-limit:]
    }


@router.post("/reset")
async def reset_pipeline():
    """Reset pipeline state (for testing)"""
    pipeline_state.update({
        "scenario": None,
        "config": None,
        "seed_tasks_uploaded": False,
        "generation_status": "idle",
        "generation_progress": 0,
        "generated_tasks": [],
        "training_status": "idle",
        "training_progress": 0,
        "training_metrics": {},
        "logs": []
    })

    return {"status": "success", "message": "Pipeline reset"}


@router.get("/pipeline-status")
async def get_pipeline_status():
    """Get overall pipeline status"""
    return {
        "scenario_submitted": pipeline_state["scenario"] is not None,
        "seed_tasks_uploaded": pipeline_state["seed_tasks_uploaded"],
        "generation": {
            "status": pipeline_state["generation_status"],
            "progress": pipeline_state["generation_progress"],
            "tasks_count": len(pipeline_state["generated_tasks"])
        },
        "training": {
            "status": pipeline_state["training_status"],
            "progress": pipeline_state["training_progress"],
            "metrics": pipeline_state["training_metrics"]
        }
    }
