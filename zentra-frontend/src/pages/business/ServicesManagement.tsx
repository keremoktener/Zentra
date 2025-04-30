import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from '../../components/business/Sidebar';
import axios from 'axios';

interface Service {
  id?: number;
  businessId: number;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  imageUrl: string;
  active: boolean;
}

const ServicesManagement: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [businessId, setBusinessId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Service>({
    businessId: 0,
    name: '',
    description: '',
    durationMinutes: 30,
    price: 0,
    imageUrl: '',
    active: true
  });

  useEffect(() => {
    // Get user info from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        
        // Fetch the business profile for this owner
        axios.get(`/api/business-profiles/owner/${userData.id}`)
          .then(response => {
            const businessProfileId = response.data.id;
            setBusinessId(businessProfileId);
            setFormData(prev => ({ ...prev, businessId: businessProfileId }));
            
            // Fetch services for this business
            return axios.get(`/api/services/business/${businessProfileId}`);
          })
          .then(response => {
            setServices(response.data);
          })
          .catch(error => {
            console.error('Error fetching data:', error);
          })
          .finally(() => {
            setLoading(false);
          });
      } catch (e) {
        console.error('Failed to parse user data');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric inputs
    if (name === 'durationMinutes' || name === 'price') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddService = () => {
    if (!businessId) return;
    
    // Reset form
    setFormData({
      businessId,
      name: '',
      description: '',
      durationMinutes: 30,
      price: 0,
      imageUrl: '',
      active: true
    });
    
    setShowAddModal(true);
  };

  const handleEditService = (service: Service) => {
    setCurrentService(service);
    setFormData(service);
    setShowEditModal(true);
  };

  const handleToggleActive = (service: Service) => {
    if (!service.id) return;
    
    axios.patch(`/api/services/${service.id}/active?active=${!service.active}`)
      .then(response => {
        // Update local state
        setServices(prev => 
          prev.map(s => s.id === service.id ? { ...s, active: !s.active } : s)
        );
      })
      .catch(error => {
        console.error('Error toggling service active status:', error);
      });
  };

  const handleSubmit = () => {
    if (!businessId) return;
    
    if (currentService && currentService.id) {
      // Update existing service
      axios.put(`/api/services/${currentService.id}`, formData)
        .then(response => {
          setServices(prev => 
            prev.map(s => s.id === currentService.id ? response.data : s)
          );
          setShowEditModal(false);
        })
        .catch(error => {
          console.error('Error updating service:', error);
        });
    } else {
      // Create new service
      axios.post('/api/services', formData)
        .then(response => {
          setServices(prev => [...prev, response.data]);
          setShowAddModal(false);
        })
        .catch(error => {
          console.error('Error creating service:', error);
        });
    }
  };

  const handleDeleteService = (serviceId: number | undefined) => {
    if (!serviceId) return;
    
    if (window.confirm('Are you sure you want to delete this service?')) {
      axios.delete(`/api/services/${serviceId}`)
        .then(() => {
          setServices(prev => prev.filter(s => s.id !== serviceId));
        })
        .catch(error => {
          console.error('Error deleting service:', error);
        });
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // If loading, show loading indicator
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // If not logged in or not a business owner, redirect to login
  if (!user || user.role !== 'ROLE_BUSINESS_OWNER') {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-neutral-100">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-neutral-200 px-6 py-4">
          <h1 className="heading-3">Services Management</h1>
        </header>
        
        <div className="p-6">
          <div className="card p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="heading-4">Your Services</h2>
              <button className="btn btn-primary" onClick={handleAddService}>Add Service</button>
            </div>
            
            {services.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-neutral-500">No services found. Add your first service!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(service => (
                  <div 
                    key={service.id} 
                    className={`card bg-white ${!service.active ? 'opacity-75' : ''}`}
                  >
                    <div className="h-36 bg-neutral-100 relative">
                      {service.imageUrl ? (
                        <img 
                          src={service.imageUrl} 
                          alt={service.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-neutral-400">No image</div>
                        </div>
                      )}
                      
                      <div className="absolute top-2 right-2">
                        <span className={`badge ${service.active ? 'badge-success' : 'badge-neutral'}`}>
                          {service.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="heading-5 mb-1">{service.name}</h3>
                      <p className="text-sm text-neutral-600 line-clamp-2 mb-3">
                        {service.description || 'No description provided'}
                      </p>
                      
                      <div className="flex justify-between mb-4">
                        <div className="text-sm">
                          <div className="font-medium">{formatDuration(service.durationMinutes)}</div>
                          <div className="text-neutral-500">Duration</div>
                        </div>
                        <div className="text-sm text-right">
                          <div className="font-medium">{formatPrice(service.price)}</div>
                          <div className="text-neutral-500">Price</div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button 
                          className="btn btn-outline flex-1 text-xs py-1"
                          onClick={() => handleEditService(service)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-outline flex-1 text-xs py-1"
                          onClick={() => handleToggleActive(service)}
                        >
                          {service.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button 
                          className="btn btn-outline text-error text-xs py-1 px-2"
                          onClick={() => handleDeleteService(service.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg p-6">
            <h2 className="heading-4 mb-4">Add New Service</h2>
            
            <div className="space-y-4">
              <div>
                <label className="label">Service Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  className="input w-full" 
                  required 
                />
              </div>
              
              <div>
                <label className="label">Description</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  className="textarea w-full" 
                  rows={3}
                ></textarea>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Duration (minutes)</label>
                  <input 
                    type="number" 
                    name="durationMinutes" 
                    value={formData.durationMinutes} 
                    onChange={handleInputChange} 
                    className="input w-full" 
                    min="1"
                    required 
                  />
                </div>
                <div>
                  <label className="label">Price ($)</label>
                  <input 
                    type="number" 
                    name="price" 
                    value={formData.price} 
                    onChange={handleInputChange} 
                    className="input w-full" 
                    min="0"
                    step="0.01"
                    required 
                  />
                </div>
              </div>
              
              <div>
                <label className="label">Image URL</label>
                <input 
                  type="url" 
                  name="imageUrl" 
                  value={formData.imageUrl} 
                  onChange={handleInputChange} 
                  className="input w-full" 
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-6 space-x-3">
              <button 
                className="btn btn-neutral" 
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleSubmit}
                disabled={!formData.name || formData.durationMinutes <= 0}
              >
                Add Service
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Service Modal */}
      {showEditModal && currentService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg p-6">
            <h2 className="heading-4 mb-4">Edit Service</h2>
            
            <div className="space-y-4">
              <div>
                <label className="label">Service Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  className="input w-full" 
                  required 
                />
              </div>
              
              <div>
                <label className="label">Description</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  className="textarea w-full" 
                  rows={3}
                ></textarea>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Duration (minutes)</label>
                  <input 
                    type="number" 
                    name="durationMinutes" 
                    value={formData.durationMinutes} 
                    onChange={handleInputChange} 
                    className="input w-full" 
                    min="1"
                    required 
                  />
                </div>
                <div>
                  <label className="label">Price ($)</label>
                  <input 
                    type="number" 
                    name="price" 
                    value={formData.price} 
                    onChange={handleInputChange} 
                    className="input w-full" 
                    min="0"
                    step="0.01"
                    required 
                  />
                </div>
              </div>
              
              <div>
                <label className="label">Image URL</label>
                <input 
                  type="url" 
                  name="imageUrl" 
                  value={formData.imageUrl} 
                  onChange={handleInputChange} 
                  className="input w-full" 
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div>
                <label className="block mb-2 flex items-center">
                  <input 
                    type="checkbox" 
                    name="active" 
                    checked={formData.active}
                    onChange={(e) => setFormData({...formData, active: e.target.checked})}
                    className="mr-2" 
                  />
                  <span>Active</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end mt-6 space-x-3">
              <button 
                className="btn btn-neutral" 
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleSubmit}
                disabled={!formData.name || formData.durationMinutes <= 0}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesManagement; 