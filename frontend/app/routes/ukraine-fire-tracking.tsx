import type { Route } from "./+types/ukraine-fire-tracking";
import { useEffect, useRef, useState } from "react";
import { 
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Paper,
  Grid,
  TextField,
  Button,
  Stack,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Divider,
  Slider,
  useTheme,
  alpha,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import PredictionsIcon from '@mui/icons-material/Psychology';
import MapIcon from '@mui/icons-material/Map';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Ukraine Fire Tracking | CYBER SYSTEM" },
    { name: "description", content: "Historical Wildfire Pattern Analysis with Violence Detection" },
  ];
}

interface FireDetection {
  id: number;
  datetime_utc: string;
  latitude: number;
  longitude: number;
  brightness: number;
  bright_t31: number;
  frp: number;
  confidence: string;
  scan: number;
  track: number;
  daynight: string;
  satellite: string;
  location: string;
  description: string;
  violence_probability?: number;
  violence_risk?: string;
}

interface PredictionResult {
  violence_probability: number;
  risk_level: string;
  risk_description: string;
  confidence_score: number;
  analysis: {
    thermal_intensity?: number;
    time_of_day: string;
    detection_confidence: string;
    location: {
      latitude: number;
      longitude: number;
      region: string;
    };
  };
}

export default function UkraineFireTracking() {
  const theme = useTheme();
  const mapRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'predict'>('map');
  const [fireDetections, setFireDetections] = useState<FireDetection[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFire, setSelectedFire] = useState<FireDetection | null>(null);
  
  // Prediction form state
  const [predictionForm, setPredictionForm] = useState({
    latitude: '',
    longitude: '',
    brightness: '',
    bright_t31: '',
    frp: '',
    confidence: 'medium',
    daynight: 'D',
    scan: '0.8',
    track: '0.8'
  });
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [predictionLoading, setPredictionLoading] = useState(false);

  // Fetch fire detections on mount
  useEffect(() => {
    fetchFireDetections();
  }, []);

  // Initialize map when on map tab
  useEffect(() => {
    if (activeTab === 'map') {
      initializeMap();
    }
    return () => {
      if (window.fireApp) {
        if (window.fireApp.socket) {
          window.fireApp.socket.emit('stop_playback');
          window.fireApp.socket.disconnect();
        }
        window.fireApp = null;
      }
    };
  }, [activeTab]);

  const fetchFireDetections = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/fire-detections');
      const data = await response.json();
      if (data.success) {
        setFireDetections(data.fires);
      }
    } catch (error) {
      console.error('Error fetching fire detections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async () => {
    setPredictionLoading(true);
    setPredictionResult(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/predict-violence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: parseFloat(predictionForm.latitude),
          longitude: parseFloat(predictionForm.longitude),
          brightness: parseFloat(predictionForm.brightness),
          bright_t31: predictionForm.bright_t31 ? parseFloat(predictionForm.bright_t31) : parseFloat(predictionForm.brightness) - 20,
          frp: predictionForm.frp ? parseFloat(predictionForm.frp) : 10,
          confidence: predictionForm.confidence,
          daynight: predictionForm.daynight,
          scan: parseFloat(predictionForm.scan),
          track: parseFloat(predictionForm.track)
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setPredictionResult(data.prediction);
      }
    } catch (error) {
      console.error('Error making prediction:', error);
    } finally {
      setPredictionLoading(false);
    }
  };

  const initializeMap = () => {
    // Load external dependencies and initialize fire tracking app
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
        
        setTimeout(() => {
          window.fireApp.resetToReadyState();
          // Add markers for detected fires
          addFireMarkersToMap();
        }, 1000);
      } catch (error) {
        console.error('Failed to initialize Fire Tracking App:', error);
      }
    };

    loadDependencies();
  };

  const addFireMarkersToMap = () => {
    if (window.fireApp && window.fireApp.map && fireDetections.length > 0) {
      fireDetections.forEach(fire => {
        const color = fire.violence_risk === 'high' ? '#9b59b6' : 
                     fire.violence_risk === 'medium' ? '#e67e22' : '#f39c12';
        
        const marker = window.L.circleMarker([fire.latitude, fire.longitude], {
          radius: 8,
          fillColor: color,
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        });
        
        marker.bindPopup(`
          <div>
            <strong>${fire.location}</strong><br/>
            ${fire.description}<br/>
            <br/>
            <strong>Violence Risk:</strong> ${fire.violence_risk}<br/>
            <strong>Probability:</strong> ${((fire.violence_probability ?? 0) * 100).toFixed(1)}%<br/>
            <strong>Brightness:</strong> ${fire.brightness}K<br/>
            <strong>Time:</strong> ${new Date(fire.datetime_utc).toLocaleString()}
          </div>
        `);
        
        marker.addTo(window.fireApp.map);
      });
    }
  };

  const getRiskColor = (level: string) => {
    switch(level) {
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: theme.palette.background.default }}>
      {/* Navigation Bar */}
      <AppBar position="static" sx={{ 
        backgroundColor: alpha(theme.palette.background.paper, 0.95),
        borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
      }}>
        <Toolbar>
          <IconButton component={Link} to="/" edge="start" color="primary" sx={{ mr: 2 }}>
            <HomeIcon />
          </IconButton>
          
          <LocalFireDepartmentIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h6" sx={{ 
            flexGrow: 1,
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.error.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            fontWeight: 700,
          }}>
            UKRAINE FIRE TRACKING & VIOLENCE DETECTION
          </Typography>

          <Stack direction="row" spacing={1}>
            <Button
              variant={activeTab === 'map' ? "contained" : "outlined"}
              onClick={() => setActiveTab('map')}
              startIcon={<MapIcon />}
              size="small"
            >
              Live Map
            </Button>
            <Button
              variant={activeTab === 'predict' ? "contained" : "outlined"}
              onClick={() => setActiveTab('predict')}
              startIcon={<PredictionsIcon />}
              size="small"
            >
              SVM Predictor
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {activeTab === 'map' ? (
          <>
            {/* Map Container */}
            <Box id="map" ref={mapRef} sx={{ width: '100%', height: '100%' }} />
            
            {/* Fire Detection List Overlay */}
            <Paper sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              width: 350,
              maxHeight: '70vh',
              overflow: 'auto',
              backgroundColor: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              p: 2
            }}>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
                Recent Fire Detections
              </Typography>
              
              {loading ? (
                <CircularProgress />
              ) : (
                <List dense>
                  {fireDetections.map(fire => (
                    <ListItem
                      key={fire.id}
                      onClick={() => setSelectedFire(fire)}
                      sx={{
                        mb: 1,
                        backgroundColor: alpha(theme.palette.background.default, 0.5),
                        borderLeft: `4px solid ${getRiskColor(fire.violence_risk || 'low')}`,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1)
                        }
                      }}
                    >
                      <ListItemIcon>
                        <LocalFireDepartmentIcon sx={{ color: getRiskColor(fire.violence_risk || 'low') }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={fire.location}
                        secondary={
                          <>
                            <Typography variant="caption" component="span" sx={{ display: 'block' }}>
                              Risk: {fire.violence_risk} ({((fire.violence_probability ?? 0) * 100).toFixed(1)}%)
                            </Typography>
                            <Typography variant="caption" component="span">
                              {new Date(fire.datetime_utc).toLocaleString()}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
            
            {/* Original Fire Tracking Controls and Styles */}
            <style>{`
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
            `}</style>

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
                  <div style={{marginTop: '10px', fontSize: '12px', color: '#888', textAlign: 'center'}}>
                    Note: Playback requires historical fire database (fire_data.db)
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="statistics">
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
                <div className="current-time" id="current-time-1">--</div>
              </div>
            </div>

            {/* Loading Indicator */}
            <div className="loading" id="loading">
              <div>Loading fire data...</div>
            </div>
          </>
        ) : (
          /* SVM Prediction Tab */
          <Box sx={{ p: 3, overflow: 'auto', height: '100%' }}>
            <Grid container spacing={3}>
              {/* Prediction Form */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}` }}>
                  <Typography variant="h5" sx={{ mb: 3, color: theme.palette.primary.main }}>
                    <PredictionsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Fire Violence Prediction
                  </Typography>
                  
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Enter fire detection parameters to predict the probability of a conflict-related fire using our SVM classifier.
                  </Alert>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Latitude"
                        value={predictionForm.latitude}
                        onChange={(e) => setPredictionForm({...predictionForm, latitude: e.target.value})}
                        placeholder="48.3794"
                        type="number"
                        required
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Longitude"
                        value={predictionForm.longitude}
                        onChange={(e) => setPredictionForm({...predictionForm, longitude: e.target.value})}
                        placeholder="31.1656"
                        type="number"
                        required
                      />
                    </Grid>
                    
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Brightness (K)"
                        value={predictionForm.brightness}
                        onChange={(e) => setPredictionForm({...predictionForm, brightness: e.target.value})}
                        placeholder="320"
                        type="number"
                        required
                        helperText="Brightness temperature in Kelvin"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Bright T31 (K)"
                        value={predictionForm.bright_t31}
                        onChange={(e) => setPredictionForm({...predictionForm, bright_t31: e.target.value})}
                        placeholder="300"
                        type="number"
                        helperText="31μm channel brightness"
                      />
                    </Grid>
                    
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Fire Radiative Power"
                        value={predictionForm.frp}
                        onChange={(e) => setPredictionForm({...predictionForm, frp: e.target.value})}
                        placeholder="15"
                        type="number"
                        helperText="FRP in MW"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel>Confidence</InputLabel>
                        <Select
                          value={predictionForm.confidence}
                          onChange={(e) => setPredictionForm({...predictionForm, confidence: e.target.value})}
                          label="Confidence"
                        >
                          <MenuItem value="low">Low</MenuItem>
                          <MenuItem value="medium">Medium</MenuItem>
                          <MenuItem value="high">High</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel>Day/Night</InputLabel>
                        <Select
                          value={predictionForm.daynight}
                          onChange={(e) => setPredictionForm({...predictionForm, daynight: e.target.value})}
                          label="Day/Night"
                        >
                          <MenuItem value="D">Day</MenuItem>
                          <MenuItem value="N">Night</MenuItem>
                          <MenuItem value="U">Unknown</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Box>
                        <Typography gutterBottom>Scan: {predictionForm.scan}</Typography>
                        <Slider
                          value={parseFloat(predictionForm.scan)}
                          onChange={(e, value) => setPredictionForm({...predictionForm, scan: value.toString()})}
                          min={0.5}
                          max={1.0}
                          step={0.1}
                          marks
                          valueLabelDisplay="auto"
                        />
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={handlePredict}
                        disabled={predictionLoading || !predictionForm.latitude || !predictionForm.longitude || !predictionForm.brightness}
                        sx={{ py: 1.5 }}
                      >
                        {predictionLoading ? <CircularProgress size={24} /> : 'Predict Violence Probability'}
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Prediction Results */}
              <Grid item xs={12} md={6}>
                {predictionResult && (
                  <Paper sx={{ 
                    p: 3, 
                    border: `2px solid ${getRiskColor(predictionResult.risk_level)}`,
                    backgroundColor: alpha(getRiskColor(predictionResult.risk_level), 0.05)
                  }}>
                    <Typography variant="h5" sx={{ mb: 3, color: getRiskColor(predictionResult.risk_level) }}>
                      <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Prediction Results
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                          <Typography variant="h2" sx={{ color: getRiskColor(predictionResult.risk_level) }}>
                            {(predictionResult.violence_probability * 100).toFixed(1)}%
                          </Typography>
                          <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
                            Violence Probability
                          </Typography>
                          <Chip 
                            label={predictionResult.risk_level.toUpperCase()}
                            color={predictionResult.risk_level === 'high' ? 'error' : predictionResult.risk_level === 'medium' ? 'warning' : 'success'}
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {predictionResult.risk_description}
                        </Typography>
                      </Grid>

                      <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" sx={{ mb: 2 }}>Analysis Details</Typography>
                        
                        <Stack spacing={1}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">
                              <ThermostatIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                              Thermal Intensity:
                            </Typography>
                            <Typography variant="body2">
                              {predictionResult.analysis?.thermal_intensity?.toFixed(1) || 'N/A'}K
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">
                              <AccessTimeIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                              Time of Day:
                            </Typography>
                            <Typography variant="body2">
                              {predictionResult.analysis?.time_of_day || 'N/A'}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">
                              <LocationOnIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                              Region:
                            </Typography>
                            <Typography variant="body2">
                              {predictionResult.analysis.location.region}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">
                              <InfoIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                              Detection Confidence:
                            </Typography>
                            <Typography variant="body2">
                              {predictionResult.analysis?.detection_confidence || 'N/A'}
                            </Typography>
                          </Box>
                        </Stack>

                        <Box sx={{ mt: 3, p: 2, backgroundColor: alpha(theme.palette.background.default, 0.5), borderRadius: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Model: SVM Classifier | Accuracy: 77.05% | Training Samples: 302,830
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                )}

                {/* Sample Fires for Testing */}
                <Paper sx={{ p: 3, mt: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}` }}>
                  <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
                    Quick Test with Sample Data
                  </Typography>
                  <Stack spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setPredictionForm({
                        latitude: '49.842957',
                        longitude: '36.642884',
                        brightness: '325.5',
                        bright_t31: '295.2',
                        frp: '18.3',
                        confidence: 'high',
                        daynight: 'D',
                        scan: '0.8',
                        track: '0.9'
                      })}
                    >
                      Load Kharkiv High Confidence Fire
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setPredictionForm({
                        latitude: '47.838800',
                        longitude: '35.139567',
                        brightness: '335.2',
                        bright_t31: '298.5',
                        frp: '25.8',
                        confidence: 'high',
                        daynight: 'N',
                        scan: '0.9',
                        track: '0.95'
                      })}
                    >
                      Load Zaporizhzhia Nighttime Fire
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setPredictionForm({
                        latitude: '50.450100',
                        longitude: '30.523400',
                        brightness: '308.8',
                        bright_t31: '290.1',
                        frp: '8.5',
                        confidence: 'low',
                        daynight: 'D',
                        scan: '0.6',
                        track: '0.7'
                      })}
                    >
                      Load Kyiv Low Confidence Fire
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>

      {/* Fire Details Dialog */}
      <Dialog
        open={Boolean(selectedFire)}
        onClose={() => setSelectedFire(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedFire && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Fire Detection Details</Typography>
              <IconButton onClick={() => setSelectedFire(null)} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                  <Typography variant="body1">{selectedFire.location}</Typography>
                  <Typography variant="caption">
                    ({selectedFire.latitude.toFixed(4)}, {selectedFire.longitude.toFixed(4)})
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Violence Risk Assessment</Typography>
                  <Chip 
                    label={`${selectedFire.violence_risk?.toUpperCase()} RISK`}
                    color={selectedFire.violence_risk === 'high' ? 'error' : selectedFire.violence_risk === 'medium' ? 'warning' : 'success'}
                    sx={{ mt: 0.5 }}
                  />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Probability: {((selectedFire.violence_probability ?? 0) * 100).toFixed(1)}%
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Thermal Data</Typography>
                  <Typography variant="body2">Brightness: {selectedFire.brightness}K</Typography>
                  <Typography variant="body2">Bright T31: {selectedFire.bright_t31}K</Typography>
                  <Typography variant="body2">FRP: {selectedFire.frp} MW</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Detection Info</Typography>
                  <Typography variant="body2">Confidence: {selectedFire.confidence}</Typography>
                  <Typography variant="body2">Satellite: {selectedFire.satellite}</Typography>
                  <Typography variant="body2">Time: {new Date(selectedFire.datetime_utc).toLocaleString()}</Typography>
                  <Typography variant="body2">Day/Night: {selectedFire.daynight === 'D' ? 'Day' : 'Night'}</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography variant="body2">{selectedFire.description}</Typography>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => {
                setPredictionForm({
                  latitude: selectedFire.latitude.toString(),
                  longitude: selectedFire.longitude.toString(),
                  brightness: selectedFire.brightness.toString(),
                  bright_t31: selectedFire.bright_t31.toString(),
                  frp: selectedFire.frp.toString(),
                  confidence: selectedFire.confidence,
                  daynight: selectedFire.daynight,
                  scan: selectedFire.scan.toString(),
                  track: selectedFire.track.toString()
                });
                setActiveTab('predict');
                setSelectedFire(null);
              }}>
                Use in Predictor
              </Button>
              <Button onClick={() => setSelectedFire(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

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
            
            this.initializeApp();
          }

          initializeApp() {
            // Connect to backend server
            this.socket = io('http://localhost:5000');
            this.setupSocketEvents();
            
            this.initializeMap();
            this.setupUIHandlers();
          }

          setupSocketEvents() {
            this.socket.on('connect', () => {
              console.log('Connected to fire tracking server');
            });

            this.socket.on('config', (config) => {
              this.config = config;
              this.updateSpeedLabels();
            });

            this.socket.on('fire_update', (data) => {
              this.handleFireUpdate(data);
            });

            this.socket.on('playback_started', () => {
              this.playbackState = 'playing';
              this.updatePlaybackControls();
              this.updateStatus('Playing');
            });

            this.socket.on('playback_paused', () => {
              this.playbackState = 'paused';
              this.updatePlaybackControls();
              this.updateStatus('Paused');
            });

            this.socket.on('playback_stopped', () => {
              this.playbackState = 'stopped';
              this.updatePlaybackControls();
              this.updateStatus('Ready');
            });

            this.socket.on('playback_ended', () => {
              this.playbackState = 'stopped';
              this.updatePlaybackControls();
              this.updateStatus('Ready');
            });
          }

          initializeMap() {
            this.map = L.map('map', {
              center: [48.3794, 31.1656],
              zoom: 7,
              minZoom: 6,
              maxZoom: 10,
              zoomControl: true
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: 'Map data © OpenStreetMap contributors',
              maxZoom: 18
            }).addTo(this.map);
          }

          setupUIHandlers() {
            const playBtn = document.getElementById('play-btn');
            if (playBtn) {
              playBtn.addEventListener('click', () => {
                this.startPlayback();
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
            const speedLabel = document.getElementById('speed-label');
            if (speedLabel) speedLabel.textContent = '1 day/sec';
          }

          startPlayback() {
            const startDate = document.getElementById('start-date')?.value;
            const endDate = document.getElementById('end-date')?.value;
            
            if (!startDate || !endDate) return;
            
            this.socket.emit('start_playback', {
              start_date: startDate,
              end_date: endDate,
              speed: 'normal'
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
          }

          changeSpeed(sliderValue) {
            const speedKeys = ['slowest', 'slow', 'normal', 'fast', 'fastest'];
            const speedKey = speedKeys[parseInt(sliderValue)] || 'slow';
            
            if (this.playbackState === 'playing') {
              this.socket.emit('change_speed', { speed: speedKey });
            }
          }

          handleFireUpdate(data) {
            const { fires, timestamp } = data;
            
            // Clear old markers
            this.currentMarkers.forEach(marker => {
              this.map.removeLayer(marker);
            });
            this.currentMarkers.clear();
            
            // Add new fire markers
            fires.forEach(fire => {
              const marker = L.circleMarker([fire.latitude, fire.longitude], {
                radius: 6,
                fillColor: this.getFireColor(fire.confidence),
                color: '#fff',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
              });
              
              marker.addTo(this.map);
              this.currentMarkers.set(fire.id, marker);
            });
            
            this.updateTimeDisplay(timestamp);
            this.updateStatistics(fires.length);
          }

          getFireColor(confidence) {
            switch(confidence) {
              case 'high': return '#e74c3c';
              case 'medium': return '#f39c12';
              default: return '#f1c40f';
            }
          }

          updateTimeDisplay(timestamp) {
            const date = new Date(timestamp);
            const display = date.toLocaleDateString();
            const timeEl = document.getElementById('current-time-1');
            if (timeEl) timeEl.textContent = display;
          }

          updateStatistics(activeCount) {
            const activeEl = document.getElementById('active-fires');
            const totalEl = document.getElementById('total-fires');
            
            if (activeEl) activeEl.textContent = activeCount;
            if (totalEl) {
              const current = parseInt(totalEl.textContent) || 0;
              totalEl.textContent = current + activeCount;
            }
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
                if (pauseBtn) pauseBtn.disabled = true;
                if (stopBtn) stopBtn.disabled = true;
                break;
              case 'playing':
                if (playBtn) playBtn.disabled = true;
                if (pauseBtn) pauseBtn.disabled = false;
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
            this.playbackState = 'stopped';
            this.updateStatus('Ready');
            this.updatePlaybackControls();
          }
        }

        window.FireTrackingApp = FireTrackingApp;
        `
      }} />
    </Box>
  );
}

// Declare global window properties
declare global {
  interface Window {
    io: any;
    L: any;
    fireApp: any;
    FireTrackingApp: any;
  }
}