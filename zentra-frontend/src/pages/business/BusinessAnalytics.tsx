import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from '../../components/business/Sidebar';
import axios from 'axios';

interface ServiceStats {
  serviceId: number;
  serviceName: string;
  bookingCount: number;
  revenue: number;
}

interface BusinessAnalytics {
  businessId: number;
  businessName: string;
  totalAppointmentsToday: number;
  totalAppointmentsThisWeek: number;
  newBookingsThisWeek: number;
  cancelledAppointmentsThisWeek: number;
  revenueThisWeek: number;
  dailyRevenue: Record<string, number>;
  appointmentsByStatus: Record<string, number>;
  topServices: ServiceStats[];
  totalCustomers: number;
  newCustomersThisWeek: number;
  returningCustomersThisWeek: number;
}

const BusinessAnalytics: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<BusinessAnalytics | null>(null);
  const [businessId, setBusinessId] = useState<number | null>(null);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');

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
            return fetchAnalytics(response.data.id, period);
          })
          .catch(error => {
            console.error('Error fetching business profile:', error);
            setLoading(false);
          });
      } catch (e) {
        console.error('Failed to parse user data');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [period]);
  
  const fetchAnalytics = (id: number, selectedPeriod: string) => {
    setLoading(true);
    axios.get(`/api/business-analytics/${id}/${selectedPeriod}`)
      .then(response => {
        setAnalytics(response.data);
      })
      .catch(error => {
        console.error('Error fetching analytics:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handlePeriodChange = (newPeriod: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    setPeriod(newPeriod);
    if (businessId) {
      fetchAnalytics(businessId, newPeriod);
    }
  };

  // Get day name from date string
  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
          <h1 className="heading-3">Business Analytics</h1>
        </header>
        
        <div className="p-6">
          {/* Time Period Selector */}
          <div className="card p-6 mb-6">
            <div className="flex items-center mb-4">
              <h2 className="heading-4 mr-auto">Performance Overview</h2>
              <div className="flex border rounded-md overflow-hidden">
                <button 
                  className={`px-3 py-1 ${period === 'daily' ? 'bg-primary text-white' : 'bg-white'}`}
                  onClick={() => handlePeriodChange('daily')}
                >
                  Daily
                </button>
                <button 
                  className={`px-3 py-1 ${period === 'weekly' ? 'bg-primary text-white' : 'bg-white'}`}
                  onClick={() => handlePeriodChange('weekly')}
                >
                  Weekly
                </button>
                <button 
                  className={`px-3 py-1 ${period === 'monthly' ? 'bg-primary text-white' : 'bg-white'}`}
                  onClick={() => handlePeriodChange('monthly')}
                >
                  Monthly
                </button>
                <button 
                  className={`px-3 py-1 ${period === 'yearly' ? 'bg-primary text-white' : 'bg-white'}`}
                  onClick={() => handlePeriodChange('yearly')}
                >
                  Yearly
                </button>
              </div>
            </div>
            
            {/* Summary Cards */}
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="card bg-white p-4">
                  <p className="text-neutral-500 text-sm">Appointments</p>
                  <div className="text-2xl font-bold mt-1">
                    {analytics.totalAppointmentsThisWeek}
                  </div>
                  <div className="flex items-center mt-2 text-sm">
                    <span className="text-success">
                      {analytics.totalAppointmentsToday} today
                    </span>
                  </div>
                </div>
                
                <div className="card bg-white p-4">
                  <p className="text-neutral-500 text-sm">Revenue</p>
                  <div className="text-2xl font-bold mt-1">
                    {formatCurrency(analytics.revenueThisWeek)}
                  </div>
                  <div className="flex items-center mt-2 text-sm">
                    <span className="text-success">
                      {period === 'weekly' ? 'This week' : period === 'monthly' ? 'This month' : period === 'yearly' ? 'This year' : 'Today'}
                    </span>
                  </div>
                </div>
                
                <div className="card bg-white p-4">
                  <p className="text-neutral-500 text-sm">New Bookings</p>
                  <div className="text-2xl font-bold mt-1">
                    {analytics.newBookingsThisWeek}
                  </div>
                  <div className="flex items-center mt-2 text-sm">
                    <span className={analytics.cancelledAppointmentsThisWeek > 0 ? "text-error" : "text-neutral-500"}>
                      {analytics.cancelledAppointmentsThisWeek} cancelled
                    </span>
                  </div>
                </div>
                
                <div className="card bg-white p-4">
                  <p className="text-neutral-500 text-sm">Customers</p>
                  <div className="text-2xl font-bold mt-1">
                    {analytics.totalCustomers}
                  </div>
                  <div className="flex items-center mt-2 text-sm">
                    <span className="text-success">
                      {analytics.newCustomersThisWeek} new, {analytics.returningCustomersThisWeek} returning
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Revenue Chart */}
            {analytics && analytics.dailyRevenue && (
              <div>
                <h3 className="body-1 mb-4">Revenue Trend</h3>
                <div className="bg-white rounded-lg p-4 mb-6">
                  <div className="h-64">
                    <div className="flex h-full items-end">
                      {Object.entries(analytics.dailyRevenue).map(([date, revenue]) => (
                        <div key={date} className="flex flex-col items-center flex-1">
                          <div 
                            className="w-full bg-primary-light rounded-t" 
                            style={{ 
                              height: `${Math.max(5, (revenue / Math.max(...Object.values(analytics.dailyRevenue))) * 100)}%` 
                            }}
                          ></div>
                          <div className="text-xs mt-2">{getDayName(date)}</div>
                          <div className="text-xs text-neutral-500">{formatCurrency(revenue)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Appointment Status */}
            {analytics && analytics.appointmentsByStatus && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="body-1 mb-4">Appointment Status</h3>
                  <div className="bg-white rounded-lg p-4">
                    <div className="space-y-3">
                      {Object.entries(analytics.appointmentsByStatus).map(([status, count]) => (
                        <div key={status} className="flex items-center">
                          <div className="w-40 text-sm">{status}</div>
                          <div className="flex-1 mx-2">
                            <div className="bg-neutral-100 rounded-full h-2 w-full">
                              <div 
                                className={`rounded-full h-2 ${
                                  status === 'COMPLETED' ? 'bg-success' :
                                  status === 'CONFIRMED' ? 'bg-primary' :
                                  status === 'PENDING' ? 'bg-warning' :
                                  status === 'CANCELLED' ? 'bg-error' : 'bg-neutral-500'
                                }`}
                                style={{ 
                                  width: `${Math.max(5, (count / analytics.totalAppointmentsThisWeek) * 100)}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                          <div className="text-sm font-medium w-8 text-right">{count}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Top Services */}
                <div>
                  <h3 className="body-1 mb-4">Top Services</h3>
                  <div className="bg-white rounded-lg p-4">
                    {analytics.topServices.length === 0 ? (
                      <p className="text-neutral-500 text-sm py-4 text-center">No services data available</p>
                    ) : (
                      <div className="space-y-4">
                        {analytics.topServices.map((service) => (
                          <div key={service.serviceId} className="flex justify-between">
                            <div>
                              <div className="font-medium">{service.serviceName}</div>
                              <div className="text-sm text-neutral-500">{service.bookingCount} bookings</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{formatCurrency(service.revenue)}</div>
                              <div className="text-sm text-neutral-500">
                                {Math.round((service.revenue / analytics.revenueThisWeek) * 100)}% of revenue
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessAnalytics; 