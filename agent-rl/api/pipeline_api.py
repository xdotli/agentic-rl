"""
Pipeline API for Agent Gym using Server-Sent Events (SSE) streaming.

This simplified architecture uses async generators to stream progress updates in real-time,
eliminating the need for background tasks, polling, and complex state management.
"""

import json
import shutil
import time
import zipfile
from pathlib import Path
from typing import Any

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from task_generator import TaskGenerator
from task_schema import GeneratedTask

router = APIRouter(prefix="/api", tags=["pipeline"])

# Simplified state (only for uploaded seeds and config)
state: dict[str, Any] = {
    "seed_task_path": None,
    "scenario": None,
    "config": {"total_tasks": 10, "parallelism": 3},
}

# Output directory for generated tasks
GENERATED_TASKS_DIR = Path(__file__).parent / "generated_tasks"
GENERATED_TASKS_DIR.mkdir(exist_ok=True)


class ScenarioSubmission(BaseModel):
    """Agent task scenario submission"""

    scenario: str = Field(..., description="Description of the RL task scenario")
    config: dict = Field(
        default={"total_tasks": 10, "parallelism": 3}, description="Generation configuration"
    )


class GenerationRequest(BaseModel):
    """Request for task generation"""

    num_tasks: int = Field(default=10, ge=1, le=100, description="Number of tasks to generate")
    parallelism: int = Field(default=3, ge=1, le=10, description="Number of parallel generations")
    model: str = Field(default="gpt-5", description="LLM model to use")


@router.post("/submit-scenario")
async def submit_scenario(submission: ScenarioSubmission):
    """Submit agent task scenario and configuration"""
    state["scenario"] = submission.scenario
    state["config"] = submission.config
    return {
        "status": "success",
        "message": "Scenario submitted successfully",
        "scenario_id": f"scenario_{int(time.time())}",
    }


@router.post("/upload-seed-tasks")
async def upload_seed_tasks(file: UploadFile = File(...)):
    """Upload seed tasks zip file"""
    if not file.filename or not file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="Only .zip files are accepted")

    # Save and extract uploaded file
    upload_dir = Path("/tmp/agent-rl-uploads")
    upload_dir.mkdir(exist_ok=True)

    file_path = upload_dir / file.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract the zip file
    extract_dir = upload_dir / file.filename.replace(".zip", "")
    if extract_dir.exists():
        shutil.rmtree(extract_dir)
    extract_dir.mkdir(exist_ok=True)

    try:
        with zipfile.ZipFile(file_path, "r") as zip_ref:
            zip_ref.extractall(extract_dir)

        # Find the task directory (should contain task.yaml)
        task_dirs = list(extract_dir.rglob("task.yaml"))
        if not task_dirs:
            raise HTTPException(
                status_code=400, detail="Invalid seed task: task.yaml not found in the zip file"
            )

        seed_task_path = task_dirs[0].parent

        # Validate required files
        required_files = ["task.yaml", "Dockerfile"]
        for req_file in required_files:
            if not (seed_task_path / req_file).exists():
                raise HTTPException(
                    status_code=400, detail=f"Invalid seed task: {req_file} not found"
                )

        # Validate tests directory
        if not (seed_task_path / "tests").exists():
            raise HTTPException(
                status_code=400, detail="Invalid seed task: tests/ directory not found"
            )

        state["seed_task_path"] = str(seed_task_path)

        return {
            "status": "success",
            "message": f"Uploaded and extracted {file.filename}",
            "file_size": file_path.stat().st_size,
            "seed_task_path": str(seed_task_path),
        }

    except zipfile.BadZipFile:
        raise HTTPException(status_code=400, detail="Invalid zip file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing upload: {str(e)}")


async def generate_tasks_stream(num_tasks: int, parallelism: int = 3, model: str = "gpt-5"):
    """
    Async generator that yields progress updates as Server-Sent Events.
    Supports parallel task generation for improved performance.
    """
    import asyncio
    import logging

    logger = logging.getLogger(__name__)

    # Use default seed task if none uploaded
    seed_task_path: str | None = state.get("seed_task_path")
    if not seed_task_path:
        default_seed = Path(__file__).parent.parent / "example_seeds" / "email-automation-agentmail"
        if default_seed.exists():
            seed_task_path = str(default_seed)
            yield f"data: {json.dumps({'type': 'info', 'message': 'Using default seed task'})}\n\n"
        else:
            yield f"data: {json.dumps({'type': 'error', 'message': 'No seed task found'})}\n\n"
            return

    yield f"data: {json.dumps({'type': 'start', 'total': num_tasks, 'message': f'🎨 Starting task generation (parallelism: {parallelism})'})}\n\n"

    # Initialize generator
    try:
        generator = TaskGenerator(model=model)
        yield f"data: {json.dumps({'type': 'info', 'message': '⚙️ TaskGenerator initialized'})}\n\n"
    except Exception as e:
        yield f"data: {json.dumps({'type': 'error', 'message': f'Failed to initialize: {str(e)}'})}\n\n"
        return

    generated_tasks = []
    completed_count = 0  # Track completed tasks for accurate progress

    # Get user scenario for context
    user_scenario = state.get("scenario", "")

    # Generate single task with variation
    async def generate_single_task(task_num: int):
        try:
            # Create variation prompt that respects user scenario and ensures diversity
            if user_scenario:
                variation_prompt = f"""Based on the user's scenario: "{user_scenario}"

Generate task variation #{task_num} with these requirements:
- Must be relevant to the user's scenario
- Must use a DIFFERENT specific API, tool, or service than other variations
- Must have a UNIQUE task_name that describes the specific tool/API (e.g., "slack-notification-api", "postgres-backup-s3")
- Think about different practical applications or tools that fit the scenario

CRITICAL: Ensure task_name is unique and descriptive!"""
            else:
                variation_prompt = f"""Generate a UNIQUE task variation #{task_num}.

Requirements:
- Use a DIFFERENT specific API, tool, or service
- Create a UNIQUE task_name describing the tool/API (e.g., "github-webhook-automation", "redis-cache-manager")
- Make this distinctly different from other variations

CRITICAL: Ensure task_name is unique and descriptive!"""

            generated_task: GeneratedTask = await generator.generate_from_seed(
                seed_task_path=seed_task_path, variation_prompt=variation_prompt
            )
            return (task_num, generated_task, None)
        except Exception as e:
            return (task_num, None, e)

    # Generate tasks in parallel batches
    for batch_start in range(1, num_tasks + 1, parallelism):
        batch_end = min(batch_start + parallelism, num_tasks + 1)
        batch_size = batch_end - batch_start

        yield f"data: {json.dumps({'type': 'info', 'message': f'🚀 Processing batch {batch_start}-{batch_end-1} ({batch_size} tasks in parallel)...'})}\n\n"

        # Create parallel tasks
        tasks = [generate_single_task(i) for i in range(batch_start, batch_end)]

        # Wait for all tasks in batch to complete
        results = await asyncio.gather(*tasks)

        # Process results
        for task_num, generated_task, error in results:
            completed_count += 1  # Increment for each task (success or error)
            if error:
                logger.error(f"Error generating task {task_num}: {error}")
                yield f"data: {json.dumps({'type': 'error', 'message': f'❌ Task {task_num} failed: {str(error)[:200]}'})}\n\n"
                # Send progress update
                yield f"data: {json.dumps({'type': 'progress', 'current': completed_count, 'total': num_tasks, 'message': f'Progress: {completed_count}/{num_tasks}'})}\n\n"
                continue

            if not generated_task:
                continue

            # Save task as JSON only (simplified)
            task_json = {
                "task_name": generated_task.task_name,
                "task_yaml": generated_task.task_yaml.model_dump(),
                "dockerfile": generated_task.dockerfile,
                "docker_compose": generated_task.docker_compose,
                "solution_script": generated_task.solution_script,
                "run_tests_script": generated_task.run_tests_script,
                "test_file_content": generated_task.test_file_content,
            }

            # Save JSON file
            json_filename = f"{generated_task.task_name}_{task_num:03d}.json"
            json_path = GENERATED_TASKS_DIR / json_filename
            with open(json_path, "w") as f:
                json.dump(task_json, f, indent=2)

            task_info = {
                "id": task_num,
                "name": generated_task.task_name,
                "difficulty": generated_task.task_yaml.difficulty,
                "category": generated_task.task_yaml.category,
                "tags": generated_task.task_yaml.tags,
                "instruction": generated_task.task_yaml.instruction,
                "json_path": str(json_path),
                "task_json": task_json,  # Include full task data
            }
            generated_tasks.append(task_info)

            # Send success event with updated progress
            yield f"data: {json.dumps({'type': 'success', 'task': task_info, 'message': f'✅ Generated: {generated_task.task_name}'})}\n\n"
            yield f"data: {json.dumps({'type': 'progress', 'current': completed_count, 'total': num_tasks, 'message': f'Progress: {completed_count}/{num_tasks}'})}\n\n"

    # Send completion event
    yield f"data: {json.dumps({'type': 'complete', 'generated': len(generated_tasks), 'total': num_tasks, 'message': '🎉 Generation completed!'})}\n\n"


@router.post("/generate-tasks-stream")
async def generate_tasks_endpoint(request: GenerationRequest):
    """
    Stream task generation progress using Server-Sent Events (SSE).

    Features:
    - Real-time progress updates via SSE
    - Parallel task generation for improved performance
    - No global state needed for progress
    - Errors are immediately visible
    - Automatic cleanup when client disconnects
    """
    return StreamingResponse(
        generate_tasks_stream(request.num_tasks, request.parallelism, request.model),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
        },
    )


@router.get("/status")
async def get_status():
    """Get current configuration status"""
    return {
        "scenario_submitted": state["scenario"] is not None,
        "seed_task_uploaded": state["seed_task_path"] is not None,
        "seed_task_path": state["seed_task_path"],
    }
