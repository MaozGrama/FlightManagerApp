import React, { useState, useContext, useReducer } from 'react';
import { AuthContext } from "../authentication/AuthContext";
import Cookies from 'js-cookie';
import './AddAdmin.css';


function AddAdmin() {

  function formReducer(state, action) {
    switch (action.type) {
      case 'SET_USERNAME':
        return { ...state, username: action.payload };
      case 'SET_EMAIL':
        return { ...state, email: action.payload };
      case 'SET_NEW_PASSWORD':
        return { ...state, password1: action.payload };
      case 'SET_CONFIRM_PASSWORD':
        return { ...state, password2: action.payload };
      case 'SET_FIRST_NAME':
        return { ...state, first_name: action.payload };
      case 'SET_LAST_NAME':
        return { ...state, last_name: action.payload };
      default:
        throw new Error(`Unhandled action type: ${action.type}`);
    }
  }

  const { user, payloadData } = useContext(AuthContext);
  

  const [state, dispatch] = useReducer(formReducer, {
    username: '',
    email: '',
    password1: '',
    password2: '',
    first_name: '',
    last_name: '',

  });

  const [errors, setErrors] = useState('');
  const [responseMsg, setResponseMsg] = useState('');


  const handleAddAdmin = (event) => {
    event.preventDefault();
    setResponseMsg('');
    setErrors({});
    if(user && payloadData && String(payloadData.roles) === 'admin'){
    fetch(`http://localhost:8000/api/admins/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Cookies.get('token')}`,
      },
      body: JSON.stringify({
        username: state.username,
        email: state.email,
        password1: state.password1,
        password2: state.password2,
        first_name: state.first_name,
        last_name: state.last_name,
       })
    })

    .then(response => {
      if (response.status === 400) {
        
        return response.json().then(data => {
          console.log(data);
          if (data && (data.non_field_errors || data.username || data.email || data.first_name || data.last_name || data.password1 || data.password2)) {
            setErrors(data);
            console.log("Errors exist");
            console.log(data);
          }
        });
      } else if (response.status === 201) {
        setErrors({});
        
        setResponseMsg("Admin added successfully");
        setTimeout(() => {
          setResponseMsg("");
          window.location.href = '/';
        }, 3000);
      }})
      .catch(error => {
        console.error(error);
      })};}

  return (
    <div>
{Object.keys(errors).length > 0 ? (
  <ul>
    {Object.keys(errors).map((key) => (
      <p key={key}>
        <span id='erroraddadmin'>{errors[key]}</span> 
      </p>
    ))}
  </ul>
) : (
  <>
    <p id='addadminsuccess'>{responseMsg}</p>
  </>
)}

    <form id='addadminaddform' onSubmit={(e) => handleAddAdmin(e)}>
      <label id='adminfield' htmlFor="username"></label>
      <input id='inputfieldadmin' placeholder='Username' type="text" name="AIRLINE" defaultValue={state.username} onChange={(e) => dispatch({ type: 'SET_USERNAME', payload: e.target.value })} required/>

      <label id='adminfield' htmlFor='email'></label>
      <input id='inputfieldadmin' placeholder='Email'  type='text'  name="AIRLINE" defaultValue={state.email} onChange={(e) => dispatch({ type: 'SET_EMAIL', payload: e.target.value })} required/>
      
      <label id='adminfield' htmlFor='new_password'></label>
      <input id='inputfieldadmin' placeholder='Password' type='password'  name='new_password' defaultValue={state.password1} onChange={(e) => dispatch({ type: 'SET_NEW_PASSWORD', payload: e.target.value })}/>

      <label id='adminfield' htmlFor='confirm_password'></label>
      <input id='inputfieldadmin' placeholder='Confirm password' type='password' name='confirm_password' defaultValue={state.password2} onChange={(e) => dispatch({ type: 'SET_CONFIRM_PASSWORD', payload: e.target.value })}/>

      <label id='adminfield' htmlFor='name'></label>
      <input id='inputfieldadmin' placeholder='First name' type='text'  name='first_name' defaultValue={state.first_name} onChange={(e) => dispatch({ type: 'SET_FIRST_NAME', payload: e.target.value })} required/>  
     
      <label id='adminfield' htmlFor='name'></label>
      <input id='inputfieldadmin' placeholder='Last name' type='text'  name='last_name' defaultValue={state.last_name} onChange={(e) => dispatch({ type: 'SET_LAST_NAME', payload: e.target.value })} required/>  

      <label id='adminfield' htmlFor='name'></label>
      <input id='createadminbutton' type='submit' name='Update Profile' value='Create profile'/>
    </form>
    
 
</div> 
       
  );
}

export default AddAdmin;