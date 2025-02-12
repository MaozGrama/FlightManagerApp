import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import SignUp from './components/authentication/SignUp';
import FlightSearchForm from './components/flights/FlightSearchForm';
import Navbar from "./components/general/Navbar";
import CustomerDashboard from './components/customers/CustomerDashboard';
import AdminDashboard from './components/admins/AdminDashboard'; // AdminDashboard import
import AirlineDashboard from './components/airlines/AirlineDashboard'; // AirlineDashboard import
import Login from './components/authentication/Login';
import General from './components/general/General';
import './App.css';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('access');
    setIsLoggedIn(!!token);
    setIsLoading(false);
    console.log('User logged in state:', !!token);
  }, []);

  const handleLogin = () => {
    console.log('handleLogin triggered');
    setIsLoggedIn(true);
    localStorage.setItem('access', 'your-token');
  };

  const handleLogout = () => {
    console.log('handleLogout triggered');
    localStorage.removeItem('access');
    setIsLoggedIn(false);
  };

  return (
    <div className="App">
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          {(location.pathname === "/" || location.pathname === "/login" || location.pathname === "/signup") && (
            <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
          )}

          <Routes>
            <Route path="/" element={<General />} />

            {!isLoggedIn ? (
              <>
                <Route path="/signup" element={<SignUp />} />
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
              </>
            ) : (
              <Route path="*" element={<Navigate to="/customer-dashboard" replace />} />
            )}

            <Route path="/flights" element={<FlightSearchForm />} />

            <Route
              path="/customer-dashboard"
              element={isLoggedIn ? (
                <CustomerDashboard onLogout={handleLogout} />
              ) : (
                <Navigate to="/" replace />
              )}
            />
            <Route
              path="/admin-dashboard"
              element={isLoggedIn ? (
                <AdminDashboard onLogout={handleLogout} />
              ) : (
                <Navigate to="/" replace />
              )}
            />
            <Route
              path="/airline-dashboard"
              element={isLoggedIn ? (
                <AirlineDashboard onLogout={handleLogout} />
              ) : (
                <Navigate to="/" replace />
              )}
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </>
      )}
    </div>
  );
}

export default App;
