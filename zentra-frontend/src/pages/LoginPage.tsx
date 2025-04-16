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
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.userId,
        email: response.data.email,
        role: response.data.role
      }));
      
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