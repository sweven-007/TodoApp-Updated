from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import logging
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

DATA_FILE = 'data.json'

def read_data():
    try:
        if not os.path.exists(DATA_FILE):
            logger.info(f"Data file not found. Creating default structure.")
            default_data = {
                "todo": {"name": "To Do", "tasks": []},
                "inProgress": {"name": "In Progress", "tasks": []},
                "done": {"name": "Done", "tasks": []}
            }
            write_data(default_data)
            return default_data
        
        with open(DATA_FILE, 'r') as f:
            data = json.load(f)
            logger.info(f"Successfully read data with {sum(len(col['tasks']) for col in data.values())} tasks.")
            return data
    except Exception as e:
        logger.error(f"Error reading data: {str(e)}")
        return {
            "todo": {"name": "To Do", "tasks": []},
            "inProgress": {"name": "In Progress", "tasks": []},
            "done": {"name": "Done", "tasks": []}
        }

def write_data(data):
    try:
        with open(DATA_FILE, 'w') as f:
            json.dump(data, f, indent=2)
        logger.info(f"Successfully wrote data with {sum(len(col['tasks']) for col in data.values())} tasks.")
        return True
    except Exception as e:
        logger.error(f"Error writing data: {str(e)}")
        return False

@app.route('/tasks', methods=['GET'])
def get_tasks():
    logger.info("GET request received for /tasks")
    return jsonify(read_data())

@app.route('/tasks', methods=['POST'])
def save_tasks():
    try:
        data = request.get_json()
        logger.info(f"POST request received for /tasks with {sum(len(col['tasks']) for col in data.values())} tasks")
        
        if write_data(data):
            return jsonify({"status": "success", "timestamp": datetime.now().isoformat()}), 200
        else:
            return jsonify({"status": "error", "message": "Failed to write data"}), 500
    except Exception as e:
        logger.error(f"Error in save_tasks: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()}), 200

if __name__ == '__main__':
    logger.info("Starting server...")
    app.run(debug=True, host='0.0.0.0', port=5000)
