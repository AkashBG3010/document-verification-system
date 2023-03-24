from flask import Flask, request, session, request, jsonify
from flask_mysqldb import MySQL
import MySQLdb.cursors
import re
import boto3
from pytesseract import pytesseract, Output
from PIL import Image
from os import environ
import os
from flask_cors import CORS, cross_origin
from dotenv import load_dotenv

load_dotenv()
region = environ.get('AWS_REGION')
s3_bucket_name = environ.get('S3_BUCKET_NAME')
db_host = environ.get('MYSQL_HOST')
db_username = environ.get('MYSQL_USERNAME')
db_password = environ.get('MYSQL_PASSWORD')
db_name = environ.get('MYSQL_DB_NAME')
app_secret_key = environ.get('APP_SECRET_KEY')
port = environ.get('APP_PORT')
pytesseract.tesseract_cmd =  r'/usr/bin/tesseract'

app = Flask(__name__)

CORS(app)
s3 = boto3.client('s3')
textract = boto3.client('textract', region_name=region)
app.config['MYSQL_HOST'] = db_host
app.config['MYSQL_USER'] = db_username
app.config['MYSQL_PASSWORD'] = db_password
app.config['MYSQL_DB'] = db_name
app.secret_key = app_secret_key
mysql = MySQL(app)

@app.route("/")
def healthcheck():
    data='Success'
    return jsonify(statusMessage=data), 200

@app.route('/home')
def home():
    if 'loggedin' in session:
        username = session['username']
        return {"statusCode":200, "message": "success"}
    else:
        return {"statusCode":400, "message": "failed"}

@app.route('/logout')
def logout():
    session.pop('loggedin', None)
    session.pop('id', None)
    return {"statusCode":200, "message": "success"}

@app.route('/register', methods=['GET', 'POST'])
def register():
    data = 'failed'
    if request.method == 'POST' and 'username' in request.json and 'password' in request.json and 'email' in request.json:
        username = request.json['username']
        password = request.json['password']
        email = request.json['email']
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM accounts WHERE username = %s', (username,))
        account = cursor.fetchone()
        if account:
            data = 'alreadyExists'
        elif not re.match(r'[^@]+@[^@]+\.[^@]+', email):
            data = 'emailError'
        elif not re.match(r'[A-Za-z0-9]+', username):
            data = 'usernameError'
        elif not re.match(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$', password):
            data = 'passwordError'
        elif not username or not password or not email:
            data = 'emptyError'
        else:
            cursor.execute('INSERT INTO accounts VALUES (NULL, %s, %s, %s)', (username, password, email,))
            mysql.connection.commit()
            data = 'success'
    elif request.method == 'POST':
        data = 'incompleteForm'
    return {"statusCode":200, "message": data}

@app.route('/login', methods=['GET', 'POST'])
def login():
    msg = 'emptyError'
    if request.method == 'POST' and 'username' in request.json and 'password' in request.json:
        username = request.json['username']
        password = request.json['password']
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM accounts WHERE username = %s AND password = %s', (username, password,))
        account = cursor.fetchone()
        if account:
            session['loggedin'] = True
            session['id'] = account['id']
            session['username'] = account['username']
            return {"statusCode":200, "message": "success"}
        else:
            return {"statusCode":400, "message": "failed"}
    else:
        return {"statusCode":400, "message": msg}

@app.route('/profile')
def profile():
    if 'loggedin' in session:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM accounts WHERE id = %s', (session['id'],))
        account = cursor.fetchone()
        return {"statusCode":200, "message": "success"}
    else:
        return {"statusCode":400, "message": "failed"}

@app.route('/data', methods=["POST"])
def data():
    userdata = request.json
    if userdata['image_name'] != '':
        #s3.download_file(s3_bucket_name, data['image_name'], "data/"+data['image_name'])
        #path_to_image = "data/"+data['image_name']
        #imageData = pytesseract.image_to_string(Image.open(path_to_image))
        #os.remove(path_to_image)
        response = textract.analyze_id(
            DocumentPages=[
                {
                    "S3Object": {
                        "Bucket": s3_bucket_name,
                        "Name": userdata['image_name']
                    }
                },
            ]
        )
        return_back_response = {}
        for data in response['IdentityDocuments']:
            for idf in data['IdentityDocumentFields']:
                if 'first_name' in userdata and 'last_name' in userdata and 'id_number' in userdata and 'date_of_birth' in userdata:
                    if (idf['Type']['Text'] == 'FIRST_NAME' and idf['ValueDetection']['Text'] == userdata['first_name'].upper()):
                        return_back_response['first_name'] = idf['ValueDetection']['Text']
                    elif idf['Type']['Text'] == 'LAST_NAME' and idf['ValueDetection']['Text'] == userdata['last_name'].upper():
                        return_back_response['last_name'] = idf['ValueDetection']['Text']
                    elif idf['Type']['Text'] == 'MIDDLE_NAME':
                        if idf['ValueDetection']['Text'] == userdata['middle_name'].upper() or idf['ValueDetection']['Text'] == 'UNKNOWN':
                            return_back_response['middle_name'] = idf['ValueDetection']['Text']
                    elif idf['Type']['Text'] == 'DOCUMENT_NUMBER':
                        if idf['ValueDetection']['Text'] == userdata['id_number'] or idf['ValueDetection']['Text'] == 'UNKNOWN':
                            return_back_response['id_number'] = idf['ValueDetection']['Text']
                    elif idf['Type']['Text'] == 'DATE_OF_BIRTH' and idf['ValueDetection']['Text'] == userdata['date_of_birth']:
                        return_back_response['date_of_birth'] = idf['ValueDetection']['Text']
                    else:
                        pass
                else:
                    return {"statusCode": 400, "message": "Required details are not passed"}

        if 'first_name' in return_back_response and 'date_of_birth' in return_back_response and 'last_name' in return_back_response and 'id_number' in return_back_response:
            verified_data=len(return_back_response)
            return {"statusCode":200, "message": "Successfully validated", "details": return_back_response, "verified_data_number":verified_data}
        else:
            verified_data=len(return_back_response)
            return {"statusCode": 300, "message": "Data missmatch", "details": return_back_response, "verified_data_number":verified_data}
    else:
        return {"statusCode":400, "message": "Empty data received"}

if __name__ == "__main__":
    app.run("0.0.0.0", port)
