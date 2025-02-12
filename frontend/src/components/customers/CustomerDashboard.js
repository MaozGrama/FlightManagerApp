import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './CustomerDashboard.css';

const FlightInfo = ({ flight }) => (
  <div className="flight-info">
    <p><strong>Airline:</strong> {flight?.airline_company_id?.name || 'Unknown Airline'}</p>
    <p><strong>From:</strong> {flight?.origin_country_id?.name || 'Unknown Origin'}</p>
    <p><strong>To:</strong> {flight?.destination_country_id?.name || 'Unknown Destination'}</p>
    <p><strong>Departure:</strong> {flight?.departure_time ? new Date(flight.departure_time).toLocaleString() : 'Not Available'}</p>
    <p><strong>Landing:</strong> {flight?.landing_time ? new Date(flight.landing_time).toLocaleString() : 'Not Available'}</p>
  </div>
);

export default function CustomerDashboard() {
  const [customerDetails, setCustomerDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem('access');
    if (!token) {
      setError('No authentication token found');
      navigate('/');
      throw new Error('No authentication token');
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (response.status === 401) {
        localStorage.clear();
        setError('Session expired. Please log in again.');
        navigate('/');
        throw new Error('Session expired');
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Server error';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = errorText;
        }
        throw new Error(`Server error (${response.status}): ${errorMessage}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }, [navigate]);

  const handleBuyTicket = useCallback(async (flight) => {
    try {
      setLoading(true);
      const paymentMethod = prompt('Choose payment method (visa/paypal):')?.toLowerCase();
      
      if (!paymentMethod || !['visa', 'paypal'].includes(paymentMethod)) {
        throw new Error('Invalid payment method. Please choose visa or paypal.');
      }

      let paymentDetails = {};

      if (paymentMethod === 'visa') {
        paymentDetails = {
          cardNumber: prompt('Enter card number:'),
          expiryDate: prompt('Enter expiry date (MM/YY):'),
          cvv: prompt('Enter CVV:'),
          cardholderName: prompt('Enter cardholder name:')
        };

        if (!paymentDetails.cardNumber || !paymentDetails.expiryDate || 
            !paymentDetails.cvv || !paymentDetails.cardholderName) {
          throw new Error('All payment details are required');
        }
      }

      const paymentResponse = await fetchWithAuth(
        'http://localhost:8000/api/payments/create/',
        {
          method: 'POST',
          body: JSON.stringify({
            payment_method: paymentMethod,
            amount: flight.price,
            ...paymentDetails
          })
        }
      );

      if (paymentResponse.status === 'success') {
        await fetchWithAuth(
          'http://localhost:8000/api/tickets/create/',
          {
            method: 'POST',
            body: JSON.stringify({
              flight_id: flight.id,
              payment_id: paymentResponse.payment_id
            })
          }
        );
        
        const updatedDetails = await fetchWithAuth('http://localhost:8000/api/customer/details/');
        setCustomerDetails(updatedDetails);
        alert('Ticket purchased successfully!');
      }
    } catch (error) {
      console.error('Error during purchase:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  const handleLogout = useCallback(async () => {
    try {
      await fetchWithAuth('http://localhost:8000/api/logout/', {
        method: 'POST',
      });
    } catch (error) {
      console.warn('Server logout failed:', error);
    } finally {
      localStorage.clear();
      navigate('/');
    }
  }, [fetchWithAuth, navigate]);

  useEffect(() => {
    async function fetchCustomerDetails() {
      try {
        const data = await fetchWithAuth('http://localhost:8000/api/customer/details/');
        console.log('Customer Details Response:', data);
        setCustomerDetails(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching customer details:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomerDetails();
  }, [fetchWithAuth]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button 
          onClick={() => {
            setLoading(true);
            setError(null);
            window.location.reload();
          }}
          className="retry-button"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome, {customerDetails?.username}</h1>
        <button onClick={handleLogout} className="logout-button">
          Log Out
        </button>
      </header>

      <section className="tickets-section">
        <h2>Your Tickets</h2>
        {customerDetails?.tickets?.length > 0 ? (
          <ul className="tickets-list">
            {customerDetails.tickets.map((ticket) => (
              <li key={ticket.id} className="ticket-item">
                <div className="ticket-info">
                  <FlightInfo flight={ticket.flight} />
                  {ticket.payment && (
                    <p><strong>Payment Method:</strong> {ticket.payment.payment_method}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-tickets">No tickets purchased yet.</p>
        )}
      </section>

      <section className="flights-section">
        <h2>Available Flights</h2>
        {customerDetails?.available_flights?.length > 0 ? (
          <ul className="flights-list">
            {customerDetails.available_flights.map((flight) => (
              <li key={flight.id} className="flight-item">
                <div className="flight-details">
                  <FlightInfo flight={flight} />
                  <p><strong>Price:</strong> ${flight.price || 'N/A'}</p>
                  <p><strong>Remaining Tickets:</strong> {flight.remaining_tickets || 0}</p>
                </div>
                <button  
                  onClick={() => handleBuyTicket(flight)}
                  className="buy-button"
                  disabled={loading || (flight.remaining_tickets === 0)}
                >
                  {flight.remaining_tickets === 0 ? 'Sold Out' : 'Buy Ticket'}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-flights">No available flights at the moment.</p>
        )}
      </section>
    </div>
  );
}