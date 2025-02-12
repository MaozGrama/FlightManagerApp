import React, { useState, useEffect, useCallback } from "react";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [editedUser, setEditedUser] = useState({
    username: "",
    role: "",
    first_name: "",
    last_name: "",
  });

  const predefinedRoles = ["Customer", "Airline", "Admin"];

  const getAccessToken = () => localStorage.getItem("access");
  
  const handleLogout = useCallback((reason = "Session expired. Please log in again.") => {
    localStorage.removeItem("access");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    alert(reason);
    window.location.href = "/";
  }, []);

  //const verifyAdminAccess = useCallback(() => {
    //const userRole = localStorage.getItem("userRole");
    //if (userRole !== "Admin") {
     // handleLogout("Admin access required");
    //  return false;
   // }
  //  return true;
//  }, [handleLogout]);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const token = getAccessToken();
    
    if (!token) {
      handleLogout();
      throw new Error("No authentication token available.");
    }
  
    try {
      console.log(`Making ${options.method || 'GET'} request to:`, url);
      console.log('Request payload:', options.body);
  
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Response error:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
  
        if (response.status === 401) {
          handleLogout();
          throw new Error("Session expired");
        }
  
        throw new Error(
          errorData?.detail || 
          errorData?.message || 
          `HTTP Error ${response.status}`
        );
      }
  
      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (err) {
      console.error("Error in fetchWithAuth:", err);
      throw err;
    }
  }, [handleLogout]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError({});

    try {
      const [usersData] = await Promise.all([
        fetchWithAuth("http://localhost:8000/api/admin/users/"),
      ]);
      
      setUsers(usersData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError((prev) => ({ ...prev, users: err.message }));
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUserSelect = useCallback((userId) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    setSelectedUser(user);
    setEditedUser({
      username: user.username || "",
      role: user.role || "",
      first_name: user.first_name || "",
      last_name: user.last_name || "",
    });
  }, [users]);

  const handleEditChange = useCallback((field, value) => {
    setEditedUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleSaveChanges = async () => {
    if (!selectedUser?.id) return;
  
    try {
      const updateData = {
        username: editedUser.username.trim(),
        role: editedUser.role,
        first_name: editedUser.first_name?.trim() || "",
        last_name: editedUser.last_name?.trim() || "",
      };
  
      // Step 1: Update user role
      const updateUrl = `http://localhost:8000/api/admin/users/${selectedUser.id}/`;
      const updatedUserResponse = await fetchWithAuth(updateUrl, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });
  
      // Step 2: If we're setting to Airline role, convert to airline company
      if (editedUser.role === "Airline" && updatedUserResponse.role === "Airline") {
        try {
          await fetchWithAuth(`http://localhost:8000/api/admin/users/${selectedUser.id}/convert-to-airline/`, {
            method: 'POST'
          });
          alert('User updated to Airline and Airline Company created');
        } catch (conversionErr) {
          console.error('Airline company conversion failed:', conversionErr);
          alert(`User role updated, but airline company creation failed: ${conversionErr.message}`);
        }
      } else {
        alert("User updated successfully!");
      }
  
      await fetchData();
  
    } catch (err) {
      console.error("Failed to update user:", err);
      alert(`Failed to save changes: ${err.message}`);
    }
  };
  return (
    <div className="admin-dashboard">
      <header>
        <h1>Admin Dashboard</h1>
        <button onClick={() => handleLogout("Logged out successfully")} className="logout-button">
          Logout
        </button>
      </header>
  
      <section>
        <h2>Manage Users</h2>
        {loading ? (
          <div className="loading">Loading users...</div>
        ) : error.users ? (
          <p className="error">Failed to load users: {error.users}</p>
        ) : (
          <>
            <label htmlFor="user-select">Select User:</label>
            <select
              id="user-select"
              value={selectedUser?.id || ""}
              onChange={(e) => handleUserSelect(Number(e.target.value))}
            >
              <option value="" disabled>-- Select a user --</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
  
            {selectedUser && (
              <div className="user-details">
                <h3>Edit User</h3>
                <label>
                  Username:
                  <input
                    type="text"
                    value={editedUser.username}
                    onChange={(e) => handleEditChange("username", e.target.value)}
                  />
                </label>
                <label>
                  First Name:
                  <input
                    type="text"
                    value={editedUser.first_name}
                    onChange={(e) => handleEditChange("first_name", e.target.value)}
                  />
                </label>
                <label>
                  Last Name:
                  <input
                    type="text"
                    value={editedUser.last_name}
                    onChange={(e) => handleEditChange("last_name", e.target.value)}
                  />
                </label>
                <label>
                  Role:
                  <select
                    value={editedUser.role}
                    onChange={(e) => handleEditChange("role", e.target.value)}
                  >
                    <option value="" disabled>Select a role</option>
                    {predefinedRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </label>
                <button 
                onClick={handleSaveChanges}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  </div>
);

}
export default AdminDashboard;

