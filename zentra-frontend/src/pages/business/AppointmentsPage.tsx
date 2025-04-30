import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from '../../components/business/Sidebar';

// Extended mock data for development
const mockAppointments = [
  { 
    id: 1, 
    customer: 'Jane Smith', 
    email: 'jane.smith@example.com',
    phone: '(555) 123-4567',
    service: 'Haircut', 
    time: '10:00 AM', 
    date: '2023-06-15', 
    duration: '45 min',
    price: '$45.00',
    status: 'completed',
    notes: 'Regular customer, prefers minimal small talk' 
  },
  { 
    id: 2, 
    customer: 'John Doe', 
    email: 'john.doe@example.com',
    phone: '(555) 987-6543',
    service: 'Beard Trim', 
    time: '11:30 AM', 
    date: '2023-06-15', 
    duration: '30 min',
    price: '$25.00',
    status: 'completed',
    notes: 'First-time customer' 
  },
  { 
    id: 3, 
    customer: 'Alice Johnson', 
    email: 'alice.j@example.com',
    phone: '(555) 321-7654',
    service: 'Manicure', 
    time: '2:00 PM', 
    date: new Date().toISOString().split('T')[0], 
    duration: '60 min',
    price: '$35.00',
    status: 'confirmed',
    notes: 'Allergic to certain nail polishes' 
  },
  { 
    id: 4, 
    customer: 'Bob Brown', 
    email: 'bob.brown@example.com',
    phone: '(555) 789-0123',
    service: 'Massage', 
    time: '4:30 PM', 
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
    duration: '90 min',
    price: '$120.00',
    status: 'confirmed',
    notes: 'Has back problems, prefers medium pressure' 
  },
  { 
    id: 5, 
    customer: 'Carol White', 
    email: 'carol.w@example.com',
    phone: '(555) 456-7890',
    service: 'Facial', 
    time: '1:00 PM', 
    date: new Date(Date.now() + 172800000).toISOString().split('T')[0], // day after tomorrow
    duration: '60 min',
    price: '$75.00',
    status: 'pending',
    notes: 'Sensitive skin' 
  },
  { 
    id: 6, 
    customer: 'David Miller', 
    email: 'david.m@example.com',
    phone: '(555) 234-5678',
    service: 'Haircut & Color', 
    time: '11:00 AM', 
    date: new Date(Date.now() + 259200000).toISOString().split('T')[0], // 3 days from now
    duration: '120 min',
    price: '$150.00',
    status: 'confirmed',
    notes: 'Bring reference photos' 
  },
  { 
    id: 7, 
    customer: 'Eva Garcia', 
    email: 'eva.g@example.com',
    phone: '(555) 876-5432',
    service: 'Deep Tissue Massage', 
    time: '3:30 PM', 
    date: new Date(Date.now() + 345600000).toISOString().split('T')[0], // 4 days from now
    duration: '60 min',
    price: '$95.00',
    status: 'confirmed',
    notes: '' 
  },
  { 
    id: 8, 
    customer: 'Frank Johnson', 
    email: 'frank.j@example.com',
    phone: '(555) 345-6789',
    service: 'Men\'s Haircut', 
    time: '5:30 PM', 
    date: '2023-06-10', 
    duration: '30 min',
    price: '$35.00',
    status: 'cancelled',
    notes: 'Cancelled due to illness' 
  },
];

// Service options for filter
const serviceOptions = [
  'All Services',
  'Haircut',
  'Beard Trim',
  'Manicure',
  'Massage',
  'Facial',
  'Haircut & Color',
  'Deep Tissue Massage',
  'Men\'s Haircut'
];

// Status options for filter
const statusOptions = [
  'All Statuses',
  'confirmed',
  'pending',
  'completed',
  'cancelled'
];

const AppointmentsPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  // Filter states
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'upcoming', 'past'
  const [serviceFilter, setServiceFilter] = useState('All Services');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');
  const [showDateRange, setShowDateRange] = useState(false);

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

  // Filter appointments based on filter criteria
  const filteredAppointments = mockAppointments.filter(appointment => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(appointment.date);
    appointmentDate.setHours(0, 0, 0, 0);
    
    // Date filter
    if (dateFilter === 'upcoming' && appointmentDate < today) return false;
    if (dateFilter === 'past' && appointmentDate >= today) return false;
    
    // Date range filter
    if (showDateRange && dateRangeStart && dateRangeEnd) {
      const startDate = new Date(dateRangeStart);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(dateRangeEnd);
      endDate.setHours(23, 59, 59, 999);
      
      if (appointmentDate < startDate || appointmentDate > endDate) return false;
    }
    
    // Service filter
    if (serviceFilter !== 'All Services' && appointment.service !== serviceFilter) return false;
    
    // Status filter
    if (statusFilter !== 'All Statuses' && appointment.status !== statusFilter) return false;
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        appointment.customer.toLowerCase().includes(query) ||
        appointment.email.toLowerCase().includes(query) ||
        appointment.service.toLowerCase().includes(query) ||
        appointment.phone.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  const handleViewDetails = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsDetailsModalOpen(true);
  };

  const handleReschedule = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsRescheduleModalOpen(true);
  };

  const handleCancelAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsCancelModalOpen(true);
  };

  const confirmCancelAppointment = () => {
    // In a real app, this would call an API to cancel the appointment
    alert(`Appointment for ${selectedAppointment.customer} has been cancelled.`);
    setIsCancelModalOpen(false);
  };

  const confirmRescheduleAppointment = () => {
    // In a real app, this would call an API to reschedule the appointment
    alert(`Appointment for ${selectedAppointment.customer} has been rescheduled.`);
    setIsRescheduleModalOpen(false);
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
          <h1 className="heading-3">Appointments</h1>
        </header>
        
        <div className="p-6">
          {/* Filters */}
          <div className="card p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="body-small mb-1 block">Date Range</label>
                <select 
                  className="input"
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    if (e.target.value === 'custom') {
                      setShowDateRange(true);
                    } else {
                      setShowDateRange(false);
                    }
                  }}
                >
                  <option value="all">All Dates</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              
              <div>
                <label className="body-small mb-1 block">Service</label>
                <select 
                  className="input"
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                >
                  {serviceOptions.map(service => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="body-small mb-1 block">Status</label>
                <select 
                  className="input"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status === 'All Statuses' ? status : status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="body-small mb-1 block">Search</label>
                <input 
                  type="text" 
                  placeholder="Search customer, email..." 
                  className="input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {showDateRange && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="body-small mb-1 block">Start Date</label>
                  <input 
                    type="date" 
                    className="input"
                    value={dateRangeStart}
                    onChange={(e) => setDateRangeStart(e.target.value)}
                  />
                </div>
                <div>
                  <label className="body-small mb-1 block">End Date</label>
                  <input 
                    type="date" 
                    className="input"
                    value={dateRangeEnd}
                    onChange={(e) => setDateRangeEnd(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Appointments Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-100">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Customer</th>
                    <th className="text-left py-3 px-4 font-semibold">Service</th>
                    <th className="text-left py-3 px-4 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 font-semibold">Time</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-right py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.length > 0 ? (
                    filteredAppointments.map((appointment) => (
                      <tr key={appointment.id} className="border-t border-neutral-200">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{appointment.customer}</div>
                            <div className="text-xs text-neutral-500">{appointment.email}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{appointment.service}</td>
                        <td className="py-3 px-4">{appointment.date}</td>
                        <td className="py-3 px-4">{appointment.time}</td>
                        <td className="py-3 px-4">
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
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <button 
                              className="btn btn-outline text-xs py-1 px-2"
                              onClick={() => handleViewDetails(appointment)}
                            >
                              Details
                            </button>
                            {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
                              <>
                                <button 
                                  className="btn btn-outline text-xs py-1 px-2"
                                  onClick={() => handleReschedule(appointment)}
                                >
                                  Reschedule
                                </button>
                                <button 
                                  className="btn btn-outline text-error text-xs py-1 px-2"
                                  onClick={() => handleCancelAppointment(appointment)}
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-t border-neutral-200">
                      <td colSpan={6} className="py-8 text-center text-neutral-500">
                        No appointments found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Details Modal */}
      {isDetailsModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="heading-4 mb-4">Appointment Details</h2>
            
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Customer Information</h3>
              <p><span className="text-neutral-500">Name:</span> {selectedAppointment.customer}</p>
              <p><span className="text-neutral-500">Email:</span> {selectedAppointment.email}</p>
              <p><span className="text-neutral-500">Phone:</span> {selectedAppointment.phone}</p>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Appointment Information</h3>
              <p><span className="text-neutral-500">Service:</span> {selectedAppointment.service}</p>
              <p><span className="text-neutral-500">Date:</span> {selectedAppointment.date}</p>
              <p><span className="text-neutral-500">Time:</span> {selectedAppointment.time}</p>
              <p><span className="text-neutral-500">Duration:</span> {selectedAppointment.duration}</p>
              <p><span className="text-neutral-500">Price:</span> {selectedAppointment.price}</p>
              <p><span className="text-neutral-500">Status:</span> {selectedAppointment.status}</p>
              <p><span className="text-neutral-500">Notes:</span> {selectedAppointment.notes || 'No notes'}</p>
            </div>
            
            <div className="flex justify-end">
              <button 
                className="btn btn-primary mr-2"
                onClick={() => setIsDetailsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Reschedule Modal */}
      {isRescheduleModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="heading-4 mb-4">Reschedule Appointment</h2>
            <p className="mb-4">Rescheduling appointment for {selectedAppointment.customer}</p>
            
            <div className="mb-4">
              <label className="body-small mb-1 block">New Date</label>
              <input type="date" className="input mb-2" defaultValue={selectedAppointment.date} />
            </div>
            
            <div className="mb-4">
              <label className="body-small mb-1 block">New Time</label>
              <input type="time" className="input mb-2" defaultValue={selectedAppointment.time.replace(/\s/g, '')} />
            </div>
            
            <div className="mb-4">
              <label className="body-small mb-1 block">Reason for Rescheduling</label>
              <textarea className="input mb-2" rows={3} placeholder="Provide reason for rescheduling"></textarea>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button 
                className="btn btn-outline"
                onClick={() => setIsRescheduleModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={confirmRescheduleAppointment}
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Cancel Modal */}
      {isCancelModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="heading-4 mb-4">Cancel Appointment</h2>
            <p className="mb-4">Are you sure you want to cancel the appointment for {selectedAppointment.customer}?</p>
            
            <div className="mb-4">
              <label className="body-small mb-1 block">Reason for Cancellation</label>
              <textarea className="input mb-2" rows={3} placeholder="Provide reason for cancellation"></textarea>
            </div>
            
            <div className="mb-4">
              <label className="body-small mb-1 block">Notify Customer</label>
              <div className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span>Send cancellation notification to customer</span>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button 
                className="btn btn-outline"
                onClick={() => setIsCancelModalOpen(false)}
              >
                Back
              </button>
              <button 
                className="btn btn-error text-white"
                onClick={confirmCancelAppointment}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage; 