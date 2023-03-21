import { Upload } from "@aws-sdk/lib-storage";
import { S3Client} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';
import { TextractClient, AnalyzeIDCommand } from "@aws-sdk/client-textract";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import axios from 'axios';
import { SignatureV4 } from '@aws-sdk/signature-v4';
import { Sha256 } from '@aws-crypto/sha256-js';

var firstName, lastName, idNumber, birthDate, fileName;
var userInputData = new Object();
var s3BucketName = process.env.REACT_APP_S3_BUCKET_NAME;
var awsRegion = process.env.REACT_APP_AWS_REGION;
var awsLambda = process.env.REACT_APP_LAMBDA_FUNCTION_NAME;
var credentials = {
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID, 
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
};

export const upload = (file)=>{
  fileName = uuidv4()+"-"+file.target.files[0].name;
  var file = file.target.files[0];
  if (file.size > 10e6) {
    window.alert("Please upload a file smaller than 10 MB");
    return false;
  }
  const target = {Bucket: s3BucketName, Key:fileName, Body:file};
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
    console.log(e);
  }
}

export const buttoncliked = () => {
    firstName=document.querySelector("#firstName").value;
    lastName=document.querySelector("#lastName").value;
    idNumber=document.querySelector("#idNumber").value;
    birthDate=document.querySelector("#birthDate").value;
    userInputData = { 
      "FIRST_NAME": firstName,
      "LAST_NAME": lastName,
      "MIDDLE_NAME": "",
      "DOCUMENT_NUMBER": idNumber,
      "DATE_OF_BIRTH": birthDate,
      "UPLOADED_FILE": fileName
    };
    console.log(userInputData);
    console.log("Sending request to AWS Lambda...");
    var client = new LambdaClient({region:awsRegion, credentials:credentials});
    var params = {
      FunctionName:awsLambda,
      Payload: [
        {
          "s3_busket_name": s3BucketName,
          "image_name": fileName,
          "FIRST_NAME": firstName,
          "LAST_NAME": lastName,
          "MIDDLE_NAME": "",
          "DOCUMENT_NUMBER": idNumber,
          "DATE_OF_BIRTH": birthDate,
        }
      ],
    };
    const command = new InvokeCommand(params);
    const response = client.send(command);
    console.log(response);
    // console.log("Sending request to AWS Textract...");
    // const client = new TextractClient({region:awsRegion, credentials:credentials});
    // var params = {
    //   DocumentPages:[{
    //     "S3Object": {
    //       "Bucket": s3BucketName,
    //       "Name": fileName,
    //     }
    //   }]
    // };
    // const command = new AnalyzeIDCommand(params);
    // try {
    //   const textractResponse = client.send(command)
    //   console.log(textractResponse)
    // }
    // catch (e) {
    //   console.log(e);
    // }
}
