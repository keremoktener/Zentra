import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from '../../components/customer/Sidebar';

// Mock data for appointments
const mockAppointments = [
  { 
    id: 1, 
    business: 'Style & Scissors Salon', 
    service: 'Haircut', 
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
    time: '10:00 AM', 
    status: 'confirmed',
    price: '$45.00',
    duration: '45 min',
    address: '123 Main St, Suite 101',
    businessPhone: '(555) 123-9876',
    notes: 'Please arrive 10 minutes early.'
  },
  { 
    id: 2, 
    business: 'Zen Massage Center', 
    service: 'Deep Tissue Massage', 
    date: new Date(Date.now() + 259200000).toISOString().split('T')[0], // 3 days from now
    time: '2:30 PM', 
    status: 'confirmed',
    price: '$85.00',
    duration: '60 min',
    address: '456 Wellness Ave',
    businessPhone: '(555) 456-7890',
    notes: 'Wear comfortable clothing.'
  },
  { 
    id: 3, 
    business: 'Polished Nail Studio', 
    service: 'Manicure', 
    date: new Date(Date.now() + 604800000).toISOString().split('T')[0], // 7 days from now
    time: '11:15 AM', 
    status: 'pending',
    price: '$35.00',
    duration: '30 min',
    address: '789 Beauty Blvd',
    businessPhone: '(555) 789-1234',
    notes: ''
  },
  { 
    id: 4, 
    business: 'Style & Scissors Salon', 
    service: 'Haircut & Color', 
    date: '2023-06-15', 
    time: '11:30 AM', 
    status: 'completed',
    price: '$150.00',
    duration: '120 min',
    address: '123 Main St, Suite 101',
    businessPhone: '(555) 123-9876',
    notes: 'Bring reference photos.'
  },
  { 
    id: 5, 
    business: 'BeautyGlow Spa', 
    service: 'Facial', 
    date: '2023-06-10', 
    time: '3:00 PM', 
    status: 'cancelled',
    price: '$75.00',
    duration: '60 min',
    address: '321 Glow Ave',
    businessPhone: '(555) 555-5555',
    notes: ''
  }
];

const CustomerAppointments: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('upcoming');
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    // Get user info from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }
    setLoading(false);
  }, []);

  // Filter appointments based on tab
  const filteredAppointments = mockAppointments.filter(appointment => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(appointment.date);
    appointmentDate.setHours(0, 0, 0, 0);
    
    if (activeTab === 'upcoming') {
      return (
        (appointment.status === 'confirmed' || appointment.status === 'pending') &&
        appointmentDate >= today
      );
    } else if (activeTab === 'past') {
      return (
        appointment.status === 'completed' || 
        appointment.status === 'cancelled' ||
        (appointmentDate < today && appointment.status !== 'pending')
      );
    } else if (activeTab === 'pending') {
      return appointment.status === 'pending';
    }
    
    return true;
  });

  const handleOpenDetailsModal = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleOpenCancelModal = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  const handleOpenRescheduleModal = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
  };

  const handleCancelAppointment = () => {
    // In a real app, this would call an API to cancel the appointment
    alert(`Appointment has been cancelled. Reason: ${cancelReason}`);
    setShowCancelModal(false);
    setCancelReason('');
  };

  const handleRescheduleAppointment = () => {
    // In a real app, this would call an API to reschedule the appointment
    alert('Appointment has been rescheduled.');
    setShowRescheduleModal(false);
  };

  // If loading, show loading indicator
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // If not logged in or not a customer, redirect to login
  if (!user || user.role !== 'ROLE_CUSTOMER') {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-neutral-100">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-neutral-200 px-6 py-4">
          <h1 className="heading-3">My Appointments</h1>
        </header>
        
        <div className="p-6">
          {/* Tabs Navigation */}
          <div className="mb-6">
            <div className="border-b border-neutral-200">
              <div className="flex space-x-6">
                <button 
                  className={`py-3 px-1 font-medium relative ${
                    activeTab === 'upcoming' 
                      ? 'text-primary' 
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                  onClick={() => setActiveTab('upcoming')}
                >
                  Upcoming
                  {activeTab === 'upcoming' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>
                  )}
                </button>
                <button 
                  className={`py-3 px-1 font-medium relative ${
                    activeTab === 'pending' 
                      ? 'text-primary' 
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                  onClick={() => setActiveTab('pending')}
                >
                  Pending
                  {activeTab === 'pending' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>
                  )}
                </button>
                <button 
                  className={`py-3 px-1 font-medium relative ${
                    activeTab === 'past' 
                      ? 'text-primary' 
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                  onClick={() => setActiveTab('past')}
                >
                  Past
                  {activeTab === 'past' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Appointments Grid */}
          {filteredAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredAppointments.map(appointment => (
                <div key={appointment.id} className="card">
                  <div className={`h-2 ${
                    appointment.status === 'confirmed' 
                      ? 'bg-success' 
                      : appointment.status === 'pending' 
                        ? 'bg-warning' 
                        : appointment.status === 'completed'
                          ? 'bg-info'
                          : 'bg-error'
                  }`}></div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold">{appointment.service}</h3>
                        <p className="text-sm text-neutral-600">{appointment.business}</p>
                      </div>
                      <span className={`badge ${
                        appointment.status === 'confirmed' 
                          ? 'badge-success' 
                          : appointment.status === 'pending' 
                            ? 'badge-warning' 
                            : appointment.status === 'completed'
                              ? 'badge-info'
                              : 'badge-error'
                      }`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <span className="mr-2">📅</span>
                        <span>{appointment.date} at {appointment.time}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="mr-2">⏱️</span>
                        <span>{appointment.duration}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="mr-2">💰</span>
                        <span>{appointment.price}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button 
                        className="btn btn-outline text-xs py-1 px-2 flex-1"
                        onClick={() => handleOpenDetailsModal(appointment)}
                      >
                        Details
                      </button>
                      
                      {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
                        <>
                          <button 
                            className="btn btn-outline text-xs py-1 px-2 flex-1"
                            onClick={() => handleOpenRescheduleModal(appointment)}
                          >
                            Reschedule
                          </button>
                          <button 
                            className="btn btn-outline text-error text-xs py-1 px-2 flex-1"
                            onClick={() => handleOpenCancelModal(appointment)}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-6 text-center">
              <p className="text-neutral-500 mb-4">
                {activeTab === 'upcoming' 
                  ? "You don't have any upcoming appointments." 
                  : activeTab === 'pending' 
                    ? "You don't have any pending appointments."
                    : "You don't have any past appointments."}
              </p>
              
              {activeTab === 'upcoming' && (
                <a href="/customer/book" className="btn btn-primary">Book New Appointment</a>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Appointment Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md overflow-hidden">
            <div className={`h-2 ${
              selectedAppointment.status === 'confirmed' 
                ? 'bg-success' 
                : selectedAppointment.status === 'pending' 
                  ? 'bg-warning' 
                  : selectedAppointment.status === 'completed'
                    ? 'bg-info'
                    : 'bg-error'
            }`}></div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="heading-4">{selectedAppointment.service}</h2>
                <button 
                  className="text-neutral-500 hover:text-neutral-700"
                  onClick={() => setShowDetailsModal(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-xl font-semibold">{selectedAppointment.business}</p>
                <div className="mt-4 space-y-2">
                  <div className="flex">
                    <span className="text-neutral-500 w-24">Status:</span>
                    <span className={`badge ${
                      selectedAppointment.status === 'confirmed' 
                        ? 'badge-success' 
                        : selectedAppointment.status === 'pending' 
                          ? 'badge-warning' 
                          : selectedAppointment.status === 'completed'
                            ? 'badge-info'
                            : 'badge-error'
                    }`}>
                      {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-neutral-500 w-24">Date:</span>
                    <span>{selectedAppointment.date}</span>
                  </div>
                  <div className="flex">
                    <span className="text-neutral-500 w-24">Time:</span>
                    <span>{selectedAppointment.time}</span>
                  </div>
                  <div className="flex">
                    <span className="text-neutral-500 w-24">Duration:</span>
                    <span>{selectedAppointment.duration}</span>
                  </div>
                  <div className="flex">
                    <span className="text-neutral-500 w-24">Price:</span>
                    <span>{selectedAppointment.price}</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-neutral-200 pt-4 mb-6">
                <h3 className="font-semibold mb-2">Business Information</h3>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="text-neutral-500 w-24">Address:</span>
                    <span>{selectedAppointment.address}</span>
                  </div>
                  <div className="flex">
                    <span className="text-neutral-500 w-24">Phone:</span>
                    <span>{selectedAppointment.businessPhone}</span>
                  </div>
                </div>
              </div>
              
              {selectedAppointment.notes && (
                <div className="border-t border-neutral-200 pt-4 mb-6">
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-sm">{selectedAppointment.notes}</p>
                </div>
              )}
              
              {(selectedAppointment.status === 'confirmed' || selectedAppointment.status === 'pending') && (
                <div className="flex space-x-2">
                  <button 
                    className="btn btn-outline flex-1"
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleOpenRescheduleModal(selectedAppointment);
                    }}
                  >
                    Reschedule
                  </button>
                  <button 
                    className="btn btn-error text-white flex-1"
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleOpenCancelModal(selectedAppointment);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Cancel Appointment Modal */}
      {showCancelModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="heading-4 mb-4">Cancel Appointment</h2>
            <p className="mb-4">Are you sure you want to cancel your {selectedAppointment.service} appointment at {selectedAppointment.business}?</p>
            
            <div className="mb-4">
              <label className="body-small mb-1 block">Reason for Cancellation</label>
              <select 
                className="input mb-2"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              >
                <option value="">Select a reason...</option>
                <option value="Schedule conflict">Schedule conflict</option>
                <option value="No longer needed">No longer needed</option>
                <option value="Found alternative">Found alternative</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button 
                className="btn btn-outline"
                onClick={() => setShowCancelModal(false)}
              >
                Back
              </button>
              <button 
                className="btn btn-error text-white"
                onClick={handleCancelAppointment}
                disabled={!cancelReason}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Reschedule Appointment Modal */}
      {showRescheduleModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="heading-4 mb-4">Reschedule Appointment</h2>
            <p className="mb-4">Select a new date and time for your {selectedAppointment.service} appointment at {selectedAppointment.business}.</p>
            
            <div className="mb-4">
              <label className="body-small mb-1 block">New Date</label>
              <input 
                type="date" 
                className="input mb-2"
                defaultValue={selectedAppointment.date}
              />
            </div>
            
            <div className="mb-6">
              <label className="body-small mb-1 block">New Time</label>
              <select className="input mb-2">
                <option value="">Select a time...</option>
                <option value="09:00">9:00 AM</option>
                <option value="09:30">9:30 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="10:30">10:30 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="11:30">11:30 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="12:30">12:30 PM</option>
                <option value="13:00">1:00 PM</option>
                <option value="13:30">1:30 PM</option>
                <option value="14:00">2:00 PM</option>
                <option value="14:30">2:30 PM</option>
                <option value="15:00">3:00 PM</option>
                <option value="15:30">3:30 PM</option>
                <option value="16:00">4:00 PM</option>
                <option value="16:30">4:30 PM</option>
                <option value="17:00">5:00 PM</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button 
                className="btn btn-outline"
                onClick={() => setShowRescheduleModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleRescheduleAppointment}
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerAppointments; 