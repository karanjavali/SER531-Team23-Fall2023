""" from flask import Flask, request, jsonify, abort

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
    
    return return_obj, 200 """

from flask import Flask, render_template, request
import requests, json

# Set the SPARQL query
SPARQL_QUERY1 = "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX lapd: <http://www.semanticweb.org/aaditya9/ontologies/2023/10/LAPD_Crime#> SELECT ?offenceType (COUNT(?offenceType) AS ?offenceCount) WHERE { ?hc rdf:type lapd:HateCrime . ?st rdf:type lapd:US_States . ?ct rdf:type lapd:US_City . ?lt rdf:type lapd:TypeOfLocation . ?bm rdf:type lapd:BiasMotivation . ?ot rdf:type lapd:TypeOfOffence . ?cr rdf:type lapd:CriminalRace .?hc lapd:hasHateCrimeState ?st . ?hc lapd:hasHateCrimeCity ?ct . ?hc lapd:hasHateCrimeLocationType ?lt . ?hc lapd:hasHateCrimeBiasMotivation ?bm . ?hc lapd:hasHateCrimeOffence ?ot . ?hc lapd:hasHateCrimeCriminalRace ?cr . BIND(xsd:string(strafter(str(?st), '#')) AS ?state) BIND(xsd:string(strafter(str(?ct), '#')) AS ?city) BIND(xsd:integer(strafter(str(?lt), '#')) AS ?locationType) BIND(xsd:string(strafter(str(?bm), '#')) AS ?biasMotivation) BIND(xsd:string(strafter(str(?ot), '#')) AS ?offenceType) BIND(xsd:string(strafter(str(?cr), '#')) AS ?criminalRace) FILTER(?criminalRace = 'BlackOrAfricanAmerican' && ?locationType = 0 && ?biasMotivation = 'Anti-BlackOrAfricanAmerican') } GROUP BY ?offenceType ORDER BY DESC(?offenceCount)"
SPARQL_QUERY2 = "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX lapd: <http://www.semanticweb.org/aaditya9/ontologies/2023/10/LAPD_Crime#> SELECT DISTINCT ?city WHERE { ?cs rdf:type lapd:CityStatistics . ?st rdf:type lapd:US_States . ?c rdf:type lapd:US_City . ?cs lapd:hasStatisticsState ?st . ?cs lapd:hasStatisticsCity ?c . BIND(xsd:string(strafter(str(?st), '#')) AS ?state) BIND(xsd:string(strafter(str(?c), '#')) AS ?city) FILTER (?state = 'AK') }"
SPARQL_QUERY3 = "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX lapd: <http://www.semanticweb.org/aaditya9/ontologies/2023/10/LAPD_Crime#> SELECT ?crimeDescription (COUNT(?crimeDescription) AS ?crimeCount) WHERE { ?gc rdf:type lapd:GeneralCrimes . ?st rdf:type lapd:US_States . ?ct rdf:type lapd:US_City . ?cc rdf:type lapd:GeneralCrimeCode . ?wc rdf:type lapd:GeneralCrimeWeaponCode . ?cd rdf:type lapd:GeneralCrimeDecription . ?wd rdf:type lapd:GeneralCrimeWeaponDescription . ?lt rdf:type lapd:TypeOfLocation . ?m rdf:type lapd:D_Month . ?y rdf:type lapd:D_Year . ?va rdf:type lapd:VictimAge . ?vr rdf:type lapd:VictimRace . ?vs rdf:type lapd:VictimSex . ?gc lapd:hasGeneralCrimeState ?st . ?gc lapd:hasGeneralCrimeCity ?ct . ?gc lapd:hasGeneralCrimeCode ?cc . ?cc lapd:hasCrimeDescription ?cd . ?gc lapd:hasGeneralCrimeWeaponCode ?wc . ?wc lapd:hasWeaponDescription ?wd . ?gc lapd:hasGeneralCrimeLocationType ?lt . ?gc lapd:hasGeneralCrimeMonth ?m . ?gc lapd:hasGeneralCrimeYear ?y . ?gc lapd:hasGeneralCrimeVictAge ?va . ?gc lapd:hasGeneralCrimeVictRace ?vr . ?gc lapd:hasGeneralCrimeVictSex ?vs . BIND(xsd:string(strafter(str(?st), '#')) AS ?state) BIND(xsd:string(strafter(str(?ct), '#')) AS ?area) BIND(xsd:integer(strafter(str(?lt), '#')) AS ?locationType) BIND(xsd:int(strafter(str(?cc), '#')) AS ?crimeCode) BIND(xsd:string(strafter(str(?cd),'#')) AS ?crimeDescription) BIND(xsd:int(strafter(str(?wc), '#')) AS ?weaponCode) BIND(xsd:string(strafter(str(?wd), '#')) AS ?weaponDescription) BIND(xsd:int(strafter(str(?m), '#')) AS ?month) BIND(xsd:int(strafter(str(?y), '#')) AS ?year) BIND(xsd:int(strafter(str(?va), '#')) AS ?victAge) BIND(xsd:string(strafter(str(?vr), '#')) AS ?victRace) BIND(xsd:string(strafter(str(?vs), '#')) AS ?victSex) FILTER(?area = 'Hollywood') } GROUP BY ?crimeDescription ORDER BY DESC(?crimeCount)"

def run_query(SPARQL_QUERY):
    # Set the Fuseki server URL and dataset name
    FUSEKI_SERVER = "http://localhost:3030"
    DATASET_NAME = "ds"

    # Set the query endpoint
    QUERY_ENDPOINT = f"{FUSEKI_SERVER}/{DATASET_NAME}/query"

    # Set headers
    headers = {"Accept": "application/sparql-results+json"}

    # Send the SPARQL query to the Fuseki server
    response = requests.post(QUERY_ENDPOINT, data={"query": SPARQL_QUERY}, headers=headers)

    # Check if the request was successful (status code 200)
    if response.status_code == 200:
        results = response.json()
        result_array = []
        
        bindings_array = results["results"]["bindings"]
        for bindings_entry in bindings_array:
            result_object = {}
            for key, value_object in bindings_entry.items():
                result_object[key] = value_object['value']
            result_array.append(result_object)
            
        # Serializing json
        result_json = json.dumps(result_array, indent=4)
            
        # Writing to output.json
        with open("output.json", "w") as output_file:
            output_file.write(result_json)
    else:
        print(f"Error: {response.status_code} - {response.text}")

run_query(SPARQL_QUERY3)