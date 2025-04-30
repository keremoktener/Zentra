import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faPlus, faTrash, faEdit, faCamera, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../../components/business/Sidebar';

// Define the Business Profile interface
interface BusinessProfile {
  id?: number;
  ownerId: number;
  businessName: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  website: string;
  logoUrl: string;
  active: boolean;
}

// Define the Service interface
interface Service {
  id?: number;
  businessId: number;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  imageUrl: string;
  active: boolean;
}

const BusinessProfileManagement: React.FC = () => {
  const navigate = useNavigate();
  
  // User and loading state
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Business profile state
  const [profileExists, setProfileExists] = useState(false);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({
    ownerId: 0,
    businessName: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phoneNumber: '',
    website: '',
    logoUrl: '',
    active: true
  });
  
  // Services state
  const [services, setServices] = useState<Service[]>([]);
  const [currentService, setCurrentService] = useState<Service>({
    businessId: 0,
    name: '',
    description: '',
    price: 0,
    durationMinutes: 30,
    imageUrl: '',
    active: true
  });
  
  // UI state
  const [activeTab, setActiveTab] = useState('profile');
  const [editingService, setEditingService] = useState<number | null>(null);
  const [saveMessage, setSaveMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [isServiceImageUploading, setIsServiceImageUploading] = useState(false);
  
  // Load user data and profile on component mount
  useEffect(() => {
    // Get token and user info from localStorage
    const userInfo = localStorage.getItem('user') || localStorage.getItem('authUser');
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    
    console.log('Auth check:', { 
      hasUserInfo: !!userInfo, 
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 15)}...` : null
    });
    
    if (!token) {
      console.log('No token found, redirecting to login');
      navigate('/login');
      return;
    }
    
    if (userInfo) {
      try {
        const userData = JSON.parse(userInfo);
        console.log('User data:', userData);
        
        if (userData.role !== 'ROLE_BUSINESS_OWNER') {
          console.log('User is not a business owner, redirecting to login');
          navigate('/login');
          return;
        }
        
        // Try a direct API call to verify token is working
        const authHeader = `Bearer ${token}`;
        axios.get('/api/business-profiles/validate-token', {
          headers: {
            'Authorization': authHeader
          }
        })
        .then(response => {
          console.log('Token validation successful:', response.data);
          // Set user data and continue with profile fetch
          setUser(userData);
          fetchBusinessProfile();
        })
        .catch(error => {
          console.error('Token validation failed:', error);
          
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.log('Authentication error in token validation, redirecting to login');
            // Clear invalid tokens
            localStorage.removeItem('token');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            localStorage.removeItem('authUser');
            navigate('/login');
          } else {
            // Continue despite error since it might be that the validation endpoint doesn't exist
            console.log('Continuing with profile fetch despite validation error');
            setUser(userData);
            fetchBusinessProfile();
          }
        });
      } catch (e) {
        console.error('Failed to parse user data', e);
        navigate('/login');
      }
    } else {
      console.log('No user info found, redirecting to login');
      navigate('/login');
    }
  }, [navigate]);
  
  // Helper function for making API calls with better error logging
  const apiCall = async <T = any>(
    method: string, 
    url: string, 
    data?: any, 
    retryCount = 0
  ): Promise<{ data: T } | null> => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) {
      console.log('No token for API call, redirecting to login');
      navigate('/login');
      return null;
    }
    
    // Don't add Bearer prefix here since axios interceptor already does it
    console.log(`Making ${method} request to ${url} with token`);
    
    const config = {
      headers: { 
        // No need to set Authorization header as the interceptor will handle it
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    
    try {
      let response;
      
      if (method === 'GET') {
        response = await axios.get(url, config);
      } else if (method === 'POST') {
        response = await axios.post(url, data, config);
      } else if (method === 'PUT') {
        response = await axios.put(url, data, config);
      } else if (method === 'DELETE') {
        response = await axios.delete(url, config);
      } else {
        throw new Error(`Unsupported method: ${method}`);
      }
      
      console.log(`${method} ${url} response:`, response.data);
      return response;
    } catch (error: any) {
      console.error(`Error in ${method} ${url}:`, error);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        
        if (error.response.status === 401 || error.response.status === 403) {
          console.log('Authentication error, redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          localStorage.removeItem('authUser');
          navigate('/login');
        }
      }
      
      throw error;
    }
  };
  
  // Fetch business profile data
  const fetchBusinessProfile = async () => {
    setLoading(true);
    
    try {
      // Get token and user ID from localStorage - check both storage methods
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const userJson = localStorage.getItem('user') || localStorage.getItem('authUser');
      
      console.log('fetchBusinessProfile - auth:', { 
        hasToken: !!token, 
        hasUserJson: !!userJson 
      });
      
      if (!token || !userJson) {
        console.log('No token or user data in fetchBusinessProfile, redirecting to login');
        setSaveMessage({
          text: 'Please log in to access your business profile',
          type: 'error'
        });
        navigate('/login');
        return;
      }
      
      const user = JSON.parse(userJson);
      console.log('User from localStorage:', user);
      
      // First check if user already has a profile
      console.log('Checking if user has profile:', `/api/business-profiles/has-profile/${user.id}`);
      const hasProfileResponse = await apiCall<boolean>('GET', `/api/business-profiles/has-profile/${user.id}`);
      
      if (!hasProfileResponse) {
        console.log('Failed to check if user has profile');
        setSaveMessage({
          text: 'Failed to check profile status. Please try again.',
          type: 'error'
        });
        setLoading(false);
        return;
      }
      
      console.log('Has profile response:', hasProfileResponse.data);
      
      if (hasProfileResponse.data === true) {
        // If user has a profile, fetch it
        console.log('Fetching existing profile');
        const profileResponse = await apiCall<BusinessProfile>('GET', `/api/business-profiles/owner/${user.id}`);
        
        if (!profileResponse) {
          console.log('Failed to fetch profile data');
          setSaveMessage({
            text: 'Failed to load your business profile. Please try again.',
            type: 'error'
          });
          setLoading(false);
          return;
        }
        
        console.log('Profile data:', profileResponse.data);
        setBusinessProfile(profileResponse.data);
        setProfileExists(true);
        
        // Fetch services for this business profile
        if (profileResponse.data.id) {
          console.log('Fetching services for business ID:', profileResponse.data.id);
          const servicesResponse = await apiCall<Service[]>('GET', `/api/services/business/${profileResponse.data.id}`);
          
          if (servicesResponse) {
            console.log('Services data:', servicesResponse.data);
            setServices(servicesResponse.data);
          } else {
            console.log('Failed to fetch services');
            setServices([]);
          }
        }
      } else {
        // Initialize with empty profile connected to the user
        console.log('Creating new profile for user ID:', user.id);
        setBusinessProfile({
          ownerId: user.id,
          businessName: '',
          description: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          phoneNumber: '',
          website: '',
          logoUrl: '',
          active: true
        });
        setProfileExists(false);
        setServices([]);
      }
      
      // Clear any error messages if successful
      setSaveMessage(null);
      
    } catch (error: any) {
      console.error('Error fetching business profile:', error);
      let errorMsg = 'Failed to load business profile';
      
      if (error.response) {
        console.log('Error response status:', error.response.status);
        console.log('Error response data:', error.response.data);
        
        if (error.response.status === 401) {
          errorMsg = 'Authentication failed. Please login again.';
          // Clear auth data and redirect
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          localStorage.removeItem('authUser');
          navigate('/login');
        } else if (error.response.status === 403) {
          errorMsg = 'You do not have permission to access this profile. Please login again.';
          navigate('/login');
        } else if (error.response.status === 404) {
          errorMsg = 'Profile not found.';
        } else if (error.response.data && error.response.data.message) {
          errorMsg = error.response.data.message;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMsg = 'Cannot connect to server. Please check your internet connection.';
      } else {
        // Something happened in setting up the request
        errorMsg = 'An unexpected error occurred. Please try again.';
      }
      
      setSaveMessage({
        text: errorMsg,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle profile form input changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBusinessProfile(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle service form input changes
  const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedValue = name === 'price' || name === 'durationMinutes' 
      ? parseFloat(value) 
      : value;
    
    if (editingService !== null) {
      // We're editing an existing service
      setServices(prev => 
        prev.map((service, index) => 
          index === editingService ? { ...service, [name]: updatedValue } : service
        )
      );
    } else {
      // We're creating a new service
      setCurrentService(prev => ({ ...prev, [name]: updatedValue }));
    }
  };
  
  // Save business profile
  const saveBusinessProfile = async () => {
    try {
      // Validate required fields
      if (!businessProfile.businessName || !businessProfile.phoneNumber || !businessProfile.address || !businessProfile.city || !businessProfile.state || !businessProfile.zipCode) {
        setSaveMessage({
          text: 'Business name, phone, address, city, state, and zip code are required',
          type: 'error'
        });
        return;
      }
      
      let apiResponse: { data: BusinessProfile } | null;
      
      if (businessProfile.id) {
        // Update existing profile
        apiResponse = await apiCall<BusinessProfile>('PUT', `/api/business-profiles/${businessProfile.id}`, businessProfile);
      } else {
        // Create new profile
        apiResponse = await apiCall<BusinessProfile>('POST', '/api/business-profiles', businessProfile);
      }
      
      if (!apiResponse) {
        setSaveMessage({
          text: 'Failed to save business profile',
          type: 'error'
        });
        return;
      }
      
      setBusinessProfile(apiResponse.data);
      
      // Update current service with the new business ID
      setCurrentService(prev => ({
        ...prev,
        businessId: apiResponse.data.id || 0
      }));
      
      setSaveMessage({
        text: 'Business profile saved successfully',
        type: 'success'
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error: any) {
      console.error('Error saving business profile:', error);
      let errorMsg = 'Failed to save business profile';
      if (error.response) {
        if (error.response.status === 403) {
          errorMsg = 'You do not have permission to save this profile. Please login again.';
          navigate('/login');
        } else if (error.response.status === 400) {
          errorMsg = 'Invalid data. Please check your inputs.';
        } else if (error.response.data && error.response.data.message) {
          errorMsg = error.response.data.message;
        }
      }
      setSaveMessage({
        text: errorMsg,
        type: 'error'
      });
    }
  };
  
  // Add a new service
  const addService = async () => {
    try {
      if (!businessProfile.id) {
        setSaveMessage({
          text: 'Please save your business profile first',
          type: 'error'
        });
        return;
      }
      
      // Validate required fields
      if (!currentService.name || currentService.price <= 0 || currentService.durationMinutes <= 0) {
        setSaveMessage({
          text: 'Service name, price, and duration are required',
          type: 'error'
        });
        return;
      }
      
      // Make sure businessId is set
      const serviceToAdd = {
        ...currentService,
        businessId: businessProfile.id
      };
      
      const apiResponse = await apiCall<Service>('POST', '/api/services', serviceToAdd);
      
      if (!apiResponse) {
        setSaveMessage({
          text: 'Failed to add service',
          type: 'error'
        });
        return;
      }
      
      setServices(prev => [...prev, apiResponse.data]);
      
      // Reset current service form
      setCurrentService({
        businessId: businessProfile.id,
        name: '',
        description: '',
        price: 0,
        durationMinutes: 30,
        imageUrl: '',
        active: true
      });
      
      setSaveMessage({
        text: 'Service added successfully',
        type: 'success'
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error: any) {
      console.error('Error adding service:', error);
      let errorMsg = 'Failed to add service';
      if (error.response) {
        if (error.response.status === 403) {
          errorMsg = 'You do not have permission to add services. Please login again.';
          navigate('/login');
        } else if (error.response.status === 400) {
          errorMsg = 'Invalid service data. Please check your inputs.';
        } else if (error.response.data && error.response.data.message) {
          errorMsg = error.response.data.message;
        }
      }
      setSaveMessage({
        text: errorMsg,
        type: 'error'
      });
    }
  };
  
  // Start editing a service
  const startEditingService = (index: number) => {
    setEditingService(index);
  };
  
  // Save edited service
  const saveEditedService = async (index: number) => {
    try {
      const serviceToUpdate = services[index];
      
      if (!serviceToUpdate.id) {
        setSaveMessage({
          text: 'Cannot update service without ID',
          type: 'error'
        });
        return;
      }
      
      // Validate required fields
      if (!serviceToUpdate.name || serviceToUpdate.price <= 0 || serviceToUpdate.durationMinutes <= 0) {
        setSaveMessage({
          text: 'Service name, price, and duration are required',
          type: 'error'
        });
        return;
      }
      
      const apiResponse = await apiCall<Service>('PUT', `/api/services/${serviceToUpdate.id}`, serviceToUpdate);
      
      if (!apiResponse) {
        setSaveMessage({
          text: 'Failed to update service',
          type: 'error'
        });
        return;
      }
      
      // Update services array with the response
      setServices(prev => 
        prev.map((service, i) => i === index ? apiResponse.data : service)
      );
      
      // Exit editing mode
      setEditingService(null);
      
      setSaveMessage({
        text: 'Service updated successfully',
        type: 'success'
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error: any) {
      console.error('Error updating service:', error);
      let errorMsg = 'Failed to update service';
      if (error.response) {
        if (error.response.status === 403) {
          errorMsg = 'You do not have permission to update services. Please login again.';
          navigate('/login');
        } else if (error.response.status === 400) {
          errorMsg = 'Invalid service data. Please check your inputs.';
        } else if (error.response.data && error.response.data.message) {
          errorMsg = error.response.data.message;
        }
      }
      setSaveMessage({
        text: errorMsg,
        type: 'error'
      });
    }
  };
  
  // Delete a service
  const deleteService = async (serviceId: number | undefined, index: number) => {
    if (!serviceId) return;
    
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }
    
    try {
      const deleteResponse = await apiCall<any>('DELETE', `/api/services/${serviceId}`);
      
      if (!deleteResponse) {
        setSaveMessage({
          text: 'Failed to delete service',
          type: 'error'
        });
        return;
      }
      
      // Remove from services array
      setServices(prev => prev.filter((_, i) => i !== index));
      
      setSaveMessage({
        text: 'Service deleted successfully',
        type: 'success'
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error: any) {
      console.error('Error deleting service:', error);
      let errorMsg = 'Failed to delete service';
      if (error.response) {
        if (error.response.status === 403) {
          errorMsg = 'You do not have permission to delete services. Please login again.';
          navigate('/login');
        } else if (error.response.data && error.response.data.message) {
          errorMsg = error.response.data.message;
        }
      }
      setSaveMessage({
        text: errorMsg,
        type: 'error'
      });
    }
  };
  
  // Cancel editing a service
  const cancelEditingService = () => {
    setEditingService(null);
  };
  
  // Upload business logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    setIsLogoUploading(true);
    
    try {
      // This is a placeholder - you would need to implement the file upload API endpoint
      // For now, we'll simulate a successful upload with a timeout
      setTimeout(() => {
        // Simulate a successful upload with a random URL
        const logoUrl = `https://example.com/logos/${Date.now()}_${file.name}`;
        setBusinessProfile(prev => ({ ...prev, logoUrl }));
        setIsLogoUploading(false);
      }, 1500);
      
      // In a real implementation, you would do something like:
      // const response = await axios.post('/api/upload/logo', formData);
      // setBusinessProfile(prev => ({ ...prev, logoUrl: response.data.url }));
    } catch (error) {
      console.error('Error uploading logo:', error);
      setIsLogoUploading(false);
      setSaveMessage({
        text: 'Failed to upload logo',
        type: 'error'
      });
    }
  };
  
  // Upload service image
  const handleServiceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, serviceIndex?: number) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    setIsServiceImageUploading(true);
    
    try {
      // This is a placeholder - you would need to implement the file upload API endpoint
      // For now, we'll simulate a successful upload with a timeout
      setTimeout(() => {
        // Simulate a successful upload with a random URL
        const imageUrl = `https://example.com/services/${Date.now()}_${file.name}`;
        
        if (serviceIndex !== undefined) {
          // Update existing service
          setServices(prev => 
            prev.map((service, index) => 
              index === serviceIndex ? { ...service, imageUrl } : service
            )
          );
        } else {
          // Update current service
          setCurrentService(prev => ({ ...prev, imageUrl }));
        }
        
        setIsServiceImageUploading(false);
      }, 1500);
      
      // In a real implementation, you would do something like:
      // const response = await axios.post('/api/upload/service-image', formData);
      // const imageUrl = response.data.url;
    } catch (error) {
      console.error('Error uploading service image:', error);
      setIsServiceImageUploading(false);
      setSaveMessage({
        text: 'Failed to upload service image',
        type: 'error'
      });
    }
  };
  
  // Render loading state
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  // Manual retry function if error occurs
  const handleManualRetry = () => {
    console.log('Manual retry attempt initiated');
    
    // Clear existing tokens
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    
    // Try to redirect to dashboard first, then back to profile as a refresh strategy
    navigate('/business/dashboard', { replace: true });
    setTimeout(() => {
      navigate('/business/profile', { replace: true });
    }, 500);
  };
  
  // Render error state with retry option
  if (saveMessage && saveMessage.type === 'error' && !profileExists) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6 max-w-md text-center">
          {saveMessage.text}
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={handleManualRetry}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  
  // Main render
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="py-6 px-8">
          <h1 className="text-2xl font-semibold mb-6">Business Profile Management</h1>
          
          {/* Alert messages */}
          {saveMessage && (
            <div className={`mb-4 p-3 rounded ${saveMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {saveMessage.text}
            </div>
          )}
          
          {/* Tab navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Basic Information
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'services'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Services
              </button>
            </nav>
          </div>
          
          {/* Profile information tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-medium mb-4">Business Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Business name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      value={businessProfile.businessName}
                      onChange={handleProfileChange}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  {/* Phone number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={businessProfile.phoneNumber}
                      onChange={handleProfileChange}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  {/* Website */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={businessProfile.website}
                      onChange={handleProfileChange}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* Logo upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Logo
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                        {businessProfile.logoUrl ? (
                          <img 
                            src={businessProfile.logoUrl} 
                            alt="Business Logo" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FontAwesomeIcon icon={faCamera} className="text-gray-400 text-2xl" />
                        )}
                      </div>
                      <div>
                        <input 
                          type="file" 
                          id="logoUpload" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleLogoUpload}
                        />
                        <label 
                          htmlFor="logoUpload"
                          className="px-4 py-2 bg-gray-200 rounded cursor-pointer hover:bg-gray-300 inline-block"
                        >
                          {isLogoUploading ? 'Uploading...' : 'Upload Logo'}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={businessProfile.description}
                    onChange={handleProfileChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={businessProfile.address}
                      onChange={handleProfileChange}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={businessProfile.city}
                      onChange={handleProfileChange}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  {/* State */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={businessProfile.state}
                      onChange={handleProfileChange}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  {/* Zip Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zip Code *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={businessProfile.zipCode}
                      onChange={handleProfileChange}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={saveBusinessProfile}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                  >
                    <FontAwesomeIcon icon={faSave} className="mr-2" />
                    Save Profile
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Services tab */}
          {activeTab === 'services' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-medium mb-4">Manage Services</h2>
                
                {/* Services list */}
                {services.length > 0 ? (
                  <div className="mb-8">
                    <h3 className="text-md font-medium mb-3">Your Services</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Service
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Duration
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {services.map((service, index) => (
                            <tr key={service.id || index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {editingService === index ? (
                                  <input
                                    type="text"
                                    name="name"
                                    value={service.name}
                                    onChange={handleServiceChange}
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                ) : (
                                  <div className="flex items-center">
                                    {service.imageUrl && (
                                      <div className="flex-shrink-0 h-10 w-10 mr-3">
                                        <img
                                          className="h-10 w-10 rounded-full object-cover"
                                          src={service.imageUrl}
                                          alt={service.name}
                                        />
                                      </div>
                                    )}
                                    <div>
                                      <div className="font-medium text-gray-900">{service.name}</div>
                                      <div className="text-gray-500 text-sm">{service.description}</div>
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {editingService === index ? (
                                  <input
                                    type="number"
                                    name="durationMinutes"
                                    value={service.durationMinutes}
                                    onChange={handleServiceChange}
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                ) : (
                                  <span className="text-gray-900">{service.durationMinutes} min</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {editingService === index ? (
                                  <input
                                    type="number"
                                    name="price"
                                    value={service.price}
                                    onChange={handleServiceChange}
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                ) : (
                                  <span className="text-gray-900">${service.price}</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {editingService === index ? (
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => saveEditedService(index)}
                                      className="text-blue-600 hover:text-blue-900"
                                    >
                                      <FontAwesomeIcon icon={faCheck} />
                                    </button>
                                    <button
                                      onClick={cancelEditingService}
                                      className="text-red-600 hover:text-red-900"
                                    >
                                      <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex space-x-3">
                                    <button
                                      onClick={() => startEditingService(index)}
                                      className="text-blue-600 hover:text-blue-900"
                                    >
                                      <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                    <button
                                      onClick={() => deleteService(service.id, index)}
                                      className="text-red-600 hover:text-red-900"
                                    >
                                      <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6 mb-8 text-center">
                    <p className="text-gray-500">You haven't added any services yet.</p>
                  </div>
                )}
                
                {/* Add new service form */}
                <div className="border rounded-lg p-6">
                  <h3 className="text-md font-medium mb-4">Add New Service</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Service name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Service Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={currentService.name}
                        onChange={handleServiceChange}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    {/* Service image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Service Image
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                          {currentService.imageUrl ? (
                            <img 
                              src={currentService.imageUrl} 
                              alt="Service" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FontAwesomeIcon icon={faCamera} className="text-gray-400 text-2xl" />
                          )}
                        </div>
                        <div>
                          <input 
                            type="file" 
                            id="serviceImageUpload" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleServiceImageUpload}
                          />
                          <label 
                            htmlFor="serviceImageUpload"
                            className="px-4 py-2 bg-gray-200 rounded cursor-pointer hover:bg-gray-300 inline-block"
                          >
                            {isServiceImageUploading ? 'Uploading...' : 'Upload Image'}
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price ($) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={currentService.price}
                        onChange={handleServiceChange}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    
                    {/* Duration */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration (minutes) *
                      </label>
                      <input
                        type="number"
                        name="durationMinutes"
                        value={currentService.durationMinutes}
                        onChange={handleServiceChange}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={currentService.description}
                      onChange={handleServiceChange}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <button
                      onClick={addService}
                      className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                      disabled={!profileExists}
                    >
                      <FontAwesomeIcon icon={faPlus} className="mr-2" />
                      Add Service
                    </button>
                    {!profileExists && (
                      <p className="text-sm text-red-500 mt-2">
                        Please save your business profile first before adding services.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessProfileManagement; 