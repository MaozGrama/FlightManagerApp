import React, { useContext, useState } from 'react';
import { AuthContext } from '../authentication/AuthContext';
import Cookies from 'js-cookie';
import './AddTicket.css';

export default function AddTicket(props) {
  const { user, payloadData } = useContext(AuthContext);
  const [responseMsg, setResponseMsg] = useState(false);
  
  const handleAddTicket = async (event) => {
    event.preventDefault();
    if (user && payloadData && String(payloadData.roles) === "customer") {
      try {
        const response = await fetch(`http://localhost:8000/api/customer/?user_id=${payloadData.user_id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${Cookies.get('token')}`,
          },
        });
        const data = await response.json();
        const customerId = data.customer_data.id;

        const ticketResponse = await fetch('http://localhost:8000/api/tickets/', {
          
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${Cookies.get('token')}`,
          },
          body: JSON.stringify({
            flight_id: props.flightId,
            customer_id: customerId,
          }),
        });
        if (!ticketResponse.ok) {
          if (ticketResponse.status === 406) {
            setResponseMsg('Ticket already added');
          } else {
            throw new Error(`Failed to add ticket: ${ticketResponse.statusText}`);
          }
        } else {
          setResponseMsg('Ticket added successfully');
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <>
    <button id='add' onClick={handleAddTicket}>Add Ticket</button>
    {responseMsg && <p id='addedsuccess'>{responseMsg}</p>}
    </>
  );
}

