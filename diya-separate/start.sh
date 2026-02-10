#!/bin/bash
# Production startup script using gunicorn WSGI server
# Usage: ./start.sh

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Start gunicorn with 4 workers on port 5555
echo "Starting DIYA on port 5555..."
gunicorn wsgi:application \
    --bind 0.0.0.0:5555 \
    --workers 4 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --log-level info
