from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify({
        'message': 'Hello from Flask backend!',
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
        'timestamp': '2025-08-25'
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
    return jsonify({
        'api': 'Flask Backend',
        'version': '1.0.0',
        'status': 'running'
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)