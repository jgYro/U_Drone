import type { Route } from "./+types/ukraine-fire-tracking";
import { useEffect, useRef } from "react";
import { Box } from '@mui/material';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Ukraine Fire Tracking | CYBER SYSTEM" },
    { name: "description", content: "Historical Wildfire Pattern Analysis" },
  ];
}

export default function UkraineFireTracking() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load external dependencies
    const loadDependencies = async () => {
      // Load Leaflet CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const leafletCSS = document.createElement('link');
        leafletCSS.rel = 'stylesheet';
        leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(leafletCSS);
      }

      // Load Socket.IO
      if (!window.io) {
        const socketScript = document.createElement('script');
        socketScript.src = 'https://cdn.socket.io/4.5.0/socket.io.min.js';
        socketScript.onload = () => {
          // Load Leaflet JS
          if (!window.L) {
            const leafletScript = document.createElement('script');
            leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            leafletScript.onload = () => {
              initializeFireTrackingApp();
            };
            document.head.appendChild(leafletScript);
          } else {
            initializeFireTrackingApp();
          }
        };
        document.head.appendChild(socketScript);
      } else if (window.L) {
        initializeFireTrackingApp();
      }
    };

    const initializeFireTrackingApp = () => {
      // Initialize the fire tracking application
      if (window.fireApp) {
        window.fireApp = null;
      }
      
      try {
        window.fireApp = new FireTrackingApp();
        console.log('Fire Tracking App initialized successfully');
        
        // Reset to ready state
        setTimeout(() => {
          window.fireApp.resetToReadyState();
        }, 1000);
      } catch (error) {
        console.error('Failed to initialize Fire Tracking App:', error);
      }
    };

    loadDependencies();

    // Cleanup on unmount
    return () => {
      if (window.fireApp) {
        // Stop any running processes
        if (window.fireApp.socket) {
          window.fireApp.socket.emit('stop_playback');
          window.fireApp.socket.disconnect();
        }
        window.fireApp = null;
      }
    };
  }, []);

  return (
    <Box sx={{ height: '100vh', overflow: 'hidden' }}>
      {/* Fire Tracking App Styles */}
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #2c3e50;
          color: #ecf0f1;
          overflow: hidden;
        }

        #map {
          width: 100vw;
          height: 100vh;
          cursor: grab;
        }

        #map:active {
          cursor: grabbing;
        }

        /* Control Panel - Slideable from left */
        .control-panel {
          position: absolute;
          top: 20px;
          left: 20px;
          z-index: 1000;
          background: rgba(44, 62, 80, 0.95);
          border-radius: 0 10px 10px 0;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          min-width: 350px;
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          transition: left 0.3s ease;
        }

        .control-panel.hidden {
          left: -370px;
        }

        .control-panel h2 {
          color: #3498db;
          margin-bottom: 15px;
          font-size: 1.2em;
          border-bottom: 1px solid #34495e;
          padding-bottom: 8px;
          text-align: center;
        }

        .control-group {
          margin-bottom: 20px;
        }

        .control-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #bdc3c7;
        }

        .date-inputs {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }

        .date-inputs input {
          flex: 1;
          padding: 8px;
          border: 1px solid #2c3e50;
          border-radius: 4px;
          background: #2c3e50;
          color: #ecf0f1;
          font-size: 14px;
        }

        .speed-control {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          margin-top: 16px;
        }

        #speed-slider {
          flex: 1;
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          background: #2c3e50;
          outline: none;
          border-radius: 3px;
        }

        #speed-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          background: #3498db;
          cursor: pointer;
          border-radius: 50%;
        }

        .playback-controls {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }

        .btn {
          padding: 10px 16px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
          flex: 1;
        }

        .btn-primary {
          background: #3498db;
          color: white;
        }

        .btn-primary:hover {
          background: #2980b9;
        }

        .btn-success {
          background: #27ae60;
          color: white;
        }

        .btn-success:hover {
          background: #229954;
        }

        .btn-warning {
          background: #f39c12;
          color: white;
        }

        .btn-warning:hover {
          background: #e67e22;
        }

        .btn-danger {
          background: #e74c3c;
          color: white;
        }

        .btn-danger:hover {
          background: #c0392b;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .statistics {
          background: #34495e;
          border-radius: 5px;
          padding: 15px;
          margin-bottom: 15px;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .stat-label {
          color: #bdc3c7;
        }

        .stat-value {
          color: #3498db;
          font-weight: 500;
        }

        /* Mini Fire Activity Chart */
        .fire-chart {
          width: 100%;
          height: 40px;
          background: rgba(52, 73, 94, 0.5);
          border-radius: 3px;
          margin-bottom: 10px;
          position: relative;
          overflow: hidden;
        }

        .fire-chart-bars {
          display: flex;
          align-items: end;
          height: 100%;
          gap: 1px;
          padding: 2px;
        }

        .fire-chart-bar {
          flex: 1;
          background: linear-gradient(to top, 
            #e74c3c 0%, 
            #f39c12 50%, 
            #f1c40f 100%);
          border-radius: 1px;
          min-height: 2px;
          transition: height 0.3s ease;
        }

        .fire-chart-label {
          position: absolute;
          top: -10px;
          left: 4px;
          font-size: 10px;
          color: #bdc3c7;
          font-weight: 500;
        }

        /* Time Display Overlay */
        .time-overlay {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 200px;
          height: 40px;
        }

        .current-time {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          font-size: 1.5em;
          font-weight: bold;
          color: #3498db;
          text-align: center;
          transition: all 0.1s ease;
          white-space: nowrap;
        }
        
        .current-time.pop {
          transform: scale(1.25);
          color: #85c1e9;
        }

        /* Interval Pulse Indicator */
        .interval-pulse {
          width: 18px;
          height: 18px;
          min-width: 18px;
          min-height: 18px;
          background-color: #3498db;
          border-radius: 50%;
          opacity: 1;
          transform: scale(0.8);
          transition: transform 0.2s ease-out;
          flex-shrink: 0;
        }

        .interval-pulse.pulse {
          transform: scale(1.1);
        }

        /* Control Panel Toggle Button */
        .control-toggle {
          position: absolute;
          top: 20px;
          left: 20px;
          z-index: 1500;
          background: rgba(44, 62, 80, 0.9);
          border: none;
          color: #3498db;
          padding: 10px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
        }

        .control-toggle:hover {
          background: rgba(44, 62, 80, 1);
          color: #2980b9;
        }

        /* Custom Zoom Controls */
        .zoom-controls {
          position: absolute;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
          display: flex;
          background: rgba(44, 62, 80, 0.9);
          border-radius: 5px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .zoom-btn {
          background: transparent;
          border: none;
          color: #3498db;
          padding: 10px 15px;
          cursor: pointer;
          font-size: 18px;
          font-weight: bold;
          transition: background-color 0.2s;
        }

        .zoom-btn:hover {
          background: rgba(52, 152, 219, 0.2);
        }

        .zoom-btn:first-child {
          border-radius: 5px 0 0 5px;
        }

        .zoom-btn:last-child {
          border-radius: 0 5px 5px 0;
        }

        .zoom-btn + .zoom-btn {
          border-left: 1px solid rgba(52, 152, 219, 0.3);
        }

        /* Fire Marker Styles */
        .fire-marker {
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.8);
          transition: opacity 0.1s ease;
        }

        .fire-marker.low {
          background-color: rgba(255, 255, 0, 0.8);
        }

        .fire-marker.medium {
          background-color: rgba(255, 165, 0, 0.8);
        }

        .fire-marker.high {
          background-color: rgba(255, 0, 0, 0.8);
        }

        /* Loading Indicator */
        .loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 3000;
          background: rgba(44, 62, 80, 0.95);
          padding: 30px;
          border-radius: 10px;
          text-align: center;
          color: #3498db;
          display: none;
        }

        .loading.show {
          display: block;
        }

        .spinner {
          border: 3px solid rgba(52, 152, 219, 0.3);
          border-top: 3px solid #3498db;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
          margin: 0 auto 15px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .control-panel {
            top: 10px;
            left: 10px;
            right: auto;
            min-width: calc(100vw - 40px);
            max-height: 40vh;
          }

          .control-panel.hidden {
            left: -100%;
          }

          .time-overlay {
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            text-align: center;
          }

          .control-toggle {
            top: 10px;
          }

          .zoom-controls {
            bottom: 10px;
            right: 10px;
          }
        }
      `}</style>

      {/* Map Container */}
      <div id="map" ref={mapRef}></div>

      {/* Control Panel Toggle Button */}
      <button className="control-toggle" id="control-toggle">🎛️</button>

      {/* Control Panel */}
      <div className="control-panel" id="control-panel">
        <h2>🔥 Fire Tracking Control</h2>
        
        {/* Date Range Selection */}
        <div className="control-group">
          <label>Date Range:</label>
          <div className="date-inputs">
            <input type="date" id="start-date" defaultValue="2023-08-01" />
            <input type="date" id="end-date" defaultValue="2025-05-31" />
          </div>
        </div>

        {/* Speed Control */}
        <div className="control-group">
          <label>Playback Speed: <span id="speed-label">1 day/sec</span></label>
          <div className="speed-control">
            <input type="range" id="speed-slider" min="0" max="4" defaultValue="1" step="1" />
          </div>
        </div>

        {/* Playback Controls */}
        <div className="control-group">
          <div className="playback-controls">
            <button className="btn btn-success" id="play-btn">Play</button>
            <button className="btn btn-warning" id="pause-btn" disabled>Pause</button>
            <button className="btn btn-danger" id="stop-btn" disabled>Stop</button>
          </div>
        </div>

        {/* Statistics */}
        <div className="statistics">
          {/* Mini Fire Activity Chart */}
          <div className="fire-chart">
            <div className="fire-chart-label">Fire Activity</div>
            <div className="fire-chart-bars" id="fire-chart-bars">
              {/* Bars will be generated dynamically */}
            </div>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">Active Fires:</span>
            <span className="stat-value" id="active-fires">0</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Processed:</span>
            <span className="stat-value" id="total-fires">0</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Status:</span>
            <span className="stat-value" id="playback-status">Ready</span>
          </div>
        </div>
      </div>

      {/* Time Display Overlay */}
      <div className="time-overlay">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="interval-pulse" id="interval-pulse"></div>
          <div className="current-time" id="current-time-1">--</div>
          <div className="current-time" id="current-time-2" style={{ opacity: 0 }}>--</div>
        </div>
      </div>

      {/* Custom Zoom Controls */}
      <div className="zoom-controls">
        <button className="zoom-btn" id="zoom-out">−</button>
        <button className="zoom-btn" id="zoom-in">+</button>
      </div>

      {/* Loading Indicator */}
      <div className="loading" id="loading">
        <div className="spinner"></div>
        <div>Loading fire data...</div>
      </div>

      {/* Fire Tracking App Script */}
      <script dangerouslySetInnerHTML={{
        __html: `
        class FireTrackingApp {
          constructor() {
            this.map = null;
            this.socket = null;
            this.config = null;
            this.currentMarkers = new Map();
            this.playbackState = 'stopped';
            this.fadeTimers = new Map();
            this.simulationEnded = false;
            
            this.fireEvents = [];
            this.currentSimulationTime = null;
            this.currentSpeed = 'slow';
            
            this.fireHistory = [];
            this.maxHistoryLength = 20;
            
            this.initializeApp();
          }

          initializeApp() {
            this.pulseTimer = null;
            
            // Connect to main backend server on port 5001
            this.socket = io('http://localhost:5001');
            this.setupSocketEvents();
            
            this.initializeMap();
            this.setupUIHandlers();
            this.initializeFireChart();
            
            const activeFiresEl = document.getElementById('active-fires');
            const totalFiresEl = document.getElementById('total-fires');
            if (activeFiresEl) activeFiresEl.textContent = '0';
            if (totalFiresEl) totalFiresEl.textContent = '0';
          }

          setupSocketEvents() {
            this.socket.on('connect', () => {
              console.log('Connected to fire tracking server');
            });

            this.socket.on('disconnect', () => {
              console.log('Disconnected from fire tracking server');
            });

            this.socket.on('config', (config) => {
              console.log('Received config:', config);
              this.config = config;
              this.updateSpeedLabels();
            });

            this.socket.on('fire_update', (data) => {
              console.log('🔥 RECEIVED fire_update:', data.fires.length, 'fires at', data.timestamp);
              this.handleFireUpdate(data);
            });

            this.socket.on('playback_started', (data) => {
              console.log('🚀 RECEIVED playback_started event:', data);
              this.simulationEnded = false;
              this.clearAllMarkers();
              this.clearAllLayers();
              this.fireEvents = [];
              this.currentSimulationTime = null;
              
              this.startPulseTimer();
              
              const activeFiresEl = document.getElementById('active-fires');
              const totalFiresEl = document.getElementById('total-fires');
              if (activeFiresEl) activeFiresEl.textContent = '0';
              if (totalFiresEl) totalFiresEl.textContent = '0';
              
              this.playbackState = 'playing';
              this.updatePlaybackControls();
              this.updateStatus('Playing');
              this.hideLoading();
            });

            this.socket.on('playback_paused', () => {
              console.log('⏸️ RECEIVED playback_paused event');
              this.playbackState = 'paused';
              this.updatePlaybackControls();
              this.updateStatus('Paused');
              this.stopPulseTimer();
              this.stopAllLayerFades();
            });

            this.socket.on('playback_resumed', () => {
              console.log('▶️ RECEIVED playback_resumed event');
              this.playbackState = 'playing';
              this.updatePlaybackControls();
              this.updateStatus('Playing');
              this.startPulseTimer();
              this.clearAllLayers();
              this.simulationEnded = false;
            });

            this.socket.on('playback_stopped', () => {
              console.log('🛑 RECEIVED playback_stopped event');
              this.simulationEnded = true;
              this.playbackState = 'stopped';
              this.updatePlaybackControls();
              this.updateStatus('Stopped');
              this.stopAllLayerFades();
              this.stopPulseTimer();
              this.hideLoading();
            });

            this.socket.on('playback_ended', () => {
              console.log('🏁 RECEIVED playback_ended event');
              this.simulationEnded = true;
              this.playbackState = 'stopped';
              this.stopAllLayerFades();
              this.stopPulseTimer();
              this.updatePlaybackControls();
              this.updateStatus('Ready');
              this.hideLoading();
              
              setTimeout(() => {
                const playBtn = document.getElementById('play-btn');
                const stopBtn = document.getElementById('stop-btn');
                const pauseBtn = document.getElementById('pause-btn');
                
                if (playBtn) playBtn.disabled = false;
                if (stopBtn) stopBtn.disabled = true;
                if (pauseBtn) {
                  pauseBtn.disabled = true;
                  pauseBtn.textContent = 'Pause';
                }
              }, 100);
            });

            this.socket.on('playback_error', (data) => {
              console.error('Playback error:', data.error);
              this.updateStatus(\`Error: \${data.error}\`);
              this.playbackState = 'stopped';
              this.updatePlaybackControls();
              this.hideLoading();
            });

            this.socket.on('speed_changed', (data) => {
              this.currentSpeed = data.speed;
              this.updateSpeedDisplay(data.speed);
            });
          }

          initializeMap() {
            this.map = L.map('map', {
              center: [48.3794, 31.1656],
              zoom: 7,
              minZoom: 6,
              maxZoom: 8,
              zoomControl: false,
              dragging: true,
              touchZoom: true,
              doubleClickZoom: true,
              scrollWheelZoom: true,
              boxZoom: true,
              keyboard: true,
              zoomAnimation: true,
              fadeAnimation: true,
              markerZoomAnimation: true
            });

            const tileLayer = L.tileLayer('http://localhost:5001/tiles/{z}/{x}/{y}.png', {
              attribution: 'Map data © OpenStreetMap contributors',
              maxZoom: 8,
              minZoom: 6,
              tileSize: 256,
              zoomOffset: 0,
              detectRetina: false,
              bounds: [[44.0, 22.0], [56.0, 50.0]]
            });

            tileLayer.addTo(this.map);

            tileLayer.on('tileerror', (e) => {
              console.warn('Tile loading error, falling back to online tiles:', e);
              // Fallback to online tiles if local tiles fail
              const onlineTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: 'Map data © OpenStreetMap contributors',
                maxZoom: 8,
                minZoom: 6,
              });
              this.map.removeLayer(tileLayer);
              onlineTileLayer.addTo(this.map);
            });

            this.canvasLayers = [];
            this.fadeTimers = [];
            
            console.log('Map initialized with canvas layer system');
          }
          
          createCanvasLayer(fires, timestamp) {
            console.log(\`Creating full-map canvas overlay with \${fires.length} fires\`);
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const mapSize = this.map.getSize();
            canvas.width = mapSize.x;
            canvas.height = mapSize.y;
            
            const bounds = this.map.getBounds();
            
            const offscreenCanvas = document.createElement('canvas');
            offscreenCanvas.width = mapSize.x;
            offscreenCanvas.height = mapSize.y;
            const offscreenCtx = offscreenCanvas.getContext('2d');
            
            let drawnCount = 0;
            
            fires.forEach(fire => {
              const point = this.map.latLngToContainerPoint([fire.latitude, fire.longitude]);
              
              if (point.x >= 0 && point.x <= mapSize.x && point.y >= 0 && point.y <= mapSize.y) {
                let color;
                switch(fire.confidence) {
                  case 'high': color = '#e74c3c'; break;
                  case 'medium': color = '#f39c12'; break;
                  default: color = '#f1c40f'; break;
                }
                
                const size = this.calculateFireSize(fire.frp || 0);
                
                offscreenCtx.beginPath();
                offscreenCtx.arc(point.x, point.y, size, 0, 2 * Math.PI);
                offscreenCtx.fillStyle = color;
                offscreenCtx.fill();
                drawnCount++;
              }
            });
            
            ctx.drawImage(offscreenCanvas, 0, 0);
            console.log(\`Drew \${drawnCount} out of \${fires.length} fires on full canvas\`);
            
            const dataURL = canvas.toDataURL();
            const imageOverlay = L.imageOverlay(dataURL, bounds, {
              opacity: 1.0,
              interactive: false,
              pane: 'overlayPane'
            });
            
            imageOverlay.addTo(this.map);
            
            const layerInfo = {
              overlay: imageOverlay,
              canvas: canvas,
              fires: fires,
              timestamp: timestamp,
              fireCount: fires.length,
              bounds: bounds
            };
            
            this.canvasLayers.push(layerInfo);
            this.startLayerFade(layerInfo);
            
            console.log(\`Created image overlay with \${fires.length} fires\`);
            return layerInfo;
          }
          
          startLayerFade(layerInfo) {
            if (this.simulationEnded) {
              console.log('Simulation ended - keeping layer visible without fade');
              layerInfo.overlay.setOpacity(1.0);
              return;
            }
            
            const visibleDuration = 100;
            const fadeDuration = 1700;
            
            layerInfo.overlay.setOpacity(1.0);
            
            const overlayElement = layerInfo.overlay.getElement();
            if (overlayElement) {
              overlayElement.style.transition = \`opacity \${fadeDuration}ms cubic-bezier(0.55, 0.055, 0.675, 0.19)\`;
            }
            
            console.log(\`Layer with \${layerInfo.fireCount} fires: visible for \${visibleDuration}ms, then fade for \${fadeDuration}ms\`);
            
            setTimeout(() => {
              console.log(\`Starting fade animation for layer with \${layerInfo.fireCount} fires\`);
              layerInfo.overlay.setOpacity(0.0);
            }, visibleDuration);
            
            const fadeTimer = setTimeout(() => {
              console.log(\`Removing completely faded overlay with \${layerInfo.fireCount} fires\`);
              
              if (layerInfo.overlay && this.map.hasLayer(layerInfo.overlay)) {
                this.map.removeLayer(layerInfo.overlay);
              }
              
              const index = this.canvasLayers.indexOf(layerInfo);
              if (index > -1) {
                this.canvasLayers.splice(index, 1);
                console.log(\`Overlay removed from array. \${this.canvasLayers.length} layers remaining\`);
              }
            }, visibleDuration + fadeDuration);
            
            this.fadeTimers.push(fadeTimer);
          }
          
          calculateFireSize(frp) {
            const zoom = this.map.getZoom();
            const zoomScale = Math.pow(3.0, zoom - 6);
            
            const baseSize = 3 * zoomScale;
            const maxSize = 18 * zoomScale;
            
            const frpContribution = (frp / 20) * zoomScale;
            
            return Math.min(maxSize, baseSize + frpContribution);
          }

          setupUIHandlers() {
            const playBtn = document.getElementById('play-btn');
            if (playBtn) {
              playBtn.addEventListener('click', () => {
                console.log('=== PLAY BUTTON CLICKED ===');
                
                this.socket.emit('stop_playback');
                
                this.simulationEnded = false;
                this.playbackState = 'stopped';
                this.clearAllLayers();
                this.stopPulseTimer();
                
                this.updateStatus('Starting...');
                
                setTimeout(() => {
                  this.startPlayback();
                }, 100);
              });
            }

            const pauseBtn = document.getElementById('pause-btn');
            if (pauseBtn) {
              pauseBtn.addEventListener('click', () => {
                this.pausePlayback();
              });
            }

            const stopBtn = document.getElementById('stop-btn');
            if (stopBtn) {
              stopBtn.addEventListener('click', () => {
                this.stopPlayback();
              });
            }

            const speedSlider = document.getElementById('speed-slider');
            if (speedSlider) {
              speedSlider.addEventListener('input', (e) => {
                this.changeSpeed(e.target.value);
              });
            }

            const startDate = document.getElementById('start-date');
            const endDate = document.getElementById('end-date');
            
            if (startDate) startDate.addEventListener('change', () => this.validateDateRange());
            if (endDate) endDate.addEventListener('change', () => this.validateDateRange());

            this.setupControlPanelToggle();

            const zoomIn = document.getElementById('zoom-in');
            const zoomOut = document.getElementById('zoom-out');
            
            if (zoomIn) zoomIn.addEventListener('click', () => this.map.zoomIn());
            if (zoomOut) zoomOut.addEventListener('click', () => this.map.zoomOut());
          }

          setupControlPanelToggle() {
            const controlToggle = document.getElementById('control-toggle');
            const controlPanel = document.getElementById('control-panel');

            if (controlToggle && controlPanel) {
              controlToggle.addEventListener('click', () => {
                controlPanel.classList.toggle('hidden');
              });
            }
          }

          updateSpeedLabels() {
            if (!this.config) return;
            
            const slider = document.getElementById('speed-slider');
            const speedKeys = Object.keys(this.config.playback_speeds);
            
            const currentIndex = speedKeys.indexOf(this.config.default_speed);
            if (currentIndex !== -1 && slider) {
              slider.value = currentIndex;
            }
            
            this.updateSpeedDisplay(this.config.default_speed);
          }

          updateSpeedDisplay(speedKey) {
            if (!this.config) return;
            
            const label = document.getElementById('speed-label');
            const displayLabel = this.config.speed_labels[speedKey] || speedKey;
            if (label) label.textContent = displayLabel;
          }

          validateDateRange() {
            const startDateValue = document.getElementById('start-date')?.value;
            const endDateValue = document.getElementById('end-date')?.value;
            
            if (!startDateValue || !endDateValue) return false;
            
            const startDate = new Date(startDateValue);
            const endDate = new Date(endDateValue);

            if (startDate >= endDate) {
              alert('Start date must be before end date');
              return false;
            }

            return true;
          }

          startPlayback() {
            if (!this.validateDateRange()) return;

            const startDate = document.getElementById('start-date')?.value;
            const endDate = document.getElementById('end-date')?.value;
            const speedSlider = document.getElementById('speed-slider');
            
            if (!startDate || !endDate || !speedSlider) return;
            
            const speedKeys = ['slowest', 'slow', 'normal', 'fast', 'fastest'];
            const speedKey = speedKeys[parseInt(speedSlider.value)] || 'slow';

            console.log(\`📡 Starting playback: \${startDate} to \${endDate} at \${speedKey} speed\`);

            this.showLoading();
            this.updateStatus('Starting...');

            this.socket.emit('start_playback', {
              start_date: startDate,
              end_date: endDate,
              speed: speedKey
            });
          }

          pausePlayback() {
            if (this.playbackState === 'playing') {
              this.socket.emit('pause_playback');
            } else if (this.playbackState === 'paused') {
              this.socket.emit('resume_playback');
            }
          }

          stopPlayback() {
            this.socket.emit('stop_playback');
            this.playbackState = 'stopped';
            this.stopPulseTimer();
          }

          changeSpeed(sliderValue) {
            const speedKeys = ['slowest', 'slow', 'normal', 'fast', 'fastest'];
            const speedKey = speedKeys[parseInt(sliderValue)] || 'slow';
            
            this.updateSpeedDisplay(speedKey);
            
            if (this.playbackState === 'playing') {
              this.socket.emit('change_speed', { speed: speedKey });
            }
          }

          handleFireUpdate(data) {
            const { fires, timestamp, statistics } = data;
            
            this.currentSimulationTime = new Date(timestamp);
            
            const intervalData = {
              timestamp: new Date(timestamp),
              count: fires.length
            };
            this.fireEvents.push(intervalData);
            
            this.updateTimeDisplay(timestamp);
            
            const activeFires = this.calculateActiveFires();
            
            this.updateStatistics({
              ...statistics,
              active_fires: activeFires
            });
            
            if (fires.length > 0) {
              console.log(\`Creating canvas layer with \${fires.length} fires\`);
              this.createCanvasLayer(fires, timestamp);
            } else {
              console.log('No fires in this interval, skipping canvas layer');
            }
          }

          calculateActiveFires() {
            if (this.fireEvents.length === 0) return 0;
            
            const latestInterval = this.fireEvents[this.fireEvents.length - 1];
            const activeFires = latestInterval.count;
            
            if (this.fireEvents.length > 10) {
              this.fireEvents = this.fireEvents.slice(-10);
            }
            
            return activeFires;
          }

          clearAllMarkers() {
            this.canvasLayers.forEach(layerInfo => {
              if (layerInfo.element && layerInfo.element.parentNode) {
                layerInfo.element.parentNode.removeChild(layerInfo.element);
              }
            });
            this.canvasLayers = [];

            this.fadeTimers.forEach(timer => clearTimeout(timer));
            this.fadeTimers = [];
            
            this.fireHistory = [];
            const bars = document.querySelectorAll('.fire-chart-bar');
            bars.forEach(bar => {
              bar.style.height = '2px';
            });
          }
          
          stopAllLayerFades() {
            this.fadeTimers.forEach(timer => clearTimeout(timer));
            this.fadeTimers = [];
            
            this.canvasLayers.forEach(layerInfo => {
              if (layerInfo.overlay) {
                layerInfo.overlay.setOpacity(1.0);
                const overlayElement = layerInfo.overlay.getElement();
                if (overlayElement) {
                  overlayElement.style.transition = 'none';
                }
              }
            });
            
            console.log(\`Stopped fading on \${this.canvasLayers.length} image overlay layers - all frozen at full opacity\`);
          }
          
          clearAllLayers() {
            console.log(\`🧹 CLEARING \${this.canvasLayers.length} canvas layers and \${this.fadeTimers.length} fade timers\`);
            
            this.canvasLayers.forEach((layerInfo, index) => {
              if (layerInfo.overlay) {
                if (this.map.hasLayer(layerInfo.overlay)) {
                  this.map.removeLayer(layerInfo.overlay);
                }
                const element = layerInfo.overlay.getElement();
                if (element && element.parentNode) {
                  element.parentNode.removeChild(element);
                }
              }
            });
            
            this.fadeTimers.forEach(timer => clearTimeout(timer));
            this.fadeTimers = [];
            this.canvasLayers = [];
            
            this.simulationEnded = false;
            
            console.log('All layers cleared and arrays reset');
          }

          startPulseTimer() {
            this.stopPulseTimer();
            
            this.pulseTimer = setInterval(() => {
              this.pulseIntervalIndicator();
            }, 1000);
          }
          
          stopPulseTimer() {
            if (this.pulseTimer) {
              clearInterval(this.pulseTimer);
              this.pulseTimer = null;
            }
          }

          pulseIntervalIndicator() {
            const pulse = document.getElementById('interval-pulse');
            if (pulse) {
              pulse.classList.add('pulse');
              
              setTimeout(() => {
                pulse.classList.remove('pulse');
                pulse.style.transform = 'scale(1.0)';
              }, 200);
              
              setTimeout(() => {
                pulse.style.transform = 'scale(0.8)';
              }, 800);
            }
          }

          updateTimeDisplay(timestamp) {
            const date = new Date(timestamp);
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const display = \`\${monthNames[date.getMonth()]} \${date.getFullYear()}\`;
            
            const element1 = document.getElementById('current-time-1');
            const element2 = document.getElementById('current-time-2');
            
            if (element2) element2.style.opacity = '0';
            
            if (element1 && element1.textContent !== display && element1.textContent !== '--') {
              element1.textContent = display;
              element1.classList.add('pop');
              
              setTimeout(() => {
                element1.classList.remove('pop');
              }, 100);
            } else if (element1 && element1.textContent === '--') {
              element1.textContent = display;
            }
          }

          initializeFireChart() {
            const chartBars = document.getElementById('fire-chart-bars');
            if (chartBars) {
              for (let i = 0; i < this.maxHistoryLength; i++) {
                const bar = document.createElement('div');
                bar.className = 'fire-chart-bar';
                bar.style.height = '2px';
                chartBars.appendChild(bar);
              }
            }
          }

          updateFireChart(currentFireCount) {
            this.fireHistory.push(currentFireCount);
            
            if (this.fireHistory.length > this.maxHistoryLength) {
              this.fireHistory.shift();
            }
            
            const maxCount = Math.max(...this.fireHistory, 1);
            
            const bars = document.querySelectorAll('.fire-chart-bar');
            this.fireHistory.forEach((count, index) => {
              if (bars[index]) {
                const height = Math.max(2, (count / maxCount) * 34);
                bars[index].style.height = \`\${height}px\`;
              }
            });
            
            for (let i = this.fireHistory.length; i < bars.length; i++) {
              bars[i].style.height = '2px';
            }
          }

          updateStatistics(stats) {
            const currentFireCount = stats.active_fires || 0;
            const totalFires = stats.total_fires || 0;
            
            const activeFiresEl = document.getElementById('active-fires');
            const totalFiresEl = document.getElementById('total-fires');
            
            if (activeFiresEl) activeFiresEl.textContent = String(currentFireCount);
            if (totalFiresEl) totalFiresEl.textContent = String(totalFires);
            
            this.updateFireChart(currentFireCount);
          }

          updateStatus(status) {
            const statusEl = document.getElementById('playback-status');
            if (statusEl) statusEl.textContent = status;
          }

          updatePlaybackControls() {
            const playBtn = document.getElementById('play-btn');
            const pauseBtn = document.getElementById('pause-btn');
            const stopBtn = document.getElementById('stop-btn');

            switch (this.playbackState) {
              case 'stopped':
                if (playBtn) playBtn.disabled = false;
                if (pauseBtn) {
                  pauseBtn.disabled = true;
                  pauseBtn.textContent = 'Pause';
                }
                if (stopBtn) stopBtn.disabled = true;
                break;
              case 'playing':
                if (playBtn) playBtn.disabled = true;
                if (pauseBtn) {
                  pauseBtn.disabled = false;
                  pauseBtn.textContent = 'Pause';
                }
                if (stopBtn) stopBtn.disabled = false;
                break;
              case 'paused':
                if (playBtn) playBtn.disabled = true;
                if (pauseBtn) {
                  pauseBtn.disabled = false;
                  pauseBtn.textContent = 'Resume';
                }
                if (stopBtn) stopBtn.disabled = false;
                break;
            }
          }

          resetToReadyState() {
            console.log('Resetting to ready state');
            
            this.socket.emit('stop_playback');
            
            this.clearAllLayers();
            this.stopPulseTimer();
            
            this.playbackState = 'stopped';
            this.simulationEnded = false;
            this.updateStatus('Ready');
            
            const playBtn = document.getElementById('play-btn');
            const pauseBtn = document.getElementById('pause-btn');
            const stopBtn = document.getElementById('stop-btn');
            
            if (playBtn) playBtn.disabled = false;
            if (pauseBtn) {
              pauseBtn.disabled = true;
              pauseBtn.textContent = 'Pause';
            }
            if (stopBtn) stopBtn.disabled = true;
            
            const activeFiresEl = document.getElementById('active-fires');
            const totalFiresEl = document.getElementById('total-fires');
            const currentTime1 = document.getElementById('current-time-1');
            const currentTime2 = document.getElementById('current-time-2');
            
            if (activeFiresEl) activeFiresEl.textContent = '0';
            if (totalFiresEl) totalFiresEl.textContent = '0';
            if (currentTime1) currentTime1.textContent = '--';
            if (currentTime2) {
              currentTime2.textContent = '--';
              currentTime2.style.opacity = '0';
            }
          }

          showLoading() {
            const loading = document.getElementById('loading');
            if (loading) loading.classList.add('show');
          }

          hideLoading() {
            const loading = document.getElementById('loading');
            if (loading) loading.classList.remove('show');
          }
        }

        // Make FireTrackingApp available globally
        window.FireTrackingApp = FireTrackingApp;
        `
      }} />
    </Box>
  );
}

// Declare global window properties for TypeScript
declare global {
  interface Window {
    io: any;
    L: any;
    fireApp: any;
    FireTrackingApp: any;
  }
}