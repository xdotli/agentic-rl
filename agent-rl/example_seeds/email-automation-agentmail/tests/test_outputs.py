"""
Test suite for email automation with agentmail.to API

This test suite validates that the email_automation.py script correctly
implements the required functionality for automated email operations using
the agentmail.to API.
"""

import os
import sys
import importlib.util
import inspect
from pathlib import Path
import pytest


def test_script_exists():
    """
    Test that the email_automation.py script exists in the home directory.

    The script must be present at /home/tbuser/email_automation.py for the
    task to be considered complete.
    """
    script_path = Path("/home/tbuser/email_automation.py")
    assert script_path.exists(), f"Script not found at {script_path}"
    assert script_path.is_file(), f"{script_path} is not a file"


def test_imports_successfully():
    """
    Test that the script can be imported without errors and that agentmail SDK is available.

    This verifies:
    - The agentmail package is installed
    - The email_automation.py script has valid Python syntax
    - The script can be imported as a module
    """
    # Test agentmail SDK availability
    try:
        import agentmail
    except ImportError as e:
        pytest.fail(f"Failed to import agentmail SDK: {e}")

    # Test script import
    script_path = "/home/tbuser/email_automation.py"
    spec = importlib.util.spec_from_file_location("email_automation", script_path)
    assert spec is not None, "Failed to load module spec"

    module = importlib.util.module_from_spec(spec)
    sys.modules["email_automation"] = module

    try:
        spec.loader.exec_module(module)
    except Exception as e:
        pytest.fail(f"Failed to import email_automation module: {e}")


def test_required_functions_exist():
    """
    Test that all required functions are implemented in the script.

    Required functions:
    - create_inbox(client)
    - send_email(client, inbox_id, to_email, subject, body)
    - format_email_summary(inbox_obj)
    """
    script_path = "/home/tbuser/email_automation.py"
    spec = importlib.util.spec_from_file_location("email_automation", script_path)
    module = importlib.util.module_from_spec(spec)
    sys.modules["email_automation"] = module
    spec.loader.exec_module(module)

    required_functions = ["create_inbox", "send_email", "format_email_summary"]

    for func_name in required_functions:
        assert hasattr(module, func_name), f"Function '{func_name}' not found in email_automation.py"
        func = getattr(module, func_name)
        assert callable(func), f"'{func_name}' is not callable"


def test_function_signatures():
    """
    Test that functions have the correct parameter signatures.

    Validates:
    - create_inbox accepts 'client' parameter
    - send_email accepts correct parameters (client, inbox_id, to_email, subject, body)
    - format_email_summary accepts 'inbox_obj' parameter
    """
    script_path = "/home/tbuser/email_automation.py"
    spec = importlib.util.spec_from_file_location("email_automation", script_path)
    module = importlib.util.module_from_spec(spec)
    sys.modules["email_automation"] = module
    spec.loader.exec_module(module)

    # Test create_inbox signature
    create_inbox_sig = inspect.signature(module.create_inbox)
    assert "client" in create_inbox_sig.parameters, "create_inbox must have 'client' parameter"

    # Test send_email signature
    send_email_sig = inspect.signature(module.send_email)
    required_params = ["client", "inbox_id", "to_email", "subject", "body"]
    for param in required_params:
        assert param in send_email_sig.parameters, f"send_email must have '{param}' parameter"

    # Test format_email_summary signature
    format_sig = inspect.signature(module.format_email_summary)
    assert "inbox_obj" in format_sig.parameters, "format_email_summary must have 'inbox_obj' parameter"


def test_functions_have_docstrings():
    """
    Test that all required functions have docstrings for documentation.

    Good code practices require documenting functions with docstrings
    that explain what the function does, its parameters, and return values.
    """
    script_path = "/home/tbuser/email_automation.py"
    spec = importlib.util.spec_from_file_location("email_automation", script_path)
    module = importlib.util.module_from_spec(spec)
    sys.modules["email_automation"] = module
    spec.loader.exec_module(module)

    required_functions = ["create_inbox", "send_email", "format_email_summary"]

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
    script_path = "/home/tbuser/email_automation.py"
    spec = importlib.util.spec_from_file_location("email_automation", script_path)
    module = importlib.util.module_from_spec(spec)
    sys.modules["email_automation"] = module
    spec.loader.exec_module(module)

    # Check type hints for send_email
    send_email_sig = inspect.signature(module.send_email)
    assert send_email_sig.return_annotation != inspect.Parameter.empty, \
        "send_email must have a return type hint"

    # Check type hints for format_email_summary
    format_sig = inspect.signature(module.format_email_summary)
    assert format_sig.return_annotation != inspect.Parameter.empty, \
        "format_email_summary must have a return type hint"


def test_no_hardcoded_api_keys():
    """
    Test that the script does not contain hardcoded API keys.

    Security best practice: API keys should be loaded from environment
    variables, not hardcoded in the script. This test checks that the
    string 'AGENTMAIL_API_KEY' appears in the script (indicating proper
    environment variable usage) and that suspicious patterns like
    'api_key = "' with a long string do not appear.
    """
    script_path = Path("/home/tbuser/email_automation.py")
    content = script_path.read_text()

    # Should reference environment variable
    assert "AGENTMAIL_API_KEY" in content, \
        "Script must reference AGENTMAIL_API_KEY environment variable"

    # Check for common hardcoding patterns
    suspicious_patterns = [
        'api_key = "am_',  # agentmail keys start with am_
        "api_key = 'am_",
    ]

    for pattern in suspicious_patterns:
        assert pattern not in content, \
            f"Potential hardcoded API key detected: '{pattern}' found in script"


def test_script_is_importable():
    """
    Test that the script can be imported without executing the main block.

    The script should use 'if __name__ == "__main__":' to guard its
    main execution code, allowing functions to be imported and tested
    independently without side effects.
    """
    script_path = Path("/home/tbuser/email_automation.py")
    content = script_path.read_text()

    assert 'if __name__ == "__main__"' in content or "if __name__ == '__main__'" in content, \
        "Script must use 'if __name__ == \"__main__\":' guard for main execution block"
