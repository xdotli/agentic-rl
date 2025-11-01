FROM ghcr.io/laude-institute/t-bench/ubuntu-24-04:latest

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3.12 \
    python3-pip \
    python3.12-venv \
    && rm -rf /var/lib/apt/lists/*

# Create user and group
RUN groupadd -r tbuser && useradd -r -g tbuser -m -d /home/tbuser tbuser

# Install Python packages
RUN pip3 install --no-cache-dir --break-system-packages \
    requests \
    pytest \
    python-dotenv

# Set working directory
WORKDIR /home/tbuser

# Switch to non-root user
USER tbuser

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV HOME=/home/tbuser
