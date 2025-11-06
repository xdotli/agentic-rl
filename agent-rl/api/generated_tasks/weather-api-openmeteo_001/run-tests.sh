#!/bin/bash
# Install pytest and run tests
pip3 install pytest
pytest > result.log; tail -n 10 result.log