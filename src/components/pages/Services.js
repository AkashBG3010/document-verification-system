import React from 'react';
import '../../App.css';
import './services.css'
import './Services'
import {upload, buttoncliked} from './functions'

export default function Services() {

  return <div className='sign-up'>
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
    <input className='serviceSelect' type="number" name="" placeholder="ID Namber" id="idNumber" minlength="12" maxlength="12"/>
    <select className='serviceGender'>
      <option className="customOption" value="1">Male</option>
      <option className="customOption" checked value="2">Female</option>
      <option className="customOption" value="3">Others</option>
    </select>
  </div>
  <div className='FileSubmit'>
  <input type="file" id="myFile" onChange={upload} name="filename" accept="image/png, image/jpeg, image/jpg" />
  </div>
  <div className='Validate'>
  <button onClick={buttoncliked} id="validate" className='btnLogin'>Validate</button>
  </div>
  </div>
</div>;
}
