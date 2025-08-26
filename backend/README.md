# U_Drone Backend - Unified Flask Application

A combined Flask backend serving both the main API and integrated Ukraine Fire Tracking System. This unified architecture provides RESTful endpoints, WebSocket communication, and real-time fire data visualization using NASA FIRMS satellite data.

## Architecture Overview

This backend combines:
- **Main API**: RESTful endpoints for the U_Drone interface
- **Fire Tracking System**: Real-time wildfire visualization with WebSocket support
- **Data Processing**: Producer-consumer pattern for streaming fire event data
- **Offline Capability**: Complete airgapped operation with local map tiles

## Quick Setup

### 1. Environment Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
```

### 2. Install Dependencies
```bash
# Install all required packages
pip install -r requirements.txt
```

### 3. Fire Tracking Data Setup (Optional)
```bash
# Load fire data into SQLite database (if JSON files available)
python database_loader.py

# Download offline map tiles (requires internet)
python download_tiles.py
```

### 4. Start Server
```bash
# Run the unified Flask application
python app.py
```

The server will start on `http://localhost:5000` with both main API and fire tracking functionality.

## API Endpoints

### Main API Routes (Port 5000)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hello` | System greeting |
| GET | `/api/data` | Sample data with fire tracking status |
| POST | `/api/echo` | Message echo service |
| GET | `/api/status` | System health check |

### Fire Tracking Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tiles/{z}/{x}/{y}.png` | Map tile serving |

### WebSocket Events
- Connection management with auto-config
- Real-time fire data streaming
- Playback control (start/pause/stop/speed)
- Live statistics and status updates

## Fire Data Specifications

**NASA FIRMS** (Fire Information for Resource Management System)
- **Satellites**: VIIRS (JPSS-1, Suomi NPP), MODIS (Terra, Aqua)
- **Dataset**: 302,830 fire detections (~68MB SQLite database)
- **Coverage**: Ukraine and Western Russia (44°N-56°N, 22°E-50°E)
- **Time Period**: August 2023 - May 2025 (22 months)
- **Confidence Levels**: Low (254,272), Medium (20,154), High (28,404)

## Technical Architecture

### Unified Flask Application
- **Single Process**: Combined main API and fire tracking in one service
- **Graceful Degradation**: Fire tracking disables automatically if data unavailable
- **CORS Support**: Cross-origin requests for frontend integration
- **Logging**: Structured logging with configurable levels

### Fire Tracking System
- **Producer-Consumer Pattern**: Thread-safe data processing
- **WebSocket Communication**: Real-time bidirectional messaging
- **Dynamic Queue Management**: Auto-sizing based on playback speed
- **Offline Operation**: Complete functionality without internet

### Database Schema
```sql
CREATE TABLE fire_events (
    id INTEGER PRIMARY KEY,
    datetime_utc DATETIME NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    brightness REAL NOT NULL,
    bright_t31 REAL NOT NULL,
    frp REAL DEFAULT 0.0,           -- Fire Radiative Power (MW)
    confidence TEXT DEFAULT 'low',  -- low/medium/high
    scan REAL DEFAULT 1.0,
    track REAL DEFAULT 1.0,
    satellite TEXT NOT NULL,
    instrument TEXT NOT NULL,
    daynight TEXT DEFAULT 'U',      -- D(ay)/N(ight)/U(nknown)
    type INTEGER DEFAULT 0,
    version TEXT DEFAULT '1.0'
);
```

## User Interface

### Control Panel
- **Date Pickers**: Start date (default: today-2yrs), End date (default: today)
- **Speed Slider**: 6 hrs/sec to 2 weeks/sec
- **Playback Controls**: Play/Pause/Stop with status display
- **Statistics**: Active fires, total processed, current status

### Map Features  
- **Zoom Levels**: User-adjustable 6-8
- **Navigation**: Mouse drag panning
- **Fire Markers**: 
  - Colors: Yellow (low), Orange (medium), Red (high confidence)
  - Size: Based on Fire Radiative Power (FRP)
  - Animation: Exponential fade over 2X playback interval
- **Time Overlay**: Shows "Mmm YYYY" format during playback

### About Sidebar
- Application synopsis and usage instructions
- Data source information and credits
- Keyboard shortcut: ESC to close

## Configuration

Edit `config.py` to customize:
- Geographic boundaries
- Playback speeds  
- Queue sizes
- Fade animations
- UI text content

## File Structure

```
fire_tracker/
├── app.py                 # Flask app with producer-consumer threads
├── config.py             # System configuration parameters
├── database_loader.py    # ETL script for JSON to SQLite
├── download_tiles.py     # Tile download utility
├── requirements.txt      # Python dependencies
├── fire_data.db         # SQLite database (generated)
├── map_tiles/           # Downloaded map tiles
│   ├── 6/              # Zoom level 6 tiles
│   ├── 7/              # Zoom level 7 tiles  
│   └── 8/              # Zoom level 8 tiles
├── templates/
│   └── index.html       # Main UI with controls
├── data/                # Source JSON files
│   ├── fire_archive_J1V-C2_*.json
│   ├── fire_archive_M-C61_*.json
│   └── fire_archive_SV-C2_*.json
└── docs/               # Documentation
    ├── synopsis.md
    └── plan.md
```

## Troubleshooting

### Database Issues
- Ensure `data/` directory contains JSON files before running `database_loader.py`
- Check database exists: `ls -la fire_data.db`
- Verify records: `sqlite3 fire_data.db "SELECT COUNT(*) FROM fire_events;"`

### Map Tiles Not Loading
- Run `download_tiles.py` with internet connection
- Check tiles exist: `ls -la map_tiles/8/`
- Verify tile server responds: `curl http://localhost:5000/tiles/8/128/87.png`

### Performance Issues
- Reduce playback speed if browser lags
- Check browser console for JavaScript errors
- Monitor system resources during high-speed playback

### WebSocket Connection Problems
- Check firewall allows port 5000
- Try different browser
- Check server logs for connection errors

## Development

### Adding New Features
1. Update configuration in `config.py`
2. Modify backend logic in `app.py`  
3. Update frontend in `templates/index.html`
4. Test with sample data before full dataset

### Performance Tuning
- Adjust batch sizes in `config.get_batch_size()`
- Modify queue sizes in `config.get_queue_size()`
- Optimize database queries for specific date ranges
- Profile marker rendering at high speeds

## Use Cases

**Emergency Response Training**
- Practice fire response coordination using historical patterns
- Identify high-risk periods and regions for resource planning
- Train dispatchers on multi-fire event management
- Simulate cross-border coordination scenarios

**Research & Analysis**  
- Study fire spread patterns over time
- Correlate with weather and seasonal data
- Analyze satellite detection effectiveness
- Support policy discussions with historical evidence

## License

Educational and research use. Fire data courtesy of NASA FIRMS.

## Credits

**Data Source**: NASA FIRMS (Fire Information for Resource Management System)  
**Map Data**: © OpenStreetMap contributors  
**Satellites**: VIIRS (JPSS-1, Suomi NPP) and MODIS (Terra, Aqua)