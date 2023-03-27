from flask import Flask, request, session, request, jsonify
from flask_mysqldb import MySQL
import MySQLdb.cursors
import re
import boto3
from os import environ
from flask_cors import CORS
from dotenv import load_dotenv
from dateutil.parser import parse

load_dotenv()
region = environ.get('AWS_REGION')
s3_bucket_name = environ.get('S3_BUCKET_NAME')
db_host = environ.get('MYSQL_HOST')
db_username = environ.get('MYSQL_USERNAME')
db_password = environ.get('MYSQL_PASSWORD')
db_name = environ.get('MYSQL_DB_NAME')
app_secret_key = environ.get('APP_SECRET_KEY')
port = environ.get('APP_PORT')

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
    return jsonify(statusCode=200, statusMessage=data)

@app.route('/home')
def home():
    if 'loggedin' in session:
        username = session['username']
        message = 'success'
        return jsonify(statusCode=200, statusMessage=message, userName=username)
    else:
        message = 'failed'
        return jsonify(statusCode=400, statusMessage=message)

@app.route('/logout')
def logout():
    session.pop('loggedin', None)
    session.pop('id', None)
    message = 'success'
    return jsonify(statusCode=200, statusMessage=message)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST' and 'username' in request.json and 'password' in request.json and 'email' in request.json:
        username = request.json['username']
        password = request.json['password']
        email = request.json['email']
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM accounts WHERE username = %s', (username,))
        account = cursor.fetchone()
        if account:
            message = 'already exists'
        elif not re.match(r'[^@]+@[^@]+\.[^@]+', email):
            message = 'invalid email'
        elif not re.match(r'[A-Za-z0-9]+', username):
            message = 'invalid username'
        elif not re.match(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$', password):
            message = 'invalid password'
        elif not username or not password or not email:
            message = 'invalid input'
        else:
            cursor.execute('INSERT INTO accounts VALUES (NULL, %s, %s, %s)', (username, password, email,))
            mysql.connection.commit()
            message = 'success'
    elif request.method == 'POST':
        message = 'invalid request'
    return jsonify(statusCode=200, statusMessage=message)

@app.route('/login', methods=['GET', 'POST'])
def login():
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
            message = 'success'
            return jsonify(statusCode=200, statusMessage=message)
        else:
            message = 'incorrect'
            return jsonify(statusCode=300, statusMessage=message)
    else:
        message = 'invalid request'
        return jsonify(statusCode=400, statusMessage=message)

@app.route('/profile')
def profile():
    if 'loggedin' in session:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM accounts WHERE id = %s', (session['id'],))
        account = cursor.fetchone()
        message = 'success'
        return jsonify(statusCode=200, statusMessage=message, accountId=account)
    else:
        message = 'failed'
        return jsonify(statusCode=400, statusMessage=message)

@app.route('/data', methods=["POST"])
def data():
    userdata = request.json
    if 'image_name' in userdata and 'first_name' in userdata and 'middle_name' in userdata and 'last_name' in userdata and 'id_number' in userdata and 'date_of_birth' in userdata:
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
                elif idf['Type']['Text'] == 'DATE_OF_BIRTH' and parse(idf['ValueDetection']['Text']) == parse(userdata['date_of_birth']):
                    return_back_response['date_of_birth'] = idf['ValueDetection']['Text']
                else:
                    pass

        if 'first_name' in return_back_response and 'date_of_birth' in return_back_response and 'last_name' in return_back_response and 'id_number' in return_back_response:
            verified_data=len(return_back_response)
            message = 'successfully validated'
            return jsonify(statusCode=200, statusMessage=message, details=return_back_response, verified_data_number=verified_data)
        else:
            verified_data=len(return_back_response)
            message = 'data missmatch'
            return jsonify(statusCode=200, statusMessage=message, details=return_back_response, verified_data_number=verified_data)
    else:
        message = 'invalid request'
        return jsonify(statusCode=400, statusMessage=message)


if __name__ == "__main__":
    app.run("0.0.0.0", port)
