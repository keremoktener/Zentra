import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerAppointments from './pages/customer/CustomerAppointments';
import CustomerBooking from './pages/customer/CustomerBooking';
import CustomerFavorites from './pages/customer/CustomerFavorites';
import BusinessDashboard from './pages/business/BusinessDashboard';
import AppointmentsPage from './pages/business/AppointmentsPage';
import CustomersPage from './pages/business/CustomersPage';
import StaffManagement from './pages/business/StaffManagement';
import BusinessAnalytics from './pages/business/BusinessAnalytics';
import Availability from './pages/business/Availability';
import Services from './pages/business/Services';
import ServicesManagement from './pages/business/ServicesManagement';
import BusinessProfileManagement from './pages/business/BusinessProfileManagement';
import './App.css';

// Axios default configuration
import axios from 'axios';

// Add response interceptor for debugging
axios.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    console.error('Axios Global Error Interceptor:', error);
    
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
      console.error('Response Headers:', error.response.headers);
      
      // Handle authentication errors globally
      if (error.response.status === 401 || error.response.status === 403) {
        console.log('Global Auth Error - You might need to login again');
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Request interceptor for adding auth token
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (token) {
      // Always add the Bearer prefix to the token (since we store raw tokens)
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Log outgoing requests for debugging
    console.log(`Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  error => {
    console.error('Request setup error:', error);
    return Promise.reject(error);
  }
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes with layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="*" element={<div className="p-8 text-center"><h2 className="text-2xl">Page Not Found</h2></div>} />
        </Route>
        
        {/* Customer routes */}
        <Route path="/customer/*">
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="appointments" element={<CustomerAppointments />} />
          <Route path="book" element={<CustomerBooking />} />
          <Route path="favorites" element={<CustomerFavorites />} />
        </Route>
        
        {/* Business routes */}
        <Route path="/business/*">
          <Route path="dashboard" element={<BusinessDashboard />} />
          <Route path="profile" element={<BusinessProfileManagement />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="analytics" element={<BusinessAnalytics />} />
          <Route path="availability" element={<Availability />} />
          <Route path="services" element={<Services />} />
          <Route path="services-management" element={<ServicesManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
