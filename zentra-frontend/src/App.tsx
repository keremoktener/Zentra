import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import BusinessDashboard from './pages/business/BusinessDashboard';
import './App.css';

// Axios default configuration
import axios from 'axios';
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
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
        </Route>
        
        {/* Business routes */}
        <Route path="/business/*">
          <Route path="dashboard" element={<BusinessDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
