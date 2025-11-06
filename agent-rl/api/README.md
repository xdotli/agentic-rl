# Agent Gym API

FastAPI backend for LLM-based task generation using structured outputs.

## Setup

### 1. Install Dependencies

```bash
# Install dependencies (skip installing the project itself)
uv sync --no-install-project
```

### 2. Configure Environment Variables

Create a `.env` file from the example template:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```bash
# Required: Anthropic API Key (for Claude models)
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here

# Optional: OpenAI API Key (for GPT models)
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

**Get your API keys:**
- Anthropic: https://console.anthropic.com/
- OpenAI: https://platform.openai.com/api-keys

### 3. Run the Server

```bash
# Run with uv
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or with standard Python
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: `http://localhost:8000`
- Interactive docs: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

## Testing

Run the test pipeline:

```bash
python test_pipeline.py
```

This will:
1. Submit a scenario
2. Generate 2 tasks using LLM (requires ANTHROPIC_API_KEY)
3. Display logs and progress
4. Download generated tasks

## Architecture

### Core Components

- **task_schema.py**: Pydantic models for structured outputs
  - `TaskYAML`: Task metadata and configuration
  - `GeneratedTask`: Complete task with all files

- **task_generator.py**: LLM-based task generator
  - Uses Claude Sonnet 4 with structured outputs
  - Generates complete Terminal Bench compatible tasks

- **pipeline_api.py**: FastAPI routes
  - `/api/submit-scenario`: Submit task scenario
  - `/api/upload-seed-tasks`: Upload seed task zip
  - `/api/generate-seed-tasks`: Start LLM generation
  - `/api/generation-status`: Check progress
  - `/api/download-tasks`: Download results

### Generated Output

Tasks are saved to `generated_tasks/` directory with structure:

```
generated_tasks/
└── task-name_001/
    ├── task.yaml
    ├── Dockerfile
    ├── docker-compose.yaml
    ├── solution.sh
    ├── run-tests.sh
    └── tests/
        └── test_outputs.py
```

## Supported Models

Configured in `litellm_utils/config.py`:

**Claude models** (require ANTHROPIC_API_KEY):
- `sonnet` (claude-3-7-sonnet-20250219)
- `claude-3.7` (claude-3-7-sonnet-latest)
- `claude-3.5` (claude-3-5-sonnet-latest)
- `haiku` (claude-3-5-haiku-20241022)

**OpenAI models** (require OPENAI_API_KEY):
- `gpt-5`
- `gpt-4o`

## Troubleshooting

**No API key error:**
```
✅ Loaded environment variables from .env
   ✓ ANTHROPIC_API_KEY is set
```
If you don't see this message on startup, check that:
- `.env` file exists in the `api/` directory
- File contains valid `ANTHROPIC_API_KEY=sk-ant-...` line
- No syntax errors in `.env` file

**Import errors:**
Ensure all dependencies are installed with `uv sync --no-install-project`
