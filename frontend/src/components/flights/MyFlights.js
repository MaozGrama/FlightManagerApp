import React, { useState, useContext, useEffect } from 'react'
import { AuthContext } from '../authentication/AuthContext'
import Cookies from 'js-cookie';
import UpdateFlightForm from './UpdateFlightForm';

export const MyFlights = (props) => {
    const [ myflights, setMyFlights ] = useState('');
    const { user , payloadData } = useContext(AuthContext);
    const [flightDetails, setFlightDetails] = useState([]);
    const [airlineId, setAirlineId] = useState('');
    const [message, setResponseMsg] = useState('');
    const { clicked, flightAdded, onUpdate, flightUpdated } = props;
    const [activeComponent, setActiveComponent] = useState(null);
    const [flightId , setFlightId] = useState('');

    
    const handleRemoveFlight = (flightId) => {
      console.log(flightId);
      if (user && payloadData && String(payloadData.roles) === "airline") {
        fetch(`http://localhost:8000/api/flights/?id=${flightId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        })
          .then((response) => {
            if (response.status === 200) {
              setResponseMsg("Flight removed successfully");
              setTimeout(() => {
                setResponseMsg("");
              }, 3000);
              // fetch the flights again after deleting the flight
              fetchFlights();
            }else if(response.status === 404){
              setResponseMsg("Flight cannot be removed as it has an active/purchased tickets");
              setTimeout(() => {
                setResponseMsg("");
              }, 3000);
            }
          })
          .catch((error) => {
            console.log(error);
          });
      }
    };



    useEffect(() => {
      if ((clicked === "clicked") || (flightAdded === true) || (flightUpdated === false)) {
        fetchFlights();
      }
    }, [clicked, flightAdded, flightUpdated]);



    const fetchFlights = () => {
      if (user && payloadData && String(payloadData.roles) === "airline") {
        fetch(
          `http://localhost:8000/api/airlines/?user_id=${payloadData.user_id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Cookies.get("token")}`,
            },
          }
        ) 
        .then((response) => response.json())
        .then((data) => {
            setAirlineId(data.airline_data.id);
            fetch(
              `http://localhost:8000/api/flights/?my=${data.airline_data.id}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${Cookies.get("token")}`,
                },})
            .then((response) => response.json())
            .then((data) => {
              setMyFlights(data);
              const flightIds = data.map((myflights) => myflights.id);
              Promise.all(
                flightIds.map((flightId) =>
                  fetch(`http://localhost:8000/api/flights/?id=${flightId}`)
                    .then((response) => response.json()))
              ).then((flightDetails) => setFlightDetails(flightDetails));})})
            .catch((error) => {
            console.error(error);  
            });}};
    
    
    const handleUpdateFlight = (Id) =>{
        setFlightId(Id);
        setActiveComponent(activeComponent === 'updateflight' ? '' : 'updateflight');

    };
        


  return (
    <div>
                    {activeComponent === "updateflight" && flightId && <UpdateFlightForm
                          flightId={flightId} 
                          airlineId={airlineId}
                          onUpdate={onUpdate} />}
      <p><span id="message">{message}</span></p>
      <br />
      {myflights.length > 0 ? (
        myflights.map((flight, index) => (
          <div key={flight.id} className="result">              <br />
            <a id="display">
              <button id="removeticket" onClick={() => handleRemoveFlight(flight.id)}>Remove Flight</button>
              {/* <button id="updateflight" onClick={() => handleUpdateFlight(flight.id)}>Edit</button> */}

    <button id='updateflight' onClick={() => handleUpdateFlight(flight.id)}>
      {activeComponent === 'updateflight' ? 'Hide' : 'Edit'} 
    </button>

              <p className="info">FlightId-{flightDetails[index]?.id}</p>
              <p className="info">
                {flightDetails[index]?.origin_country_name}
              </p>
              <p className="info">
                {flightDetails[index]?.destination_country_name}
              </p>
              <p className="info">
                {flightDetails[index]?.airline_company_name}
              </p>
              <p className="info">{flightDetails[index]?.departure_time}</p>
              <p className="info">{flightDetails[index]?.landing_time}</p>
              <p className="info">Tickets - {flightDetails[index]?.remaining_tickets}</p>
            </a>
          </div>
        ))
      ) : (
        <p id="notickets">{message}</p>
      )}
    </div>
  ); 
}
