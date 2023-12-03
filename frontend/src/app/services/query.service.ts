import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

// service to return query based on user input
export class QueryService {

  constructor() { }

  getStateListQuery() {
    return "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
    PREFIX lapd: <http://www.semanticweb.org/aaditya9/ontologies/2023/10/LAPD_Crime#>\
    \
    SELECT DISTINCT ?state\
    WHERE {\
      ?cs rdf:type lapd:CityStatistics .\
      ?st rdf:type lapd:US_States .\
      \
      ?cs lapd:hasStatisticsState ?st .\
      \
      BIND(xsd:string(strafter(str(?st), \"#\")) AS ?state)\
    }\
    ORDER BY ASC(?city)";
  }

  getCityListQuery(state:string) {
    return `PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
    PREFIX lapd: <http://www.semanticweb.org/aaditya9/ontologies/2023/10/LAPD_Crime#>\
    \
    SELECT DISTINCT ?city\
    WHERE {\
      ?cs rdf:type lapd:CityStatistics .\
      ?st rdf:type lapd:US_States .\
      ?c rdf:type lapd:US_City .\
      \
      ?cs lapd:hasStatisticsState ?st .\
      ?cs lapd:hasStatisticsCity ?c .\
      \
      BIND(xsd:string(strafter(str(?st), \"#\")) AS ?state)\
      BIND(xsd:string(strafter(str(?c), \"#\")) AS ?city)\
      \
      FILTER (?state = \"${state}\")\
    }
    ORDER BY ASC(?city)`;
  }

  getCityStatsQuery(state:string, city:string) {
    return `PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
    PREFIX lapd: <http://www.semanticweb.org/aaditya9/ontologies/2023/10/LAPD_Crime#>\
    \
    SELECT DISTINCT ?percentAsian ?percentBlack ?percentWhite ?percentNative ?percentHispanic ?medianIncome ?percentPoverty ?percentEducation\
    WHERE {\
      ?cs rdf:type lapd:CityStatistics .\
      ?st rdf:type lapd:US_States .\
      ?c rdf:type lapd:US_City .\
      ?pa rdf:type lapd:PercentAsian .\
      ?pb rdf:type lapd:PercentBlack .\
      ?pw rdf:type lapd:PercentWhite .\
      ?ph rdf:type lapd:PercentHispanic .\
      ?pn rdf:type lapd:PercentNativeAmerican .\
      ?mi rdf:type lapd:MedianIncome .\
      ?phs rdf:type lapd:PercentAbove25HighSchool .\
      ?pbp rdf:type lapd:PercentBelowPoverty .\
      \
      ?cs lapd:hasStatisticsState ?st .\
      ?cs lapd:hasStatisticsCity ?c .\
      ?cs lapd:hasStatisticsAsian ?pa .\
      ?cs lapd:hasStatisticsBlack ?pb .\
      ?cs lapd:hasStatisticsWhite ?pw .\
      ?cs lapd:hasStatisticsHispanic ?ph .\
      ?cs lapd:hasStatisticsNativeAmerican ?pn .\
      ?cs lapd:hasStatisticsMedianIncome ?mi .\
      ?cs lapd:hasStatisticsPercentAbove25HighSchool ?pbs .\
      ?cs lapd:hasStatisticsPercentBelowPoverty ?pbp .\
      \
      BIND(xsd:string(strafter(str(?st), \"#\")) AS ?state)\
      BIND(xsd:string(strafter(str(?c), \"#\")) AS ?city)\
      BIND(xsd:float(strafter(str(?pa), \"#\")) AS ?percentAsian)\
      BIND(xsd:float(strafter(str(?pb), \"#\")) AS ?percentBlack)\
      BIND(xsd:float(strafter(str(?pw), \"#\")) AS ?percentWhite)\
      BIND(xsd:float(strafter(str(?ph), \"#\")) AS ?percentHispanic)\
      BIND(xsd:float(strafter(str(?pn), \"#\")) AS ?percentNative)\
      BIND(xsd:double(strafter(str(?mi), \"#\")) AS ?medianIncome)\
      BIND(xsd:float(strafter(str(?phs), \"#\")) AS ?percentEducation)\
      BIND(xsd:float(strafter(str(?pbp), \"#\")) AS ?percentPoverty)\
      \
      FILTER (?state = \"${state}\" && ?city = \"${city}\")\
    }`;
  }

  getHateCrimeDataQuery(race:string, location:string, biasMotivation:string) {
    
    let criminalRaceFilter = `?criminalRace = \"${race}\"`;
    let locationTypeFilter = `?locationType = ${location}`;
    let biasMotivationFilter = `?biasMotivation = \"${biasMotivation}\"`;

    let filters = [];
    if (race != "All") {
      filters.push(criminalRaceFilter);
      filters.push("&&");
    }
    
    if (location != "All") {
      filters.push(locationTypeFilter);
      filters.push("&&");
    }

    if (biasMotivation != "All") {
      filters.push(biasMotivationFilter);
      filters.push("&&");
    }

    if (filters.length > 0) {
      filters.pop();
    }
    
    let queryFilterString = "";

    if (filters.length > 0) {
      let filterString = "";
      for (let filter of filters) {
        filterString += filter + " ";
      }
      queryFilterString = `FILTER(${filterString})`;
    }
    
    const query = `PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
    PREFIX lapd: <http://www.semanticweb.org/aaditya9/ontologies/2023/10/LAPD_Crime#>\
    \
    SELECT ?offenceType (COUNT(?offenceType) AS ?offenceCount)\
    WHERE {\
      ?hc rdf:type lapd:HateCrime .\
      ?st rdf:type lapd:US_States .\
      ?ct rdf:type lapd:US_City .\
      ?lt rdf:type lapd:TypeOfLocation .\
      ?bm rdf:type lapd:BiasMotivation .\
      ?ot rdf:type lapd:TypeOfOffence .\
      ?cr rdf:type lapd:CriminalRace .\
      \
      ?hc lapd:hasHateCrimeState ?st .\
      ?hc lapd:hasHateCrimeCity ?ct .\
      ?hc lapd:hasHateCrimeLocationType ?lt .\
      ?hc lapd:hasHateCrimeBiasMotivation ?bm .\
      ?hc lapd:hasHateCrimeOffence ?ot .\
      ?hc lapd:hasHateCrimeCriminalRace ?cr .\
      \
      BIND(xsd:string(strafter(str(?st), \"#\")) AS ?state)\
      BIND(xsd:string(strafter(str(?ct), \"#\")) AS ?city)\
      BIND(xsd:integer(strafter(str(?lt), \"#\")) AS ?locationType)\
      BIND(xsd:string(strafter(str(?bm), \"#\")) AS ?biasMotivation)\
      BIND(xsd:string(strafter(str(?ot), \"#\")) AS ?offenceType)\
      BIND(xsd:string(strafter(str(?cr), \"#\")) AS ?criminalRace)\
      \
      ${queryFilterString}\
    }\
    GROUP BY ?offenceType\
    ORDER BY DESC(?offenceCount)\
    `

    return query;
  }

  getLAPDMainData(city:string) {
    return `PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
    PREFIX lapd: <http://www.semanticweb.org/aaditya9/ontologies/2023/10/LAPD_Crime#>\
    \
    SELECT ?crimeDescription (COUNT(?crimeDescription) AS ?crimeCount)\
    WHERE {\
      ?gc rdf:type lapd:GeneralCrimes .\
      ?st rdf:type lapd:US_States .\
      ?ct rdf:type lapd:US_City .\
      ?cc rdf:type lapd:GeneralCrimeCode .\
      ?wc rdf:type lapd:GeneralCrimeWeaponCode .\
      ?cd rdf:type lapd:GeneralCrimeDecription .\
      ?wd rdf:type lapd:GeneralCrimeWeaponDescription .\
      ?lt rdf:type lapd:TypeOfLocation .\
      ?m rdf:type lapd:D_Month .\
      ?y rdf:type lapd:D_Year .\
      ?va rdf:type lapd:VictimAge .\
      ?vr rdf:type lapd:VictimRace .\
      ?vs rdf:type lapd:VictimSex .\
      \
      ?gc lapd:hasGeneralCrimeState ?st .\
      ?gc lapd:hasGeneralCrimeCity ?ct .\
      ?gc lapd:hasGeneralCrimeCode ?cc .\
      ?cc lapd:hasCrimeDescription ?cd .\
      ?gc lapd:hasGeneralCrimeWeaponCode ?wc .\
      ?wc lapd:hasWeaponDescription ?wd .\
      ?gc lapd:hasGeneralCrimeLocationType ?lt .\
      ?gc lapd:hasGeneralCrimeMonth ?m .\
      ?gc lapd:hasGeneralCrimeYear ?y .\
      ?gc lapd:hasGeneralCrimeVictAge ?va .\
      ?gc lapd:hasGeneralCrimeVictRace ?vr .\
      ?gc lapd:hasGeneralCrimeVictSex ?vs .\
    \
      BIND(xsd:string(strafter(str(?st), \"#\")) AS ?state)\
      BIND(xsd:string(strafter(str(?ct), \"#\")) AS ?area)\
      BIND(xsd:integer(strafter(str(?lt), \"#\")) AS ?locationType)\
      BIND(xsd:int(strafter(str(?cc), \"#\")) AS ?crimeCode)\
      BIND(xsd:string(strafter(str(?cd), \"#\")) AS ?crimeDescription)\
      BIND(xsd:int(strafter(str(?wc), \"#\")) AS ?weaponCode)\
      BIND(xsd:string(strafter(str(?wd), \"#\")) AS ?weaponDescription)\
      BIND(xsd:int(strafter(str(?m), \"#\")) AS ?month)\
      BIND(xsd:int(strafter(str(?y), \"#\")) AS ?year)\
      BIND(xsd:int(strafter(str(?va), \"#\")) AS ?victAge)\
      BIND(xsd:string(strafter(str(?vr), \"#\")) AS ?victRace)\
      BIND(xsd:string(strafter(str(?vs), \"#\")) AS ?victSex)\
      \
      FILTER(?area = \"${city}\")\
    }\
    GROUP BY ?crimeDescription\
    `
  }

  getLAPDMainAreaList() {
    return "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
    PREFIX lapd: <http://www.semanticweb.org/aaditya9/ontologies/2023/10/LAPD_Crime#>\
    \
    SELECT DISTINCT ?area\
    WHERE {\
      ?gc rdf:type lapd:GeneralCrimes .\
      ?ct rdf:type lapd:US_City .\
      ?gc lapd:hasGeneralCrimeCity ?ct .\
    \
      BIND(xsd:string(strafter(str(?ct), \"#\")) AS ?area)\
    }\
    ORDER BY ASC(?area)"
  }

  getHateCrimeCriminalRaceList() {
    return "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
    PREFIX lapd: <http://www.semanticweb.org/aaditya9/ontologies/2023/10/LAPD_Crime#>\
    \
    SELECT DISTINCT ?criminalRace\
    WHERE {\
      ?hc rdf:type lapd:HateCrime .\
      ?cr rdf:type lapd:CriminalRace .\
      ?hc lapd:hasHateCrimeCriminalRace ?cr .\
    \
      BIND(xsd:string(strafter(str(?cr), \"#\")) AS ?criminalRace)\
    }\
    ORDER BY ASC(?criminalRace)";
  }

  getHateCrimeBiasMotivationList() {
    return "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
    PREFIX lapd: <http://www.semanticweb.org/aaditya9/ontologies/2023/10/LAPD_Crime#>\
    \
    SELECT DISTINCT ?biasMotivation\
    WHERE {\
      ?hc rdf:type lapd:HateCrime .\
      ?bm rdf:type lapd:BiasMotivation .\
      ?hc lapd:hasHateCrimeBiasMotivation ?bm .\
      \
      BIND(xsd:string(strafter(str(?bm), \"#\")) AS ?biasMotivation)\
    }\
    ORDER BY ASC(?biasMotivation)";
  }
}
