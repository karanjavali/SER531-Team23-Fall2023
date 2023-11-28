from flask import Flask, request, jsonify, abort

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import json


app = Flask(__name__)


@app.route('/get_crime_data', methods=['GET', 'POST'])
def get_hate_crime_data():
    data_hate_crime = pd.read_csv('../dataset_processed/HateCrime.csv')
    data_lapd_main = pd.read_csv('../dataset_processed/LAPDMain.csv')
    data_city_stats = pd.read_csv('../dataset_processed/CityStats.csv')
    
    json_data_hate_crime = data_hate_crime.to_json(orient='records')
    json_data_lapd_main = data_lapd_main.to_json(orient='records')
    json_data_city_stats = data_city_stats.to_json(orient='records')

    return_obj = {
        'hateCrime': json.loads(json_data_hate_crime),
        'lapdMain': json.loads(json_data_lapd_main),
        'cityStats': json.loads(json_data_city_stats)
    }
    
    return return_obj, 200