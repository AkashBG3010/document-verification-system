import React from 'react';
import '../../App.css';
import './services.css'
import './Services'
import {upload, fetchData} from './functions'

var firstName, lastName, idNumber, birthDate;
var userInputData = {};

export default function Services() {

  const useButtoncliked = async () => {
    firstName=document.querySelector("#firstName").value;
    if (firstName === "") {
      alert("Firstname must be filled out");
      return false;
    }
    lastName=document.querySelector("#lastName").value;
    if (lastName === "") {
      alert("Lastname must be filled out");
      return false;
    }
    idNumber=document.querySelector("#idNumber").value;
    if (idNumber === "") {
      alert("Id Number must be filled out");
      return false;
    }
    birthDate=document.querySelector("#birthDate").value;
    if (birthDate === "") {
      alert("Birth Date must be filled out");
      return false;
    }
    const [year, month, day] =  birthDate.split('-')
    const DOB = `${year}/${month}/${day}`;
    userInputData = { 
      first_name: firstName,
      last_name: lastName,
      middle_name: "",
      id_number: idNumber,
      date_of_birth: DOB,
    };
    try {
      const output = await fetchData(userInputData)
      if(output.statusCode === 200 && output.statusMessage === "successfully validated")
          {
            alert(`Verification Successful!\n 
              Data verified: ${output.verified_data_number}/5\n
              Verified Data Details: ${JSON.stringify(output.details)}`)
            document.getElementById("firstName").value="";
            document.getElementById("lastName").value="";
            document.getElementById("birthDate").value="";
            document.getElementById("idNumber").value="";
            document.getElementById("myFile").value="";
          }
      else if(output.statusCode === 200 && output.statusMessage === "data missmatch")
          {
            alert(`Verification failed!\n 
              Data verified: ${output.verified_data_number}/5\n
              Verified Data Details: ${JSON.stringify(output.details)}`)
            document.getElementById("firstName").value="";
            document.getElementById("lastName").value="";
            document.getElementById("birthDate").value="";
            document.getElementById("idNumber").value="";
            document.getElementById("myFile").value="";
          }
      else
          {
            alert("Invalid Request")
            document.getElementById("firstName").value="";
            document.getElementById("lastName").value="";
            document.getElementById("birthDate").value="";
            document.getElementById("idNumber").value="";
            document.getElementById("myFile").value="";
          }
    }
    catch (error) {
      console.error(error);
      alert(`Something bad happened!\n
        error:${error}`)
      document.getElementById("firstName").value="";
      document.getElementById("lastName").value="";
      document.getElementById("birthDate").value="";
      document.getElementById("idNumber").value="";
      document.getElementById("myFile").value="";
    }
  }

  return <div className='services'>
  <div className="Servicebox">
    <h1 className='boxH1'>VALIDATE</h1>
      <div className="name">
        <input type="text" name="" placeholder="First Name" id= "firstName"/>
        <input type="text" name="" placeholder="Last Name" id= "lastName"/>
        <input type='date' name="" placeholder='BirthDate' id= "birthDate" className= "birthDate"/>
      </div>
      <div className="custom-select">
        <select className='serviceSelect'>
          <option className="customOption" value="1" checked>Aadhar Card</option>
          <option className="customOption" value="2">PAN Card</option>
          <option className="customOption" value="3">Driving Licence</option>
        </select>
        <input className='serviceSelect' type="number" name="" placeholder="ID Namber" id="idNumber"/>
        <select className='serviceSelect'>
          <option className="customOption" value="1">Male</option>
          <option className="customOption" checked value="2">Female</option>
          <option className="customOption" value="3">Others</option>
        </select>
      </div>
      <div className='FileSubmit'>
        <input type="file" id="myFile" onChange={upload} name="filename" accept="image/png, image/jpeg, image/jpg"/>
      </div>
      <div className='Validate'>
        <button onClick={useButtoncliked} id="validate" className='btnLogin'>Validate</button>
      </div>
    </div>
  </div>;
}
