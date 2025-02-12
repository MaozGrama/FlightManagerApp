import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GetCountries from '../countries/GetCountries';
import GetAirlines from '../airlines/GetAirlines';
import './Flights.css';
import AddTicket from '../customers/AddTicket';

const FlightSearchForm = () => {
 
  const [selectedOriginCountry, setSelectedOriginCountry] = useState('');
  const [selectedDestinationCountry, setSelectedDestinationCountry] = useState('');
  const [selectedAirlineCompany, setSelectedAirlineCompany] = useState('');
  const [selectedDepartureTime, setSelectedDepartureTime] = useState('');
  const [selectedLandingTime, setSelectedLandingTime] = useState('');
  const [flights, setFlights] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedFlightId, setSelectedFlightId] = useState(null);
  const [clicked, setClicked] = useState(false)
  const handleSubmit = async (event) => {
 
    event.preventDefault();
    if (
      !selectedOriginCountry &&
      !selectedDestinationCountry &&
      !selectedAirlineCompany &&
      !selectedDepartureTime &&
      !selectedLandingTime
    ) {
      alert('Please select BOTH departure country and destination country');
      return;
    }
    try {
      const response = await axios.get(
        `http://localhost:8000/api/flights/?origin_country_id=${selectedOriginCountry}&destination_country_id=${selectedDestinationCountry}&airline_company_id=${selectedAirlineCompany}&departure_time=${selectedDepartureTime}&landing_time=${selectedLandingTime}`
      );
      setFlights(response.data);
      setIsLoaded(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleOriginCountrySelect = (countryId) => {
    setSelectedOriginCountry(countryId);
  };

  const handleDestinationCountrySelect = (countryId) => {
    setSelectedDestinationCountry(countryId);
  };

  const handleAirlineCompanySelect = (airlineCompanyId) => {
    setSelectedAirlineCompany(airlineCompanyId);
  };

  const handleDepartureTimeChange = (event) => {
    setSelectedDepartureTime(event.target.value);
  };

  const handleLandingTimeChange = (event) => {
    setSelectedLandingTime(event.target.value);
  };


  const clearForm = () => {
    document.getElementById("SearchForm").reset();
    setSelectedOriginCountry("");
    setSelectedDestinationCountry("");
    setSelectedAirlineCompany("");
    setSelectedDepartureTime("");
    setSelectedLandingTime("");
  };

  const handleClick = (flightId) => {
    setSelectedFlightId(flightId);
    setClicked(true);
    
  };
  
  return (
    <div> 
      <form id='SearchForm'  onSubmit={handleSubmit}>

        <label id='origin' >
         <span>From</span>
          <GetCountries onCountrySelect={handleOriginCountrySelect}/>
          <input type="hidden" value={selectedOriginCountry} onChange={(e) => setSelectedOriginCountry(e.target.value)} />
        </label>
        <br/>
          
        <label id='destination'>
          <span>To</span>
          <GetCountries 
          onCountrySelect={handleDestinationCountrySelect} />
          <input type="hidden" value={selectedDestinationCountry} onChange={(e) => setSelectedDestinationCountry(e.target.value)} />
        </label>
        <br/>

        <label id='airline'>
          <span>Airline</span>
          <GetAirlines onAirlineCompanySelect={handleAirlineCompanySelect}/>
          <input  type="hidden" value={selectedAirlineCompany} onChange={(e) => setSelectedAirlineCompany(e.target.value)} />
        </label>
        <br/>
        
        <label >
        <span>Depart</span>
        <br/>
          <input id='departure' type="datetime-local" value={selectedDepartureTime} onChange={handleDepartureTimeChange} />   
        </label>
        <br/>

        <label>
        <span>Land</span>
        <br/>
          <input id='landing' type="datetime-local" value={selectedLandingTime} onChange={handleLandingTimeChange} />
        </label>
        <br/>

        <button id='search' type="submit">Search</button>
        <button id='clear' type="button" onClick={clearForm}>Clear</button>

      </form>

      <ul>
      
{isLoaded ? (
  
  flights.length > 0 ? (

flights.map((flight) => (
  <div key={flight.id} className="flight-result">

<a id='addticket' >
{<AddTicket flightId={flight.id}/>}
<p className='flight-info'>FlighID {flight.id}</p>
<p className='flight-info'>{flight.origin_country_name}</p>
<p className='flight-info'>{flight.destination_country_name}</p>
<p className='flight-info'>{flight.airline_company_name}</p>
<p className='flight-info'>{flight.departure_time}</p>
<p className='flight-info'>{flight.landing_time}</p>
<p className='flight-info'>Tickets - {flight.remaining_tickets}</p>
</a>
</div>

))
  ) : (
    <p id='noflights'>No flights found</p>
  )
) : (
  <div><p></p></div>
)}
</ul>
    </div>
  );
};

export default FlightSearchForm;



