#!/usr/bin/env python3
"""
Utility script to convert between JSON and file-based task formats.

Usage:
    # Expand JSON to files (for execution)
    python task_utils.py expand task.json output_dir/
    
    # Compress files to JSON (for storage/transfer)
    python task_utils.py compress task_dir/ output.json
    
    # Batch expand all JSONs
    python task_utils.py expand-all generated_tasks/ output_dir/
"""

import argparse
import json
import shutil
from pathlib import Path
from typing import Dict, Any

import yaml


def expand_json_to_files(json_path: Path, output_dir: Path) -> None:
    """
    Expand a task JSON file into a directory structure with all files.
    
    Args:
        json_path: Path to the task JSON file
        output_dir: Directory to create the task files in
    """
    with open(json_path, "r") as f:
        task_data = json.load(f)
    
    # Create output directory
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Write task.yaml
    with open(output_dir / "task.yaml", "w") as f:
        yaml.dump(task_data["task_yaml"], f, default_flow_style=False)
    
    # Write Dockerfile
    with open(output_dir / "Dockerfile", "w") as f:
        f.write(task_data["dockerfile"])
    
    # Write docker-compose.yaml
    with open(output_dir / "docker-compose.yaml", "w") as f:
        f.write(task_data["docker_compose"])
    
    # Write solution.sh
    with open(output_dir / "solution.sh", "w") as f:
        f.write(task_data["solution_script"])
    
    # Write run-tests.sh
    with open(output_dir / "run-tests.sh", "w") as f:
        f.write(task_data["run_tests_script"])
    
    # Create tests directory and write test file
    tests_dir = output_dir / "tests"
    tests_dir.mkdir(exist_ok=True)
    with open(tests_dir / "test_outputs.py", "w") as f:
        f.write(task_data["test_file_content"])
    
    print(f"✅ Expanded {json_path.name} to {output_dir}")
    print(f"   Created 6 files + tests/ directory")


def compress_files_to_json(task_dir: Path, output_json: Path) -> None:
    """
    Compress a task directory into a single JSON file.
    
    Args:
        task_dir: Directory containing task files
        output_json: Path to save the JSON file
    """
    # Read all required files
    task_yaml_path = task_dir / "task.yaml"
    dockerfile_path = task_dir / "Dockerfile"
    docker_compose_path = task_dir / "docker-compose.yaml"
    solution_path = task_dir / "solution.sh"
    run_tests_path = task_dir / "run-tests.sh"
    test_file_path = task_dir / "tests" / "test_outputs.py"
    
    # Validate all files exist
    required_files = [
        task_yaml_path, dockerfile_path, docker_compose_path,
        solution_path, run_tests_path, test_file_path
    ]
    
    for file_path in required_files:
        if not file_path.exists():
            raise FileNotFoundError(f"Required file not found: {file_path}")
    
    # Load task.yaml
    with open(task_yaml_path, "r") as f:
        task_yaml = yaml.safe_load(f)
    
    # Read all file contents
    with open(dockerfile_path, "r") as f:
        dockerfile = f.read()
    
    with open(docker_compose_path, "r") as f:
        docker_compose = f.read()
    
    with open(solution_path, "r") as f:
        solution_script = f.read()
    
    with open(run_tests_path, "r") as f:
        run_tests_script = f.read()
    
    with open(test_file_path, "r") as f:
        test_file_content = f.read()
    
    # Create JSON structure
    task_json = {
        "task_name": task_dir.name,
        "task_yaml": task_yaml,
        "dockerfile": dockerfile,
        "docker_compose": docker_compose,
        "solution_script": solution_script,
        "run_tests_script": run_tests_script,
        "test_file_content": test_file_content,
    }
    
    # Save JSON
    with open(output_json, "w") as f:
        json.dump(task_json, f, indent=2)
    
    print(f"✅ Compressed {task_dir} to {output_json}")
    print(f"   JSON size: {output_json.stat().st_size / 1024:.1f} KB")


def expand_all_jsons(json_dir: Path, output_dir: Path) -> None:
    """
    Expand all JSON files in a directory to file structures.
    
    Args:
        json_dir: Directory containing task JSON files
        output_dir: Base directory to create task directories in
    """
    json_files = list(json_dir.glob("*.json"))
    
    if not json_files:
        print(f"❌ No JSON files found in {json_dir}")
        return
    
    print(f"📦 Found {len(json_files)} JSON files to expand")
    
    for json_file in json_files:
        task_name = json_file.stem  # filename without .json
        task_output_dir = output_dir / task_name
        
        try:
            expand_json_to_files(json_file, task_output_dir)
        except Exception as e:
            print(f"❌ Failed to expand {json_file.name}: {e}")
    
    print(f"\n✅ Expanded {len(json_files)} tasks to {output_dir}")


def main():
    parser = argparse.ArgumentParser(
        description="Convert between JSON and file-based task formats"
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # Expand command
    expand_parser = subparsers.add_parser(
        "expand", 
        help="Expand JSON to file structure"
    )
    expand_parser.add_argument("json_path", type=Path, help="Path to task JSON file")
    expand_parser.add_argument("output_dir", type=Path, help="Output directory for task files")
    
    # Compress command
    compress_parser = subparsers.add_parser(
        "compress",
        help="Compress file structure to JSON"
    )
    compress_parser.add_argument("task_dir", type=Path, help="Task directory with files")
    compress_parser.add_argument("output_json", type=Path, help="Output JSON file path")
    
    # Expand all command
    expand_all_parser = subparsers.add_parser(
        "expand-all",
        help="Expand all JSONs in directory"
    )
    expand_all_parser.add_argument("json_dir", type=Path, help="Directory containing JSON files")
    expand_all_parser.add_argument("output_dir", type=Path, help="Base output directory")
    
    args = parser.parse_args()
    
    if args.command == "expand":
        expand_json_to_files(args.json_path, args.output_dir)
    
    elif args.command == "compress":
        compress_files_to_json(args.task_dir, args.output_json)
    
    elif args.command == "expand-all":
        expand_all_jsons(args.json_dir, args.output_dir)
    
    else:
        parser.print_help()


if __name__ == "__main__":
    main()

