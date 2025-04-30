import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from '../../components/business/Sidebar';
import axios from 'axios';

interface Service {
  id?: number;
  businessProfileId: number;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  category: string;
  isActive: boolean;
  imageUrl?: string;
}

// Define BusinessProfile interface minimally for what we need
interface BusinessProfileInfo {
  id: number;
  // Add other fields if needed by the component, though likely just ID
}

const Services: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<number | null>(null); // Store just the ID
  const [services, setServices] = useState<Service[]>([]);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] = useState<Partial<Service>>({ // Use Partial for initial state
    name: '',
    description: '',
    price: 0,
    durationMinutes: 30,
    category: '',
    isActive: true,
    imageUrl: ''
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [profileExists, setProfileExists] = useState<boolean | null>(null); // Track profile existence

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);

        // 1. Check if a business profile exists for this owner
        axios.get<{ id: number }>(`/api/business-profiles/owner/${userData.id}`)
          .then(profileResponse => {
            // Profile exists, store the ID
            const fetchedBusinessId = profileResponse.data.id;
            console.log('Business profile found, ID:', fetchedBusinessId);
            setBusinessId(fetchedBusinessId);
            setProfileExists(true);
            
            // 2. Fetch services using the business ID
            return axios.get<Service[]>(`/api/services/business/${fetchedBusinessId}`);
          })
          .then(servicesResponse => {
            // Services fetched successfully
            console.log('Services fetched:', servicesResponse.data);
            setServices(servicesResponse.data || []);
            const uniqueCategories = Array.from(
              new Set(servicesResponse.data?.map((service: Service) => service.category).filter(Boolean) as string[] || [])
            );
            setCategories(uniqueCategories);
            setLoading(false); // Stop loading only after services are fetched
          })
          .catch(error => {
            if (error.response && error.response.status === 404) {
              // Business profile does not exist
              console.log('No business profile found on backend for this user.');
              setProfileExists(false);
            } else {
              // Other error (fetching profile or services)
              console.error('Error fetching business data:', error);
              setMessage({
                text: 'Failed to load business data. Please try again later.',
                type: 'error'
              });
            }
            setLoading(false); // Stop loading on error
          });

      } catch (e) {
        console.error('Failed to parse user data:', e);
        setLoading(false);
      }
    } else {
      console.log('No user found in localStorage');
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle number inputs
    if (type === 'number') {
      setCurrentService({
        ...currentService,
        [name]: value === '' ? '' : Number(value)
      });
    } else {
      setCurrentService({
        ...currentService,
        [name]: value
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setCurrentService({
      ...currentService,
      [name]: checked
    });
  };

  const handleNewService = () => {
    if (!businessId) { // Check if businessId is available
       setMessage({ text: 'Cannot add service without a business profile.', type: 'error' });
       return;
    }
    setIsEditing(true);
    setCurrentService({
      businessProfileId: businessId, // Use the fetched businessId
      name: '',
      description: '',
      price: 0,
      durationMinutes: 30,
      category: categories.length > 0 ? categories[0] : '',
      isActive: true,
      imageUrl: ''
    });
  };

  const handleEditService = (service: Service) => {
    setIsEditing(true);
    setCurrentService({ ...service });
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset currentService, ensure businessProfileId is handled if needed
    setCurrentService({ 
       name: '', description: '', price: 0, durationMinutes: 30, 
       category: '', isActive: true, imageUrl: '',
       businessProfileId: businessId || 0 // Assign businessId or default
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessId) { // Ensure businessId exists before submitting
      setMessage({
        text: 'Cannot save service. Business profile ID is missing.',
        type: 'error'
      });
      return;
    }
    
    // Make sure the service has the business profile ID
    const serviceToSubmit: Service = {
      ...currentService,
      businessProfileId: businessId, // Assign the correct businessId
      id: currentService.id, // Ensure ID is present if editing
      name: currentService.name || '',
      description: currentService.description || '',
      price: currentService.price || 0,
      durationMinutes: currentService.durationMinutes || 30,
      category: currentService.category || '',
      isActive: currentService.isActive === undefined ? true : currentService.isActive,
      imageUrl: currentService.imageUrl || ''
    };
    
    // Determine if this is an update or create
    const isUpdate = !!serviceToSubmit.id;
    
    // Validate required fields (adjust as needed)
    if (!serviceToSubmit.name || serviceToSubmit.price < 0 || serviceToSubmit.durationMinutes <= 0) {
      setMessage({ text: 'Please fill in all required fields (Name, Price, Duration).', type: 'error' });
      return;
    }
    
    const request = isUpdate
      ? axios.put(`/api/services/${serviceToSubmit.id}`, serviceToSubmit)
      : axios.post('/api/services', serviceToSubmit);
    
    setMessage({ text: isUpdate ? 'Updating service...' : 'Creating service...', type: 'success'});

    request
      .then(response => {
        // Update the services list
        if (isUpdate) {
          setServices(services.map(s => s.id === response.data.id ? response.data : s));
        } else {
          setServices([...services, response.data]);
        }
        
        // Update categories if needed
        if (response.data.category && !categories.includes(response.data.category)) {
          setCategories([...categories, response.data.category]);
        }
        
        setMessage({
          text: `Service ${isUpdate ? 'updated' : 'created'} successfully.`,
          type: 'success'
        });
        
        // Reset form and edit mode
        setIsEditing(false);
        setCurrentService({ // Reset fully
          businessProfileId: businessId,
          name: '', description: '', price: 0, durationMinutes: 30,
          category: '', isActive: true, imageUrl: ''
        });
        
        // Hide message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      })
      .catch(error => {
        console.error('Error saving service:', error);
        const errorMsg = error.response?.data?.message || `Failed to ${isUpdate ? 'update' : 'create'} service. Please try again.`;
        setMessage({
          text: errorMsg,
          type: 'error'
        });
      });
  };
  
  const handleToggleActive = (serviceId: number | undefined, isActive: boolean) => {
    if (!serviceId) return;
    
    axios.patch(`/api/services/${serviceId}/active`, { isActive })
      .then(response => {
        setServices(services.map(s => s.id === serviceId ? { ...s, isActive } : s));
        setMessage({
          text: `Service ${isActive ? 'activated' : 'deactivated'} successfully.`,
          type: 'success'
        });
        
        // Hide message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      })
      .catch(error => {
        console.error('Error updating service status:', error);
        setMessage({
          text: 'Failed to update service status. Please try again.',
          type: 'error'
        });
      });
  };
  
  const handleDeleteService = (serviceId: number | undefined) => {
    if (!serviceId) return;
    
    if (window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      axios.delete(`/api/services/${serviceId}`)
        .then(() => {
          setServices(services.filter(s => s.id !== serviceId));
          setMessage({
            text: 'Service deleted successfully.',
            type: 'success'
          });
          
          // Hide message after 3 seconds
          setTimeout(() => setMessage(null), 3000);
        })
        .catch(error => {
          console.error('Error deleting service:', error);
          setMessage({
            text: 'Failed to delete service. Please try again.',
            type: 'error'
          });
        });
    }
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };
  
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`;
    }
  };

  // If loading, show loading indicator
  if (loading) {
    return (
      <div className="flex h-screen bg-neutral-100">
        <Sidebar />
        <div className="flex-1 flex justify-center items-center">
          <p>Loading business data...</p>
        </div>
      </div>
    );
  }

  // If not logged in
  if (!user || user.role !== 'ROLE_BUSINESS_OWNER') {
    return <Navigate to="/login" />;
  }

  // If profile check completed and profile does NOT exist on backend
  if (profileExists === false) {
    return (
      <div className="flex h-screen bg-neutral-100">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="alert alert-error mb-6">
            <h3 className="font-bold">Backend Business Profile Missing</h3>
            <p>We couldn't find a business profile associated with your account on the server. Services cannot be managed without it.</p>
             {/* Optional: Add contact support or other guidance */}
          </div>
          {/* Removed the button to create profile as the page is deleted */}
        </div>
      </div>
    );
  }

  // If profileExists is still null, something went wrong during fetch but wasn't a 404
  if (profileExists === null && !loading) {
     return (
       <div className="flex h-screen bg-neutral-100">
         <Sidebar />
         <div className="flex-1 p-6">
           <div className="alert alert-error mb-6">
             <h3 className="font-bold">Error Loading Business Data</h3>
             <p>{message?.text || 'An unexpected error occurred while checking your business profile.'}</p>
           </div>
         </div>
       </div>
     );
  }

  // --- Main component render when profile exists --- 
  return (
    <div className="flex h-screen bg-neutral-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-neutral-200 px-6 py-4 flex justify-between items-center">
          <h1 className="heading-3">Manage Services</h1>
          {!isEditing && (
            <button 
              className="btn btn-primary"
              onClick={handleNewService}
            >
              Add New Service
            </button>
          )}
        </header>
        
        <div className="p-6">
          {message && (
            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mb-6`}>
              {message.text}
            </div>
          )}

          {/* Conditional Rendering: Show form or list */}
          {isEditing ? (
            // EDITING / ADDING FORM (will be modal later)
            <div className="card p-6">
              <h2 className="heading-4 mb-6">
                {currentService.id ? 'Edit Service' : 'Create New Service'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                {/* Form fields will go here */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="label">Service Name</label>
                    <input
                      type="text"
                      name="name"
                      className="input w-full"
                      value={currentService.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="label">Category</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="category"
                        className="input w-full"
                        value={currentService.category}
                        onChange={handleInputChange}
                        list="categories"
                        placeholder="e.g. Haircut, Massage"
                      />
                      <datalist id="categories">
                        {categories.map(cat => (
                          <option key={cat} value={cat} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="label">Description</label>
                  <textarea
                    name="description"
                    className="textarea w-full h-24"
                    value={currentService.description}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="label">Price ($)</label>
                    <input
                      type="number"
                      name="price"
                      step="0.01"
                      min="0"
                      className="input w-full"
                      value={currentService.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Duration (minutes)</label>
                    <input
                      type="number"
                      name="durationMinutes"
                      step="1"
                      min="5"
                      className="input w-full"
                      value={currentService.durationMinutes}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="label">Image URL (Optional)</label>
                  <input
                    type="url"
                    name="imageUrl" 
                    className="input w-full"
                    value={currentService.imageUrl || ''} 
                    onChange={handleInputChange}
                    placeholder="https://example.com/service.jpg"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isActive"
                      className="checkbox"
                      checked={currentService.isActive}
                      onChange={handleCheckboxChange} 
                    />
                    <span>Active (Visible to customers)</span>
                  </label>
                </div>
                
                <div className="flex justify-end gap-4">
                  <button 
                    type="button" 
                    className="btn btn-outline"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                  >
                    {currentService.id ? 'Update Service' : 'Create Service'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            // SERVICE LIST VIEW
            <div>
              {services.length === 0 ? (
                <p className="text-center text-neutral-500">You haven't added any services yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map(service => (
                    <div key={service.id} className="card bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                       {/* Service Card Content */}
                       {service.imageUrl && (
                         <img src={service.imageUrl} alt={service.name} className="w-full h-40 object-cover rounded-t-lg" />
                       )}
                       <div className="p-4">
                         <h3 className="heading-5 mb-2 truncate">{service.name}</h3>
                         <p className="text-sm text-neutral-600 mb-1">{service.category || 'Uncategorized'}</p>
                         <p className="text-sm text-neutral-600 mb-3 truncate">{service.description || 'No description'}</p>
                         <div className="flex justify-between items-center mb-3 text-sm">
                           <span className="font-medium">{formatPrice(service.price)}</span>
                           <span>{formatDuration(service.durationMinutes)}</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className={`badge ${service.isActive ? 'badge-success' : 'badge-neutral'}`}>
                              {service.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <div className="flex gap-2">
                              <button 
                                className="btn btn-xs btn-outline"
                                onClick={() => handleEditService(service)}
                              >
                                Edit
                              </button>
                              <button 
                                className="btn btn-xs btn-error btn-outline"
                                onClick={() => handleDeleteService(service.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                       </div>
                     </div>
                  ))}
                 </div>
              )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Services; 