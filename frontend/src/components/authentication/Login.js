import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // Fetch CSRF token on component mount
  useEffect(() => {
    async function fetchCsrfToken() {
      try {
        const response = await fetch('http://localhost:8000/api/csrf/', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setCsrfToken(data.csrfToken);
        } else {
          console.error('Failed to fetch CSRF token.');
          setErrorMessage('Failed to fetch CSRF token. Please try again later.');
        }
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
        setErrorMessage('An error occurred while fetching the CSRF token.');
      }
    }

    fetchCsrfToken();
  }, []);

  // Handle form submission
  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');
  
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both username and password.');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({ username, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log('Login successful:', data);
  
        // Store token using the correct key from response
        localStorage.setItem('access', data.token);  // Changed from data.access to data.token
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('username', data.username);
  
        // Notify parent component
        if (typeof onLogin === 'function') onLogin();
  
        // Navigate based on role
        switch (data.role) {
          case 'Customer':
            navigate('/customer-dashboard');
            break;
          case 'Airline':
            navigate('/airline-dashboard');
            break;
          case 'Admin':
            navigate('/admin-dashboard');
            break;
          default:
            setErrorMessage('Role not recognized. Please contact support.');
        }
      } else {
        setErrorMessage(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    }
  }

  return (
    <div>
      <form id="logindiv" onSubmit={handleSubmit}>
        <label id="username" htmlFor="username">Username&nbsp;</label>
        <input
          type="text"
          id="box"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <br />
        <label id="password" htmlFor="password">Password&nbsp;</label>
        <input
          type="password"
          id="box"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <input id="login" type="submit" value="Login" />
      </form>
    </div>
  );
}