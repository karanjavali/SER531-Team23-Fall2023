from flask import Flask, request, jsonify
import os, requests
import json

from dotenv import load_dotenv
load_dotenv()  # take environment variables from .env.

app = Flask(__name__)

# accept input -> { query: "QUERY" }
@app.route('/get_data', methods=['GET','POST'])
def get_data():
    input_data = request.get_json()
    sparql_query = input_data.get('query').replace("\n","")
    
    # Fuseki query endpoint
    fuseki_query_url = os.environ.get("FUSEKI_SERVER_QUERY_URL")

    # Set headers
    headers = {"Accept": "application/sparql-results+json"}

    # Send the SPARQL query to the Fuseki server
    response = requests.post(fuseki_query_url, data={"query": sparql_query}, headers=headers)
    print('status code --> ',response.status_code)
    # Check if the request was successful (status code 200)
    if response.status_code == 200:
        # print(response.json())
        results = response.json()
        # print('results = ',results)
        result_array = []
        
        bindings_array = results["results"]["bindings"]
        for bindings_entry in bindings_array:
            result_object = {}
            for key, value_object in bindings_entry.items():
                result_object[key] = value_object['value']
            result_array.append(result_object)
        
        if len(result_array) == 0:
            result_array.append({})
        return jsonify(result_array)
    
    else:
        print(f"Error: {response.status_code} - {response.text}")
