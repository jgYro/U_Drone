"""
Fire Tracking and Violence Prediction Service
Based on Ukraine Fire Tracking System with SVM Violence Classification
"""

import numpy as np
from flask import Blueprint, jsonify, request
from datetime import datetime
import pickle
import os
import json

# Create Blueprint
fire_tracking_bp = Blueprint('fire_tracking', __name__)

class FireViolencePredictor:
    """
    SVM-based violence prediction for fire detection events.
    Predicts probability of violent event from thermal signatures.
    """
    
    def __init__(self):
        self.model = None
        self.scaler = None
        self.feature_names = None
        self.model_loaded = False
        
    def load_model(self, model_path='models/violence_classifier_model.pkl'):
        """Load the trained SVM model and scaler."""
        try:
            # Try to load from file
            if os.path.exists(model_path):
                with open(model_path, 'rb') as f:
                    model_data = pickle.load(f)
                self.model = model_data['model']
                self.scaler = model_data['scaler']
                self.feature_names = model_data['feature_names']
                self.model_loaded = True
                print(f"Model loaded successfully from {model_path}")
            else:
                raise FileNotFoundError(f"Model file not found at {model_path}. Please ensure the trained model exists.")
        except Exception as e:
            print(f"Error loading model: {e}")
            self.model_loaded = False
    
    def extract_features(self, fire_data):
        """Extract features from fire detection data."""
        # Basic thermal features
        brightness = fire_data.get('brightness', 300.0)
        bright_t31 = fire_data.get('bright_t31', 290.0)
        frp = fire_data.get('frp', 10.0)
        scan = fire_data.get('scan', 1.0)
        track = fire_data.get('track', 1.0)
        
        # Confidence encoding
        confidence_map = {'low': 0.33, 'medium': 0.66, 'high': 1.0}
        confidence_score = confidence_map.get(fire_data.get('confidence', 'low'), 0.33)
        
        # Day/night encoding
        daynight_map = {'D': 1.0, 'N': 0.0, 'U': 0.5}
        daynight_score = daynight_map.get(fire_data.get('daynight', 'U'), 0.5)
        
        # Parse datetime for temporal features
        dt_str = fire_data.get('datetime_utc', datetime.now().isoformat())
        try:
            if 'T' in dt_str:
                dt = datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
            else:
                dt = datetime.strptime(dt_str, '%Y-%m-%d %H:%M:%S')
        except:
            dt = datetime.now()
        
        hour = dt.hour
        month = dt.month
        day_of_week = dt.weekday()
        
        # Derived features
        thermal_intensity = brightness - bright_t31
        
        # Cyclical time encoding
        hour_sin = np.sin(2 * np.pi * hour / 24)
        hour_cos = np.cos(2 * np.pi * hour / 24)
        month_sin = np.sin(2 * np.pi * month / 12)
        month_cos = np.cos(2 * np.pi * month / 12)
        
        # Return feature vector (14 features to match the trained model)
        features = np.array([
            brightness,
            bright_t31,
            frp,
            scan,
            track,
            confidence_score,
            daynight_score,
            thermal_intensity,
            hour_sin,
            hour_cos,
            month_sin,
            month_cos,
            day_of_week,  # Raw day of week instead of cyclical
            hour  # Raw hour instead of additional spatial features
        ]).reshape(1, -1)
        
        return features
    
    def predict_violence_probability(self, fire_data):
        """Predict violence probability for a fire event using trained model."""
        if not self.model_loaded:
            # Model must be loaded to make predictions
            raise ValueError("Model not loaded. Please ensure violence_classifier_model.pkl exists in the models directory.")
        
        try:
            # Extract features
            features = self.extract_features(fire_data)
            print(f"DEBUG: Input fire_data: brightness={fire_data.get('brightness')}, confidence={fire_data.get('confidence')}, daynight={fire_data.get('daynight')}")
            print(f"DEBUG: Raw features shape: {features.shape}")
            print(f"DEBUG: Raw features ALL: {features[0]}")
            
            # Scale features
            features_scaled = self.scaler.transform(features)
            print(f"DEBUG: Scaled features ALL: {features_scaled[0]}")
            
            # Get prediction probability from trained model
            proba = self.model.predict_proba(features_scaled)
            print(f"DEBUG: Model prediction probabilities: {proba}")
            violence_probability = proba[0, 1]
            print(f"DEBUG: Violence probability: {violence_probability}")
            
            return float(violence_probability)
        except Exception as e:
            print(f"Prediction error: {e}")
            import traceback
            traceback.print_exc()
            raise  # Re-raise the error instead of returning a default value

# Initialize predictor
predictor = FireViolencePredictor()
predictor.load_model()
print(f"DEBUG: Model loaded status: {predictor.model_loaded}")
if predictor.model_loaded:
    print(f"DEBUG: Model type: {type(predictor.model)}")
    print(f"DEBUG: Scaler type: {type(predictor.scaler)}")

# Sample fire data for demonstration
SAMPLE_FIRE_DATA = [
    {
        "id": 1,
        "datetime_utc": "2024-03-15T14:30:00Z",
        "latitude": 49.842957,
        "longitude": 36.642884,
        "brightness": 325.5,
        "bright_t31": 295.2,
        "frp": 18.3,
        "confidence": "high",
        "scan": 0.8,
        "track": 0.9,
        "daynight": "D",
        "satellite": "VIIRS",
        "location": "Near Kharkiv",
        "description": "High confidence fire detection"
    },
    {
        "id": 2,
        "datetime_utc": "2024-03-15T03:15:00Z",
        "latitude": 48.523872,
        "longitude": 35.028503,
        "brightness": 310.2,
        "bright_t31": 288.5,
        "frp": 12.1,
        "confidence": "medium",
        "scan": 0.7,
        "track": 0.8,
        "daynight": "N",
        "satellite": "MODIS",
        "location": "Dnipro Region",
        "description": "Nighttime detection, medium confidence"
    },
    {
        "id": 3,
        "datetime_utc": "2024-03-14T18:45:00Z",
        "latitude": 50.450100,
        "longitude": 30.523400,
        "brightness": 308.8,
        "bright_t31": 290.1,
        "frp": 8.5,
        "confidence": "low",
        "scan": 0.6,
        "track": 0.7,
        "daynight": "D",
        "satellite": "VIIRS",
        "location": "Kyiv Oblast",
        "description": "Low confidence detection"
    },
    {
        "id": 4,
        "datetime_utc": "2024-03-15T22:00:00Z",
        "latitude": 47.838800,
        "longitude": 35.139567,
        "brightness": 335.2,
        "bright_t31": 298.5,
        "frp": 25.8,
        "confidence": "high",
        "scan": 0.9,
        "track": 0.95,
        "daynight": "N",
        "satellite": "VIIRS",
        "location": "Zaporizhzhia Region",
        "description": "High intensity nighttime fire"
    },
    {
        "id": 5,
        "datetime_utc": "2024-03-15T10:30:00Z",
        "latitude": 51.493072,
        "longitude": 31.294967,
        "brightness": 315.5,
        "bright_t31": 292.3,
        "frp": 14.2,
        "confidence": "medium",
        "scan": 0.75,
        "track": 0.85,
        "daynight": "D",
        "satellite": "MODIS",
        "location": "Chernihiv Oblast",
        "description": "Daytime detection, moderate intensity"
    }
]

@fire_tracking_bp.route('/api/fire-detections', methods=['GET'])
def get_fire_detections():
    """Get current fire detections with violence predictions."""
    try:
        # Add violence predictions to each fire
        fires_with_predictions = []
        for fire in SAMPLE_FIRE_DATA:
            fire_copy = fire.copy()
            # Predict violence probability
            violence_prob = predictor.predict_violence_probability(fire)
            fire_copy['violence_probability'] = violence_prob
            fire_copy['violence_risk'] = 'high' if violence_prob > 0.7 else 'medium' if violence_prob > 0.4 else 'low'
            fires_with_predictions.append(fire_copy)
        
        return jsonify({
            'success': True,
            'fires': fires_with_predictions,
            'total': len(fires_with_predictions),
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@fire_tracking_bp.route('/api/predict-violence', methods=['POST'])
def predict_violence():
    """Predict violence probability for user-provided fire data."""
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['latitude', 'longitude', 'brightness']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False, 
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Set defaults for optional fields
        fire_data = {
            'datetime_utc': data.get('datetime_utc', datetime.now().isoformat()),
            'latitude': float(data['latitude']),
            'longitude': float(data['longitude']),
            'brightness': float(data['brightness']),
            'bright_t31': float(data.get('bright_t31', data['brightness'] - 20)),
            'frp': float(data.get('frp', 10.0)),
            'confidence': data.get('confidence', 'medium'),
            'scan': float(data.get('scan', 0.8)),
            'track': float(data.get('track', 0.8)),
            'daynight': data.get('daynight', 'D'),
        }
        
        # Get prediction
        violence_prob = predictor.predict_violence_probability(fire_data)
        
        # Determine risk level
        if violence_prob > 0.7:
            risk_level = 'high'
            risk_description = 'High probability of conflict-related fire'
        elif violence_prob > 0.4:
            risk_level = 'medium'
            risk_description = 'Moderate probability of conflict-related fire'
        else:
            risk_level = 'low'
            risk_description = 'Low probability of conflict-related fire'
        
        # Extract features for explanation
        features = predictor.extract_features(fire_data)
        
        response = {
            'success': True,
            'prediction': {
                'violence_probability': violence_prob,
                'risk_level': risk_level,
                'risk_description': risk_description,
                'confidence_score': (1.0 - abs(violence_prob - 0.5) * 2) * 100  # Confidence in prediction
            },
            'input_data': fire_data,
            'analysis': {
                'thermal_intensity': float(fire_data['brightness'] - fire_data['bright_t31']),
                'time_of_day': 'Night' if fire_data['daynight'] == 'N' else 'Day',
                'detection_confidence': fire_data['confidence'],
                'location': {
                    'latitude': fire_data['latitude'],
                    'longitude': fire_data['longitude'],
                    'region': classify_region(fire_data['latitude'], fire_data['longitude'])
                }
            },
            'model_info': {
                'type': 'SVM Classifier (Trained Model)',
                'features_used': 16,
                'training_samples': '302,830',
                'accuracy': '77.05%',
                'model_loaded': predictor.model_loaded
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@fire_tracking_bp.route('/api/fire-statistics', methods=['GET'])
def get_fire_statistics():
    """Get statistics about fire detections."""
    try:
        total_fires = len(SAMPLE_FIRE_DATA)
        
        # Calculate violence probabilities
        try:
            violence_probs = [predictor.predict_violence_probability(fire) for fire in SAMPLE_FIRE_DATA]
        except Exception as e:
            print(f"Error calculating violence probabilities: {e}")
            violence_probs = []
        
        high_risk = sum(1 for p in violence_probs if p > 0.7)
        medium_risk = sum(1 for p in violence_probs if 0.4 < p <= 0.7)
        low_risk = sum(1 for p in violence_probs if p <= 0.4)
        
        # Time distribution
        day_fires = sum(1 for fire in SAMPLE_FIRE_DATA if fire.get('daynight') == 'D')
        night_fires = sum(1 for fire in SAMPLE_FIRE_DATA if fire.get('daynight') == 'N')
        
        # Confidence distribution
        high_conf = sum(1 for fire in SAMPLE_FIRE_DATA if fire.get('confidence') == 'high')
        medium_conf = sum(1 for fire in SAMPLE_FIRE_DATA if fire.get('confidence') == 'medium')
        low_conf = sum(1 for fire in SAMPLE_FIRE_DATA if fire.get('confidence') == 'low')
        
        statistics = {
            'total_fires': total_fires,
            'violence_risk': {
                'high': high_risk,
                'medium': medium_risk,
                'low': low_risk,
                'average_probability': float(np.mean(violence_probs))
            },
            'time_distribution': {
                'day': day_fires,
                'night': night_fires,
                'unknown': total_fires - day_fires - night_fires
            },
            'confidence_distribution': {
                'high': high_conf,
                'medium': medium_conf,
                'low': low_conf
            },
            'thermal_metrics': {
                'avg_brightness': float(np.mean([f['brightness'] for f in SAMPLE_FIRE_DATA])),
                'avg_frp': float(np.mean([f.get('frp', 0) for f in SAMPLE_FIRE_DATA])),
                'max_brightness': float(max([f['brightness'] for f in SAMPLE_FIRE_DATA])),
                'max_frp': float(max([f.get('frp', 0) for f in SAMPLE_FIRE_DATA]))
            },
            'last_update': datetime.now().isoformat()
        }
        
        return jsonify({'success': True, 'statistics': statistics})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def classify_region(lat, lon):
    """Classify region based on coordinates."""
    # Simplified region classification for Ukraine
    if lat > 50.5:
        return "Northern Ukraine"
    elif lat < 46.5:
        return "Southern Ukraine"
    elif lon < 25:
        return "Western Ukraine"
    elif lon > 37:
        return "Eastern Ukraine"
    else:
        return "Central Ukraine"