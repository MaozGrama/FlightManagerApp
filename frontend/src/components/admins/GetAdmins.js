import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../authentication/AuthContext";
import Cookies from "js-cookie";

const GetAdmins = ({ onAdminSelect }) => {
  const [admins, setAdmins] = useState([]);
  const { user, payloadData } = useContext(AuthContext);

  useEffect(() => {
    const fetchAdmins = async () => {
        if(user && payloadData && String(payloadData.roles) === 'admin'){
      const response = await fetch("http://localhost:8000/api/admins/",{
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        }, 
      });
      const data = await response.json();
      setAdmins(data);
    }}

    fetchAdmins();
  }, [user, payloadData]);


  const handleAdminSelect = (event) => {
    const selectedAdmin = event.target.value;
    onAdminSelect(selectedAdmin);
  };

  return (
    <div>
      <label htmlFor="admin-select"></label>
      <select id="admin-select" onChange={handleAdminSelect} defaultValue="Select admin">
      <option value="">Select admin</option>
        {admins.map((admin) => (  
          <option key={admin.id} value={admin.id}>
            {admin.first_name}&nbsp;{admin.last_name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default GetAdmins;
