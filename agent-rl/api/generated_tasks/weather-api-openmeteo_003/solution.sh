#!/bin/bash
# Weather Bot Solution
# Creates a Python script that uses Open Meteo API for weather automation

cat <<'EOF' > /home/tbuser/weather_automation.py
"""
Weather automation system using the Open Meteo API.

This module provides functions to fetch weather data and format summaries.
"""

import os
import requests
from typing import Dict


def get_weather_data(api_key: str, latitude: float, longitude: float) -> Dict:
    """
    Fetch weather data from Open Meteo API.

    Args:
        api_key: API key for Open Meteo
        latitude: Latitude for weather query
        longitude: Longitude for weather query

    Returns:
        Weather data as a dictionary
    """
    try:
        response = requests.get(f'https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current_weather=true&apikey={api_key}')
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        raise Exception(f"Failed to fetch weather data: {e}")


def format_weather_summary(weather_data: Dict) -> str:
    """
    Format the weather data into a summary string.

    Args:
        weather_data: Dictionary containing weather data

    Returns:
        A summary string of the weather conditions
    """
    temperature = weather_data['current_weather']['temperature']
    condition = weather_data['current_weather']['weathercode']
    return f"Temperature: {temperature}°C, Condition: {condition}"


def main():
    """
    Main execution block to fetch and display weather data.
    """
    api_key = os.getenv('OPENMETEO_API_KEY')
    latitude = float(os.getenv('LATITUDE', 0))
    longitude = float(os.getenv('LONGITUDE', 0))

    if not api_key:
        print("Error: OPENMETEO_API_KEY environment variable not set")
        exit(1)

    try:
        weather_data = get_weather_data(api_key, latitude, longitude)
        print(format_weather_summary(weather_data))
    except Exception as e:
        print(f"Error: {e}")
        exit(1)


if __name__ == '__main__':
    main()
EOF

chmod +x /home/tbuser/weather_automation.py
