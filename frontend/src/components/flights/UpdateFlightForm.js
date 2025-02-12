import React, { useState, useContext, useEffect} from 'react'
import { AuthContext } from '../authentication/AuthContext';
import GetCountries from '../countries/GetCountries';
import Cookies from 'js-cookie';
import moment from 'moment';
import './UpdateFlightForm.css';


function UpdateFlightForm(props) {
    const { flightId,
            airlineId,
            onUpdate,
 } = props;


    const { user, payloadData} = useContext(AuthContext);
    const [errors, setErrors] = useState('');
    const [message, setResponseMsg] = useState('');
    const [origin, setOriginCountryId] = useState('');
    const [destination, setDestinationCountryId] = useState('');
    const [departure, setDepartureTime] = useState('');
    const [landing, setLandingTime] = useState('');
    const [remaining, setRemainigTickets] = useState('');


    const handleOriginCountrySelect = (countryId) => {
      setOriginCountryId(countryId);
    };
  
    const handleDestinationCountrySelect = (countryId) => {
      setDestinationCountryId(countryId);
      };
       
    const handleDepartureTimeChange = (event) => {
      event.preventDefault();
      setDepartureTime(event.target.value);
    };

    const handleLandingTimeChange = (event) => {
      event.preventDefault();
      setLandingTime(event.target.value);
    };

    const handleRemainingTickets = (event) => {
      event.preventDefault();
      setRemainigTickets(event.target.value);
    };


    useEffect(() => {
      const fetchFlight = () =>{
        if (user && payloadData && String(payloadData.roles) === "airline"){
          fetch(`http://localhost:8000/api/flights/?update=${flightId}`,{
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${Cookies.get('token')}`,
            },})
          .then((response) => response.json())
          .then(data => {
              setOriginCountryId(data.origin_country_id);
              setDestinationCountryId(data.destination_country_id);
    
              setDepartureTime(moment.utc(data.departure_time).local().format('YYYY-MM-DDTHH:mm'));
              setLandingTime(moment.utc(data.landing_time).local().format('YYYY-MM-DDTHH:mm'));
              setRemainigTickets(data.remaining_tickets);
          
            })
          .catch(error => {
              console.error(error);
            });
          }
      }
    
      if (flightId) {
        fetchFlight(flightId);
      }
    }, [flightId, user, payloadData, setOriginCountryId, setDestinationCountryId, setDepartureTime, setLandingTime, setRemainigTickets]);
    



    const handleUpdate = async (event) => {
      onUpdate(false);
      event.preventDefault();
      if(user && payloadData && String(payloadData.roles) === "airline"){
        fetch(`http://localhost:8000/api/flights/?id=${flightId}`,{
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${Cookies.get('token')}`,
          },
          body: JSON.stringify({
            airline_company_id: airlineId,
            origin_country_id: origin,
            destination_country_id: destination,
            departure_time: departure,
            landing_time: landing,
            remaining_tickets: remaining,
          }),
        })
        .then(response => {
          if (response.status === 400) {
            return response.json().then(data => {
              if (data) {
                setErrors(data);
                console.log("Errors exist");
                console.log(data);
              }
            });
          } else if (response.status === 200) {
            console.log(response.status)
            setErrors('');
            setResponseMsg("Flight updated successfully");
            onUpdate(true);
            setTimeout(() => {
              setResponseMsg("");
            }, 3000);
          }
        })
        .catch(error => {
            console.error(error);
          });
        
      }
      

    }


  return (
    
      <div>
        {Object.keys(errors).length > 0 || message ? (
          <ul>
            {Object.keys(errors).map((key) => (
              <p key={key}>
                <span id="error">{errors[key]}</span>
              </p>
            ))}
            {message && <p id="success">{message}</p>}
          </ul>
        ) : (
          <>
            <p id="success">{message}</p>
          </>
        )}
        <form id="BBB" onSubmit={handleUpdate}>
          <div className="form-group">
            <label htmlFor="origin">
              <span>From</span>
              <GetCountries onCountrySelect={handleOriginCountrySelect} selectedCountryId={origin} required/>
              <input type="hidden" onChange={(e) => setOriginCountryId(e.target.value)} required/>
            </label>
          </div>
    
          <div className="form-group">
            <label htmlFor="destination">
              <span>To</span>
              <GetCountries onCountrySelect={handleDestinationCountrySelect} selectedCountryId={destination} required/>
              <input type="hidden" onChange={(e) => setDestinationCountryId(e.target.value)} required />
            </label>
          </div>
    
          <div className="form-group">
            
            <label htmlFor="departure">
           
              <span>Depart</span>
              <br />
        
              <input id="departure" type="datetime-local" defaultValue={departure} onChange={handleDepartureTimeChange} required/>
            </label>
          </div>
    
          <div className="form-group">
            <label htmlFor="landing">
              <span>Land</span>
              <br />
              <input id="landing" type="datetime-local" defaultValue={landing} onChange={handleLandingTimeChange} required />
            </label>
          </div>
    
          <div className="form-group">
            <label htmlFor="tickets">
              <span>Tickets</span>
              <br />
              <input id="tickets" type="number" defaultValue={remaining} onChange={handleRemainingTickets} required/>
            </label>
          </div>
          <input id='updatebutton'  type='submit' name='Update Profile' value='Update'/>

        </form>
      </div>
    );
}

export default UpdateFlightForm


