import React, { useState, useEffect } from 'react';
import { ToolTip } from '../general/ToolTip';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password1: '',
    password2: '',
    first_name: '',
    last_name: '',
    address: '',
    phone_no: '',
    credit_card_no: '',
  });

  const [validity, setValidity] = useState({});
  const [responseMsg, setResponseMsg] = useState('');
  const [showForm, setShowForm] = useState(true);
  const [csrfToken, setCsrfToken] = useState('');

  const navigate = useNavigate();

  // Fetch CSRF token on component mount
  useEffect(() => {
    fetch('http://localhost:8000/api/csrf/', {
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => {
        setCsrfToken(data.csrfToken);
        console.log('CSRF Token:', data.csrfToken); // Log CSRF token
      })
      .catch((error) => console.error('Error fetching CSRF token:', error));
  }, []);

  // Validate input fields
  const validateField = (name, value) => {
    console.log(`Validating field: ${name} with value: ${value}`); // Log field validation
    let isValid = true;
    switch (name) {
      case 'username':
        isValid = /^[a-zA-Z0-9]{8,20}$/.test(value); // 8-20 alphanumeric characters
        break;
      case 'email':
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); // Basic email validation
        break;
      case 'password1':
        isValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,30}$/.test(value); // 8-30 characters, includes uppercase, lowercase, and number
        break;
      case 'password2':
        isValid = value === formData.password1; // Matches password1
        break;
      case 'phone_no':
        isValid = /^[0-9\\-]+$/.test(value); // Digits and "-" allowed
        break;
      case 'credit_card_no':
        isValid = /^[0-9\\-]{12,20}$/.test(value); // Digits and "-" with 12-20 characters
        break;
      default:
        isValid = value.trim().length >= 3; // At least 3 characters for name/address
    }
    console.log(`Field ${name} is valid: ${isValid}`); // Log validation result
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field changed: ${name} with value: ${value}`); // Log field changes
    setFormData({ ...formData, [name]: value });
    setValidity({ ...validity, [name]: validateField(name, value) });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Form submitted:', formData); // Log form data on submit

    const isValid = Object.values(validity).every((valid) => valid);
    console.log('Form validity:', isValid); // Log form validity check

    if (!isValid) {
      setResponseMsg('Please fix the errors before submitting.');
      console.log('Form invalid, not submitting.'); // Log form invalidation
      return;
    }

    fetch('http://localhost:8000/api/add_customer/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      body: JSON.stringify(formData),
      credentials: 'include',
    })
      .then((response) => {
        console.log('Response received:', response.status); // Log response status
        if (response.status === 400) {
          return response.json().then((data) => {
            setResponseMsg('Validation errors occurred.');
            console.log('Validation errors:', data); // Log validation errors
          });
        } else if (response.status === 201) {
          setResponseMsg('Customer created successfully, redirecting to login...');
          setShowForm(false);
          console.log('Customer created, redirecting to login'); // Log success and redirect
          setTimeout(() => navigate('/api/login'), 3000);
        } else {
          throw new Error('Unexpected server response.');
        }
      })
      .catch((error) => {
        setResponseMsg('An error occurred. Please try again later.');
        console.error('Submit error:', error); // Log submit error
      });
  };

  return (
    <HelmetProvider>
      <div>
        <Helmet>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          />
        </Helmet>

        {responseMsg && <p id="success">{responseMsg}</p>}

        {showForm && (
          <form id="signupform" onSubmit={handleSubmit}>
            {inputFields.map((field) => (
              <InputField
                key={field.name}
                label={field.label}
                name={field.name}
                type={field.type || 'text'}
                value={formData[field.name]}
                onChange={handleChange}
                isValid={validity[field.name]}
                tooltip={field.tooltip}
              />
            ))}
            <input id="create" type="submit" value="Create profile" />
          </form>
        )}
      </div>
    </HelmetProvider>
  );
}

function InputField({ label, name, type = 'text', value, onChange, tooltip, isValid }) {
  return (
    <div className="input-group">
      <input
        placeholder={label}
        id="inputfield"
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required
      />
      <ToolTip text={tooltip}>
        <span id="tooltiplacement" className="material-symbols-outlined">Help</span>
      </ToolTip>
      {isValid === true && <span className="valid-check">✔</span>}
      {isValid === false && <span className="invalid-check">✘</span>}
    </div>
  );
}

const inputFields = [
  { label: 'Username', name: 'username', tooltip: '8-20 alphanumeric characters.' },
  { label: 'Email', name: 'email', type: 'email', tooltip: 'Valid email address.' },
  { label: 'Password', name: 'password1', type: 'password', tooltip: '8-30 characters, with at least one uppercase, lowercase, and number.' },
  { label: 'Confirm Password', name: 'password2', type: 'password', tooltip: 'Must match the password.' },
  { label: 'First Name', name: 'first_name', tooltip: 'At least 3 characters.' },
  { label: 'Last Name', name: 'last_name', tooltip: 'At least 3 characters.' },
  { label: 'Address', name: 'address', tooltip: 'At least 3 characters.' },
  { label: 'Phone Number', name: 'phone_no', tooltip: 'Digits and "-" only.' },
  { label: 'Credit Card', name: 'credit_card_no', tooltip: '12-20 digits or "-" characters.' },
];
