import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleSelection from '../components/auth/RoleSelection';
import RegisterForm from '../components/auth/RegisterForm';
import axios from 'axios';

type Role = 'ROLE_CUSTOMER' | 'ROLE_BUSINESS_OWNER';

const RegisterPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setError(null);
  };

  const handleBack = () => {
    setSelectedRole(null);
    setError(null);
  };

  const handleSubmit = async (values: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: Role;
  }) => {
    try {
      setError(null);
      const response = await axios.post('/api/auth/register', values);
      
      // Store token and user info in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.userId,
        email: response.data.email,
        role: response.data.role
      }));
      
      // Redirect based on role
      if (values.role === 'ROLE_CUSTOMER') {
        navigate('/customer/dashboard');
      } else {
        navigate('/business/dashboard');
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Registration failed. Please try again.');
      }
      console.error('Registration error:', err);
    }
  };

  return (
    <div>
      {!selectedRole ? (
        <RoleSelection onSelectRole={handleRoleSelect} />
      ) : (
        <RegisterForm 
          role={selectedRole} 
          onSubmit={handleSubmit} 
          onBack={handleBack} 
        />
      )}
    </div>
  );
};

export default RegisterPage; 