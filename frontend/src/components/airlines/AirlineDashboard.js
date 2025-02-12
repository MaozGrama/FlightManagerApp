import React, { useState, useCallback, useMemo, useEffect } from 'react';

const AirlineDashboard = () => {
  const [airline, setAirline] = useState(null);
  const [countries, setCountries] = useState([]);
  const [flights, setFlights] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ticket Creation State with form visibility
  const [isCreateFlightFormOpen, setIsCreateFlightFormOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    origin_country: '',
    destination_country: '',
    departure_time: '',
    landing_time: '',
    price: '',
    total_tickets: ''
  });

  const API_CONFIG = useMemo(() => ({
    baseUrl: 'http://localhost:8000',
    endpoints: {
      countries: '/api/airline/countries/',
      airline: '/api/airline/airline-company/',
      flights: '/api/airline/flights/',
      createFlight: '/api/airline/flights/create/'
    }
  }), []);

  const getAccessToken = () => localStorage.getItem("access");

  const handleLogout = useCallback((reason = "Session expired. Please log in again.") => {
    localStorage.removeItem("access");
    localStorage.removeItem("userRole");
    alert(reason);
    window.location.href = "/";
  }, []);

  const fetchWithAuth = useCallback(async (endpoint, options = {}) => {
    const token = getAccessToken();
    
    if (!token) {
      handleLogout();
      throw new Error("No authentication token available.");
    }

    try {
      const url = `${API_CONFIG.baseUrl}${endpoint}`;
      console.log('Fetching from:', url);
      
      const fetchOptions = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers
        },
      };

      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          throw new Error("Session expired");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error("Fetch error:", err.message);
      throw err;
    }
  }, [API_CONFIG, handleLogout]);

  const fetchAirlineData = useCallback(async () => {
    try {
      const data = await fetchWithAuth(API_CONFIG.endpoints.airline);
      if (data && data.airline) {
        setAirline(data.airline);
      }
    } catch (err) {
      setError("Failed to load airline data: " + err.message);
    }
  }, [fetchWithAuth, API_CONFIG.endpoints.airline]);

  const fetchCountries = useCallback(async () => {
    try {
      const data = await fetchWithAuth(API_CONFIG.endpoints.countries);
      if (data && data.countries) {
        setCountries(data.countries.sort((a, b) => a.name.localeCompare(b.name)));
      }
    } catch (err) {
      setError("Failed to load countries: " + err.message);
    }
  }, [fetchWithAuth, API_CONFIG.endpoints.countries]);

  const fetchFlights = useCallback(async () => {
    try {
      const data = await fetchWithAuth(API_CONFIG.endpoints.flights);
      if (data && data.flights) {
        setFlights(data.flights);
      }
    } catch (err) {
      setError("Failed to load flights: " + err.message);
    }
  }, [fetchWithAuth, API_CONFIG.endpoints.flights]);

  const createFlight = useCallback(async (flightData) => {
    try {
      const response = await fetchWithAuth(API_CONFIG.endpoints.createFlight, {
        method: 'POST',
        body: JSON.stringify(flightData)
      });

      // Refresh flights after creating a new one
      await fetchFlights();
      
      // Reset form and close it
      setNewTicket({
        origin_country: '',
        destination_country: '',
        departure_time: '',
        landing_time: '',
        price: '',
        total_tickets: '',
        remaining_tickets: ''
      });
      setIsCreateFlightFormOpen(false);

      alert('Flight created successfully!');
      return response;
    } catch (err) {
      setError(`Failed to create flight: ${err.message}`);
      throw err;
    }
  }, [fetchWithAuth, API_CONFIG.endpoints.createFlight, fetchFlights]);

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'Airline') {
      handleLogout('Unauthorized access');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchAirlineData(),
          fetchCountries(),
          fetchFlights()
        ]);
      } catch (err) {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchAirlineData, fetchCountries, fetchFlights, handleLogout]);

  const handleCreateTicket = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!newTicket.origin_country || !newTicket.destination_country) {
      setError('Please select origin and destination countries');
      return;
    }

    // Prepare flight data for backend
    const flightData = {
      origin_country_id: newTicket.origin_country,
      destination_country_id: newTicket.destination_country,
      departure_time: newTicket.departure_time,
      landing_time: newTicket.landing_time,
      remaining_tickets: newTicket.total_tickets,
      price: newTicket.price
    };

    createFlight(flightData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTicket(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-4 p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-4 bg-white rounded-lg shadow-md">
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Airline Dashboard</h2>
          {airline && (
            <p className="text-gray-600">
              {airline.name} - Based in {airline.country.name}
            </p>
          )}
        </div>
        <button 
          onClick={() => setIsCreateFlightFormOpen(!isCreateFlightFormOpen)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {isCreateFlightFormOpen ? 'Cancel' : 'Create Flight'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {isCreateFlightFormOpen && (
        <form onSubmit={handleCreateTicket} className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <select
              name="origin_country"
              value={newTicket.origin_country}
              onChange={handleInputChange}
              className="border p-2 rounded"
              required
            >
              <option value="">Select Origin Country</option>
              {countries.map(country => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
            <select
              name="destination_country"
              value={newTicket.destination_country}
              onChange={handleInputChange}
              className="border p-2 rounded"
              required
            >
              <option value="">Select Destination Country</option>
              {countries.map(country => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
            {/* Additional input fields for other flight details */}
            <input
              type="datetime-local"
              name="departure_time"
              value={newTicket.departure_time}
              onChange={handleInputChange}
              className="border p-2 rounded"
              required
            />
            <input
              type="datetime-local"
              name="landing_time"
              value={newTicket.landing_time}
              onChange={handleInputChange}
              className="border p-2 rounded"
              required
            />
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={newTicket.price}
              onChange={handleInputChange}
              className="border p-2 rounded"
              required
            />
            <input
              type="number"
              name="total_tickets"
              placeholder="Total Tickets"
              value={newTicket.total_tickets}
              onChange={handleInputChange}
              className="border p-2 rounded"
              required
            />
            <button 
              type="submit" 
              className="col-span-2 bg-green-500 text-white p-2 rounded hover:bg-green-600"
            >
              Create Flight
            </button>
          </div>
        </form>
      )}

      {/* Flights list section can be added here */}
      {flights.length > 0 && (
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">Current Flights</h3>
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Origin</th>
                <th className="border p-2">Destination</th>
                <th className="border p-2">Departure</th>
                <th className="border p-2">Arrival</th>
                <th className="border p-2">Remaining Tickets</th>
              </tr>
            </thead>
            <tbody>
              {flights.map(flight => (
                <tr key={flight.id} className="hover:bg-gray-50">
                  <td className="border p-2">{flight.origin_country.name}</td>
                  <td className="border p-2">{flight.destination_country.name}</td>
                  <td className="border p-2">{new Date(flight.departure_time).toLocaleString()}</td>
                  <td className="border p-2">{new Date(flight.landing_time).toLocaleString()}</td>
                  <td className="border p-2">{flight.remaining_tickets}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AirlineDashboard;