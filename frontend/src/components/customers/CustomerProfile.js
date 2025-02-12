import React, { useState, useEffect, useContext, useReducer } from "react";
import { AuthContext } from "../authentication/AuthContext";
import Cookies from "js-cookie";
import "./CustomerProfile.css";

function CustomerProfile() {
  // Reducer for form state management
  const formReducer = (state, action) => {
    switch (action.type) {
      case "SET_USERNAME":
        return { ...state, username: action.payload };
      case "SET_EMAIL":
        return { ...state, email: action.payload };
      case "SET_CURRENT_PASSWORD":
        return { ...state, current_password: action.payload };
      case "SET_NEW_PASSWORD":
        return { ...state, password1: action.payload };
      case "SET_CONFIRM_PASSWORD":
        return { ...state, password2: action.payload };
      case "SET_FIRST_NAME":
        return { ...state, first_name: action.payload };
      case "SET_LAST_NAME":
        return { ...state, last_name: action.payload };
      case "SET_ADDRESS":
        return { ...state, address: action.payload };
      case "SET_PHONE_NO":
        return { ...state, phone_no: action.payload };
      case "SET_CREDIT_CARD":
        return { ...state, credit_card_no: action.payload };
      default:
        throw new Error(`Unhandled action type: ${action.type}`);
    }
  };

  // Initial state for form
  const [state, dispatch] = useReducer(formReducer, {
    username: "",
    email: "",
    current_password: "",
    password1: "",
    password2: "",
    first_name: "",
    last_name: "",
    address: "",
    phone_no: "",
    credit_card_no: "",
  });

  const { payloadData } = useContext(AuthContext);
  const [setCustomerId] = useState(null);
  const [errors, setErrors] = useState({});
  const [responseMsg, setResponseMsg] = useState("");
  const [showForm, setShowForm] = useState(true);

  // Fetch customer profile data
  useEffect(() => {
    if (payloadData?.username) {
      fetch("http://localhost:8000/api/customer/profile/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }
          return response.json();
        })
        .then((data) => {
          setCustomerId(data.customer_data.id);
          dispatch({ type: "SET_USERNAME", payload: data.user_data.username });
          dispatch({ type: "SET_EMAIL", payload: data.user_data.email });
          dispatch({ type: "SET_FIRST_NAME", payload: data.customer_data.first_name });
          dispatch({ type: "SET_LAST_NAME", payload: data.customer_data.last_name });
          dispatch({ type: "SET_ADDRESS", payload: data.customer_data.address });
          dispatch({ type: "SET_PHONE_NO", payload: data.customer_data.phone_no });
          dispatch({ type: "SET_CREDIT_CARD", payload: data.customer_data.credit_card_no });
        })
        .catch((error) => {
          console.error("Error fetching customer data:", error);
        });
    }
  }, [payloadData, setCustomerId]);

  // Handle profile update
  const handleUpdate = (event) => {
    event.preventDefault();
    setResponseMsg("");
    setErrors({});

    fetch("http://localhost:8000/api/customer/update/", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
      body: JSON.stringify({
        username: state.username,
        email: state.email,
        current_password: state.current_password,
        password1: state.password1,
        password2: state.password2,
        first_name: state.first_name,
        last_name: state.last_name,
        address: state.address,
        phone_no: state.phone_no,
        credit_card_no: state.credit_card_no,
      }),
    })
      .then((response) => {
        if (response.status === 400) {
          return response.json().then((data) => {
            setErrors(data);
          });
        } else if (response.ok) {
          setErrors({});
          setResponseMsg("Profile updated successfully!");
          setTimeout(() => {
            setResponseMsg("");
          }, 3000);
          setShowForm(false);
        } else {
          setResponseMsg("An unexpected error occurred.");
        }
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
      });
  };

  return (
    <div>
      {Object.keys(errors).length > 0 && (
        <ul>
          {Object.keys(errors).map((key) => (
            <p key={key}>
              <span id="updateprofilerror">{errors[key]}</span>
            </p>
          ))}
        </ul>
      )}
      {responseMsg && <p id="updateprofilesuccess">{responseMsg}</p>}

      {showForm ? (
        <div id="moveform">
          <form id="customerupdateform" onSubmit={handleUpdate}>
            <input
              placeholder="Username"
              id="input"
              type="text"
              value={state.username}
              onChange={(e) => dispatch({ type: "SET_USERNAME", payload: e.target.value })}
              required
            />

            <input
              placeholder="Email"
              id="input"
              type="text"
              value={state.email}
              onChange={(e) => dispatch({ type: "SET_EMAIL", payload: e.target.value })}
              required
            />

            <input
              placeholder="Current password"
              id="input"
              type="password"
              value={state.current_password}
              onChange={(e) => dispatch({ type: "SET_CURRENT_PASSWORD", payload: e.target.value })}
            />

            <input
              placeholder="New password"
              id="input"
              type="password"
              value={state.password1}
              onChange={(e) => dispatch({ type: "SET_NEW_PASSWORD", payload: e.target.value })}
            />

            <input
              placeholder="Confirm password"
              id="input"
              type="password"
              value={state.password2}
              onChange={(e) => dispatch({ type: "SET_CONFIRM_PASSWORD", payload: e.target.value })}
            />

            <input
              placeholder="First name"
              id="input"
              type="text"
              value={state.first_name}
              onChange={(e) => dispatch({ type: "SET_FIRST_NAME", payload: e.target.value })}
              required
            />

            <input
              placeholder="Last name"
              id="input"
              type="text"
              value={state.last_name}
              onChange={(e) => dispatch({ type: "SET_LAST_NAME", payload: e.target.value })}
              required
            />

            <input
              placeholder="Address"
              id="input"
              type="text"
              value={state.address}
              onChange={(e) => dispatch({ type: "SET_ADDRESS", payload: e.target.value })}
              required
            />

            <input
              placeholder="Phone number"
              id="input"
              type="text"
              value={state.phone_no}
              onChange={(e) => dispatch({ type: "SET_PHONE_NO", payload: e.target.value })}
              required
            />

            <input
              placeholder="Credit card"
              id="input"
              type="text"
              value={state.credit_card_no}
              onChange={(e) => dispatch({ type: "SET_CREDIT_CARD", payload: e.target.value })}
              required
            />

            <input id="customerupdatebutton" type="submit" value="Update profile" />
          </form>
        </div>
      ) : (
        <p>Thank you! Your profile has been updated.</p>
      )}
    </div>
  );
}

export default CustomerProfile;
