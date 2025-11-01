"""
Test suite for weather automation with Open Meteo API

This test suite validates that the weather_automation.py script correctly
implements the required functionality for weather data retrieval.
"""

import os
import sys
import importlib.util
import inspect
from pathlib import Path
import pytest


def test_script_exists():
    """
    Test that the weather_automation.py script exists in the home directory.

    The script must be present at /home/tbuser/weather_automation.py for the
task to be considered complete.
    """
    script_path = Path("/home/tbuser/weather_automation.py")
    assert script_path.exists(), f"Script not found at {script_path}"
    assert script_path.is_file(), f"{script_path} is not a file"


def test_imports_successfully():
    """
    Test that the script can be imported without errors and that requests library is available.

    This verifies:
    - The requests package is installed
    - The weather_automation.py script has valid Python syntax
    - The script can be imported as a module
    """
    # Test requests library availability
    try:
        import requests
    except ImportError as e:
        pytest.fail(f"Failed to import requests library: {e}")

    # Test script import
    script_path = "/home/tbuser/weather_automation.py"
    spec = importlib.util.spec_from_file_location("weather_automation", script_path)
    assert spec is not None, "Failed to load module spec"

    module = importlib.util.module_from_spec(spec)
    sys.modules["weather_automation"] = module

    try:
        spec.loader.exec_module(module)
    except Exception as e:
        pytest.fail(f"Failed to import weather_automation module: {e}")


def test_required_functions_exist():
    """
    Test that all required functions are implemented in the script.

    Required functions:
    - get_weather_data(api_key, latitude, longitude)
    - format_weather_summary(weather_data)
    - main()
    """
    script_path = "/home/tbuser/weather_automation.py"
    spec = importlib.util.spec_from_file_location("weather_automation", script_path)
    module = importlib.util.module_from_spec(spec)
    sys.modules["weather_automation"] = module
    spec.loader.exec_module(module)

    required_functions = ["get_weather_data", "format_weather_summary", "main"]

    for func_name in required_functions:
        assert hasattr(module, func_name), f"Function '{func_name}' not found in weather_automation.py"
        func = getattr(module, func_name)
        assert callable(func), f"'{func_name}' is not callable"


def test_function_signatures():
    """
    Test that functions have the correct parameter signatures.

    Validates:
    - get_weather_data accepts 'api_key', 'latitude', 'longitude'
    - format_weather_summary accepts 'weather_data'
    - main has no parameters
    """
    script_path = "/home/tbuser/weather_automation.py"
    spec = importlib.util.spec_from_file_location("weather_automation", script_path)
    module = importlib.util.module_from_spec(spec)
    sys.modules["weather_automation"] = module
    spec.loader.exec_module(module)

    # Test get_weather_data signature
    get_weather_data_sig = inspect.signature(module.get_weather_data)
    required_params = ["api_key", "latitude", "longitude"]
    for param in required_params:
        assert param in get_weather_data_sig.parameters, f"get_weather_data must have '{param}' parameter"

    # Test format_weather_summary signature
    format_sig = inspect.signature(module.format_weather_summary)
    assert "weather_data" in format_sig.parameters, "format_weather_summary must have 'weather_data' parameter"

    # Test main signature
    main_sig = inspect.signature(module.main)
    assert not main_sig.parameters, "main should not have parameters"


def test_functions_have_docstrings():
    """
    Test that all required functions have docstrings for documentation.

    Good code practices require documenting functions with docstrings
    that explain what the function does, its parameters, and return values.
    """
    script_path = "/home/tbuser/weather_automation.py"
    spec = importlib.util.spec_from_file_location("weather_automation", script_path)
    module = importlib.util.module_from_spec(spec)
    sys.modules["weather_automation"] = module
    spec.loader.exec_module(module)

    required_functions = ["get_weather_data", "format_weather_summary", "main"]

    for func_name in required_functions:
        func = getattr(module, func_name)
        assert func.__doc__ is not None, f"Function '{func_name}' must have a docstring"
        assert len(func.__doc__.strip()) > 0, f"Function '{func_name}' docstring is empty"


def test_type_hints_present():
    """
    Test that functions use type hints for parameters and return values.

    Type hints improve code readability and enable static type checking.
    This test verifies that the main functions have type annotations.
    """
    script_path = "/home/tbuser/weather_automation.py"
    spec = importlib.util.spec_from_file_location("weather_automation", script_path)
    module = importlib.util.module_from_spec(spec)
    sys.modules["weather_automation"] = module
    spec.loader.exec_module(module)

    # Check type hints for get_weather_data
    get_weather_data_sig = inspect.signature(module.get_weather_data)
    assert get_weather_data_sig.return_annotation != inspect.Parameter.empty, 
        "get_weather_data must have a return type hint"

    # Check type hints for format_weather_summary
    format_sig = inspect.signature(module.format_weather_summary)
    assert format_sig.return_annotation != inspect.Parameter.empty, 
        "format_weather_summary must have a return type hint"


def test_no_hardcoded_api_keys():
    """
    Test that the script does not contain hardcoded API keys.

    Security best practice: API keys should be loaded from environment
    variables, not hardcoded in the script. This test checks that the
    string 'OPENMETEO_API_KEY' appears in the script (indicating proper
    environment variable usage) and that suspicious patterns like
    'api_key = "' with a long string do not appear.
    """
    script_path = Path("/home/tbuser/weather_automation.py")
    content = script_path.read_text()

    # Should reference environment variable
    assert "OPENMETEO_API_KEY" in content, 
        "Script must reference OPENMETEO_API_KEY environment variable"

    # Check for common hardcoding patterns
    suspicious_patterns = [
        'api_key = "op_',  # Open Meteo keys start with op_
        "api_key = 'op_",
    ]

    for pattern in suspicious_patterns:
        assert pattern not in content, 
            f"Potential hardcoded API key detected: '{pattern}' found in script"


def test_script_is_importable():
    """
    Test that the script can be imported without executing the main block.

    The script should use 'if __name__ == "__main__":' to guard its
    main execution code, allowing functions to be imported and tested
    independently without side effects.
    """
    script_path = Path("/home/tbuser/weather_automation.py")
    content = script_path.read_text()

    assert 'if __name__ == "__main__"' in content or "if __name__ == '__main__'" in content, \
        "Script must use 'if __name__ == \"__main__\":' guard for main execution block"
