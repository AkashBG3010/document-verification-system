import { Upload } from "@aws-sdk/lib-storage";
import { S3Client} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

var fileName;
var s3BucketName = process.env.REACT_APP_S3_BUCKET_NAME;
var awsRegion = process.env.REACT_APP_AWS_REGION;
var backend_host = process.env.REACT_APP_BACKEND_HOST_NAME;
var credentials = {
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID, 
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
};

export const upload = (file)=>{
  fileName = uuidv4()+"-"+file.target.files[0].name;
  var uploadedFile = file.target.files[0];
  if (uploadedFile.size > 10e6) {
    window.alert("Please upload a file smaller than 10 MB");
    return false;
  }
  const target = {Bucket: s3BucketName, Key:fileName, Body:uploadedFile};
  try {
    const Uploads3 = new Upload({
      client: new S3Client({region:awsRegion, credentials:credentials}),
      params: target,
      leavePartsOnError: false,
    });
    Uploads3.on("httpUploadProgress", (progress) => {
      console.log(progress);
    });
    Uploads3.done();
  } 
  catch (e) {
    alert("please retry again!");
    console.log(e);
  }
}

export const fetchData = async (formData) => {
  const userData = {...formData, image_name: fileName}
  console.log(`calling backend with data: ${userData}`);
  const response = await axios.post(`http://${backend_host}/data`, userData, {headers: "Content-Type: application/json"})
  return response.data
  }

export const LoginData = async (LoginFormData) => {
    const userData = LoginFormData
    console.log(`calling backend with Login data: ${userData}`);
    const response = await axios.post(`http://${backend_host}/login`, userData, {headers: "Content-Type: application/json"})
    return response.data
  }

export const RegisterData = async (RegisterFormData) => {
  const newUserData = RegisterFormData
  console.log(`calling backend with New User data: ${newUserData}`);
  const response = await axios.post(`http://${backend_host}/register`, newUserData, {headers: "Content-Type: application/json"})
  return response.data
}
