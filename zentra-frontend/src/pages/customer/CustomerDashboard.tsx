import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from '../../components/customer/Sidebar';

// Mock data for customer appointments
const mockAppointments = [
  { 
    id: 1, 
    business: 'Style & Scissors Salon', 
    service: 'Haircut', 
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
    time: '10:00 AM', 
    status: 'confirmed',
    price: '$45.00'
  },
  { 
    id: 2, 
    business: 'Zen Massage Center', 
    service: 'Deep Tissue Massage', 
    date: new Date(Date.now() + 259200000).toISOString().split('T')[0], // 3 days from now
    time: '2:30 PM', 
    status: 'confirmed',
    price: '$85.00'
  },
  { 
    id: 3, 
    business: 'Polished Nail Studio', 
    service: 'Manicure', 
    date: new Date(Date.now() + 604800000).toISOString().split('T')[0], // 7 days from now
    time: '11:15 AM', 
    status: 'pending',
    price: '$35.00'
  }
];

// Mock data for recent activity
const mockActivity = [
  {
    id: 1,
    type: 'appointment_completed',
    business: 'Style & Scissors Salon',
    service: 'Haircut & Color',
    date: '2023-06-15',
    time: '11:30 AM'
  },
  {
    id: 2,
    type: 'appointment_booked',
    business: 'Zen Massage Center',
    service: 'Deep Tissue Massage',
    date: new Date(Date.now() + 259200000).toISOString().split('T')[0], // 3 days from now
    time: '2:30 PM'
  },
  {
    id: 3,
    type: 'appointment_cancelled',
    business: 'BeautyGlow Spa',
    service: 'Facial',
    date: '2023-06-12',
    time: '3:00 PM'
  }
];

// Mock data for recommended businesses
const mockRecommendedBusinesses = [
  {
    id: 1,
    name: 'Harmony Spa & Wellness',
    category: 'Spa',
    rating: 4.8,
    image: 'https://via.placeholder.com/150?text=Spa',
    featured: true
  },
  {
    id: 2,
    name: 'Elite Barber Shop',
    category: 'Hair Salon',
    rating: 4.6,
    image: 'https://via.placeholder.com/150?text=Barber'
  },
  {
    id: 3,
    name: 'Nail Art Studio',
    category: 'Nail Salon',
    rating: 4.7,
    image: 'https://via.placeholder.com/150?text=Nails'
  }
];

const CustomerDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
          <h1 className="heading-3">Customer Dashboard</h1>
        </header>
        
        <div className="p-6">
          <div className="mb-8">
            <div className="card p-6 mb-6">
              <h2 className="heading-4 mb-4">Welcome back, {user.email}!</h2>
              <p className="body">This is your dashboard where you can manage your appointments and discover new services.</p>
            </div>
          </div>
          
          {/* Upcoming Appointments */}
          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="heading-4">Upcoming Appointments</h2>
              <a href="/customer/appointments" className="text-primary hover:underline">View All</a>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockAppointments.length > 0 ? (
                mockAppointments.map(appointment => (
                  <div key={appointment.id} className="card p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{appointment.service}</h3>
                        <p className="text-sm text-neutral-600">{appointment.business}</p>
                      </div>
                      <span className={`badge ${
                        appointment.status === 'confirmed' 
                          ? 'badge-success' 
                          : appointment.status === 'pending' 
                            ? 'badge-warning' 
                            : 'badge-error'
                      }`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm mb-3">
                      <span className="mr-2">📅</span>
                      <span>{appointment.date} at {appointment.time}</span>
                    </div>
                    <div className="flex items-center text-sm mb-4">
                      <span className="mr-2">💰</span>
                      <span>{appointment.price}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button className="btn btn-outline text-xs py-1 px-2 flex-1">Reschedule</button>
                      <button className="btn btn-outline text-error text-xs py-1 px-2 flex-1">Cancel</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card p-6 col-span-3">
                  <p className="text-center text-neutral-500">You don't have any upcoming appointments.</p>
                  <div className="flex justify-center mt-4">
                    <a href="/customer/book" className="btn btn-primary">Book New Appointment</a>
                  </div>
                </div>
              )}
            </div>
          </section>
          
          {/* Recent Activity & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="heading-4">Recent Activity</h2>
              </div>
              
              <div className="card overflow-hidden">
                {mockActivity.length > 0 ? (
                  <div className="divide-y divide-neutral-200">
                    {mockActivity.map(activity => (
                      <div key={activity.id} className="p-4">
                        <div className="flex items-start">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                            activity.type === 'appointment_completed' 
                              ? 'bg-success bg-opacity-20 text-success' 
                              : activity.type === 'appointment_booked' 
                                ? 'bg-primary bg-opacity-20 text-primary' 
                                : 'bg-error bg-opacity-20 text-error'
                          }`}>
                            {activity.type === 'appointment_completed' ? '✓' : 
                              activity.type === 'appointment_booked' ? '📅' : '✗'}
                          </div>
                          <div>
                            <p className="font-medium">
                              {activity.type === 'appointment_completed' ? 'Appointment Completed' : 
                                activity.type === 'appointment_booked' ? 'Appointment Booked' : 
                                  'Appointment Cancelled'}
                            </p>
                            <p className="text-sm text-neutral-600">{activity.service} at {activity.business}</p>
                            <p className="text-xs text-neutral-500">{activity.date} at {activity.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-neutral-500">
                    No recent activity to display.
                  </div>
                )}
              </div>
            </div>
            
            {/* Quick Actions */}
            <div>
              <h2 className="heading-4 mb-4">Quick Actions</h2>
              <div className="card p-4 space-y-3">
                <a href="/customer/book" className="flex items-center p-3 rounded-md hover:bg-neutral-100 transition-colors">
                  <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center mr-3">
                    <span className="text-white">📝</span>
                  </div>
                  <div>
                    <p className="font-medium">Book Appointment</p>
                    <p className="text-xs text-neutral-500">Find services and schedule</p>
                  </div>
                </a>
                
                <a href="/customer/appointments" className="flex items-center p-3 rounded-md hover:bg-neutral-100 transition-colors">
                  <div className="w-10 h-10 bg-secondary-light rounded-full flex items-center justify-center mr-3">
                    <span className="text-white">📅</span>
                  </div>
                  <div>
                    <p className="font-medium">View Appointments</p>
                    <p className="text-xs text-neutral-500">Manage your schedule</p>
                  </div>
                </a>
                
                <a href="/customer/favorites" className="flex items-center p-3 rounded-md hover:bg-neutral-100 transition-colors">
                  <div className="w-10 h-10 bg-accent-light rounded-full flex items-center justify-center mr-3">
                    <span className="text-white">⭐</span>
                  </div>
                  <div>
                    <p className="font-medium">Favorite Businesses</p>
                    <p className="text-xs text-neutral-500">Your preferred services</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
          
          {/* Recommended Businesses */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="heading-4">Recommended For You</h2>
              <a href="/customer/discover" className="text-primary hover:underline">View More</a>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockRecommendedBusinesses.map(business => (
                <div key={business.id} className="card overflow-hidden">
                  <div className="h-40 bg-neutral-200 relative">
                    <img 
                      src={business.image} 
                      alt={business.name} 
                      className="w-full h-full object-cover"
                    />
                    {business.featured && (
                      <div className="absolute top-2 right-2 bg-accent text-white text-xs px-2 py-1 rounded">
                        Featured
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{business.name}</h3>
                        <p className="text-sm text-neutral-600">{business.category}</p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm mr-1">{business.rating}</span>
                        <span className="text-yellow-400">★</span>
                      </div>
                    </div>
                    <button className="btn btn-primary w-full mt-2">View Services</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard; 