import React from 'react';
import '../../App.css';
import './signIn.css';
import { Link } from 'react-router-dom';
import './Services';
import {LoginData} from './functions';

var userName, password;
var userLoginData = {};

export default function signIn() {
  const RegisterBtnClicked = async () => {
    window.location.href = '/signup'
  };

  const LoginBtnClicked = async () => {
    
    userName=document.querySelector("#userName").value;
    password=document.querySelector("#password").value;
    userLoginData = { 
      username: userName,
      password: password
    };
    console.log(`Login data displayed ${userLoginData}`)
    try{
      const LoginOutput = await LoginData(userLoginData)
      if(LoginOutput.statusCode === 200 && LoginOutput.statusMessage === "success")
          {
            alert("Login Succeeded")
            window.location.href = '/services'
          }
      else if(LoginOutput.statusCode === 300 && LoginOutput.statusMessage === "incorrect")
          {
            alert("Login Failed! Please check the Username and Password entered")
            document.getElementById("password").value="";
            document.getElementById("userName").value="";
          }
      else
          {
            alert("Invalid Request")
            document.getElementById("password").value="";
            document.getElementById("userName").value="";
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
      <h1 className='boxH1'>WELCOME BACK!</h1>
      <input type="text" name="" placeholder="Username" id="userName" />
      <input type="password" name=""  placeholder="Password" id="password"/>
      <Link  onClick={LoginBtnClicked} className='btnLogin'>Sign In </Link>
      <Link  onClick={RegisterBtnClicked} className='btnRedirectSignup'>Not registered? Sign Up here!</Link>
    </form>
  </div>;
}
