import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from '../../components/business/Sidebar';

// Mock data for development
const mockAppointments = [
  { id: 1, customer: 'Jane Smith', service: 'Haircut', time: '10:00 AM', date: '2023-06-15', status: 'confirmed' },
  { id: 2, customer: 'John Doe', service: 'Beard Trim', time: '11:30 AM', date: '2023-06-15', status: 'confirmed' },
  { id: 3, customer: 'Alice Johnson', service: 'Manicure', time: '2:00 PM', date: '2023-06-15', status: 'pending' },
  { id: 4, customer: 'Bob Brown', service: 'Massage', time: '4:30 PM', date: '2023-06-16', status: 'confirmed' },
  { id: 5, customer: 'Carol White', service: 'Facial', time: '1:00 PM', date: '2023-06-17', status: 'cancelled' },
];

const mockMetrics = {
  todayAppointments: 3,
  weeklyAppointments: 12,
  newBookings: 8,
  cancellations: 2,
  revenue: '$1,250.00',
};

const BusinessDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');

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

  // Filter appointments based on active tab
  const filteredAppointments = mockAppointments.filter(appointment => {
    const today = new Date().toISOString().split('T')[0];
    
    if (activeTab === 'today') {
      return appointment.date === today;
    } else if (activeTab === 'upcoming') {
      return new Date(appointment.date) > new Date(today);
    } else if (activeTab === 'all') {
      return true;
    }
    return false;
  });

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
          <h1 className="heading-3">Business Dashboard</h1>
        </header>
        
        <div className="p-6">
          <div className="mb-8">
            <div className="card p-6 mb-6">
              <h2 className="heading-4 mb-4">Welcome back, {user.email}!</h2>
              <p className="body">This is your business dashboard where you can manage your appointments and services.</p>
            </div>
          </div>
          
          {/* Key Metrics */}
          <section className="mb-8">
            <h2 className="heading-4 mb-4">Key Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="card p-5">
                <p className="caption mb-2">Today's Appointments</p>
                <p className="heading-3 text-primary">{mockMetrics.todayAppointments}</p>
              </div>
              
              <div className="card p-5">
                <p className="caption mb-2">Weekly Appointments</p>
                <p className="heading-3 text-primary">{mockMetrics.weeklyAppointments}</p>
              </div>
              
              <div className="card p-5">
                <p className="caption mb-2">New Bookings</p>
                <p className="heading-3 text-secondary">{mockMetrics.newBookings}</p>
              </div>
              
              <div className="card p-5">
                <p className="caption mb-2">Cancellations</p>
                <p className="heading-3 text-error">{mockMetrics.cancellations}</p>
              </div>
              
              <div className="card p-5">
                <p className="caption mb-2">Weekly Revenue</p>
                <p className="heading-3 text-success">{mockMetrics.revenue}</p>
              </div>
            </div>
          </section>
          
          {/* Appointments Overview */}
          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="heading-4">Appointments Overview</h2>
              <div className="flex space-x-2">
                <button 
                  className={`btn ${activeTab === 'today' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setActiveTab('today')}
                >
                  Today
                </button>
                <button 
                  className={`btn ${activeTab === 'upcoming' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setActiveTab('upcoming')}
                >
                  Upcoming
                </button>
                <button 
                  className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setActiveTab('all')}
                >
                  All
                </button>
              </div>
            </div>
            
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
                          <td className="py-3 px-4">{appointment.customer}</td>
                          <td className="py-3 px-4">{appointment.service}</td>
                          <td className="py-3 px-4">{appointment.date}</td>
                          <td className="py-3 px-4">{appointment.time}</td>
                          <td className="py-3 px-4">
                            <span className={`badge ${
                              appointment.status === 'confirmed' 
                                ? 'badge-success' 
                                : appointment.status === 'pending' 
                                  ? 'badge-warning' 
                                  : 'badge-error'
                            }`}>
                              {appointment.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button className="btn btn-outline text-xs py-1 px-2">Details</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="border-t border-neutral-200">
                        <td colSpan={6} className="py-8 text-center text-neutral-500">
                          No appointments found for this period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
          
          {/* Shortcut Cards */}
          <section className="mb-8">
            <h2 className="heading-4 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card p-6 flex flex-col items-center text-center hover:border-primary cursor-pointer">
                <div className="w-14 h-14 bg-primary-light rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">Manage Services</h3>
                <p className="text-sm text-neutral-600">Add or edit your business services</p>
              </div>
              
              <div className="card p-6 flex flex-col items-center text-center hover:border-secondary cursor-pointer">
                <div className="w-14 h-14 bg-secondary-light rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">Manage Staff</h3>
                <p className="text-sm text-neutral-600">Add or edit staff members</p>
              </div>
              
              <div className="card p-6 flex flex-col items-center text-center hover:border-accent cursor-pointer">
                <div className="w-14 h-14 bg-accent-light rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">Working Hours</h3>
                <p className="text-sm text-neutral-600">Set your business hours</p>
              </div>
              
              <div className="card p-6 flex flex-col items-center text-center hover:border-info cursor-pointer">
                <div className="w-14 h-14 bg-info rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">Business Profile</h3>
                <p className="text-sm text-neutral-600">Edit your business details</p>
              </div>
            </div>
          </section>
          
          {/* Analytics Preview */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="heading-4">Performance Overview</h2>
              <button className="btn btn-outline">View Full Analytics</button>
            </div>
            <div className="card p-6">
              <div className="h-60 flex items-center justify-center border border-dashed border-neutral-300 rounded-lg">
                <p className="text-neutral-500">Analytics graph visualization will be displayed here</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard; 