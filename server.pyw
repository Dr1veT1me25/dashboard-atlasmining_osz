from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

@app.route('/weather')
def get_weather():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    if not lat or not lon:
        return jsonify({"error": "No coordinates provided"}), 400

    try:
        # Используем product=civil для получения текущей температуры
        url = f"http://www.7timer.info/bin/api.pl?lon={lon}&lat={lat}&product=civil&output=json"
        response = requests.get(url, timeout=15)
        response.raise_for_status()
        
        data = response.json()
        
        # Правильный ключ — dataseries
        if 'dataseries' in data and len(data['dataseries']) > 0:
            temp_data = data['dataseries'][0].get('temp2m')
            if isinstance(temp_data, dict):
                # Для product=civillight temp2m приходит как {'max': ..., 'min': ...}
                temp = temp_data.get('max') or temp_data.get('min')
            else:
                temp = temp_data
            return jsonify({"temp": temp})
        else:
            return jsonify({"error": "Invalid response structure"}), 500
            
    except Exception as e:
        print(f"Ошибка 7Timer!: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)