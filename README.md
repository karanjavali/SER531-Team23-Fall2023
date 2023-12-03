# SER531-Team23-Fall2023

## Application Setup

### 1. Fuseki Server:

a. Run the fuseki server locally and upload the required .owl files or run from hosted instance. The application will not work without this.

b. https://jena.apache.org/download/index.cgi - Download the apache-jena-fuseki zip file from this link.

c .Go inside the folder and run the following command from terminal: ./fuseki-server --update --mem /ds

d. Then go the link displayed in terminal: http://localhost:3030/

e. Select the add data option and in the upload files section, upload the OWL file submiited with project.

f. This LAPD OWL file is our final ontology solution to the problem statement.

g. Once the data (OWL file) has been submitted you can start the application by starting/running the front-end and back-end of the app as mentioned below.

### 2. Frontend:
Run the following commands from the terminal after navigating to the frontend folder -

a. npm i

b. ng serve

### 3. Backend:
Create a .env file in the backend folder. A sample is provided for the content in env.example.txt. Run the following commands from the terminal after navigating to the backend folder -

a. pip install -r requirements.txt

b. flask run

NOTE - When running locally, you may face CORS issue.
