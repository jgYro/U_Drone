#!/usr/bin/env python3
"""
U_Drone - Combined Flask Application
Main Flask API with integrated Ukraine Fire Tracking System
"""

import os
import sys
import sqlite3
import json
import time
import threading
from datetime import datetime, timedelta
from queue import Queue, Empty
from typing import Dict, List, Any, Optional
import logging

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit, disconnect

try:
    import config as fire_config
except ImportError:
    print("Warning: Fire tracking config not found. Fire tracking features will be disabled.")
    fire_config = None


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class FireDataProducer:
    """Producer thread that reads fire data from database and feeds queue."""
    
    def __init__(self, data_queue: Queue, db_path: str):
        """Initialize producer with queue and database."""
        self.data_queue = data_queue
        self.db_path = db_path
        self.is_running = False
        self.is_paused = False
        self.current_speed = fire_config.DEFAULT_SPEED if fire_config else 'slow'
        self.start_date = None
        self.end_date = None
        self.current_datetime = None
        self.thread = None
        
        # Statistics
        self.total_records = 0
        self.processed_records = 0
        
    def set_date_range(self, start_date: str, end_date: str):
        """Set date range for playback."""
        self.start_date = datetime.fromisoformat(start_date)
        self.end_date = datetime.fromisoformat(end_date)
        self.current_datetime = self.start_date
        logger.info(f"Producer date range set: {start_date} to {end_date}")
    
    def set_speed(self, speed_key: str):
        """Update playback speed."""
        if fire_config and speed_key in fire_config.PLAYBACK_SPEEDS:
            self.current_speed = speed_key
            logger.info(f"Producer speed changed to {speed_key}")
    
    def pause(self):
        """Pause the producer."""
        self.is_paused = True
        logger.info("Producer paused")
    
    def resume(self):
        """Resume the producer."""
        self.is_paused = False
        logger.info("Producer resumed")
    
    def stop(self):
        """Stop the producer."""
        self.is_running = False
        logger.info("Producer stopped")
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get current producer statistics."""
        return {
            'total_records': self.total_records,
            'processed_records': self.processed_records,
            'current_datetime': self.current_datetime.isoformat() if self.current_datetime else None,
            'speed': self.current_speed,
            'is_running': self.is_running,
            'is_paused': self.is_paused
        }
    
    def query_interval(self, start_dt: datetime, end_dt: datetime) -> List[Dict[str, Any]]:
        """Query fire records within a specific time interval."""
        if not fire_config:
            return []
            
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            query = """
                SELECT * FROM fire_events 
                WHERE datetime_utc > ? AND datetime_utc <= ?
                ORDER BY datetime_utc
            """
            
            start_str = start_dt.strftime('%Y-%m-%d %H:%M:%S')
            end_str = end_dt.strftime('%Y-%m-%d %H:%M:%S')
            
            cursor.execute(query, (start_str, end_str))
            rows = cursor.fetchall()
            
            records = []
            for row in rows:
                record = {
                    'id': row['id'],
                    'datetime_utc': row['datetime_utc'],
                    'latitude': row['latitude'],
                    'longitude': row['longitude'],
                    'brightness': row['brightness'],
                    'bright_t31': row['bright_t31'],
                    'frp': row['frp'],
                    'confidence': row['confidence'],
                    'scan': row['scan'],
                    'track': row['track'],
                    'satellite': row['satellite'],
                    'instrument': row['instrument'],
                    'daynight': row['daynight'],
                    'type': row['type'],
                    'version': row['version'],
                    'fade_duration': fire_config.get_fade_duration(self.current_speed)
                }
                records.append(record)
            
            conn.close()
            return records
            
        except Exception as e:
            logger.error(f"Database query error: {e}")
            return []
    
    def run_producer(self):
        """Main producer loop - queries every 1 second."""
        logger.info("Producer thread started")
        
        if not self.start_date or not self.end_date or not fire_config:
            logger.error("Date range not set or config missing")
            return
        
        self.is_running = True
        
        try:
            # Get total record count
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("""
                SELECT COUNT(*) FROM fire_events 
                WHERE datetime_utc >= ? AND datetime_utc <= ?
            """, (self.start_date.isoformat(), self.end_date.isoformat()))
            self.total_records = cursor.fetchone()[0]
            conn.close()
            
            logger.info(f"Producer will process {self.total_records} records")
            
            self.current_datetime = self.start_date
            last_interval_time = time.time()
            
            while self.is_running and self.current_datetime <= self.end_date:
                current_time = time.time()
                elapsed = current_time - last_interval_time
                
                if elapsed >= 1.0 and not self.is_paused:
                    hours_per_second = fire_config.PLAYBACK_SPEEDS[self.current_speed]
                    next_datetime = self.current_datetime + timedelta(hours=hours_per_second)
                    
                    if next_datetime > self.end_date:
                        next_datetime = self.end_date
                    
                    records = self.query_interval(self.current_datetime, next_datetime)
                    
                    batch_data = {
                        'type': 'fire_batch',
                        'records': records,
                        'timestamp': next_datetime.isoformat(),
                        'speed': self.current_speed
                    }
                    
                    try:
                        self.data_queue.put(batch_data)
                        if records:
                            self.processed_records += len(records)
                    except Exception as e:
                        logger.warning(f"Failed to queue batch: {e}")
                    
                    self.current_datetime = next_datetime
                    last_interval_time = current_time
                
                time.sleep(0.01)
            
        except Exception as e:
            logger.error(f"Producer thread error: {e}")
        finally:
            try:
                self.data_queue.put({'type': 'end_of_data'})
            except:
                pass
            self.is_running = False
            logger.info("Producer thread finished")
    
    def start(self):
        """Start producer thread."""
        if not self.thread or not self.thread.is_alive():
            self.is_running = True
            self.thread = threading.Thread(target=self.run_producer)
            self.thread.daemon = True
            self.thread.start()


class FireDataConsumer:
    """Consumer thread that processes queue and emits to clients."""
    
    def __init__(self, data_queue: Queue, socketio_app):
        """Initialize consumer with queue and SocketIO app."""
        self.data_queue = data_queue
        self.socketio = socketio_app
        self.is_running = False
        self.thread = None
        
        self.fire_statistics = {
            'total_fires': 0,
            'active_count': 0,
            'current_time': None
        }
    
    def emit_fire_update(self, batch_data: Dict[str, Any]):
        """Emit fire update to all connected clients."""
        records = batch_data['records']
        
        if records:
            self.fire_statistics['total_fires'] += len(records)
            self.fire_statistics['current_time'] = batch_data['timestamp']
            self.fire_statistics['active_count'] = len(records)
            
            self.socketio.emit('fire_update', {
                'fires': records,
                'timestamp': batch_data['timestamp'],
                'speed': batch_data['speed'],
                'statistics': self.fire_statistics
            })
            
            logger.debug(f"Emitted {len(records)} fire records to clients")
    
    def run_consumer(self):
        """Main consumer loop."""
        logger.info("Consumer thread started")
        self.is_running = True
        
        try:
            while self.is_running:
                try:
                    data = self.data_queue.get(timeout=1.0)
                    
                    if data['type'] == 'end_of_data':
                        logger.info("Received end of data signal")
                        self.socketio.emit('playback_ended')
                        break
                    elif data['type'] == 'fire_batch':
                        self.emit_fire_update(data)
                    
                    self.data_queue.task_done()
                    
                except Empty:
                    continue
                except Exception as e:
                    logger.error(f"Consumer error: {e}")
                    
        except Exception as e:
            logger.error(f"Consumer thread error: {e}")
        finally:
            self.is_running = False
            logger.info("Consumer thread finished")
    
    def start(self):
        """Start consumer thread."""
        if not self.thread or not self.thread.is_alive():
            self.is_running = True
            self.thread = threading.Thread(target=self.run_consumer)
            self.thread.daemon = True
            self.thread.start()
    
    def stop(self):
        """Stop consumer thread."""
        self.is_running = False


# Initialize Flask application
app = Flask(__name__)
CORS(app)

# Initialize SocketIO for fire tracking
if fire_config:
    app.config['SECRET_KEY'] = fire_config.SECRET_KEY
    socketio = SocketIO(
        app, 
        cors_allowed_origins=fire_config.CORS_ORIGINS,
        ping_interval=fire_config.WEBSOCKET_PING_INTERVAL,
        ping_timeout=fire_config.WEBSOCKET_PING_TIMEOUT
    )
    
    # Initialize producer-consumer system
    data_queue = Queue(maxsize=fire_config.get_queue_size(fire_config.DEFAULT_SPEED))
    db_path = os.path.join(os.path.dirname(__file__), fire_config.DATABASE_PATH)
    producer = FireDataProducer(data_queue, db_path)
    consumer = FireDataConsumer(data_queue, socketio)
else:
    socketio = None
    producer = None
    consumer = None


# ========== MAIN API ROUTES ==========

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify({
        'message': 'Hello from U_Drone Flask backend!',
        'status': 'success'
    })

@app.route('/api/data', methods=['GET'])
def get_data():
    sample_data = {
        'users': [
            {'id': 1, 'name': 'John Doe', 'email': 'john@example.com'},
            {'id': 2, 'name': 'Jane Smith', 'email': 'jane@example.com'},
            {'id': 3, 'name': 'Bob Johnson', 'email': 'bob@example.com'}
        ],
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'fire_tracking_enabled': fire_config is not None
    }
    return jsonify(sample_data)

@app.route('/api/echo', methods=['POST'])
def echo():
    data = request.get_json()
    return jsonify({
        'received': data,
        'message': f"Echo: {data.get('message', 'No message provided')}"
    })

@app.route('/api/status', methods=['GET'])
def status():
    status_data = {
        'api': 'U_Drone Flask Backend',
        'version': '2.0.0',
        'status': 'running',
        'features': {
            'main_api': True,
            'fire_tracking': fire_config is not None,
            'websockets': socketio is not None
        }
    }
    
    if fire_config and os.path.exists(db_path):
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM fire_events")
            fire_count = cursor.fetchone()[0]
            conn.close()
            status_data['fire_events_count'] = fire_count
        except:
            status_data['fire_events_count'] = 0
    
    return jsonify(status_data)


# ========== FIRE TRACKING ROUTES ==========

if fire_config:
    @app.route('/tiles/<int:z>/<int:x>/<int:y>.png')
    def serve_tile(z, x, y):
        """Serve map tiles from local storage."""
        try:
            tile_dir = os.path.join(os.path.dirname(__file__), 
                                  fire_config.TILE_DIRECTORY, str(z), str(x))
            filename = f'{y}.png'
            
            if os.path.exists(os.path.join(tile_dir, filename)):
                return send_from_directory(tile_dir, filename)
            else:
                logger.warning(f"Tile not found: {z}/{x}/{y}")
                return '', 404
                
        except Exception as e:
            logger.error(f"Error serving tile {z}/{x}/{y}: {e}")
            return '', 500


# ========== WEBSOCKET EVENT HANDLERS ==========

if socketio:
    @socketio.on('connect')
    def handle_connect():
        """Handle client connection."""
        logger.info(f"Client connected: {request.sid}")
        
        if fire_config:
            emit('config', {
                'zoom_levels': fire_config.ZOOM_LEVELS,
                'default_zoom': fire_config.DEFAULT_ZOOM,
                'map_center': fire_config.MAP_CENTER,
                'bounding_box': fire_config.BOUNDING_BOX,
                'playback_speeds': fire_config.PLAYBACK_SPEEDS,
                'speed_labels': fire_config.SPEED_LABELS,
                'default_speed': fire_config.DEFAULT_SPEED,
                'default_date_range': fire_config.DEFAULT_DATE_RANGE
            })

    @socketio.on('disconnect')
    def handle_disconnect():
        """Handle client disconnection."""
        logger.info(f"Client disconnected: {request.sid}")

    @socketio.on('start_playback')
    def handle_start_playback(data):
        """Handle playback start request."""
        if not fire_config or not producer or not consumer:
            emit('playback_error', {'error': 'Fire tracking not available'})
            return
            
        try:
            start_date = data.get('start_date')
            end_date = data.get('end_date')
            speed = data.get('speed', fire_config.DEFAULT_SPEED)
            
            logger.info(f"Starting playback: {start_date} to {end_date} at {speed}")
            
            producer.set_date_range(start_date, end_date)
            producer.set_speed(speed)
            producer.is_paused = False
            
            consumer.start()
            producer.start()
            
            emit('playback_started', {
                'status': 'success',
                'start_date': start_date,
                'end_date': end_date,
                'speed': speed
            })
            
        except Exception as e:
            logger.error(f"Error starting playback: {e}")
            emit('playback_error', {'error': str(e)})

    @socketio.on('pause_playback')
    def handle_pause_playback():
        """Handle playback pause request."""
        if producer:
            try:
                producer.pause()
                emit('playback_paused')
                logger.info("Playback paused")
            except Exception as e:
                logger.error(f"Error pausing playback: {e}")
                emit('playback_error', {'error': str(e)})

    @socketio.on('resume_playback')
    def handle_resume_playback():
        """Handle playback resume request."""
        if producer:
            try:
                producer.resume()
                emit('playback_resumed')
                logger.info("Playback resumed")
            except Exception as e:
                logger.error(f"Error resuming playback: {e}")
                emit('playback_error', {'error': str(e)})

    @socketio.on('stop_playback')
    def handle_stop_playback():
        """Handle playback stop request."""
        try:
            if producer:
                producer.stop()
            if consumer:
                consumer.stop()
            
            # Clear queue
            if data_queue:
                while not data_queue.empty():
                    try:
                        data_queue.get_nowait()
                    except:
                        break
            
            emit('playback_stopped')
            logger.info("Playback stopped")
            
        except Exception as e:
            logger.error(f"Error stopping playback: {e}")
            emit('playback_error', {'error': str(e)})

    @socketio.on('change_speed')
    def handle_change_speed(data):
        """Handle speed change request."""
        if not fire_config or not producer:
            emit('playback_error', {'error': 'Fire tracking not available'})
            return
            
        try:
            new_speed = data.get('speed')
            
            if new_speed in fire_config.PLAYBACK_SPEEDS:
                producer.set_speed(new_speed)
                emit('speed_changed', {'speed': new_speed})
                logger.info(f"Speed changed to {new_speed}")
            else:
                emit('playback_error', {'error': f'Invalid speed: {new_speed}'})
                
        except Exception as e:
            logger.error(f"Error changing speed: {e}")
            emit('playback_error', {'error': str(e)})


def check_fire_tracking_setup():
    """Check if fire tracking is properly set up."""
    if not fire_config:
        logger.warning("Fire tracking config not found - feature disabled")
        return False
    
    if not os.path.exists(db_path):
        logger.warning(f"Fire database not found: {db_path}")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM fire_events")
        count = cursor.fetchone()[0]
        conn.close()
        logger.info(f"Fire tracking database loaded with {count} events")
        return True
    except Exception as e:
        logger.warning(f"Fire database error: {e}")
        return False


def main():
    """Main entry point."""
    logger.info("Starting U_Drone Flask Application")
    
    # Check fire tracking setup
    fire_available = check_fire_tracking_setup()
    if fire_available:
        logger.info("Fire tracking system enabled")
    else:
        logger.info("Fire tracking system disabled - running in basic mode")
    
    # Start the application
    logger.info("Starting server on 0.0.0.0:5000")
    
    try:
        if socketio and fire_available:
            socketio.run(
                app,
                host='0.0.0.0',
                port=5000,
                debug=False,
                allow_unsafe_werkzeug=True
            )
        else:
            app.run(
                host='0.0.0.0',
                port=5000,
                debug=True
            )
    except KeyboardInterrupt:
        logger.info("Shutting down...")
    except Exception as e:
        logger.error(f"Server error: {e}")
        return 1
    
    return 0


if __name__ == '__main__':
    exit(main())