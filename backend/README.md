# Flask Backend

## Setup

1. Create and activate virtual environment:
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Backend

```bash
python app.py
```

The Flask server will run on http://localhost:5000

## API Endpoints

- `GET /api/hello` - Returns a hello message
- `GET /api/data` - Returns sample user data
- `POST /api/echo` - Echoes back the message sent
- `GET /api/status` - Returns API status information