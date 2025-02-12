import React, { useState, useEffect } from "react";
import "./GetCountries.css";

const GetCountries = ({ onCountrySelect, selectedCountryId }) => {
  const [countries, setCountries] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCountry = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/flights/");
        if (!response.ok) {
          throw new Error("Failed to fetch countries");
        }
        const data = await response.json();
        console.log(data); // Inspect the API response

        // Update state based on response format
        if (Array.isArray(data)) {
          setCountries(data);
        } else if (data.countries) {
          setCountries(data.countries);
        } else {
          console.error("Unexpected response format:", data);
          setCountries([]);
        }
      } catch (err) {
        console.error(err.message);
        setError("Unable to load countries");
      }
    };

    fetchCountry();
  }, []);

  const handleCountrySelect = (event) => {
    const selectedCountry = event.target.value;
    onCountrySelect(selectedCountry);
  };

  return (
    <div>
      <label htmlFor="country-select">Select a Country:</label>
      {error ? (
        <p className="error">{error}</p>
      ) : (
        <select
          id="country-select"
          value={selectedCountryId || ""}
          onChange={handleCountrySelect}
        >
          <option value="">Select country</option>
          {Array.isArray(countries) &&
            countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
        </select>
      )}
    </div>
  );
};

export default GetCountries;
