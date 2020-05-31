from flask import Flask, jsonify, request
import logging
import requests

app = Flask(__name__)
API_KEY = 'ce2b9abfd0c24d4a8aa5864dcc854a00'
MBTA_URL = 'https://api-v3.mbta.com/'
headers = {
    'accept': 'application/vnd.api+json',
    'x-api-key': API_KEY
}

# Get all train routes on this given stop.
@app.route('/api/v1/get_routes_from_stop/<stop_id>', methods=['GET'])
def get_routes_from_stop(stop_id):
    response = requests.get('https://api-v3.mbta.com/routes?filter%5Bstop%5D=' + stop_id, headers=headers).json()
    return jsonify(response['data'])

# Get Train Schedule Predicitions at a given stop.
@app.route('/api/v1/get_predictions/<stop_id>', methods=['GET'])
def get_predictions(stop_id):
    response = requests.get('https://api-v3.mbta.com/predictions?fields%5Bprediction%5D=schedule&include=schedule.route&filter%5Broute_type%5D=2&filter%5Bstop%5D=' + stop_id, headers=headers).json()
    return jsonify(response)

# Get all stops on a given Route type. Ex: Use route_type_id = 2, to fetch all all stops for commuter trains.
@app.route('/api/v1/get_stops/<route_type_id>', methods=['GET'])
def get_stops(route_type_id):
    response = requests.get('https://api-v3.mbta.com/stops?filter%5Broute_type%5D=' + route_type_id, headers=headers).json()
    return jsonify(response['data'])
