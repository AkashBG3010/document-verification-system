import React from 'react';
import '../../App.css';
import './signUp.css';
import { Link } from 'react-router-dom';
import './SignIn';
import {RegisterData} from './functions';

var userName, password, emailId;
var userRegisterData = {};

export default function signUp() {

  const RegisterBtnClicked = async () => {
    
    userName=document.querySelector("#userName").value;
    password=document.querySelector("#password").value;
    emailId=document.querySelector("#emailId").value;
    userRegisterData = { 
      username: userName,
      password: password,
      email: emailId
    };
    console.log(`New User Data: ${userRegisterData}`)
    try{
      const RegisterOutput = await RegisterData(userRegisterData)
      if(RegisterOutput.statusCode === 200 && RegisterOutput.statusMessage === "success")
          {
            alert("Register Succeeded!\nRedirecting to login...")
            window.location.href = '/signin'
          }
      else if(RegisterOutput.statusCode === 200 && RegisterOutput.statusMessage === "already exists")
          {
            alert("Register Failed! Account already exists")
            document.getElementById("userName").value="";
            document.getElementById("password").value="";
            document.getElementById("emailId").value="";
          }
      else if(RegisterOutput.statusCode === 200 && RegisterOutput.statusMessage === "invalid username")
          {
            alert("Register Failed! Invalid username")
            document.getElementById("userName").value="";
          }
      else if(RegisterOutput.statusCode === 200 && RegisterOutput.statusMessage === "invalid password")
          {
            alert("Register Failed! Invalid password")
            document.getElementById("password").value="";
          }
      else if(RegisterOutput.statusCode === 200 && RegisterOutput.statusMessage === "invalid email")
          {
            alert("Register Failed! Invalid email")
            document.getElementById("emailId").value="";
          }    
      else
          {
            alert("Invalid Request")
            document.getElementById("userName").value="";
            document.getElementById("password").value="";
            document.getElementById("emailId").value="";
          }
      }
      catch (error) {
        console.error("Something bad happened!");
        console.error(error);
        alert(`Something bad happened!\n
          error:${error}`)
      }
  }
  return <div className='signin'>
    <form class="box" action="./Services.js">
      <h1 className='boxH1'>Register Here!</h1>
      <input type="text" name="" placeholder="Username" id="userName" />
      <input type="password" name=""  placeholder="Password" id="password"/>
      <input type="text" name=""  placeholder="Email Id" id="emailId"/>
      <Link  onClick={RegisterBtnClicked} className='btnLogin'>Sign Up</Link>
    </form>
  </div>;
}
