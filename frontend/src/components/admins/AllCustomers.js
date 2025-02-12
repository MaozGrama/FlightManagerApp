import React, { useState, useContext } from 'react';
import { AuthContext } from '../authentication/AuthContext';
import Cookies from 'js-cookie';
import GetCustomers from '../customers/GetCustomers';
import AddCustomer from './AddCustomer';
import './AllCustomers.css';

export const AllCustomers = () => {
  const { user, payloadData } = useContext(AuthContext);
  const [customer, setCustomer] = useState(null);
  const [searchId, setSearchId] = useState('');
  const [message, setResponseMsg] = useState('');
  const [activeComponent, setActiveComponent] = useState('');

  
  const handleAddClick = (event) => {
    event.preventDefault();
    setActiveComponent(activeComponent === 'addcustomer' ? '' : 'addcustomer');
  };


  const handleRemoveCustomer = ( customerId) => {
    
    if(customerId && user && payloadData && String(payloadData.roles) === 'admin'){

      fetch(`http://localhost:8000/api/customer/?id=${customerId}`,{
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        }})
        .then(response => {
          if (response.status === 401) {
            setResponseMsg('This customer has an on going active ticket/s thus cannot be deleted.');
            setTimeout(() => {
              setResponseMsg('');
            }, 3000);
          } else if (response.status === 200) {
            setResponseMsg('Customer deleted successfully');
            setTimeout(() => {
              setResponseMsg('');
              window.location.href = '/';
            }, 2000);
          }
        })
        .catch((error) => {
          console.log(error);
        });}}


  const handleCustomerSelect = (customerId) => {
    setSearchId('');
    fetch(`http://localhost:8000/api/customer/?customer_id=${customerId}`,{
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },  
    })
    .then((response) => response.json())
    .then((data) => {
      setCustomer(data);
    })
    .catch((error) => {
      console.log(error);
    });
  };

  const handleSelect = async () => {
    if(user && payloadData && String(payloadData.roles) === 'admin') {
      if (searchId) {
        fetch(`http://localhost:8000/api/customer/?customer_id=${searchId}`,{
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },  
        })
        .then((response) => response.json())
        .then((data) => {
          setCustomer(data);
        })
        .catch((error) => {
          console.log(error);
        });
      } else {
        setCustomer(null);
      }
    }
  };

return (
  <div className="table-container">
    <p id='customerremovedsuccessfully'>{message}</p>
    <div>
    <button id='adminaddcustomer' onClick={handleAddClick}>
      {activeComponent === 'addcustomer' ? 'Hide' : 'Add customer'} 
    </button>
    {activeComponent === 'addcustomer' && <AddCustomer />}
  </div>
    <div id='searchcustomer'>
      <input id='customersearchid'
        type="text"
        value={searchId}
        onChange={(event) => setSearchId(event.target.value)}
        placeholder="Search by ID"
      />
      <button id='customersearchbutton' onClick={handleSelect}>Search</button>
    </div>
    <br></br>
    <div id='selectcustomer'>
    <GetCustomers onCustomerSelect={handleCustomerSelect}/>
    <br></br>
    </div>
    {customer && (
      <div>
                  <button id='removecustomerbutton' onClick={() => handleRemoveCustomer(customer.id)}>Remove Customer</button>
        <p id='customeresults'>
          
            <label id='customerfield'>Customer ID:</label>
            <span id='customerX'>{customer.id}</span>
     
            <label id='customerfield'>Customer Name:</label>
            <span id='customerX'>{customer.first_name} {customer.last_name}</span>

            <label id='customerfield'>Address:</label>
            <span id='customerX'>{customer.address}</span>

            <label id='customerfield'>Phone Number:</label>
            <span id='customerX'>{customer.phone_no}</span>

            <label id='customerfield'>User Id:</label>
            <span id='customerX'>{customer.user_id}</span>

      </p>
      </div>
      
    )}
    
  </div>
);
};

