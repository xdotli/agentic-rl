"""
LLM-based task generator using structured outputs.
"""

import os
from pathlib import Path

import yaml
from openai import AsyncOpenAI

from task_schema import GeneratedTask


class TaskGenerator:
    """Generates programming tasks using LLM with structured outputs."""

    def __init__(self, model: str = "gpt-5"):
        """
        Initialize the task generator.

        Args:
            model: OpenAI model to use for generation (e.g., "gpt-5", "gpt-4o")
        """
        self.model = model
        self.client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    async def generate_from_seed(
        self, seed_task_path: str, variation_prompt: str | None = None
    ) -> GeneratedTask:
        """
        Generate a new task based on a seed task.

        Args:
            seed_task_path: Path to the seed task directory
            variation_prompt: Optional specific variation request

        Returns:
            GeneratedTask with all required files
        """
        import logging

        logger = logging.getLogger(__name__)
        logger.info(f"[TaskGenerator] Starting generation from seed: {seed_task_path}")

        # Read seed task files
        seed_path = Path(seed_task_path)
        task_yaml_path = seed_path / "task.yaml"
        dockerfile_path = seed_path / "Dockerfile"
        solution_path = seed_path / "solution.sh"
        test_path = seed_path / "tests" / "test_outputs.py"

        logger.info("[TaskGenerator] Loading seed task files...")
        # Load seed task content
        with open(task_yaml_path) as f:
            seed_task_yaml = yaml.safe_load(f)

        with open(dockerfile_path) as f:
            seed_dockerfile = f.read()

        with open(solution_path) as f:
            seed_solution = f.read()

        with open(test_path) as f:
            seed_test = f.read()

        logger.info("[TaskGenerator] Building prompts...")
        # Build the prompt
        system_prompt = self._build_system_prompt()
        user_prompt = self._build_user_prompt(
            seed_task_yaml=seed_task_yaml,
            seed_dockerfile=seed_dockerfile,
            seed_solution=seed_solution,
            seed_test=seed_test,
            variation_prompt=variation_prompt,
        )

        logger.info(f"[TaskGenerator] Calling OpenAI model: {self.model}")
        logger.info(f"[TaskGenerator] Prompt length: {len(user_prompt)} chars")

        try:
            # Call OpenAI Responses API with structured outputs
            response = await self.client.responses.parse(
                model=self.model,
                input=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                text_format=GeneratedTask,
                parallel_tool_calls=True,
                reasoning={"effort": "minimal"},
                timeout=120.0,
            )
            logger.info("[TaskGenerator] OpenAI response received")
        except Exception as e:
            logger.error(f"[TaskGenerator] LLM call failed: {type(e).__name__}: {str(e)}")
            raise

        # Extract structured output from Responses API
        logger.info("[TaskGenerator] Parsing response...")
        generated_task = response.output_parsed

        if generated_task is None:
            raise ValueError("Failed to parse response: output_parsed is None")

        logger.info(f"[TaskGenerator] Task generated successfully: {generated_task.task_name}")
        return generated_task

    def _build_system_prompt(self) -> str:
        """Build the system prompt for task generation."""
        return """You are a professional programming task designer specializing in creating high-quality coding challenges and automation tasks.

Your role is to generate complete, executable programming tasks that include:
1. Detailed task instructions with clear requirements
2. Docker-based test environments
3. Complete reference solutions
4. Comprehensive test suites

Key principles:
- Generate tasks that are realistic and practical
- Ensure all generated content is self-consistent and executable
- Maintain appropriate difficulty levels
- Include proper error handling and security best practices
- Follow Python coding standards (PEP 8, type hints, docstrings)
- Create thorough test cases that validate functionality, code quality, and security

When generating task variations:
- Change the API, tool, or technology used
- Maintain similar complexity and task structure
- Ensure the new task is sufficiently different but equally challenging
- Keep the same testing methodology (pytest-based)"""

    def _build_user_prompt(
        self,
        seed_task_yaml: dict,
        seed_dockerfile: str,
        seed_solution: str,
        seed_test: str,
        variation_prompt: str | None = None,
    ) -> str:
        """Build the user prompt with seed task content."""

        variation_instruction = (
            variation_prompt
            if variation_prompt
            else "Generate a unique task variation. Think creatively about different tools, APIs, or approaches."
        )

        return f"""Based on the following seed task, generate a new programming task variation.

SEED TASK YAML:
```yaml
{yaml.dump(seed_task_yaml, default_flow_style=False)}
```

SEED DOCKERFILE:
```dockerfile
{seed_dockerfile}
```

SEED SOLUTION (solution.sh):
```bash
{seed_solution}
```

SEED TEST (tests/test_outputs.py):
```python
{seed_test}
```

VARIATION REQUEST:
{variation_instruction}

Generate a complete new task that:
1. Uses a DIFFERENT API, tool, or technology (not agentmail.to, and DIFFERENT from the seed task)
2. Maintains the SAME difficulty level ({seed_task_yaml.get('difficulty', 'medium')})
3. Follows the SAME structure and quality standards
4. Includes complete, working Dockerfile, solution, and tests
5. Has a UNIQUE and DESCRIPTIVE task_name that reflects the specific API/tool used
6. Ensures all files are self-consistent and would work together

The generated task should be production-ready and immediately usable for evaluation.

CRITICAL: Generate a UNIQUE task_name based on the variation request!

IMPORTANT GUIDELINES:
- For task_name: MUST be descriptive and unique based on the variation request
  Examples:
  * "weather-api-openweathermap" (if using OpenWeatherMap API)
  * "database-backup-postgres" (if using PostgreSQL)
  DO NOT reuse the seed task name or generate generic names!
- For Dockerfile: base on ubuntu-24-04, install Python 3.12, create tbuser, install necessary packages
- For solution_script: use heredoc (cat <<'EOF' > /home/tbuser/script.py) to create the Python script
- For test_file_content: write comprehensive pytest tests similar to the seed task
- For docker_compose: include client service with proper volume mounts and environment variables
- Ensure the instruction field is detailed with all sections: Environment Setup, Core Functionality, Code Quality Requirements, Testing Compatibility, Constraints, and Success Criteria"""

    async def generate_batch(self, seed_task_path: str, num_tasks: int = 10) -> list[GeneratedTask]:
        """
        Generate multiple task variations from a seed task.

        Args:
            seed_task_path: Path to the seed task directory
            num_tasks: Number of tasks to generate

        Returns:
            List of GeneratedTask objects
        """
        tasks = []
        for i in range(num_tasks):
            # Generate with slight variation in prompt for diversity
            variation_prompts = [
                "Generate a task using a popular REST API (weather, news, finance, etc.)",
                "Generate a task involving database operations (SQL, NoSQL)",
                "Generate a task for file processing or data transformation",
            ]

            variation_prompt = variation_prompts[i % len(variation_prompts)]
            task = await self.generate_from_seed(seed_task_path, variation_prompt)
            tasks.append(task)

        return tasks
