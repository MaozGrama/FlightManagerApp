import React, { createContext, useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';
import Cookies from 'js-cookie';

export const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
});

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [payloadData, setPayloadData] = useState(null);
  const [reloadUpdatedData, setRealodUpdatedData] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const storedPayloadData = localStorage.getItem('payload');
    if (storedPayloadData) {
      setPayloadData(JSON.parse(storedPayloadData));
    }
  }, []);

  const storePayloadData = async (payload) => {
    setPayloadData(payload);
    localStorage.setItem('payload', JSON.stringify(payload));
  };


  const login = async (token, payload) => {
    const decodedToken = jwt_decode(token);
    setUser(decodedToken);
    Cookies.set('token', token);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(decodedToken));
    await storePayloadData(payload);
  };

  const logout = () => {
    fetch('http://localhost:8000/api/logout/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Cookies.get('token')}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error logging out');
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('payload')
        setPayloadData(null);
        setUser(null);
        window.location.href = '/';
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, storePayloadData, payloadData, reloadUpdatedData, setRealodUpdatedData}}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
