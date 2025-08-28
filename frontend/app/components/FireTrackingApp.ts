export class FireTrackingApp {
  private map: any;
  public socket: any;
  private config: any;
  private currentMarkers: Map<string, any>;
  private playbackState: string;
  private fadeTimers: Map<string, any>;
  private simulationEnded: boolean;
  private fireEvents: any[];
  private currentSimulationTime: any;
  private currentSpeed: string;
  private fireHistory: any[];
  private maxHistoryLength: number;
  private pulseTimer: any;
  private canvasLayers: any[];
  private fadeTimers2: any[];

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
    this.canvasLayers = [];
    this.fadeTimers2 = [];
    
    this.initializeApp();
  }

  private initializeApp(): void {
    this.pulseTimer = null;
    
    // Connect to main backend server on port 5001
    this.socket = (window as any).io('http://localhost:5001');
    this.setupSocketEvents();
    
    this.initializeMap();
    this.setupUIHandlers();
    this.initializeFireChart();
    
    // Fetch initial statistics from backend
    this.fetchInitialStats();
    
    const activeFiresEl = document.getElementById('active-fires');
    const totalFiresEl = document.getElementById('total-fires');
    if (activeFiresEl) activeFiresEl.textContent = '0';
    if (totalFiresEl) totalFiresEl.textContent = '0';
  }

  private setupSocketEvents(): void {
    console.log('Setting up socket events...');
    console.log('Socket object:', this.socket);
    
    this.socket.on('connect', () => {
      console.log('Connected to fire tracking server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from fire tracking server');
      // Attempt to reconnect after a short delay
      setTimeout(() => {
        if (!this.socket.connected) {
          console.log('Attempting to reconnect...');
          this.reconnectSocket();
        }
      }, 1000);
    });

    this.socket.on('config', (config: any) => {
      console.log('Received config:', config);
      this.config = config;
      this.updateSpeedLabels();
    });

    this.socket.on('fire_update', (data: any) => {
      console.log('🔥 RECEIVED fire_update:', data);
      console.log('🔥 Number of fires:', data.fires?.length || 0);
      console.log('🔥 Timestamp:', data.timestamp);
      console.log('🔥 Sample fire data:', data.fires?.[0]);
      this.handleFireUpdate(data);
    });

    // Add debugging for all socket events
    (this.socket as any).onAny = (this.socket as any).onAny || function(eventName: string, ...args: any[]) {
      console.log('🔌 Socket event received:', eventName, args);
    };

    this.socket.on('playback_started', (data: any) => {
      console.log('🚀 RECEIVED playback_started event:', data);
      this.simulationEnded = false;
      this.clearAllMarkers();
      this.clearAllLayers();
      this.fireEvents = [];
      this.currentSimulationTime = null;
      
      this.startPulseTimer();
      
      const activeFiresEl = document.getElementById('active-fires');
      if (activeFiresEl) activeFiresEl.textContent = '0';
      // Don't reset total fires count - keep showing the database total
      
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
        
        if (playBtn) (playBtn as any).disabled = false;
        if (stopBtn) (stopBtn as any).disabled = true;
        if (pauseBtn) {
          (pauseBtn as any).disabled = true;
          pauseBtn.textContent = 'Pause';
        }
      }, 100);
    });

    this.socket.on('playback_error', (data: any) => {
      console.error('Playback error:', data.error);
      this.updateStatus(`Error: ${data.error}`);
      this.playbackState = 'stopped';
      this.updatePlaybackControls();
      this.hideLoading();
    });

    this.socket.on('speed_changed', (data: any) => {
      this.currentSpeed = data.speed;
      this.updateSpeedDisplay(data.speed);
    });
  }

  private initializeMap(): void {
    const L = (window as any).L;
    
    this.map = L.map('map', {
      center: [48.3794, 31.1656], // Center on Ukraine
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
      detectRetina: false
    });

    tileLayer.addTo(this.map);




    this.canvasLayers = [];
    this.fadeTimers2 = [];
    
    console.log('Map initialized with canvas layer system');
  }
  
  private createCanvasLayer(fires: any[], timestamp: string): any {
    console.log(`Creating full-map canvas overlay with ${fires.length} fires`);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get 2D context for canvas');
      return null;
    }
    
    const mapSize = this.map.getSize();
    canvas.width = mapSize.x;
    canvas.height = mapSize.y;
    
    const bounds = this.map.getBounds();
    
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = mapSize.x;
    offscreenCanvas.height = mapSize.y;
    const offscreenCtx = offscreenCanvas.getContext('2d');
    if (!offscreenCtx) {
      console.error('Failed to get 2D context for offscreen canvas');
      return null;
    }
    
    let drawnCount = 0;
    
    fires.forEach((fire: any) => {
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
    console.log(`Drew ${drawnCount} out of ${fires.length} fires on full canvas`);
    
    const dataURL = canvas.toDataURL();
    const imageOverlay = (window as any).L.imageOverlay(dataURL, bounds, {
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
    
    console.log(`Created image overlay with ${fires.length} fires`);
    return layerInfo;
  }
  
  private startLayerFade(layerInfo: any): void {
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
      overlayElement.style.transition = `opacity ${fadeDuration}ms cubic-bezier(0.55, 0.055, 0.675, 0.19)`;
    }
    
    console.log(`Layer with ${layerInfo.fireCount} fires: visible for ${visibleDuration}ms, then fade for ${fadeDuration}ms`);
    
    setTimeout(() => {
      console.log(`Starting fade animation for layer with ${layerInfo.fireCount} fires`);
      layerInfo.overlay.setOpacity(0.0);
    }, visibleDuration);
    
    const fadeTimer = setTimeout(() => {
      console.log(`Removing completely faded overlay with ${layerInfo.fireCount} fires`);
      
      if (layerInfo.overlay && this.map.hasLayer(layerInfo.overlay)) {
        this.map.removeLayer(layerInfo.overlay);
      }
      
      const index = this.canvasLayers.indexOf(layerInfo);
      if (index > -1) {
        this.canvasLayers.splice(index, 1);
        console.log(`Overlay removed from array. ${this.canvasLayers.length} layers remaining`);
      }
    }, visibleDuration + fadeDuration);
    
    this.fadeTimers2.push(fadeTimer);
  }
  
  private calculateFireSize(frp: number): number {
    const zoom = this.map.getZoom();
    const zoomScale = Math.pow(3.0, zoom - 6);
    
    const baseSize = 3 * zoomScale;
    const maxSize = 18 * zoomScale;
    
    const frpContribution = (frp / 20) * zoomScale;
    
    return Math.min(maxSize, baseSize + frpContribution);
  }

  private setupUIHandlers(): void {
    const playBtn = document.getElementById('play-btn');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        console.log('=== PLAY BUTTON CLICKED ===');
        
        // Check if socket is connected before emitting
        if (this.socket && this.socket.connected) {
          this.socket.emit('stop_playback');
        } else {
          console.warn('Socket not connected, attempting to reconnect...');
          this.reconnectSocket();
        }
        
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
        const target = e.target as HTMLInputElement;
        this.changeSpeed(parseInt(target.value));
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

  private setupControlPanelToggle(): void {
    const controlToggle = document.getElementById('control-toggle');
    const controlPanel = document.getElementById('control-panel');

    if (controlToggle && controlPanel) {
      controlToggle.addEventListener('click', () => {
        controlPanel.classList.toggle('hidden');
      });
    }
  }

  private updateSpeedLabels(): void {
    if (!this.config) return;
    
    const slider = document.getElementById('speed-slider');
    const speedKeys = Object.keys(this.config.playback_speeds);
    
    const currentIndex = speedKeys.indexOf(this.config.default_speed);
    if (currentIndex !== -1 && slider) {
      (slider as any).value = currentIndex;
    }
    
    this.updateSpeedDisplay(this.config.default_speed);
  }

  private updateSpeedDisplay(speedKey: string): void {
    if (!this.config) return;
    
    const label = document.getElementById('speed-label');
    const displayLabel = this.config.speed_labels[speedKey] || speedKey;
    if (label) label.textContent = displayLabel;
  }

  private fetchInitialStats(): void {
    console.log('Fetching initial statistics from backend...');
    
    fetch('http://localhost:5001/api/status')
      .then(response => {
        console.log('Response received:', response.status, response.ok);
        return response.json();
      })
      .then(data => {
        console.log('Data received:', data);
        if (data.fire_events_count !== undefined) {
          const totalFiresEl = document.getElementById('total-fires');
          if (totalFiresEl) {
            totalFiresEl.textContent = data.fire_events_count.toLocaleString();
            console.log('Updated total fires to:', data.fire_events_count.toLocaleString());
          }
        }
      })
      .catch(error => {
        console.error('Failed to fetch initial stats:', error);
      });
  }

  private reconnectSocket(): void {
    console.log('Reconnecting socket...');
    if (this.socket) {
      this.socket.disconnect();
    }
    
    this.socket = (window as any).io('http://localhost:5001');
    this.setupSocketEvents();
    
    console.log('Socket reconnected');
  }

  private validateDateRange(): boolean {
    const startDateValue = (document.getElementById('start-date') as HTMLInputElement)?.value;
    const endDateValue = (document.getElementById('end-date') as HTMLInputElement)?.value;
    
    if (!startDateValue || !endDateValue) return false;
    
    const startDate = new Date(startDateValue);
    const endDate = new Date(endDateValue);

    if (startDate >= endDate) {
      alert('Start date must be before end date');
      return false;
    }

    return true;
  }

  private startPlayback(): void {
    if (!this.validateDateRange()) return;

    const startDate = (document.getElementById('start-date') as HTMLInputElement)?.value;
    const endDate = (document.getElementById('end-date') as HTMLInputElement)?.value;
    const speedSlider = document.getElementById('speed-slider') as HTMLInputElement;
    
    if (!startDate || !endDate || !speedSlider) return;
    
    const speedKeys = ['slowest', 'slow', 'normal', 'fast', 'fastest'];
    const speedKey = speedKeys[parseInt(speedSlider.value)] || 'slow';

    console.log(`📡 Starting playback: ${startDate} to ${endDate} at ${speedKey} speed`);

    this.showLoading();
    this.updateStatus('Starting...');

    if (this.socket && this.socket.connected) {
      this.socket.emit('start_playback', {
        start_date: startDate,
        end_date: endDate,
        speed: speedKey
      });
    } else {
      console.error('Socket not connected, cannot start playback');
      this.updateStatus('Error: Socket not connected');
      this.hideLoading();
    }
  }

  private pausePlayback(): void {
    if (this.socket && this.socket.connected) {
      if (this.playbackState === 'playing') {
        this.socket.emit('pause_playback');
      } else if (this.playbackState === 'paused') {
        this.socket.emit('resume_playback');
      }
    } else {
      console.error('Socket not connected, cannot pause/resume playback');
    }
  }

  private stopPlayback(): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('stop_playback');
    } else {
      console.error('Socket not connected, cannot stop playback');
    }
    this.playbackState = 'stopped';
    this.stopPulseTimer();
  }

  private changeSpeed(sliderValue: number): void {
    const speedKeys = ['slowest', 'slow', 'normal', 'fast', 'fastest'];
    const speedKey = speedKeys[sliderValue] || 'slow';
    
    this.updateSpeedDisplay(speedKey);
    
    if (this.socket && this.socket.connected && this.playbackState === 'playing') {
      this.socket.emit('change_speed', { speed: speedKey });
    } else if (!this.socket || !this.socket.connected) {
      console.error('Socket not connected, cannot change speed');
    }
  }

  private handleFireUpdate(data: any): void {
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
      console.log(`Creating canvas layer with ${fires.length} fires`);
      this.createCanvasLayer(fires, timestamp);
    } else {
      console.log('No fires in this interval, skipping canvas layer');
    }
  }

  private calculateActiveFires(): number {
    if (this.fireEvents.length === 0) return 0;
    
    const latestInterval = this.fireEvents[this.fireEvents.length - 1];
    const activeFires = latestInterval.count;
    
    if (this.fireEvents.length > 10) {
      this.fireEvents = this.fireEvents.slice(-10);
    }
    
    return activeFires;
  }

  private clearAllMarkers(): void {
    this.canvasLayers.forEach((layerInfo: any) => {
      if (layerInfo.element && layerInfo.element.parentNode) {
        layerInfo.element.parentNode.removeChild(layerInfo.element);
      }
    });
    this.canvasLayers = [];

    this.fadeTimers2.forEach((timer: any) => clearTimeout(timer));
    this.fadeTimers2 = [];
    
    this.fireHistory = [];
    const bars = document.querySelectorAll('.fire-chart-bar');
    bars.forEach((bar: any) => {
      bar.style.height = '2px';
    });
  }
  
  private stopAllLayerFades(): void {
    this.fadeTimers2.forEach((timer: any) => clearTimeout(timer));
    this.fadeTimers2 = [];
    
    this.canvasLayers.forEach((layerInfo: any) => {
      if (layerInfo.overlay) {
        layerInfo.overlay.setOpacity(1.0);
        const overlayElement = layerInfo.overlay.getElement();
        if (overlayElement) {
          overlayElement.style.transition = 'none';
        }
      }
    });
    
    console.log(`Stopped fading on ${this.canvasLayers.length} image overlay layers - all frozen at full opacity`);
  }
  
  private clearAllLayers(): void {
    console.log(`🧹 CLEARING ${this.canvasLayers.length} canvas layers and ${this.fadeTimers2.length} fade timers`);
    
    this.canvasLayers.forEach((layerInfo: any, index: number) => {
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
    
    this.fadeTimers2.forEach((timer: any) => clearTimeout(timer));
    this.fadeTimers2 = [];
    this.canvasLayers = [];
    
    this.simulationEnded = false;
    
    console.log('All layers cleared and arrays reset');
  }

  private startPulseTimer(): void {
    this.stopPulseTimer();
    
    this.pulseTimer = setInterval(() => {
      this.pulseIntervalIndicator();
    }, 1000);
  }
  
  private stopPulseTimer(): void {
    if (this.pulseTimer) {
      clearInterval(this.pulseTimer);
      this.pulseTimer = null;
    }
  }

  private pulseIntervalIndicator(): void {
    const pulse = document.getElementById('interval-pulse');
    if (pulse) {
      pulse.classList.add('pulse');
      
      setTimeout(() => {
        pulse.classList.remove('pulse');
        (pulse as any).style.transform = 'scale(1.0)';
      }, 200);
      
      setTimeout(() => {
        (pulse as any).style.transform = 'scale(0.8)';
      }, 800);
    }
  }

  private updateTimeDisplay(timestamp: string): void {
    const date = new Date(timestamp);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const display = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    
    const element1 = document.getElementById('current-time-1');
    const element2 = document.getElementById('current-time-2');
    
    if (element2) (element2 as any).style.opacity = '0';
    
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

  private initializeFireChart(): void {
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

  private updateFireChart(currentFireCount: number): void {
    this.fireHistory.push(currentFireCount);
    
    if (this.fireHistory.length > this.maxHistoryLength) {
      this.fireHistory.shift();
    }
    
    const maxCount = Math.max(...this.fireHistory, 1);
    
    const bars = document.querySelectorAll('.fire-chart-bar');
    this.fireHistory.forEach((count: number, index: number) => {
      if (bars[index]) {
        const height = Math.max(2, (count / maxCount) * 34);
        (bars[index] as any).style.height = `${height}px`;
      }
    });
    
    for (let i = this.fireHistory.length; i < bars.length; i++) {
      (bars[i] as any).style.height = '2px';
    }
  }

  private updateStatistics(stats: any): void {
    const currentFireCount = stats.active_fires || 0;
    const totalFires = stats.total_fires || 0;
    
    const activeFiresEl = document.getElementById('active-fires');
    const totalFiresEl = document.getElementById('total-fires');
    
    if (activeFiresEl) activeFiresEl.textContent = String(currentFireCount);
    if (totalFiresEl) totalFiresEl.textContent = String(totalFires);
    
    this.updateFireChart(currentFireCount);
  }

  private updateStatus(status: string): void {
    const statusEl = document.getElementById('playback-status');
    if (statusEl) statusEl.textContent = status;
  }

  private updatePlaybackControls(): void {
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const stopBtn = document.getElementById('stop-btn');

    switch (this.playbackState) {
      case 'stopped':
        if (playBtn) (playBtn as any).disabled = false;
        if (pauseBtn) {
          (pauseBtn as any).disabled = true;
          pauseBtn.textContent = 'Pause';
        }
        if (stopBtn) (stopBtn as any).disabled = true;
        break;
      case 'playing':
        if (playBtn) (playBtn as any).disabled = true;
        if (pauseBtn) {
          (pauseBtn as any).disabled = false;
          pauseBtn.textContent = 'Pause';
        }
        if (stopBtn) (stopBtn as any).disabled = false;
        break;
      case 'paused':
        if (playBtn) (playBtn as any).disabled = true;
        if (pauseBtn) {
          (pauseBtn as any).disabled = false;
          pauseBtn.textContent = 'Resume';
        }
        if (stopBtn) (stopBtn as any).disabled = false;
        break;
    }
  }

  public resetToReadyState(): void {
    console.log('Resetting to ready state');
    
    if (this.socket && this.socket.connected) {
      this.socket.emit('stop_playback');
    }
    
    this.clearAllLayers();
    this.stopPulseTimer();
    
    this.playbackState = 'stopped';
    this.simulationEnded = false;
    this.updateStatus('Ready');
    
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const stopBtn = document.getElementById('stop-btn');
    
    if (playBtn) (playBtn as any).disabled = false;
    if (pauseBtn) {
      (pauseBtn as any).disabled = true;
      pauseBtn.textContent = 'Pause';
    }
    if (stopBtn) (stopBtn as any).disabled = true;
    
    const activeFiresEl = document.getElementById('active-fires');
    const currentTime1 = document.getElementById('current-time-1');
    const currentTime2 = document.getElementById('current-time-2');
    
    if (activeFiresEl) activeFiresEl.textContent = '0';
    // Don't reset total fires count - keep showing the database total
    if (currentTime1) currentTime1.textContent = '--';
    if (currentTime2) {
      currentTime2.textContent = '--';
      (currentTime2 as any).style.opacity = '0';
    }
  }

  private showLoading(): void {
    const loading = document.getElementById('loading');
    if (loading) loading.classList.add('show');
  }

  private hideLoading(): void {
    const loading = document.getElementById('loading');
    if (loading) loading.classList.remove('show');
  }

  public cleanup(): void {
    // Stop timers
    this.stopPulseTimer();
    this.stopAllLayerFades();
    
    // Clear markers and layers
    this.clearAllMarkers();
    this.clearAllLayers();
    
    // Remove map
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    
    // Disconnect socket
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    // Clear references
    this.currentMarkers.clear();
    this.fireEvents = [];
    this.fireHistory = [];
  }
}
