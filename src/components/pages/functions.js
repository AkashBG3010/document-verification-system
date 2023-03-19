import { Upload } from "@aws-sdk/lib-storage";
import { S3Client} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';
import * as AWS from "@aws-sdk/client-textract";

var textract = new AWS.Textract({apiVersion: '2018-06-27'});
var firstName, lastName, idNumber, birthDate, fileName
var userData = new Object();
var s3BucketName = process.env.REACT_APP_S3_BUCKET_NAME
var awsRegion = process.env.REACT_APP_AWS_REGION
var credentials = {accessKeyId:process.env.REACT_APP_AWS_ACCESS_KEY_ID, secretAccessKey:process.env.REACT_APP_AWS_SECRET_ACCESS_KEY}

export const upload = (file)=>{
  fileName = uuidv4()+"-"+file.target.files[0].name;
  var file = file.target.files[0];
  if (file.size > 10e6) {
    window.alert("Please upload a file smaller than 10 MB");
    return false;
  }
  const target = {Bucket: s3BucketName, Key:fileName, Body:file}
  try {
    const parallelUploads3 = new Upload({
      client: new S3Client({region:awsRegion, credentials:credentials}),
      params: target,
      leavePartsOnError: false,
    });
    parallelUploads3.on("httpUploadProgress", (progress) => {
      console.log(progress);
    });
    parallelUploads3.done();
    console.log("file successfully uploaded to s3 with name: "+fileName);
  } 
  catch (e) {
    console.log(e);
  }
}

export const buttoncliked = () => {
    firstName=document.querySelector("#firstName").value
    lastName=document.querySelector("#lastName").value
    idNumber=document.querySelector("#idNumber").value
    birthDate=document.querySelector("#birthDate").value
    userData = { 
      "firstName": firstName,
      "lastName": lastName,
      "idNumber": idNumber,
      "birthDate": birthDate,
    };
    console.log(userData)
    var params = {
          DocumentPages:[
            { 
              S3Object:{Bucket:s3BucketName, Name:fileName}
            }
          ]
        }; 
    try {
      textract.AnalyzeIDCommand(params, credentials, function(err, data) {
        if (err) 
          console.log(err, err.stack);
        else
          console.log(data);
      });
    }
    catch (e) {
      console.log(e);
    }  
}
