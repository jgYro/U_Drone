# U_Drone - Advanced Cyber Interface System

A sophisticated full-stack React + Flask application featuring an integrated Ukraine Fire Tracking System for emergency response training and wildfire analysis. Built with modern web technologies and real NASA satellite data.

## Overview

U_Drone is a cutting-edge web application that demonstrates the power of combining elegant user interfaces with real-time data visualization. The system seamlessly integrates:

- **🎨 Cyberpunk Frontend**: Modern React UI with Material-UI components and futuristic aesthetics
- **⚡ Unified Flask Backend**: Single-service architecture with RESTful API and WebSocket support
- **🔥 Fire Tracking System**: Advanced wildfire visualization using 302K+ NASA FIRMS satellite records
- **🛡️ Offline Capability**: Complete airgapped operation for secure environments

This application serves as both a demonstration of modern full-stack development and a practical tool for emergency response training using historical wildfire data from the Ukraine region.

## System Architecture

```
U_Drone/
├── frontend/                    # React application (port 5173)
│   ├── app/
│   │   ├── routes/             # React Router pages
│   │   │   ├── home.tsx        # Main dashboard
│   │   │   ├── ukraine-fire-tracking.tsx  # Fire tracking interface
│   │   │   ├── about.tsx       # System information
│   │   │   ├── data.tsx        # Data analytics
│   │   │   └── api-demo.tsx    # API demonstration
│   │   └── components/         # Reusable UI components
│   └── package.json
├── backend/                     # Combined Flask application
│   ├── app.py                  # Main Flask API with integrated fire tracking (port 5000)
│   ├── config.py               # Fire tracking system configuration
│   ├── database_loader.py      # Data ETL pipeline
│   ├── download_tiles.py       # Map tile downloader
│   ├── fire_data.db            # SQLite database (302K+ fire events)
│   ├── map_tiles/              # Offline map tiles (zoom 6-8)
│   ├── data/                   # NASA FIRMS source data
│   ├── static/                 # Static web assets
│   ├── templates/              # HTML templates
│   └── requirements.txt
├── data/                       # Shared data files
├── start-fire-tracking.sh      # Quick start script
└── README.md
```

## ✨ Key Features

### 🎮 Frontend Interface
- **🌃 Cyberpunk Design**: Dark theme with neon accents and futuristic styling
- **📱 Responsive Layout**: Adaptive grid system for desktop and mobile devices
- **✨ Interactive Navigation**: Smooth hover effects and transitions with 3D elements
- **📊 Real-time Status**: Live system monitoring and connection indicators
- **🎯 Multi-page Application**: Dashboard, fire tracking, data analytics, and API demo

### 🔥 Ukraine Fire Tracking System
- **📅 Historical Data Playback**: 22 months of NASA FIRMS satellite data (Aug 2023 - May 2025)
- **🗺️ Interactive Mapping**: Custom Leaflet-based maps with offline tile serving
- **⚡ Real-time Simulation**: Variable speed replay (6 hours/sec to 2 weeks/sec)
- **🔌 WebSocket Communication**: Live bidirectional data streaming
- **🔒 Offline Operation**: Complete airgapped functionality for secure environments
- **🚨 Emergency Training**: Professional-grade tool for fire response coordination
- **📈 Live Statistics**: Real-time fire counts, activity charts, and analytics
- **🎨 Dynamic Visualization**: Color-coded confidence levels and FRP-based sizing

### 🛠️ Data Processing & Architecture
- **🛰️ NASA FIRMS Integration**: Official VIIRS and MODIS satellite fire detection data
- **💾 SQLite Database**: Optimized storage with 302,830+ fire event records (68MB)
- **⚙️ Producer-Consumer Pattern**: Thread-safe data processing with dynamic queue management
- **🌍 Geographic Coverage**: Ukraine and Western Russia (44°N-56°N, 22°E-50°E)
- **🔄 Unified Backend**: Single Flask service combining API and fire tracking
- **📡 Graceful Degradation**: System operates normally even without fire data

## 🚀 Quick Start

### 1. Prerequisites
- **Python 3.8+** with pip and venv
- **Node.js 18+** with npm
- **Git** for cloning the repository
- **Internet connection** (for initial tile download only)

### 2. Clone and Setup
```bash
git clone <repository-url>
cd U_Drone
```

### 3. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install all dependencies (Flask, SocketIO, etc.)
pip install -r requirements.txt

# Set up fire tracking data (if source JSON files are available)
python database_loader.py    # Creates fire_data.db with 302K+ records
python download_tiles.py     # Downloads offline map tiles (requires internet)

# Start the unified Flask server
python app.py                # Runs on http://localhost:5000
```

**Expected output:**
```
2024-XX-XX XX:XX:XX,XXX - __main__ - INFO - Fire tracking database loaded with 302830 events
2024-XX-XX XX:XX:XX,XXX - __main__ - INFO - Fire tracking system enabled
2024-XX-XX XX:XX:XX,XXX - __main__ - INFO - Starting server on 0.0.0.0:5000
```

### 4. Frontend Setup
```bash
# In a new terminal
cd frontend

# Install React dependencies
npm install

# Start development server
npm run dev  # Runs on http://localhost:5173
```

### 5. Quick Start Alternative
```bash
# Use the provided startup script for backend
chmod +x start-fire-tracking.sh
./start-fire-tracking.sh
```

### 6. Access the Application
- **Main Interface**: http://localhost:5173
- **API Status**: http://localhost:5000/api/status
- **Fire Tracking**: Navigate to "FIRE TRACKING" from the main dashboard

## 🔌 API Documentation

### Flask Backend (Port 5000)

#### Main API Routes
| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| `GET` | `/api/hello` | System greeting | JSON with welcome message |
| `GET` | `/api/data` | Sample user data + fire tracking status | JSON with user list and system info |
| `POST` | `/api/echo` | Echo service for testing | JSON echoing the sent message |
| `GET` | `/api/status` | Comprehensive system health check | JSON with all system features and fire event count |

#### Fire Tracking Routes
| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| `GET` | `/tiles/{z}/{x}/{y}.png` | Offline map tile serving | PNG image or 404 |

#### WebSocket Events (Socket.IO)
| Event | Direction | Description | Data |
|-------|-----------|-------------|------|
| `connect` | Client → Server | Client connection established | Auto-sends config |
| `config` | Server → Client | Fire tracking configuration | Zoom levels, speeds, date ranges |
| `start_playback` | Client → Server | Begin fire simulation | `{start_date, end_date, speed}` |
| `pause_playback` | Client → Server | Pause current simulation | None |
| `resume_playback` | Client → Server | Resume paused simulation | None |
| `stop_playback` | Client → Server | Stop and reset simulation | None |
| `change_speed` | Client → Server | Adjust playback speed | `{speed}` |
| `fire_update` | Server → Client | Real-time fire data batch | `{fires[], timestamp, statistics}` |
| `playback_started` | Server → Client | Simulation started confirmation | `{status, start_date, end_date, speed}` |
| `playback_paused` | Server → Client | Simulation paused | None |
| `playback_resumed` | Server → Client | Simulation resumed | None |
| `playback_stopped` | Server → Client | Simulation stopped | None |
| `playback_ended` | Server → Client | Simulation completed | None |
| `playback_error` | Server → Client | Error occurred | `{error}` |

### Frontend Routes (Port 5173)
| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Home | Main cyberpunk dashboard with navigation |
| `/ukraine-fire-tracking` | Fire Tracking | Interactive fire visualization system |
| `/data` | Data Analytics | Sample data display and API integration |
| `/about` | About | System information and credits |
| `/api-demo` | API Demo | Live API testing interface |

## 🔥 Fire Tracking System

### 📊 Data Specifications
| Metric | Value | Details |
|--------|-------|---------|
| **Data Source** | NASA FIRMS | Fire Information for Resource Management System |
| **Satellites** | VIIRS, MODIS | JPSS-1, Suomi NPP, Terra, Aqua |
| **Geographic Coverage** | Ukraine & Western Russia | 44°N-56°N, 22°E-50°E |
| **Time Period** | Aug 2023 - May 2025 | 22 months of historical data |
| **Total Events** | 302,830 records | ~68MB optimized SQLite database |
| **Confidence Levels** | Low: 254,272 \| Medium: 20,154 \| High: 28,404 | Satellite detection confidence |

### 🎮 Interactive Controls

#### Playback Controls
- **🎯 Date Range Selection**: Pick any period within Aug 2023 - May 2025
- **⚡ Variable Speed Control**: 
  - Slowest: 6 hours/second
  - Slow: 1 day/second  
  - Normal: 3 days/second
  - Fast: 1 week/second
  - Fastest: 2 weeks/second
- **▶️ Playback Management**: Play, pause, stop, and resume functionality
- **📈 Live Statistics**: Real-time fire counts and activity charts

#### Map Navigation
- **🔍 Zoom Levels**: 6 (regional) to 8 (detailed) with smooth transitions
- **🖱️ Pan & Drag**: Smooth map navigation with mouse controls
- **🎨 Custom Zoom Controls**: Dedicated +/- buttons for precise control

### 🎨 Visual Features

#### Fire Markers
| Confidence | Color | Description |
|------------|-------|-------------|
| **Low** | 🟡 Yellow | Basic satellite detection |
| **Medium** | 🟠 Orange | Moderate confidence fire |
| **High** | 🔴 Red | High confidence fire event |

#### Advanced Visualization
- **📏 Size Scaling**: Marker size based on Fire Radiative Power (FRP)
- **✨ Animation Effects**: Exponential fade over 2x playback interval
- **⏰ Time Display**: Live date/time overlay during simulation
- **📊 Activity Charts**: Mini fire activity visualization bars
- **💫 Pulse Indicators**: Visual feedback for data intervals

## 🎯 Use Cases & Applications

### 🚨 Emergency Response Training
- **Historical Pattern Analysis**: Study fire behavior across seasons and regions
- **Resource Planning**: Identify high-risk periods for optimal resource allocation  
- **Multi-Event Management**: Train dispatchers on handling simultaneous fire events
- **Cross-Border Coordination**: Simulate international emergency response scenarios
- **Timeline Simulation**: Practice response timing with realistic fire progression

### 🔬 Research & Analysis
- **Temporal Pattern Studies**: Analyze fire frequency and intensity over time
- **Weather Correlation**: Compare fire activity with meteorological data
- **Satellite Effectiveness**: Evaluate detection accuracy across different instruments
- **Policy Support**: Provide evidence-based data for policy discussions
- **Geographic Risk Assessment**: Identify fire-prone regions and corridors

### 📚 Educational Applications
- **Wildfire Education**: Demonstrate fire behavior and spread patterns
- **Emergency Management Courses**: Hands-on training with real satellite data
- **Technology Showcase**: Display satellite monitoring and data processing capabilities
- **Interactive Learning**: Engage students with dynamic data visualization
- **Professional Development**: Train emergency personnel with realistic scenarios

### 💻 Technical Demonstration
- **Full-Stack Development**: Showcase modern React + Flask architecture
- **Real-Time Systems**: Demonstrate WebSocket communication and data streaming
- **Data Visualization**: Advanced mapping and time-series visualization techniques
- **Offline Capabilities**: Airgapped system operation for secure environments

## 🛠️ Development & Customization

### Adding New Features
1. **Backend Configuration**: Update `backend/config.py` for fire tracking settings
2. **Flask Routes**: Modify `backend/app.py` for new API endpoints  
3. **Frontend Components**: Add new routes in `frontend/app/routes/`
4. **Database Schema**: Extend `database_loader.py` for additional data fields
5. **UI Components**: Create new Material-UI components with cyberpunk styling

### Performance Optimization
- **Queue Management**: Adjust batch sizes in `config.get_queue_size()`
- **Database Tuning**: Optimize queries for specific date ranges and filters
- **Marker Rendering**: Profile visualization performance at high speeds
- **WebSocket Monitoring**: Track connection stability and message throughput
- **Memory Management**: Monitor and optimize large dataset handling

### Configuration Options
| File | Purpose | Key Settings |
|------|---------|--------------|
| `backend/config.py` | Fire tracking configuration | Playback speeds, geographic bounds, fade durations |
| `frontend/app/routes/ukraine-fire-tracking.tsx` | UI behavior | Map settings, animation timings, visual effects |
| `backend/app.py` | Server settings | CORS origins, logging levels, port configuration |

## 🔧 Troubleshooting

### 🔥 Fire Tracking Issues
| Problem | Check | Solution |
|---------|-------|----------|
| Database missing | `ls -la backend/fire_data.db` | Run `python database_loader.py` |
| No map tiles | `ls -la backend/map_tiles/8/` | Run `python download_tiles.py` |
| WebSocket errors | Browser console + `/api/status` | Verify port 5000 accessibility |
| No fire data | Check browser network tab | Ensure database has records |
| Performance issues | Monitor CPU/memory usage | Reduce playback speed |

### ⚙️ General Issues
| Problem | Check | Solution |
|---------|-------|----------|
| Port conflicts | `netstat -tulpn \| grep :5000` | Kill conflicting processes |
| Module errors | Virtual environment activation | `source .venv/bin/activate` |
| CORS issues | Browser console errors | Check CORS_ORIGINS in config |
| Frontend crashes | `npm run dev` output | Clear node_modules, reinstall |
| Database errors | SQLite file permissions | Check file ownership and permissions |

### 🧪 System Verification
```bash
# Check backend status
curl http://localhost:5000/api/status

# Check fire tracking availability  
python -c "import config; print('Config OK')"

# Verify database
python -c "import sqlite3; c=sqlite3.connect('fire_data.db'); print(c.execute('SELECT COUNT(*) FROM fire_events').fetchone())"

# Test WebSocket connection
# Use browser dev tools → Network → WS to monitor WebSocket messages
```

## 🛡️ Technology Stack

### 🎨 Frontend Technologies
| Technology | Version | Purpose | Key Features |
|------------|---------|---------|--------------|
| **React** | 19.x | UI Framework | Hooks, Concurrent Features, Server Components |
| **Material-UI** | 5.x | Component Library | Theming, Icons, Responsive Grid |
| **React Router** | 7.x | Client-side Routing | Nested routes, Data loading |
| **TypeScript** | 5.x | Type Safety | Static typing, IntelliSense |
| **Vite** | 5.x | Build Tool | Fast HMR, ES modules, Bundle optimization |
| **Socket.IO Client** | 4.x | WebSocket Client | Real-time communication |

### ⚙️ Backend Technologies  
| Technology | Version | Purpose | Key Features |
|------------|---------|---------|--------------|
| **Flask** | 3.x | Web Framework | Lightweight, Flexible, RESTful APIs |
| **Flask-SocketIO** | 5.x | WebSocket Server | Real-time bidirectional communication |
| **SQLite** | 3.x | Database | Embedded, Zero-config, ACID compliance |
| **Python** | 3.8+ | Runtime | Async support, Type hints |
| **Threading** | Built-in | Concurrency | Producer-consumer pattern |

### 🗺️ Mapping & Visualization
| Technology | Purpose | Features |
|------------|---------|----------|
| **Leaflet** | Interactive Maps | Zoom, Pan, Tile layers, Custom controls |
| **OpenStreetMap** | Map Tiles | Offline tile serving, Custom styling |
| **Canvas API** | Fire Rendering | Hardware-accelerated drawing, Image overlays |
| **Custom Animations** | Visual Effects | Exponential fades, Pulse indicators |

### 🛠️ Development & Infrastructure
| Component | Technology | Purpose |
|-----------|------------|---------|
| **Version Control** | Git | Source code management |
| **Package Management** | npm, pip | Dependency management |
| **Environment** | Python venv | Isolated environments |
| **Logging** | Python logging | Structured application logs |
| **Error Handling** | Try-catch, Graceful degradation | Robust error management |
| **CORS** | Flask-CORS | Cross-origin resource sharing |

### 📊 Data Processing Pipeline
```
NASA FIRMS JSON → database_loader.py → SQLite → Flask Backend → WebSocket → React Frontend → Leaflet Map
```

## 📄 License & Usage

### License Terms
- **Educational Use**: Freely available for educational and research purposes
- **Non-Commercial**: Not for commercial distribution or profit
- **Attribution Required**: Credit NASA FIRMS for fire data
- **Open Source Components**: Respects all upstream licenses

### Data Attribution
- **Fire Data**: Courtesy of NASA FIRMS (Fire Information for Resource Management System)
- **Map Data**: © OpenStreetMap contributors under ODbL license
- **Satellite Data**: VIIRS (JPSS-1, Suomi NPP) and MODIS (Terra, Aqua)

## 🙏 Credits & Acknowledgments

### Data Providers
- **NASA FIRMS Team**: Fire Information for Resource Management System
- **NOAA/NASA**: VIIRS and MODIS satellite instrument teams
- **OpenStreetMap Community**: Global map data contributors

### Technology Contributors
- **React Team**: Modern UI framework and ecosystem
- **Material-UI Team**: Comprehensive React component library  
- **Flask Community**: Lightweight web framework and extensions
- **Leaflet Team**: Leading open-source JavaScript library for maps
- **Socket.IO Team**: Real-time engine for WebSocket communication

### Special Recognition
- **Emergency Response Community**: Inspiration for practical training applications
- **Open Source Community**: Foundation technologies enabling this project
- **Educational Institutions**: Promoting technology for emergency preparedness