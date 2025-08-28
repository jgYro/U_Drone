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
              loadFireTrackingAppScript();
            };
            document.head.appendChild(leafletScript);
          } else {
            loadFireTrackingAppScript();
          }
        };
        document.head.appendChild(socketScript);
      } else if (window.L) {
        loadFireTrackingAppScript();
      }
    };

    const loadFireTrackingAppScript = () => {
      // Create and execute the FireTrackingApp script
      const script = document.createElement('script');
      script.textContent = `
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
            this.currentFires = []; // Track current active fires
            
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

            this.socket.on('fire_update', (data) => {
              console.log('🔥 RECEIVED fire_update:', data.fires.length, 'fires at', data.timestamp);
              this.handleFireUpdate(data);
            });

            this.socket.on('playback_started', (data) => {
              console.log('🚀 RECEIVED playback_started event:', data);
              this.simulationEnded = false;
              this.clearAllLayers();
              this.fireEvents = [];
              this.currentSimulationTime = null;
              
              // Reset fire chart history and clear the chart
              this.fireHistory = [];
              this.initializeFireChart();
              
              // Clear current fires
              this.currentFires = [];
              
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
            });

            this.socket.on('speed_changed', (data) => {
              console.log('⚡ RECEIVED speed_changed event:', data);
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
              zoomControl: false
            });

            const tileLayer = L.tileLayer('http://localhost:5001/tiles/{z}/{x}/{y}.png', {
              attribution: 'Map data © OpenStreetMap contributors',
              maxZoom: 8,
              minZoom: 6
            });

            tileLayer.addTo(this.map);
            this.canvasLayers = [];
            this.fadeTimers = [];
          }

          setupUIHandlers() {
            const playBtn = document.getElementById('play-btn');
            if (playBtn) {
              playBtn.addEventListener('click', () => {
                this.startPlayback();
              });
            }

            const stopBtn = document.getElementById('stop-btn');
            if (stopBtn) {
              stopBtn.addEventListener('click', () => {
                this.stopPlayback();
              });
            }

            // Add speed slider handler
            const speedSlider = document.getElementById('speed-slider');
            if (speedSlider) {
              speedSlider.addEventListener('input', (e) => {
                this.changeSpeed(e.target.value);
              });
            }
          }

          startPlayback() {
            const startDate = document.getElementById('start-date')?.value;
            const endDate = document.getElementById('end-date')?.value;
            const speedSlider = document.getElementById('speed-slider');
            
            if (!startDate || !endDate) return;
            
            // Get speed from slider
            const speedKeys = ['slowest', 'slow', 'normal', 'fast', 'fastest'];
            const speedKey = speedKeys[parseInt(speedSlider?.value || '1')] || 'normal';
            
            console.log('📡 Starting playback:', startDate, 'to', endDate, 'at speed:', speedKey);
            this.socket.emit('start_playback', {
              start_date: startDate,
              end_date: endDate,
              speed: speedKey
            });
          }

          stopPlayback() {
            this.socket.emit('stop_playback');
          }

          changeSpeed(sliderValue) {
            const speedKeys = ['slowest', 'slow', 'normal', 'fast', 'fastest'];
            const speedKey = speedKeys[parseInt(sliderValue)] || 'normal';
            
            console.log('🎚️ Changing speed to:', speedKey);
            
            // Update speed label
            const speedLabel = document.getElementById('speed-label');
            if (speedLabel) {
              const speedLabels = {
                'slowest': '0.5 day/sec',
                'slow': '1 day/sec', 
                'normal': '2 days/sec',
                'fast': '5 days/sec',
                'fastest': '10 days/sec'
              };
              speedLabel.textContent = speedLabels[speedKey] || speedKey;
            }
            
            // Update current speed
            this.currentSpeed = speedKey;
            
            // Adjust fade durations for existing layers based on new speed
            this.adjustLayerFadeDurations(speedKey);
            
            // Send speed change to backend if playing
            if (this.playbackState === 'playing') {
              this.socket.emit('change_speed', { speed: speedKey });
            }
          }

          updateSpeedDisplay(speedKey) {
            const speedLabel = document.getElementById('speed-label');
            if (speedLabel) {
              const speedLabels = {
                'slowest': '0.5 day/sec',
                'slow': '1 day/sec', 
                'normal': '2 days/sec',
                'fast': '5 days/sec',
                'fastest': '10 days/sec'
              };
              speedLabel.textContent = speedLabels[speedKey] || speedKey;
            }
            
            // Update slider position
            const speedSlider = document.getElementById('speed-slider');
            if (speedSlider) {
              const speedKeys = ['slowest', 'slow', 'normal', 'fast', 'fastest'];
              const index = speedKeys.indexOf(speedKey);
              if (index !== -1) {
                speedSlider.value = index;
              }
            }
          }

          adjustLayerFadeDurations(newSpeed) {
            // Speed durations for reference
            const speedDurations = {
              'slowest': 6000,   // 6 seconds
              'slow': 4000,      // 4 seconds  
              'normal': 3000,    // 3 seconds
              'fast': 2000,      // 2 seconds
              'fastest': 1500    // 1.5 seconds
            };
            
            const newDuration = speedDurations[newSpeed] || 3000;
            
            // For existing layers, we can't easily change their fade duration
            // But we can log the change for debugging
            
            // Optionally, we could restart fades for existing layers
            // but that might be jarring, so we'll let them continue with their original timing
          }

          handleFireUpdate(data) {
            // Only process fire updates when playback is active
            if (this.playbackState !== 'playing') {
              console.log('Ignoring fire update - playback not active');
              return;
            }
            
            const { fires, timestamp, statistics } = data;
            console.log('Handling fire update:', fires.length, 'fires');
            
            // Store current fires for active count
            this.currentFires = fires;
            
            // Update the time display
            this.updateTimeDisplay(timestamp);
            
            // Update the fire activity chart
            this.updateFireChart(fires.length);
            
            // Only create canvas layer if there are fires and we're not overwhelmed
            if (fires.length > 0 && this.canvasLayers.length < 6) {
              // Use throttled rendering to prevent overwhelming the system
              if (!this._renderThrottle) {
                this._renderThrottle = true;
                requestAnimationFrame(() => {
                  this.createCanvasLayer(fires, timestamp);
                  this._renderThrottle = false;
                });
              }
            } else if (fires.length === 0) {
              console.log('No fires in this interval, skipping canvas layer');
            }
            
            this.updateStatistics(statistics);
          }

          createCanvasLayer(fires, timestamp) {
            // Performance: Allow more layers for smoother overlap effect
            if (this.canvasLayers.length > 6) {
              const oldLayer = this.canvasLayers.shift();
              if (oldLayer && this.map.hasLayer(oldLayer)) {
                this.map.removeLayer(oldLayer);
              }
            }
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const mapSize = this.map.getSize();
            canvas.width = mapSize.x;
            canvas.height = mapSize.y;
            
            const bounds = this.map.getBounds();
            
            // Optimize canvas context for better performance
            ctx.imageSmoothingEnabled = false; // Disable anti-aliasing for better performance
            ctx.lineWidth = 1;
            
            // Pre-calculate colors and use object for faster lookups
            const colors = {
              high: '#e74c3c',
              medium: '#f39c12',
              low: '#f1c40f'
            };
            
            // Batch all drawing operations for maximum performance
            ctx.save();
            
            // Draw all fires in optimized batches
            fires.forEach(fire => {
              const point = this.map.latLngToContainerPoint([fire.latitude, fire.longitude]);
              if (point.x >= 0 && point.x <= mapSize.x && point.y >= 0 && point.y <= mapSize.y) {
                const color = colors[fire.confidence] || colors.low;
                const size = this.calculateFireSize(fire.frp || 0);
                
                // Use more efficient drawing
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(Math.round(point.x), Math.round(point.y), size, 0, 2 * Math.PI);
                ctx.fill();
              }
            });
            
            ctx.restore();
            
            // Use more efficient image creation
            const dataURL = canvas.toDataURL('image/png', 0.9); // Slightly lower quality for better performance
            const imageOverlay = L.imageOverlay(dataURL, bounds, {
              opacity: 1.0,
              interactive: false
            });
            
            imageOverlay.addTo(this.map);
            this.canvasLayers.push(imageOverlay);
            
            // Start optimized fade animation
            this.startLayerFade(imageOverlay);
          }

          updateStatistics(stats) {
            // Calculate active fires from the current fires array
            const currentFireCount = this.currentFires ? this.currentFires.length : 0;
            const totalFires = stats.total_fires || 0;
            
            const activeFiresEl = document.getElementById('active-fires');
            const totalFiresEl = document.getElementById('total-fires');
            
            if (activeFiresEl) activeFiresEl.textContent = String(currentFireCount);
            if (totalFiresEl) totalFiresEl.textContent = String(totalFires);
          }

          updatePlaybackControls() {
            const playBtn = document.getElementById('play-btn');
            const stopBtn = document.getElementById('stop-btn');
            
            if (playBtn) playBtn.disabled = this.playbackState === 'playing';
            if (stopBtn) stopBtn.disabled = this.playbackState === 'stopped';
          }

          updateStatus(status) {
            const statusEl = document.getElementById('playback-status');
            if (statusEl) statusEl.textContent = status;
          }

          startPulseTimer() {
            this.stopPulseTimer();
            
            let lastTime = 0;
            const pulseInterval = 1000; // 1 second
            
            const animate = (currentTime) => {
              if (currentTime - lastTime >= pulseInterval) {
                const pulse = document.getElementById('interval-pulse');
                if (pulse) {
                  pulse.classList.add('pulse');
                  setTimeout(() => pulse.classList.remove('pulse'), 200);
                }
                lastTime = currentTime;
              }
              
              if (this.playbackState === 'playing') {
                this.pulseTimer = requestAnimationFrame(animate);
              }
            };
            
            this.pulseTimer = requestAnimationFrame(animate);
          }
          
          stopPulseTimer() {
            if (this.pulseTimer) {
              cancelAnimationFrame(this.pulseTimer);
              this.pulseTimer = null;
            }
          }

          clearAllLayers() {
            this.canvasLayers.forEach(layer => {
              if (this.map.hasLayer(layer)) {
                this.map.removeLayer(layer);
              }
            });
            this.canvasLayers = [];
          }
          
          stopAllLayerFades() {
            this.fadeTimers.forEach(timer => clearTimeout(timer));
            this.fadeTimers = [];
          }

          hideLoading() {
            const loading = document.getElementById('loading');
            if (loading) loading.classList.remove('show');
          }

          calculateFireSize(frp) {
            const zoom = this.map.getZoom();
            // Cache zoom calculations for better performance
            if (!this._zoomCache) {
              this._zoomCache = new Map();
            }
            
            let zoomScale = this._zoomCache.get(zoom);
            if (zoomScale === undefined) {
              // Use more efficient math operations
              zoomScale = Math.max(0.8, Math.min(2.0, (zoom - 6) * 0.3 + 1));
              this._zoomCache.set(zoom, zoomScale);
            }
            
            // Simplified FRP calculation with integer math
            const baseSize = 3;
            const frpSize = Math.min(6, (frp / 15) | 0); // Use bitwise OR for faster integer conversion
            
            return (baseSize + frpSize) * zoomScale | 0; // Use bitwise OR for faster rounding
          }

          startLayerFade(layer) {
            // Calculate fade duration based on playback speed for normalized effect
            const speedDurations = {
              'slowest': 3000,   // 3 seconds for very slow playback
              'slow': 2000,      // 2 seconds for slow playback  
              'normal': 1500,    // 1.5 seconds for normal playback
              'fast': 1000,      // 1 second for fast playback
              'fastest': 800     // 0.8 seconds for fastest playback
            };
            
            const duration = speedDurations[this.currentSpeed] || 1500;
            
            // Use more efficient animation with fewer frames for better performance
            let startTime = null;
            const frameInterval = 16; // Target ~60fps (16ms per frame)
            let lastFrameTime = 0;
            
            const animate = (currentTime) => {
              if (!startTime) startTime = currentTime;
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              
              // Only update every 16ms for smoother performance
              if (currentTime - lastFrameTime >= frameInterval) {
                if (layer && this.map.hasLayer(layer)) {
                  // Use easing function for smoother animation
                  const easeProgress = 1 - Math.pow(1 - progress, 2); // Ease-out
                  const opacity = 1 - (easeProgress * 0.8);
                  layer.setOpacity(opacity);
                  lastFrameTime = currentTime;
                }
              }
              
              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                // Remove layer after fade completes
                if (layer && this.map.hasLayer(layer)) {
                  this.map.removeLayer(layer);
                  const index = this.canvasLayers.indexOf(layer);
                  if (index > -1) {
                    this.canvasLayers.splice(index, 1);
                  }
                }
              }
            };
            
            requestAnimationFrame(animate);
          }

          updateTimeDisplay(timestamp) {
            const date = new Date(timestamp);
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const day = date.getDate();
            const month = monthNames[date.getMonth()];
            const year = date.getFullYear();
            const display = \`\${month} \${day}, \${year}\`;
            
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
              // Clear existing bars
              chartBars.innerHTML = '';
              
              // Create bars with proper initial state
              for (let i = 0; i < this.maxHistoryLength; i++) {
                const bar = document.createElement('div');
                bar.className = 'fire-chart-bar';
                bar.style.height = '2px';
                bar.style.background = 'rgba(52, 152, 219, 0.3)'; // Default inactive color
                bar.style.transition = 'all 0.3s ease';
                chartBars.appendChild(bar);
              }
            }
            
            // Reset fire history
            this.fireHistory = [];
          }

          updateFireChart(fireCount) {
            const chartBars = document.getElementById('fire-chart-bars');
            if (!chartBars) return;
            
            // Add new fire count to history
            this.fireHistory.push(fireCount);
            
            // Keep only the last maxHistoryLength items
            if (this.fireHistory.length > this.maxHistoryLength) {
              this.fireHistory.shift();
            }
            
            // Update chart bars
            const bars = chartBars.children;
            const maxFires = Math.max(...this.fireHistory, 1); // Avoid division by zero
            
            for (let i = 0; i < bars.length; i++) {
              const bar = bars[i];
              const fireCount = this.fireHistory[i] || 0;
              
              if (fireCount > 0) {
                // Calculate height based on fire count relative to max
                const heightPercent = (fireCount / maxFires) * 100;
                const height = Math.max(2, heightPercent); // Minimum 2px height
                
                bar.style.height = height + '%';
                
                // Color based on fire intensity
                if (heightPercent > 80) {
                  bar.style.background = 'linear-gradient(to top, #e74c3c 0%, #f39c12 50%, #f1c40f 100%)';
                } else if (heightPercent > 50) {
                  bar.style.background = 'linear-gradient(to top, #f39c12 0%, #f1c40f 100%)';
                } else {
                  bar.style.background = 'linear-gradient(to top, #f1c40f 0%, #85c1e9 100%)';
                }
              } else {
                // No fires - show as inactive
                bar.style.height = '2px';
                bar.style.background = 'rgba(52, 152, 219, 0.3)';
              }
            }
          }

          resetToReadyState() {
            console.log('Resetting to ready state');
            this.updateStatus('Ready');
            this.updatePlaybackControls();
          }
        }

        // Make FireTrackingApp available globally
        window.FireTrackingApp = FireTrackingApp;
        console.log('FireTrackingApp class defined and available');
      `;
      
      document.head.appendChild(script);
      
      // Wait a moment for the script to execute, then initialize
      setTimeout(() => {
        initializeFireTrackingApp();
      }, 100);
    };

    const initializeFireTrackingApp = () => {
      // Initialize the fire tracking application
      if (window.fireApp) {
        window.fireApp = null;
      }
      
      // Wait for the script to execute and class to be available
      if (typeof window.FireTrackingApp === 'undefined') {
        console.log('FireTrackingApp class not yet available, retrying in 100ms...');
        setTimeout(initializeFireTrackingApp, 100);
        return;
      }
      
      try {
        window.fireApp = new window.FireTrackingApp();
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
          background: rgba(52, 152, 219, 0.3);
          border-radius: 1px;
          min-height: 2px;
          transition: all 0.3s ease;
          position: relative;
        }

        .fire-chart-bar:hover {
          opacity: 0.8;
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