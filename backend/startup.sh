#!/bin/bash

echo "Starting Ukraine Fire Tracking System..."
echo "======================================"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if required Python scripts exist
if [ ! -f "/app/database_loader.py" ]; then
    echo "ERROR: database_loader.py not found!"
    exit 1
fi

if [ ! -f "/app/download_tiles.py" ]; then
    echo "ERROR: download_tiles.py not found!"
    exit 1
fi

if [ ! -f "/app/app.py" ]; then
    echo "ERROR: app.py not found!"
    exit 1
fi

# Check if database exists, if not run database loader
if [ ! -f "/app/fire_data.db" ]; then
    echo "Database not found. Running database loader..."
    if [ -d "/app/data" ] && [ "$(ls -A /app/data)" ]; then
        echo "Found data files. Loading into database..."
        python database_loader.py
        if [ $? -eq 0 ]; then
            echo "Database loaded successfully!"
        else
            echo "Warning: Database loading failed, but continuing..."
        fi
    else
        echo "Warning: No data directory or data files found. Database will be empty."
        echo "You can add JSON fire data files to the /app/data directory and restart the container."
    fi
else
    echo "Database already exists."
fi

# Check if map tiles exist, if not run tile downloader
if [ ! -d "/app/map_tiles" ] || [ -z "$(ls -A /app/map_tiles)" ]; then
    echo "Map tiles not found. Running tile downloader..."
    echo "This may take several minutes depending on your internet connection..."
    python download_tiles.py
    if [ $? -eq 0 ]; then
        echo "Map tiles downloaded successfully!"
    else
        echo "Warning: Tile downloading failed, but continuing..."
        echo "The application may not work properly without map tiles."
    fi
else
    echo "Map tiles already exist."
fi

# Verify the application can start
echo "Verifying application files..."
python -c "import app" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to import app.py. Check for syntax errors."
    exit 1
fi

# Start the main application
echo "======================================"
echo "Starting Flask application..."
echo "Application will be available at http://localhost:5000"
echo "======================================"

exec python app.py
