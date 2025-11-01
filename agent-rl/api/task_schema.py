"""
Pydantic models for structured task generation outputs.
"""

from pydantic import BaseModel, Field


class TaskYAML(BaseModel):
    """Task YAML configuration model."""

    instruction: str = Field(
        description="Detailed multi-line task instruction including environment setup, core functionality, code quality requirements, testing compatibility, constraints, and success criteria"
    )
    author_name: str = Field(default="Terminal Bench")
    author_email: str = Field(default="tb@laude.org")
    difficulty: str = Field(description="Task difficulty level: easy, medium, or hard")
    category: str = Field(
        description="Task category (e.g., software-engineering, data-analysis, devops)"
    )
    tags: list[str] = Field(
        description="List of relevant tags (e.g., python, api-integration, docker)"
    )
    parser_name: str = Field(default="pytest")
    max_agent_timeout_sec: int = Field(default=600)
    max_test_timeout_sec: int = Field(default=120)
    expert_time_estimate_min: int = Field(
        description="Estimated time for expert to complete (minutes)"
    )
    junior_time_estimate_min: int = Field(
        description="Estimated time for junior developer to complete (minutes)"
    )


class GeneratedTask(BaseModel):
    """Complete generated task with all required files."""

    task_name: str = Field(
        description="Unique task identifier (e.g., email-automation-agentmail, file-encryption-gpg)"
    )
    task_yaml: TaskYAML = Field(description="Task YAML configuration")
    dockerfile: str = Field(
        description="Complete Dockerfile content for test environment (base: ubuntu-24-04, Python 3.12, non-root user tbuser)"
    )
    docker_compose: str = Field(
        description="Complete docker-compose.yaml content with client service, volume mounts, and environment variables"
    )
    solution_script: str = Field(
        description="Complete solution.sh bash script using heredoc to create the solution Python script at /home/tbuser/<script_name>.py"
    )
    run_tests_script: str = Field(
        description="Complete run-tests.sh script that installs pytest and runs the test suite"
    )
    test_file_content: str = Field(
        description="Complete pytest test file content (tests/test_outputs.py) that validates script existence, importability, function signatures, docstrings, type hints, security, and code structure"
    )


class TaskGenerationRequest(BaseModel):
    """Request model for task generation."""

    num_tasks: int = Field(default=10, ge=1, le=100, description="Number of tasks to generate")
    seed_task_name: str | None = Field(
        default=None, description="Name of the seed task to base generation on"
    )
