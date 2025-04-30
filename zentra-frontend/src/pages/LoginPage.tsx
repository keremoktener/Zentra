import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import axios from 'axios';

const LoginPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      setError(null);
      const response = await axios.post('/api/auth/login', values);
      
      // Store token and user info in localStorage
      // Store just the raw token WITHOUT Bearer prefix
      const token = response.data.token;
      const rawToken = token.startsWith('Bearer ') ? token.substring(7) : token;
      
      // Store tokens in both formats - RAW TOKEN (no Bearer prefix)
      localStorage.setItem('token', rawToken);
      localStorage.setItem('authToken', rawToken);
      
      // Store user info in both formats for compatibility
      const userInfo = {
        id: response.data.userId,
        email: response.data.email,
        role: response.data.role
      };
      localStorage.setItem('user', JSON.stringify(userInfo));
      localStorage.setItem('authUser', JSON.stringify(userInfo));
      
      console.log('Login successful, stored RAW token without Bearer prefix');
      
      // Redirect based on role
      if (response.data.role === 'ROLE_CUSTOMER') {
        navigate('/customer/dashboard');
      } else if (response.data.role === 'ROLE_BUSINESS_OWNER') {
        navigate('/business/dashboard');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
      console.error('Login error:', err);
    }
  };

  return (
    <div>
      <LoginForm onSubmit={handleSubmit} error={error || undefined} />
    </div>
  );
};

export default LoginPage; 