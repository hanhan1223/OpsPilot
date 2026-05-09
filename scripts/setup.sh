#!/bin/bash
set -e

echo "Setting up OpsPilot..."

# Create virtual environment
python -m venv .venv
source .venv/bin/activate

# Install packages in development mode
pip install -e ./packages/opspilot_core
pip install -e ./backend
pip install -e ./cli

# Create data directories
mkdir -p data/deployments data/logs

# Copy env file if not exists
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file from .env.example"
fi

echo "Setup complete!"
echo "Run 'docker compose up --build' to start OpsPilot"
echo "Or run 'uvicorn app.main:app --reload' for development"
