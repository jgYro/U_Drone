# React + Flask Full Stack Application

A simple full-stack application with React frontend and Flask backend API.

## Project Structure

```
.
├── backend/           # Flask API backend
│   ├── app.py        # Main Flask application
│   └── requirements.txt
├── frontend/          # React frontend
│   ├── app/          # Application source code
│   │   └── routes/   # React Router pages
│   └── package.json
└── .gitignore
```

## Quick Start

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create and activate virtual environment:
```bash
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run Flask server:
```bash
python app.py
```

Backend will be available at http://localhost:5000

### Frontend Setup

1. In a new terminal, navigate to frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```

Frontend will be available at http://localhost:5173 (or similar port)

## Features

- ✅ React frontend with React Router for navigation
- ✅ Flask backend API with CORS support
- ✅ Multiple API endpoints (GET and POST)
- ✅ API integration demo page
- ✅ Git repository initialized with .gitignore

## API Endpoints

- `GET /api/hello` - Returns a hello message
- `GET /api/data` - Returns sample user data  
- `POST /api/echo` - Echoes back the message sent
- `GET /api/status` - Returns API status

## Development

Make sure both servers are running:
1. Flask backend on http://localhost:5000
2. React frontend on http://localhost:5173

The frontend is configured to proxy API requests to the Flask backend.