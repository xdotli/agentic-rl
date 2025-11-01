#!/bin/bash
# Test runner script for email-automation-agentmail task
# This script installs pytest and runs the test suite

set -e

# Install pytest with specific version for consistency
pip3 install pytest==8.4.1

# Run pytest with detailed output
# -rA: show extra test summary info for all test outcomes
# The tests validate code structure, not API functionality
python3 -m pytest $TEST_DIR/test_outputs.py -rA
