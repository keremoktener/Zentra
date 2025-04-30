import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from '../../components/business/Sidebar';
import axios from 'axios';

interface StaffMember {
  id?: number;
  businessId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  position: string;
  bio: string;
  photoUrl: string;
  services: Service[];
  active: boolean;
}

interface Service {
  id: number;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  imageUrl?: string;
  active: boolean;
}

const StaffManagement: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(null);
  const [businessId, setBusinessId] = useState<number | null>(null);
  const [formData, setFormData] = useState<StaffMember>({
    businessId: 0,
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    position: '',
    bio: '',
    photoUrl: '',
    services: [],
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
            setBusinessId(response.data.id);
            setFormData(prev => ({ ...prev, businessId: response.data.id }));
            
            // Fetch staff members for this business
            return axios.get(`/api/staff/business/${response.data.id}`);
          })
          .then(response => {
            setStaffMembers(response.data);
            
            // Fetch services for this business
            return axios.get(`/api/services/business/${businessId}`);
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
  }, [businessId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleServiceSelection = (e: React.ChangeEvent<HTMLInputElement>, service: Service) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      // Add service
      setFormData({
        ...formData,
        services: [...formData.services, service]
      });
    } else {
      // Remove service
      setFormData({
        ...formData,
        services: formData.services.filter(s => s.id !== service.id)
      });
    }
  };

  const handleAddStaff = () => {
    if (!businessId) return;
    
    // Reset form
    setFormData({
      businessId,
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      position: '',
      bio: '',
      photoUrl: '',
      services: [],
      active: true
    });
    
    setShowAddModal(true);
  };

  const handleEditStaff = (staff: StaffMember) => {
    setCurrentStaff(staff);
    setFormData(staff);
    setShowEditModal(true);
  };

  const handleToggleActive = (staff: StaffMember) => {
    if (!staff.id) return;
    
    axios.patch(`/api/staff/${staff.id}/active?active=${!staff.active}`)
      .then(response => {
        // Update local state
        setStaffMembers(prev => 
          prev.map(s => s.id === staff.id ? { ...s, active: !s.active } : s)
        );
      })
      .catch(error => {
        console.error('Error toggling staff active status:', error);
      });
  };

  const handleSubmit = () => {
    if (!businessId) return;
    
    if (currentStaff && currentStaff.id) {
      // Update existing staff
      axios.put(`/api/staff/${currentStaff.id}`, formData)
        .then(response => {
          setStaffMembers(prev => 
            prev.map(s => s.id === currentStaff.id ? response.data : s)
          );
          setShowEditModal(false);
        })
        .catch(error => {
          console.error('Error updating staff:', error);
        });
    } else {
      // Create new staff
      axios.post('/api/staff', formData)
        .then(response => {
          setStaffMembers(prev => [...prev, response.data]);
          setShowAddModal(false);
        })
        .catch(error => {
          console.error('Error creating staff:', error);
        });
    }
  };

  const handleDeleteStaff = (staffId: number | undefined) => {
    if (!staffId) return;
    
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      axios.delete(`/api/staff/${staffId}`)
        .then(() => {
          setStaffMembers(prev => prev.filter(s => s.id !== staffId));
        })
        .catch(error => {
          console.error('Error deleting staff:', error);
        });
    }
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
          <h1 className="heading-3">Staff Management</h1>
        </header>
        
        <div className="p-6">
          <div className="card p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="heading-4">Your Staff Team</h2>
              <button className="btn btn-primary" onClick={handleAddStaff}>Add Staff Member</button>
            </div>
            
            {staffMembers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-neutral-500">No staff members found. Add your first team member!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-neutral-50">
                      <th className="py-3 px-4 text-left">Name</th>
                      <th className="py-3 px-4 text-left">Position</th>
                      <th className="py-3 px-4 text-left">Contact</th>
                      <th className="py-3 px-4 text-left">Services</th>
                      <th className="py-3 px-4 text-left">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffMembers.map(staff => (
                      <tr key={staff.id} className="border-t border-neutral-200">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {staff.photoUrl ? (
                              <img 
                                src={staff.photoUrl} 
                                alt={`${staff.firstName} ${staff.lastName}`} 
                                className="w-10 h-10 rounded-full mr-3"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center mr-3">
                                <span className="text-primary font-medium">
                                  {staff.firstName.charAt(0)}{staff.lastName.charAt(0)}
                                </span>
                              </div>
                            )}
                            <div>
                              <div className="font-medium">{staff.firstName} {staff.lastName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{staff.position}</td>
                        <td className="py-3 px-4">
                          <div>{staff.email}</div>
                          <div className="text-sm text-neutral-500">{staff.phoneNumber}</div>
                        </td>
                        <td className="py-3 px-4">
                          {staff.services && staff.services.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {staff.services.slice(0, 3).map(service => (
                                <span key={service.id} className="badge badge-outline py-1 px-2">
                                  {service.name}
                                </span>
                              ))}
                              {staff.services.length > 3 && (
                                <span className="badge badge-outline py-1 px-2">
                                  +{staff.services.length - 3} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-neutral-400">No services assigned</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`badge ${staff.active ? 'badge-success' : 'badge-neutral'}`}>
                            {staff.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <button 
                              className="btn btn-outline text-xs py-1 px-2"
                              onClick={() => handleEditStaff(staff)}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn btn-outline text-xs py-1 px-2"
                              onClick={() => handleToggleActive(staff)}
                            >
                              {staff.active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button 
                              className="btn btn-outline text-error text-xs py-1 px-2"
                              onClick={() => handleDeleteStaff(staff.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-xl p-6">
            <h2 className="heading-4 mb-4">Add New Staff Member</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name</label>
                  <input 
                    type="text" 
                    name="firstName" 
                    value={formData.firstName} 
                    onChange={handleInputChange} 
                    className="input w-full" 
                    required 
                  />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input 
                    type="text" 
                    name="lastName" 
                    value={formData.lastName} 
                    onChange={handleInputChange} 
                    className="input w-full" 
                    required 
                  />
                </div>
              </div>
              
              <div>
                <label className="label">Position</label>
                <input 
                  type="text" 
                  name="position" 
                  value={formData.position} 
                  onChange={handleInputChange} 
                  className="input w-full" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    className="input w-full" 
                  />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input 
                    type="tel" 
                    name="phoneNumber" 
                    value={formData.phoneNumber} 
                    onChange={handleInputChange} 
                    className="input w-full" 
                  />
                </div>
              </div>
              
              <div>
                <label className="label">Bio</label>
                <textarea 
                  name="bio" 
                  value={formData.bio} 
                  onChange={handleInputChange} 
                  className="textarea w-full" 
                  rows={3}
                ></textarea>
              </div>
              
              <div>
                <label className="label">Photo URL</label>
                <input 
                  type="url" 
                  name="photoUrl" 
                  value={formData.photoUrl} 
                  onChange={handleInputChange} 
                  className="input w-full" 
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
              
              <div>
                <label className="label">Services</label>
                <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                  {services.length === 0 ? (
                    <p className="text-neutral-500 text-sm">No services available</p>
                  ) : (
                    services.map(service => (
                      <div key={service.id} className="flex items-center">
                        <input 
                          type="checkbox" 
                          id={`service-${service.id}`} 
                          checked={formData.services.some(s => s.id === service.id)}
                          onChange={(e) => handleServiceSelection(e, service)}
                          className="mr-2" 
                        />
                        <label htmlFor={`service-${service.id}`} className="flex-1">
                          {service.name} - ${service.price.toFixed(2)}
                        </label>
                      </div>
                    ))
                  )}
                </div>
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
                disabled={!formData.firstName || !formData.lastName}
              >
                Add Staff Member
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Staff Modal */}
      {showEditModal && currentStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-xl p-6">
            <h2 className="heading-4 mb-4">Edit Staff Member</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name</label>
                  <input 
                    type="text" 
                    name="firstName" 
                    value={formData.firstName} 
                    onChange={handleInputChange} 
                    className="input w-full" 
                    required 
                  />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input 
                    type="text" 
                    name="lastName" 
                    value={formData.lastName} 
                    onChange={handleInputChange} 
                    className="input w-full" 
                    required 
                  />
                </div>
              </div>
              
              <div>
                <label className="label">Position</label>
                <input 
                  type="text" 
                  name="position" 
                  value={formData.position} 
                  onChange={handleInputChange} 
                  className="input w-full" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    className="input w-full" 
                  />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input 
                    type="tel" 
                    name="phoneNumber" 
                    value={formData.phoneNumber} 
                    onChange={handleInputChange} 
                    className="input w-full" 
                  />
                </div>
              </div>
              
              <div>
                <label className="label">Bio</label>
                <textarea 
                  name="bio" 
                  value={formData.bio} 
                  onChange={handleInputChange} 
                  className="textarea w-full" 
                  rows={3}
                ></textarea>
              </div>
              
              <div>
                <label className="label">Photo URL</label>
                <input 
                  type="url" 
                  name="photoUrl" 
                  value={formData.photoUrl} 
                  onChange={handleInputChange} 
                  className="input w-full" 
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
              
              <div>
                <label className="label">Services</label>
                <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                  {services.length === 0 ? (
                    <p className="text-neutral-500 text-sm">No services available</p>
                  ) : (
                    services.map(service => (
                      <div key={service.id} className="flex items-center">
                        <input 
                          type="checkbox" 
                          id={`edit-service-${service.id}`} 
                          checked={formData.services.some(s => s.id === service.id)}
                          onChange={(e) => handleServiceSelection(e, service)}
                          className="mr-2" 
                        />
                        <label htmlFor={`edit-service-${service.id}`} className="flex-1">
                          {service.name} - ${service.price.toFixed(2)}
                        </label>
                      </div>
                    ))
                  )}
                </div>
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
                disabled={!formData.firstName || !formData.lastName}
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

export default StaffManagement; 