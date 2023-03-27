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
    if (userName === "") {
      alert("Username must be filled out");
      return false;
    }
    if (password === "") {
      alert("Password must be filled out");
      return false;
    }
    userLoginData = { 
      username: userName,
      password: password
    };
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
      <Link  onClick={LoginBtnClicked} className='btnLogin' to="#">Sign In </Link>
      <Link  onClick={RegisterBtnClicked} className='btnRedirectSignup' to="#">Not registered? Sign Up here!</Link>
    </form>
  </div>;
}
