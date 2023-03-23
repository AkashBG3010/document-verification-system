from flask import Flask, request, session, request
from flask_mysqldb import MySQL
import MySQLdb.cursors
import re
import json
import boto3
from pytesseract import pytesseract
from PIL import Image
from os import environ
import os
from dotenv import load_dotenv

load_dotenv()
s3_bucket_name = environ.get('S3_BUCKET_NAME')
db_host = environ.get('MYSQL_HOST')
db_username = environ.get('MYSQL_USERNAME')
db_password = environ.get('MYSQL_PASSWORD')
db_name = environ.get('MYSQL_DB_NAME')
app_secret_key = environ.get('APP_SECRET_KEY')
pytesseract.tesseract_cmd =  r'/usr/bin/tesseract'

app = Flask(__name__)

s3 = boto3.client('s3')
app.config['MYSQL_HOST'] = db_host
app.config['MYSQL_USER'] = db_username
app.config['MYSQL_PASSWORD'] = db_password
app.config['MYSQL_DB'] = db_name
app.secret_key = app_secret_key
mysql = MySQL(app)

@app.route("/")
def healthcheck():
    return "Application is healthy :)"

@app.route('/home')
def home():
    if 'loggedin' in session:
        username = session['username']
        return username
    return '---Home Page---'

@app.route('/logout')
def logout():
   session.pop('loggedin', None)
   session.pop('id', None)
   return 'logout success!'

@app.route('/register', methods=['GET', 'POST'])
def register():
    msg = 'Something went wrong! Please try again'
    if request.method == 'POST' and 'username' in request.json and 'password' in request.json and 'email' in request.json:
        username = request.json['username']
        password = request.json['password']
        email = request.json['email']
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM accounts WHERE username = %s', (username,))
        account = cursor.fetchone()
        if account:
            msg = 'Account already exists!'
        elif not re.match(r'[^@]+@[^@]+\.[^@]+', email):
            msg = 'Invalid email address!'
        elif not re.match(r'[A-Za-z0-9]+', username):
            msg = 'Username must contain only characters and numbers!'
        elif not username or not password or not email:
            msg = 'Please fill out the form!'
        else:
            cursor.execute('INSERT INTO accounts VALUES (NULL, %s, %s, %s)', (username, password, email,))
            mysql.connection.commit()
            msg = 'You have successfully registered!'
    elif request.method == 'POST':
        msg = 'Please fill the form completly!'
    return msg

@app.route('/login', methods=['GET', 'POST'])
def login():
    msg = ''
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
            return 'Logged in successfully!'
        else:
            msg = 'Incorrect username/password!'
    return msg

@app.route('/profile')
def profile():
    if 'loggedin' in session:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM accounts WHERE id = %s', (session['id'],))
        account = cursor.fetchone()
        return account
    return 'login again!'

@app.route('/data', methods=["POST"])
def data():
    data = request.json
    s3.download_file(s3_bucket_name, data['image_name'], "data/"+data['image_name'])
    path_to_image = "data/"+data['image_name']
    response = pytesseract.image_to_string(Image.open(path_to_image))
    os.remove(path_to_image)
    return response
    
if __name__ == "__main__":
    app.run("0.0.0.0", 80)
