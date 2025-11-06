"""
Test suite for weather fetching with Open Meteo API.

This test suite validates that the weather_fetcher.py script correctly implements the required functionality for fetching weather data.
"""

import os
import sys
import importlib.util
import inspect
from pathlib import Path
import pytest


def test_script_exists():
    """
    Test that the weather_fetcher.py script exists in the home directory.
    """
    script_path = Path("/home/tbuser/weather_fetcher.py")
    assert script_path.exists(), f"Script not found at {script_path}"
    assert script_path.is_file(), f"{script_path} is not a file"


def test_imports_successfully():
    """
    Test that the script can be imported without errors.
    """
    script_path = "/home/tbuser/weather_fetcher.py"
    spec = importlib.util.spec_from_file_location("weather_fetcher", script_path)
    module = importlib.util.module_from_spec(spec)
    sys.modules["weather_fetcher"] = module
    try:
        spec.loader.exec_module(module)
    except Exception as e:
        pytest.fail(f"Failed to import weather_fetcher module: {e}")


def test_required_functions_exist():
    """
    Test that all required functions are implemented in the script.
    """
    script_path = "/home/tbuser/weather_fetcher.py"
    spec = importlib.util.spec_from_file_location("weather_fetcher", script_path)
    module = importlib.util.module_from_spec(spec)
    sys.modules["weather_fetcher"] = module
    spec.loader.exec_module(module)
    required_functions = ["get_weather_data", "format_weather_report", "main"]
    for func_name in required_functions:
        assert hasattr(module, func_name), f"Function '{func_name}' not found in weather_fetcher.py"
        func = getattr(module, func_name)
        assert callable(func), f"'{func_name}' is not callable"


def test_function_signatures():
    """
    Test that functions have the correct parameter signatures.
    """
    script_path = "/home/tbuser/weather_fetcher.py"
    spec = importlib.util.spec_from_file_location("weather_fetcher", script_path)
    module = importlib.util.module_from_spec(spec)
    sys.modules["weather_fetcher"] = module
    spec.loader.exec_module(module)
    # Test get_weather_data signature
    get_weather_data_sig = inspect.signature(module.get_weather_data)
    assert "location" in get_weather_data_sig.parameters, "get_weather_data must have 'location' parameter"
    assert "client" in get_weather_data_sig.parameters, "get_weather_data must have 'client' parameter"
    # Test format_weather_report signature
    format_weather_report_sig = inspect.signature(module.format_weather_report)
    assert "weather_data" in format_weather_report_sig.parameters, "format_weather_report must have 'weather_data' parameter"


def test_functions_have_docstrings():
    """
    Test that all required functions have docstrings for documentation.
    """
    script_path = "/home/tbuser/weather_fetcher.py"
    spec = importlib.util.spec_from_file_location("weather_fetcher", script_path)
    module = importlib.util.module_from_spec(spec)
    sys.modules["weather_fetcher"] = module
    spec.loader.exec_module(module)
    required_functions = ["get_weather_data", "format_weather_report", "main"]
    for func_name in required_functions:
        func = getattr(module, func_name)
        assert func.__doc__ is not None, f"Function '{func_name}' must have a docstring"
        assert len(func.__doc__.strip()) > 0, f"Function '{func_name}' docstring is empty"


def test_type_hints_present():
    """
    Test that functions use type hints for parameters and return values.
    """
    script_path = "/home/tbuser/weather_fetcher.py"
    spec = importlib.util.spec_from_file_location("weather_fetcher", script_path)
    module = importlib.util.module_from_spec(spec)
    sys.modules["weather_fetcher"] = module
    spec.loader.exec_module(module)
    # Check type hints for get_weather_data
    get_weather_data_sig = inspect.signature(module.get_weather_data)
    assert get_weather_data_sig.return_annotation != inspect.Parameter.empty, \
        "get_weather_data must have a return type hint"

    # Check type hints for format_weather_report
    format_weather_report_sig = inspect.signature(module.format_weather_report)
    assert format_weather_report_sig.return_annotation != inspect.Parameter.empty, \
        "format_weather_report must have a return type hint"


def test_no_hardcoded_api_keys():
    """
    Test that the script does not contain hardcoded API keys.
    """
    script_path = Path("/home/tbuser/weather_fetcher.py")
    content = script_path.read_text()
    assert "OPEN_METEO_API_KEY" in content, \
        "Script must reference OPEN_METEO_API_KEY environment variable"
    suspicious_patterns = [
        'api_key = "',  # Common hardcoding pattern
        "api_key = '"
    ]
    for pattern in suspicious_patterns:
        assert pattern not in content, \
            f"Potential hardcoded API key detected: '{pattern}' found in script"


def test_script_is_importable():
    """
    Test that the script can be imported without executing the main block.
    """
    script_path = Path("/home/tbuser/weather_fetcher.py")
    content = script_path.read_text()
    assert 'if __name__ == "__main__"' in content or "if __name__ == '__main__'" in content, \
        "Script must use 'if __name__ == \"__main__\":' guard for main execution block"