import React from 'react';
import '../../App.css';
import './signIn.css'
import { Link } from 'react-router-dom';
import './Services'
import {LoginData} from './functions'


var userName, password;
var userLoginData = {};

export default function SignUp() {

  const LoginBtnClicked = async () => {
    
    userName=document.querySelector("#userName").value;
    password=document.querySelector("#password").value;
    userLoginData = { 
      username: userName,
      password: password
    };
    console.log(`Login data displayed ${userLoginData}`)
    const LoginOutput = await LoginData(userLoginData)
    if(LoginOutput.statusCode === 200 && LoginOutput.statusMessage === "success")
        {
          alert("Login Succeeded")
        }
    else if(LoginOutput.statusCode === 300 && LoginOutput.statusMessage === "incorrect")
        {
          alert("Login Failed! Please check the Username and Password entered")
        }
    else
        {
          alert("Invalid Request")
        }
  }
  return <div className='sign-up'>
    <form class="box" action="./Services.js">
      <h1 className='boxH1'>VALIDATE</h1>
      <input type="text" name="" placeholder="Username" id="userName" />
      <input type="password" name=""  placeholder="Password" id="password"/>
      {/* <div className='Validate'>
  <button onClick={LoginBtnClicked} to="/services" id="validate" className='btnLogin'>Log In</button>
  </div> */}
      <Link  onClick={LoginBtnClicked} className='btnLogin'>Sign In </Link>
    </form>
  </div>;
  // <div>
  // <button className='btnSignUp'>Not registered? Sign Up here!</button>
  // </div>;
}
