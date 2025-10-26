# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import random

# --- Initialization ---
app = Flask(__name__)
CORS(app) 

# Try to load model (optional - we're using dummy predictions)
model = None
model_columns = None
try:
    model = joblib.load('lgb_model.pkl')
    model_columns = joblib.load('model_columns.pkl')
    print("Model and columns loaded successfully.")
except FileNotFoundError:
    print("Warning: Model files not found. Using dummy predictions instead.")
    print("This is expected if you're testing with simulated data.")

# --- NEW: Add coordinates for all your locations ---
location_coords = {
    'nsit': (28.61, 77.04),
    'ito': (28.631, 77.248),
    'punjabi': (28.66, 77.12),
    'isbt': (28.667, 77.231),
    'mandir_marg': (28.628, 77.203),
    'civil_lines': (28.678, 77.222),
    'CPCBHQ': (28.59, 77.25),
    'Dilshad': (28.68, 77.31),
    'centralschool': (28.53, 77.25),
}

# --- Endpoint for SINGLE prediction (using DUMMY predictions) ---
@app.route('/predict', methods=['POST'])
def predict():
    """
    Generate a single dummy prediction based on input parameters.
    """
    data = request.get_json()
    
    # Extract parameters with defaults
    hour = data.get('hour', 15)
    day_of_week = data.get('day_of_week', 1)
    noise_lag = data.get('noise_lag_1hr', 68.5)
    
    # Try to identify location from input data
    location_name = data.get('location', 'nsit')
    
    # If location is provided as a flag (loc_xxx), find it
    for key in data.keys():
        if key.startswith('loc_') and data[key] == 1:
            location_name = key.replace('loc_', '')
            break
    
    # Generate dummy prediction
    prediction = generate_dummy_prediction(
        hour=hour,
        day_of_week=day_of_week,
        noise_lag=noise_lag,
        location_name=location_name
    )
    
    return jsonify({'prediction': prediction})

# --- NEW: Endpoint for generating MAP data (using DUMMY predictions) ---
@app.route('/predict_map', methods=['POST', 'OPTIONS'])
def predict_map():
    """
    Generate dummy predictions for all locations based on input parameters.
    This mimics the model behavior without requiring a working ML model.
    """
    # Handle OPTIONS request for CORS preflight
    if request.method == 'OPTIONS':
        return '', 204
    
    # Get parameters from request (with defaults)
    data = request.get_json() if request.is_json else {}
    hour = data.get('hour', 15)  # Default: 3 PM
    day_of_week = data.get('day_of_week', 1)  # Default: Tuesday
    noise_lag = data.get('noise_lag_1hr', 68.5)  # Default previous noise level
    
    map_predictions = []
    
    # Generate predictions for each known location
    for location_name, (lat, lon) in location_coords.items():
        # Use dummy prediction function
        predicted_noise = generate_dummy_prediction(
            hour=hour,
            day_of_week=day_of_week,
            noise_lag=noise_lag,
            location_name=location_name
        )
        
        # Determine zone type based on location
        zone_type = get_zone_type(location_name)
        
        # Calculate violation status
        limit = get_noise_limit(zone_type, hour)
        is_violation = predicted_noise > limit
        
        # Append the result to our list
        map_predictions.append({
            'location': location_name,
            'latitude': lat,
            'longitude': lon,
            'predicted_noise': predicted_noise,
            'zone_type': zone_type,
            'noise_limit': limit,
            'is_violation': is_violation,
            'confidence': round(random.uniform(0.75, 0.95), 2)  # Dummy confidence score
        })
    
    return jsonify(map_predictions)

# 1. Define the inherent "base" noise level for each location.
# These values are crucial for making the map look realistic.
# (Adjust these based on your project's findings)
LOCATION_BASE_NOISE = {
    'ito': 76.0,
    'isbt': 75.0,
    'punjabi': 72.0,
    'civil_lines': 70.0,
    'mandir_marg': 68.0,
    'CPCBHQ': 66.0,
    'nsit': 65.0,
    'Dilshad': 64.0,
    'centralschool': 62.0,
}

# Zone type mapping for each location
LOCATION_ZONE_TYPES = {
    'ito': 'Commercial',
    'isbt': 'Commercial',
    'punjabi': 'Residential',
    'civil_lines': 'Residential',
    'mandir_marg': 'Commercial',
    'CPCBHQ': 'Commercial',
    'nsit': 'Silence Zone',
    'Dilshad': 'Residential',
    'centralschool': 'Silence Zone',
}

# Noise limits based on zone type and time (dBA)
NOISE_LIMITS = {
    'Industrial': {'day': 75, 'night': 70},
    'Commercial': {'day': 65, 'night': 55},
    'Residential': {'day': 55, 'night': 45},
    'Silence Zone': {'day': 50, 'night': 40},
}

def get_zone_type(location_name: str) -> str:
    """Get the zone type for a given location."""
    return LOCATION_ZONE_TYPES.get(location_name, 'Residential')

def get_noise_limit(zone_type: str, hour: int) -> float:
    """Get the noise limit based on zone type and time of day."""
    time_period = 'night' if (22 <= hour or hour < 6) else 'day'
    return NOISE_LIMITS.get(zone_type, NOISE_LIMITS['Residential'])[time_period]

def generate_dummy_prediction(hour: int, day_of_week: int, noise_lag: float, location_name: str) -> float:
    """
    Generates a realistic but fake noise prediction based on inputs.
    
    Args:
        hour (int): The hour of the day (0-23).
        day_of_week (int): Day of the week (0=Monday, 6=Sunday).
        noise_lag (float): The noise level from the previous hour.
        location_name (str): The name of the monitoring station.
    """
    # Get the base noise for the given location, default to 65 if not found
    base_noise = LOCATION_BASE_NOISE.get(location_name, 65.0)

    # 2. Add a time-of-day factor
    time_factor = 0.0
    if 8 <= hour <= 10:  # Morning rush hour
        time_factor = 4.5
    elif 17 <= hour <= 20: # Evening rush hour
        time_factor = 6.0
    elif 0 <= hour <= 5:   # Late night
        time_factor = -8.0
    
    # 3. Add a day-of-week factor (weekends are quieter)
    day_factor = 0.0
    if day_of_week >= 5: # Saturday or Sunday
        day_factor = -3.5

    # 4. Calculate the "environmental" noise based on location, time, and day
    environmental_noise = base_noise + time_factor + day_factor

    # 5. Combine with the previous hour's noise for a smooth, realistic prediction
    # This weighted average makes the prediction anchored to the recent past.
    predicted_noise = (0.6 * noise_lag) + (0.4 * environmental_noise)

    # 6. Add a small amount of random noise to make it look less robotic
    final_prediction = predicted_noise + random.uniform(-1.5, 1.5)

    return round(final_prediction, 2)


# --- Run the Server ---
if __name__ == '__main__':
    app.run(port=5000, debug=True)
