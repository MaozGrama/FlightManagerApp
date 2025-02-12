import React, { useState, useContext, useReducer } from 'react';
import { AuthContext } from "../authentication/AuthContext";
import Cookies from 'js-cookie';
import GetCountries from '../countries/GetCountries';
import './AddAirline.css';

function AddAirline() {
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
      case 'SET_NAME':
        return { ...state, name: action.payload };
      case 'SET_COUNTRY':
        return { ...state, country_id: action.payload };
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
    name: '',
    country_id: '',
  });

  const [errors, setErrors] = useState({});
  const [responseMsg, setResponseMsg] = useState('');

  const handleSetCountry = (countryId) => {
    dispatch({ type: 'SET_COUNTRY', payload: countryId });
  };

  const handleAddAirline = (event) => {
    event.preventDefault();
    setResponseMsg('');
    setErrors({});

    if (user && payloadData && String(payloadData.roles) === 'admin') {
      if (state.password1 !== state.password2) {
        setErrors({ password2: 'Passwords do not match' });
        return;
      }

      fetch(`http://localhost:8000/api/airlines/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
        body: JSON.stringify({
          username: state.username,
          email: state.email,
          password: state.password1,
          name: state.name,
          country_id: state.country_id,
        }),
      })
        .then((response) => {
          if (response.status === 400) {
            return response.json().then((data) => {
              setErrors(data);
            });
          } else if (response.status === 201) {
            setErrors({});
            setResponseMsg('Airline added successfully');
            setTimeout(() => {
              setResponseMsg('');
              window.location.href = '/';
            }, 3000);
          }
        })
        .catch((error) => {
          console.error(error);
          setErrors({ general: 'An unexpected error occurred' });
        });
    }
  };

  return (
    <div>
      {Object.keys(errors).length > 0 ? (
        <ul>
          {Object.keys(errors).map((key) => (
            <p key={key}>
              <span id="erroraddairline">{errors[key]}</span>
            </p>
          ))}
        </ul>
      ) : (
        <p id="addairlinesuccess">{responseMsg}</p>
      )}

      <form id="adminaddairlineform" onSubmit={handleAddAirline}>
        <input
          placeholder="Username"
          id="inputfieldairline"
          type="text"
          value={state.username}
          onChange={(e) => dispatch({ type: 'SET_USERNAME', payload: e.target.value })}
          required
        />
        <input
          placeholder="Email"
          id="inputfieldairline"
          type="email"
          value={state.email}
          onChange={(e) => dispatch({ type: 'SET_EMAIL', payload: e.target.value })}
          required
        />
        <input
          placeholder="Password"
          type="password"
          id="inputfieldairline"
          value={state.password1}
          onChange={(e) => dispatch({ type: 'SET_NEW_PASSWORD', payload: e.target.value })}
          required
        />
        <input
          placeholder="Confirm Password"
          type="password"
          id="inputfieldairline"
          value={state.password2}
          onChange={(e) => dispatch({ type: 'SET_CONFIRM_PASSWORD', payload: e.target.value })}
          required
        />
        <input
          placeholder="Name"
          type="text"
          id="inputfieldairline"
          value={state.name}
          onChange={(e) => dispatch({ type: 'SET_NAME', payload: e.target.value })}
          required
        />
        <GetCountries id="country1" onCountrySelect={handleSetCountry} selectedCountryId={state.country_id} />
        <input id="createairlinebutton" type="submit" value="Create Airline" />
      </form>
    </div>
  );
}

export default AddAirline;
