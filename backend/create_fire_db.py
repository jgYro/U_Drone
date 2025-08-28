#!/usr/bin/env python3
"""
Create fire_data.db from Ukraine violence data for fire tracking system.
This script creates sample fire event data based on conflict zones.
"""

import sqlite3
import json
import random
from datetime import datetime, timedelta
import os

def create_database(db_path: str = "fire_data.db"):
    """Create SQLite database with fire_events table."""
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Drop existing table if it exists
    cursor.execute("DROP TABLE IF EXISTS fire_events")
    
    # Create table with unified schema
    cursor.execute("""
        CREATE TABLE fire_events (
            id INTEGER PRIMARY KEY,
            datetime_utc DATETIME NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            brightness REAL NOT NULL,
            bright_t31 REAL NOT NULL,
            frp REAL DEFAULT 0.0,
            confidence TEXT DEFAULT 'low',
            scan REAL DEFAULT 1.0,
            track REAL DEFAULT 1.0,
            satellite TEXT NOT NULL,
            instrument TEXT NOT NULL,
            daynight TEXT DEFAULT 'U',
            type INTEGER DEFAULT 0,
            version TEXT DEFAULT '1.0'
        )
    """)
    
    # Create indexes for performance
    cursor.execute("CREATE INDEX idx_datetime ON fire_events(datetime_utc)")
    cursor.execute("CREATE INDEX idx_location ON fire_events(latitude, longitude)")
    cursor.execute("CREATE INDEX idx_datetime_location ON fire_events(datetime_utc, latitude, longitude)")
    
    conn.commit()
    print(f"Created database: {db_path}")
    
    return conn, cursor

def generate_fire_events():
    """Generate sample fire events based on Ukraine conflict zones."""
    
    # Major conflict areas in Ukraine (approximate coordinates)
    conflict_zones = [
        {"name": "Kharkiv", "lat": 49.9935, "lon": 36.2304, "activity": "high"},
        {"name": "Mariupol", "lat": 47.1055, "lon": 37.5497, "activity": "high"},
        {"name": "Donetsk", "lat": 48.0159, "lon": 37.8028, "activity": "high"},
        {"name": "Luhansk", "lat": 48.5671, "lon": 39.3171, "activity": "high"},
        {"name": "Zaporizhzhia", "lat": 47.8388, "lon": 35.1396, "activity": "medium"},
        {"name": "Kherson", "lat": 46.6354, "lon": 32.6169, "activity": "medium"},
        {"name": "Mykolaiv", "lat": 46.9750, "lon": 31.9946, "activity": "medium"},
        {"name": "Bakhmut", "lat": 48.5971, "lon": 37.9998, "activity": "high"},
        {"name": "Severodonetsk", "lat": 48.9482, "lon": 38.4937, "activity": "high"},
        {"name": "Lysychansk", "lat": 48.9040, "lon": 38.4265, "activity": "high"},
        {"name": "Kramatorsk", "lat": 48.7233, "lon": 37.5553, "activity": "medium"},
        {"name": "Sloviansk", "lat": 48.8666, "lon": 37.6156, "activity": "medium"},
        {"name": "Avdiivka", "lat": 48.1433, "lon": 37.7503, "activity": "high"},
        {"name": "Melitopol", "lat": 46.8419, "lon": 35.3679, "activity": "medium"},
        {"name": "Berdyansk", "lat": 46.7552, "lon": 36.8033, "activity": "low"},
    ]
    
    # Generate events from August 2023 to May 2025
    start_date = datetime(2023, 8, 1)
    end_date = datetime(2025, 5, 31)
    current_date = start_date
    
    events = []
    event_id = 1
    
    while current_date <= end_date:
        # Generate multiple events per day based on conflict intensity
        num_events = random.randint(5, 20)
        
        for _ in range(num_events):
            # Select random conflict zone
            zone = random.choice(conflict_zones)
            
            # Add random variation to location (within ~10km)
            lat = zone["lat"] + random.uniform(-0.1, 0.1)
            lon = zone["lon"] + random.uniform(-0.1, 0.1)
            
            # Generate time of day
            hour = random.randint(0, 23)
            minute = random.randint(0, 59)
            second = random.randint(0, 59)
            datetime_utc = current_date.replace(hour=hour, minute=minute, second=second)
            
            # Generate thermal signatures based on activity level and time
            if zone["activity"] == "high":
                brightness = random.uniform(315, 350)
                confidence = random.choice(["high", "high", "medium"])
                frp = random.uniform(15, 50)
            elif zone["activity"] == "medium":
                brightness = random.uniform(305, 325)
                confidence = random.choice(["medium", "medium", "low", "high"])
                frp = random.uniform(8, 25)
            else:
                brightness = random.uniform(295, 315)
                confidence = random.choice(["low", "low", "medium"])
                frp = random.uniform(3, 15)
            
            # Nighttime events tend to be brighter (more visible)
            if hour < 6 or hour > 20:
                brightness += random.uniform(5, 15)
                daynight = "N"
            else:
                daynight = "D"
            
            bright_t31 = brightness - random.uniform(15, 30)
            scan = random.uniform(0.6, 1.0)
            track = random.uniform(0.6, 1.0)
            
            # Choose satellite
            satellite = random.choice(["NOAA-20", "NPP", "AQUA", "TERRA"])
            instrument = "VIIRS" if satellite in ["NOAA-20", "NPP"] else "MODIS"
            
            event = {
                "id": event_id,
                "datetime_utc": datetime_utc.strftime("%Y-%m-%d %H:%M:%S"),
                "latitude": round(lat, 6),
                "longitude": round(lon, 6),
                "brightness": round(brightness, 2),
                "bright_t31": round(bright_t31, 2),
                "frp": round(frp, 2),
                "confidence": confidence,
                "scan": round(scan, 2),
                "track": round(track, 2),
                "satellite": satellite,
                "instrument": instrument,
                "daynight": daynight,
                "type": 0,
                "version": "1.0"
            }
            
            events.append(event)
            event_id += 1
        
        # Move to next day
        current_date += timedelta(days=1)
    
    return events

def insert_events(conn, cursor, events):
    """Insert fire events into database."""
    
    insert_sql = """
        INSERT INTO fire_events (
            id, datetime_utc, latitude, longitude, brightness, bright_t31,
            frp, confidence, scan, track, satellite, instrument, daynight,
            type, version
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    
    for event in events:
        cursor.execute(insert_sql, (
            event["id"],
            event["datetime_utc"],
            event["latitude"],
            event["longitude"],
            event["brightness"],
            event["bright_t31"],
            event["frp"],
            event["confidence"],
            event["scan"],
            event["track"],
            event["satellite"],
            event["instrument"],
            event["daynight"],
            event["type"],
            event["version"]
        ))
    
    conn.commit()
    print(f"Inserted {len(events)} fire events into database")

def main():
    """Main function to create and populate the database."""
    
    db_path = "fire_data.db"
    
    print("Creating fire_data.db for Ukraine fire tracking...")
    
    # Create database
    conn, cursor = create_database(db_path)
    
    # Generate fire events
    print("Generating fire events based on conflict zones...")
    events = generate_fire_events()
    print(f"Generated {len(events)} fire events")
    
    # Insert events
    print("Inserting events into database...")
    insert_events(conn, cursor, events)
    
    # Verify data
    cursor.execute("SELECT COUNT(*) FROM fire_events")
    count = cursor.fetchone()[0]
    print(f"Total events in database: {count}")
    
    # Get date range
    cursor.execute("SELECT MIN(datetime_utc), MAX(datetime_utc) FROM fire_events")
    min_date, max_date = cursor.fetchone()
    print(f"Date range: {min_date} to {max_date}")
    
    # Sample data
    cursor.execute("""
        SELECT datetime_utc, latitude, longitude, brightness, confidence, satellite 
        FROM fire_events 
        ORDER BY datetime_utc DESC 
        LIMIT 5
    """)
    
    print("\nSample events (most recent):")
    for row in cursor.fetchall():
        print(f"  {row[0]} - ({row[1]:.4f}, {row[2]:.4f}) - {row[3]:.1f}K - {row[4]} - {row[5]}")
    
    conn.close()
    print(f"\nDatabase created successfully: {db_path}")

if __name__ == "__main__":
    main()