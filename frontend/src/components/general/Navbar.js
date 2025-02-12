import React, { useState, useContext } from "react";
import './Navbar.css';
import { Link } from "react-router-dom";
import { AuthContext } from "../authentication/AuthContext";
import Cookies from "js-cookie";
import Login from "../authentication/Login";
import SignUp from "../authentication/SignUp";
import FlightSearchForm from "../flights/FlightSearchForm";
import { Home } from "./Home";
import CustomerProfile from "../customers/CustomerDashboard";
import { MyFlights } from "../flights/MyFlights";
import AirlineProfile from "../airlines/AirlineProfile";
import { AddFlightForm } from "../flights/AddFlightForm";
import MyTickets from "../customers/MyTickets";
import { AllCustomers } from "../admins/AllCustomers";
import { AllAirlines } from "../admins/AllAirlines";
import { AllAdmins } from "../admins/AllAdmins";

const Navbar = () => {
    const [activeComponent, setActiveComponent] = useState(null);
    const [activeComponent2, setActiveComponent2] = useState(null);
    const { user, logout, payloadData, setRealodUpdatedData } = useContext(AuthContext);
    const [flightAdded, setFlightAdded] = useState(false);
    const [flightUpdated, setFlightUpdated] = useState(false);

    const handleLogout = () => {
        logout();
        Cookies.remove('token');
        setActiveComponent(null);
        setRealodUpdatedData(true); // Trigger data reload after logout
    };

    const handleNavigation = (component, event, resetDropdown = true) => {
        event.preventDefault();
        setActiveComponent(component);
        if (resetDropdown) setActiveComponent2(null);
    };

    const handleAddFlightSuccess = () => {
        setFlightAdded(true);
        setRealodUpdatedData(true); // Trigger data reload after adding a flight
    };

    const handleFlightUpdate = (updated) => {
        setFlightUpdated(updated);
        setRealodUpdatedData(true); // Trigger data reload after updating a flight
    };

    return (
        <div>
            <nav>
                <ul>
                    <div id="mainP">
                        <span>
                            <Link id="main" to="/" onClick={(e) => handleNavigation("/", e)}>Home</Link> &nbsp;&nbsp;&nbsp;&nbsp;
                            <Link id="main" to="/flights" onClick={(e) => handleNavigation("flights", e)}>Flights</Link>
                            {user && (
                                <p id="logoutP">
                                    <Link id="Logout" to="/" onClick={handleLogout}>
                                        Logout
                                    </Link>
                                </p>
                            )}
                        </span>

                        {!user && (
                            <>
                                <p id="loginP">
                                    <Link id="Login" to="/login" onClick={(e) => handleNavigation("login", e)}>
                                        Login
                                    </Link>
                                </p>
                                <p id="signupP">
                                    <Link id="Signup" to="/signup" onClick={(e) => handleNavigation("signup", e)}>
                                        Signup
                                    </Link>
                                </p>
                            </>
                        )}

                        {user && payloadData && String(payloadData.roles) === "customer" && (
                            <div>
                                <p id="profileP">
                                    <Link id="profile" to="/customer" onClick={(e) => handleNavigation("", e, false)}>
                                        {payloadData.username}
                                    </Link>
                                </p>
                                <div className="dropdown">
                                    <div id="dropdown" className="dropdown-content">
                                        <Link id="drop" to="/customerprofile" onClick={(e) => handleNavigation("customerprofile", e)}>Profile</Link>
                                        <Link id="drop" to="/tickets" onClick={(e) => handleNavigation("tickets", e)}>Tickets</Link>
                                    </div>
                                </div>
                            </div>
                        )}

                        {user && payloadData && String(payloadData.roles) === "admin" && (
                            <div>
                                <p id="profileP">
                                    <Link id="profile" to="/customer" onClick={(e) => handleNavigation("", e, false)}>
                                        {payloadData.username}
                                    </Link>
                                </p>
                                <div className="dropdown">
                                    <div id="dropdown" className="dropdown-content">
                                        <Link id="drop" to="/alladmins" onClick={(e) => handleNavigation("alladmins", e)}>Admins</Link>
                                        <Link id="drop" to="/allairlines" onClick={(e) => handleNavigation("allairlines", e)}>Airlines</Link>
                                        <Link id="drop" to="/allcustomers" onClick={(e) => handleNavigation("allcustomers", e)}>Customers</Link>
                                    </div>
                                </div>
                            </div>
                        )}

                        {user && payloadData && String(payloadData.roles) === "airline" && (
                            <div>
                                <p id="profileP">
                                    <Link id="profile" to="/customer" onClick={(e) => handleNavigation("", e, false)}>
                                        {payloadData.username}
                                    </Link>
                                </p>
                                <div className="dropdown">
                                    <div id="dropdown" className="dropdown-content">
                                        <Link id="drop" to="/airlineprofile" onClick={(e) => handleNavigation("airlineprofile", e)}>Profile</Link>
                                        <Link id="drop" to="/myflights" onClick={(e) => handleNavigation("myflights", e)}>MyFlights</Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ul>
            </nav>
            <br />
            {activeComponent2 === "addflightform" && (
                <AddFlightForm 
                    onSuccess={handleAddFlightSuccess} 
                />
            )}
            {activeComponent === "flights" && <FlightSearchForm />}
            {activeComponent === "myflights" && (
                <MyFlights
                    clicked="clicked"
                    flightAdded={flightAdded}
                    onUpdate={handleFlightUpdate}
                    flightUpdated={flightUpdated}
                />
            )}
            {activeComponent === "tickets" && <MyTickets clicked="clicked" />}
            {activeComponent === "signup" && <SignUp />}
            {activeComponent === "/" && <Home />}
            {activeComponent === "login" && <Login handleLoginSuccess={() => setActiveComponent(null)} />}
            {activeComponent === "customerprofile" && <CustomerProfile />}
            {activeComponent === "airlineprofile" && <AirlineProfile />}
            {activeComponent === "allcustomers" && <AllCustomers />}
            {activeComponent === "allairlines" && <AllAirlines />}
            {activeComponent === "alladmins" && <AllAdmins />}
        </div>
    );
};

export default Navbar;
