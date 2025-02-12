import React, { useState, useEffect } from "react";

const GetAirlines = ({ onAirlineCompanySelect }) => {
  const [airlines, setAirlineCompany] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAirlineCompany = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/airlines/");
        if (!response.ok) {
          throw new Error("Failed to fetch airlines");
        }
        const data = await response.json();
        console.log(data); // Inspect the response

        if (Array.isArray(data)) {
          setAirlineCompany(data);
        } else if (data.airlines) {
          setAirlineCompany(data.airlines);
        } else {
          console.error("Unexpected response format:", data);
          setAirlineCompany([]);
        }
      } catch (error) {
        console.error("Error fetching airlines:", error);
        setError("Unable to load airlines");
      }
    };

    fetchAirlineCompany();
  }, []);

  const handleAirlineCompanySelect = (event) => {
    const selectedAirlineCompany = event.target.value;
    onAirlineCompanySelect(selectedAirlineCompany);
  };

  return (
    <div>
      <label htmlFor="airline-company-select">Select an Airline:</label>
      {error ? (
        <p className="error">{error}</p>
      ) : (
        <select
          id="airline-company-select"
          onChange={handleAirlineCompanySelect}
          defaultValue=""
        >
          <option value="">Select airline</option>
          {Array.isArray(airlines) &&
            airlines.map((airlinecompany) => (
              <option key={airlinecompany.id} value={airlinecompany.id}>
                {airlinecompany.name}
              </option>
            ))}
        </select>
      )}
    </div>
  );
};

export default GetAirlines;
