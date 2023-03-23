from flask import Flask, request
import json
import boto3
from pytesseract import pytesseract
from PIL import Image
from os import environ
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

s3 = boto3.client('s3')
s3_bucket_name = environ.get('S3_BUCKET_NAME')
pytesseract.tesseract_cmd =  r'/usr/bin/tesseract'

@app.route("/")
def hello():
    return "Success!"

@app.route('/data', methods=["POST"])
def data():
    s3.download_file(s3_bucket_name, request.data['image_name'], request.data['image_name'])
    path_to_image = request.data['image_name']
    response = pytesseract.image_to_string(Image.open(path_to_image))
    return json.dumps(response)
    
if __name__ == "__main__":
    app.run("localhost", 80)