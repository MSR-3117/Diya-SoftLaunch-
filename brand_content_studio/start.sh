#!/bin/bash

# Brand Content Studio - macOS/Linux Setup Script

echo ""
echo "============================================"
echo "  Brand Content Studio - Setup Script"
echo "============================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python 3.8+ from python.org"
    exit 1
fi

echo "[1/4] Checking Python version..."
python3 --version

echo ""
echo "[2/4] Installing dependencies..."
pip3 install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

echo ""
echo "[3/4] Setting up environment file..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file - Please add your API keys if desired"
else
    echo ".env file already exists"
fi

echo ""
echo "[4/4] Setup complete!"
echo ""
echo "============================================"
echo "  Ready to launch Brand Content Studio!"
echo "============================================"
echo ""
echo "Starting application..."
echo ""
echo "Open your browser to: http://localhost:5000"
echo ""

python3 run.py
