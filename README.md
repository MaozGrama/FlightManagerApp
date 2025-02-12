# ✈️ Flight Management System  

## 🚀 Overview  

The **Flight Management System** is a **full-stack web application** designed for **seamless flight management, airline operations, and customer bookings**. It provides **role-based access** for three key user types:  

- **Administrator**: Manages the entire system, approves airlines, and oversees flights.  
- **Airline Company**: Once approved, they can add, update, and manage flights.  
- **Customer**: Can browse available flights and purchase tickets via **Visa or PayPal**.  

The system is built using **React (TypeScript) for the frontend** and **Django REST Framework for the backend**, ensuring **security, efficiency, and scalability**.  

---

## 📌 Features  

### **🔐 Authentication & Role-Based Access**  
✔ Secure **JWT authentication** for login & session management  
✔ **Role-based dashboards** with dynamic UI updates  
✔ **Admin-controlled role assignments**  

### **👨‍✈️ Administrator Features**  
✔ Create a **superuser** via terminal  
✔ Access the **Admin Dashboard**  
✔ Approve **customer-to-airline conversions**  
✔ Manage **all users, airlines, and flights**  
✔ Oversee **transactions & system settings**  

### **✈️ Airline Company Features**  
✔ Access **Airline Dashboard** after **admin approval**  
✔ Add, update, and delete **flights**  
✔ Set **ticket prices & availability**  
✔ Track **customer bookings**  

### **🛒 Customer Features**  
✔ Register, login, and access **Customer Dashboard**  
✔ Browse **real-time updated flights**  
✔ Book flights using **Visa or PayPal**  
✔ View **purchased tickets & booking history**  

---

## 📖 Backend - How to Use 
## open up Terminal (CTRL + J) and run the following commands:
cd FlightManagementApp  
 ->  python manage.py runserver

## Frontend - How to use
# Open up a NEW Terminal (CTRL + J) and run the following commands:
cd frontend 
-> npm install -> npm start 

### **1️⃣ Administrator Setup**  
1. **Create a superuser** through the terminal:  
   ```sh
   python manage.py createsuperuser
   ```
2. Log in with the **admin credentials**.  
3. Access the **Admin Dashboard** to:  
   - View & manage users  
   - Approve customers to become **Airline Companies**  
   - Oversee **flights and transactions**  

---

### **2️⃣ Airline Company Workflow**  
1. **A customer registers as a normal user**.  
2. The **admin updates their role** to **AirlineCompany**.  
3. The Airline **logs in** and accesses the **Airline Dashboard**.  
4. Inside the dashboard, they can:  
   - **Add flights** (destination, pricing, schedule)  
   - **Update or delete flights**  
   - **Track bookings from customers**  

---

### **3️⃣ Customer Booking Process**  
1. **Register & log in** as a customer.  
2. Browse **available flights** in the **Customer Dashboard**.  
3. Select a flight & **proceed to checkout**.  
4. Choose a **payment method** (Visa/PayPal).  
5. Receive **confirmation** and view tickets in the **booking history**.  

---

## 🏗️ Tech Stack  

### **Frontend (React + TypeScript)**  
- **React Router** – Dynamic navigation  
- **Context API** – Authentication & state management  
- **CSS Modules** – Consistent styling  
- **Custom Hooks** – API calls & user interactions  

### **Backend (Django + Django REST Framework)**  
- **Django REST Framework (DRF)** – REST API  
- **JWT Authentication** – Secure login sessions  
- **PostgreSQL** – Scalable database  
- **Role-Based Permissions** – Access control enforcement  

---

## 🔗 API Endpoints  

### **Authentication**  
✔ `POST /api/register/` → Register new users  
✔ `POST /api/login/` → Authenticate users  
✔ `POST /api/logout/` → Logout and destroy session  

### **Admin APIs**  
✔ `POST /api/admin/approve_airline/{customer_id}/` → Convert customer to AirlineCompany  
✔ `DELETE /api/admin/delete_user/{id}/` → Remove a user  
✔ `GET /api/admin/users/` → View all users  

### **Airline APIs**  
✔ `POST /api/airlines/add_flight/` → Create a new flight  
✔ `PUT /api/airlines/update_flight/{id}/` → Modify flight details  
✔ `DELETE /api/airlines/delete_flight/{id}/` → Remove a flight  

### **Customer APIs**  
✔ `GET /api/flights/` → View available flights  
✔ `POST /api/customers/buy_ticket/` → Purchase a flight  
✔ `GET /api/customers/tickets/` → View purchased tickets  

---

## 🛡️ Security & Role Management  

✔ **Admin can update user roles** (Customer → Airline)  
✔ **Only airlines can manage flights**  
✔ **Customers can only book & view their own tickets**  
✔ **Unauthorized actions return `403 Forbidden`**  

---

## 💳 Payment Integration  

✔ **Visa & PayPal payments** for secure transactions  
✔ **Backend verification before confirming bookings**  
✔ **Transaction history tracking**  

---

## 🎯 Future Enhancements  

🔹 **Automated email confirmations** for bookings  
🔹 **Flight tracking API integration**  
🔹 **Discounts & promotional offers**  

---

## 🎉 Conclusion  

The **Flight Management System** provides a **structured and secure** way for airlines to manage flights, customers to book tickets, and administrators to oversee operations. With a **scalable design**, **secure authentication**, and **seamless payment integration**, it is a **powerful solution for modern airline management**. 🚀  

> **Designed for efficiency, built for security, and optimized for usability.**
