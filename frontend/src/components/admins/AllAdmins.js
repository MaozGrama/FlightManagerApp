import React, { useState, useContext } from 'react';
import { AuthContext } from '../authentication/AuthContext';
import Cookies from 'js-cookie';
import GetAdmins from '../admins/GetAdmins';
import AddAdmin from './AddAdmin';
import './AllAdmins.css'

export const AllAdmins = () => {
    const { user, payloadData } = useContext(AuthContext);
    const [admin, setAdmin] = useState(null);
    const [searchId, setSearchId] = useState('');
    const [message, setResponseMsg] = useState('');
    const [activeComponent, setActiveComponent] = useState('');
  
  
    const handleAddClick = (event) => {
      event.preventDefault();
      setActiveComponent(activeComponent === 'addadmin' ? '' : 'addadmin');
    };
    
    const handleRemoveAdmin = ( adminId) => {
      
      if(adminId && user && payloadData && String(payloadData.roles) === 'admin'){
        fetch(`http://localhost:8000/api/admins/?id=${adminId}`,{
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          }})
          .then(response => {
            if (response.status === 401) {
              setResponseMsg('Admin does not exist');
            } else if (response.status === 200) {
              setResponseMsg('Admin deleted successfully');
              setTimeout(() => {
                setResponseMsg('');
                window.location.href = '/';
              }, 2000);
            }
          })
          .catch((error) => {
            console.log(error);
          });}}
  
  
    const handleAdminSelect = (adminId) => {
      setSearchId('');
      fetch(`http://localhost:8000/api/admins/?id=${adminId}`,{
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },  
      })
      .then((response) => response.json())
      .then((data) => {
        setAdmin(data);
      })
      .catch((error) => {
        console.log(error);
      });
    };
  
    const handleSelect = async () => {
      if(user && payloadData && String(payloadData.roles) === 'admin') {
        if (searchId) {
          fetch(`http://localhost:8000/api/admins/?id=${searchId}`,{
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Cookies.get("token")}`,
            },  
          })
          .then((response) => response.json())
          .then((data) => {
            setAdmin(data);
          })
          .catch((error) => {
            console.log(error);
          });
        } else {
          setAdmin(null);
        }
      }
    };
  
  return (
    <div className="table-container">
      <p id='adminremovedsuccessfully'>{message}</p>
      <div>
      <button id='adminaddadmin' onClick={handleAddClick}>
        {activeComponent === 'addadmin' ? 'Hide' : 'Add admin'} 
      </button>
      {activeComponent === 'addadmin' && <AddAdmin />}
    </div>
      <div id='searchadmin'>
        <input id='adminsearchid'
          type="text"
          value={searchId}
          onChange={(event) => setSearchId(event.target.value)}
          placeholder="Search by ID"
        />
        <button id='adminsearchbutton' onClick={handleSelect}>Search</button>
      </div>
      <br></br>
      <div id='selectadmin'>
      <GetAdmins onAdminSelect={handleAdminSelect}/>
      <br></br>
      </div>
      {admin && (
        <div>
            <button id='removeadminbutton' onClick={() => handleRemoveAdmin(admin.id)}>Remove Admin</button>
            
          <p id='adminresults'>
            
              <label id='adminfield'>Admin ID:</label>
              <span id='adminX'>{admin.id}</span>
       
              <label id='adminfield'>First Name:</label>
              <span id='adminX'>{admin.first_name}</span>
  
              <label id='adminfield'>Last Name:</label>
              <span id='adminX'>{admin.last_name}</span>
  
              <label id='adminfield'>User Id:</label>
              <span id='adminX'>{admin.user_id}</span> 
        </p>
        </div>
      )}
    </div>
  );
  };