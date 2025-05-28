from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
import json
from pathlib import Path

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/config')
def get_config():
    try:
        with open('config.json', 'r') as f:
            config = json.load(f)
        return jsonify(config)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/theme')
def get_theme():
    try:
        with open('config.json', 'r') as f:
            config = json.load(f)
        return jsonify({
            'mode': config['site']['theme']['mode'] if 'mode' in config['site']['theme'] else 'light'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/update-theme', methods=['POST'])
def update_theme():
    try:
        data = request.json
        if not data or 'mode' not in data:
            return jsonify({'error': 'Invalid theme data'}), 400
        
        with open('config.json', 'r+') as f:
            config = json.load(f)
            if 'theme' not in config['site']:
                config['site']['theme'] = {}
            config['site']['theme']['mode'] = data['mode']
            f.seek(0)
            json.dump(config, f, indent=2)
            f.truncate()
        
        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
