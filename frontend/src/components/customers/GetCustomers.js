import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../authentication/AuthContext";
import Cookies from "js-cookie";

const GetCustomers = ({ onCustomerSelect }) => {
  const [customers, setCustomers] = useState([]);
  const { user, payloadData } = useContext(AuthContext);

  useEffect(() => {
    const fetchCustomers = async () => {
        if(user && payloadData && String(payloadData.roles) === 'admin'){
      const response = await fetch("http://localhost:8000/api/customer/",{
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        }, 
      });
      const data = await response.json();
      setCustomers(data);
    }}

    fetchCustomers();
  }, [user, payloadData]);


  const handleCustomerSelect = (event) => {
    const selectedCustomer = event.target.value;
    onCustomerSelect(selectedCustomer);
  };

  return (
    <div>
      <label htmlFor="customer-select"></label>
      <select id="customer-select" onChange={handleCustomerSelect} defaultValue="Select customer">
      <option value="">Select customer</option>
        {customers.map((customer) => (  
          <option key={customer.id} value={customer.id}>
            {customer.first_name}&nbsp;{customer.last_name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default GetCustomers;