# Models Directory

This directory is for storing machine learning models used by the application.

## Violence Classifier Model

The application expects a file named `violence_classifier_model.pkl` in this directory.

This should be a pickled Python object containing:
- `model`: Trained SVM classifier
- `scaler`: Feature scaler (StandardScaler or similar)
- `feature_names`: List of feature names used in training

Without this file, the application will use a mock predictor that generates predictions based on simple heuristics.

To create a proper model:
1. Train an SVM classifier on Ukraine fire/violence data
2. Save it using pickle with the structure mentioned above
3. Place the file in this directory as `violence_classifier_model.pkl`

The mock predictor provides reasonable predictions for demonstration purposes:
- Higher probability for high confidence, high brightness, nighttime events
- Based on thermal signatures and temporal patterns typical of conflict zones