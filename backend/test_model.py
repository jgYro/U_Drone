#!/usr/bin/env python3
"""Test the violence classifier model directly"""

import pickle
import numpy as np

# Load model
with open('models/violence_classifier_model.pkl', 'rb') as f:
    model_data = pickle.load(f)

model = model_data['model']
scaler = model_data['scaler']

print(f"Model type: {type(model)}")
print(f"Scaler expects {scaler.n_features_in_} features")
print(f"Scaler mean shape: {scaler.mean_.shape}")
print(f"Scaler scale shape: {scaler.scale_.shape}")

# Test different feature vectors (14 features)
test_cases = [
    {
        "name": "High risk - Night, high brightness",
        "features": [350, 290, 50, 1.0, 1.0, 1.0, 0.0, 60,  # thermal features
                    0.5, 0.866, 0.5, 0.866, 3, 22]  # temporal features
    },
    {
        "name": "Low risk - Day, low brightness", 
        "features": [295, 285, 5, 0.8, 0.8, 0.33, 1.0, 10,  # thermal features
                    0.866, 0.5, 0.866, 0.5, 1, 14]  # temporal features
    },
    {
        "name": "Medium risk - Mixed parameters",
        "features": [315, 295, 20, 0.9, 0.9, 0.66, 1.0, 20,  # thermal features
                    0.707, 0.707, 0.0, 1.0, 5, 9]  # temporal features
    }
]

for test in test_cases:
    features = np.array(test["features"]).reshape(1, -1)
    print(f"\n{test['name']}:")
    print(f"  Raw features: {features[0][:8]}...")
    
    # Scale features
    features_scaled = scaler.transform(features)
    print(f"  Scaled features: {features_scaled[0][:8]}...")
    
    # Predict
    proba = model.predict_proba(features_scaled)
    print(f"  Prediction: Non-violent={proba[0][0]:.4f}, Violent={proba[0][1]:.4f}")
    print(f"  Violence probability: {proba[0][1]*100:.2f}%")