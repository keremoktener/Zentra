import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from '../../components/business/Sidebar';

// Mock customer data for development
const mockCustomers = [
  {
    id: 1,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '(555) 123-4567',
    created: '2023-01-15',
    totalBookings: 8,
    lastBooking: '2023-06-15',
    totalSpent: '$360.00',
    notes: 'Regular customer, prefers morning appointments. Allergic to certain hair products.',
    favorite: true,
    appointments: [
      { id: 101, service: 'Haircut', date: '2023-06-15', time: '10:00 AM', status: 'completed', price: '$45.00' },
      { id: 102, service: 'Haircut & Color', date: '2023-05-12', time: '09:30 AM', status: 'completed', price: '$150.00' },
      { id: 103, service: 'Blowout', date: '2023-04-05', time: '11:00 AM', status: 'completed', price: '$35.00' },
    ]
  },
  {
    id: 2,
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '(555) 987-6543',
    created: '2023-02-10',
    totalBookings: 3,
    lastBooking: '2023-06-15',
    totalSpent: '$95.00',
    notes: 'Prefers after-work appointments. Likes to chat during service.',
    favorite: false,
    appointments: [
      { id: 201, service: 'Beard Trim', date: '2023-06-15', time: '11:30 AM', status: 'completed', price: '$25.00' },
      { id: 202, service: 'Men\'s Haircut', date: '2023-05-18', time: '5:30 PM', status: 'completed', price: '$35.00' },
      { id: 203, service: 'Men\'s Haircut & Beard Trim', date: '2023-04-20', time: '6:00 PM', status: 'completed', price: '$35.00' },
    ]
  },
  {
    id: 3,
    name: 'Alice Johnson',
    email: 'alice.j@example.com',
    phone: '(555) 321-7654',
    created: '2023-03-05',
    totalBookings: 5,
    lastBooking: new Date().toISOString().split('T')[0],
    totalSpent: '$215.00',
    notes: 'Allergic to certain nail polishes. Prefers eco-friendly products.',
    favorite: true,
    appointments: [
      { id: 301, service: 'Manicure', date: new Date().toISOString().split('T')[0], time: '2:00 PM', status: 'confirmed', price: '$35.00' },
      { id: 302, service: 'Pedicure', date: '2023-05-20', time: '3:00 PM', status: 'completed', price: '$45.00' },
      { id: 303, service: 'Mani-Pedi', date: '2023-04-22', time: '2:30 PM', status: 'completed', price: '$75.00' },
    ]
  },
  {
    id: 4,
    name: 'Bob Brown',
    email: 'bob.brown@example.com',
    phone: '(555) 789-0123',
    created: '2023-02-20',
    totalBookings: 2,
    lastBooking: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
    totalSpent: '$215.00',
    notes: 'Has back problems, prefers medium pressure massages.',
    favorite: false,
    appointments: [
      { id: 401, service: 'Massage', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '4:30 PM', status: 'confirmed', price: '$120.00' },
      { id: 402, service: 'Hot Stone Massage', date: '2023-05-05', time: '4:00 PM', status: 'completed', price: '$95.00' },
    ]
  },
  {
    id: 5,
    name: 'Carol White',
    email: 'carol.w@example.com',
    phone: '(555) 456-7890',
    created: '2023-04-10',
    totalBookings: 1,
    lastBooking: new Date(Date.now() + 172800000).toISOString().split('T')[0], // day after tomorrow
    totalSpent: '$75.00',
    notes: 'First-time customer. Sensitive skin.',
    favorite: false,
    appointments: [
      { id: 501, service: 'Facial', date: new Date(Date.now() + 172800000).toISOString().split('T')[0], time: '1:00 PM', status: 'pending', price: '$75.00' },
    ]
  },
  {
    id: 6,
    name: 'David Miller',
    email: 'david.m@example.com',
    phone: '(555) 234-5678',
    created: '2023-01-25',
    totalBookings: 4,
    lastBooking: new Date(Date.now() + 259200000).toISOString().split('T')[0], // 3 days from now
    totalSpent: '$380.00',
    notes: 'Likes to bring reference photos for haircuts.',
    favorite: true,
    appointments: [
      { id: 601, service: 'Haircut & Color', date: new Date(Date.now() + 259200000).toISOString().split('T')[0], time: '11:00 AM', status: 'confirmed', price: '$150.00' },
      { id: 602, service: 'Haircut', date: '2023-05-25', time: '10:30 AM', status: 'completed', price: '$45.00' },
      { id: 603, service: 'Haircut & Highlights', date: '2023-04-15', time: '11:30 AM', status: 'completed', price: '$185.00' },
    ]
  },
];

const CustomersPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isCustomerDetailsOpen, setIsCustomerDetailsOpen] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [newNote, setNewNote] = useState('');

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

  // Filter and sort customers
  const filteredCustomers = mockCustomers
    .filter(customer => {
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          customer.name.toLowerCase().includes(query) ||
          customer.email.toLowerCase().includes(query) ||
          customer.phone.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .filter(customer => {
      // Filter by favorites
      if (filterFavorites) {
        return customer.favorite;
      }
      return true;
    })
    .sort((a, b) => {
      // Sort by selected field
      if (sortField === 'name') {
        return sortDirection === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortField === 'lastBooking') {
        return sortDirection === 'asc'
          ? new Date(a.lastBooking).getTime() - new Date(b.lastBooking).getTime()
          : new Date(b.lastBooking).getTime() - new Date(a.lastBooking).getTime();
      } else if (sortField === 'totalBookings') {
        return sortDirection === 'asc'
          ? a.totalBookings - b.totalBookings
          : b.totalBookings - a.totalBookings;
      } else if (sortField === 'totalSpent') {
        const aValue = parseFloat(a.totalSpent.replace('$', ''));
        const bValue = parseFloat(b.totalSpent.replace('$', ''));
        return sortDirection === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }
      return 0;
    });

  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setIsCustomerDetailsOpen(true);
  };

  const handleAddNote = () => {
    setIsAddNoteModalOpen(true);
  };

  const handleSaveNote = () => {
    // In a real app, this would call an API to save the note
    alert(`Note added to ${selectedCustomer.name}'s profile`);
    setNewNote('');
    setIsAddNoteModalOpen(false);
  };

  const handleToggleFavorite = (customerId: number) => {
    // In a real app, this would call an API to toggle favorite status
    console.log(`Toggle favorite for customer ID: ${customerId}`);
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
          <h1 className="heading-3">Customers</h1>
        </header>
        
        <div className="p-6">
          {/* Search and Filters */}
          <div className="card p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="body-small mb-1 block">Search Customers</label>
                <input 
                  type="text" 
                  placeholder="Search by name, email, or phone..." 
                  className="input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div>
                <label className="body-small mb-1 block">Sort By</label>
                <div className="flex">
                  <select 
                    className="input rounded-r-none"
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value)}
                  >
                    <option value="name">Name</option>
                    <option value="lastBooking">Last Booking</option>
                    <option value="totalBookings">Total Bookings</option>
                    <option value="totalSpent">Total Spent</option>
                  </select>
                  <button 
                    className="px-3 bg-neutral-200 rounded-r-md"
                    onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox"
                  className="mr-2"
                  checked={filterFavorites}
                  onChange={() => setFilterFavorites(!filterFavorites)}
                />
                <span>Show favorites only</span>
              </label>
            </div>
          </div>
          
          {/* Customers Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-100">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Customer</th>
                    <th className="text-left py-3 px-4 font-semibold">Last Booking</th>
                    <th className="text-left py-3 px-4 font-semibold">Total Appointments</th>
                    <th className="text-left py-3 px-4 font-semibold">Total Spent</th>
                    <th className="text-center py-3 px-4 font-semibold">Favorite</th>
                    <th className="text-right py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="border-t border-neutral-200">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-xs text-neutral-500">{customer.email}</div>
                            <div className="text-xs text-neutral-500">{customer.phone}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{customer.lastBooking}</td>
                        <td className="py-3 px-4">{customer.totalBookings}</td>
                        <td className="py-3 px-4">{customer.totalSpent}</td>
                        <td className="py-3 px-4 text-center">
                          <button 
                            className="text-xl"
                            onClick={() => handleToggleFavorite(customer.id)}
                          >
                            {customer.favorite ? '⭐' : '☆'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button 
                            className="btn btn-outline text-xs py-1 px-2"
                            onClick={() => handleViewCustomer(customer)}
                          >
                            View Profile
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-t border-neutral-200">
                      <td colSpan={6} className="py-8 text-center text-neutral-500">
                        No customers found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Customer Details Sidebar */}
      {isCustomerDetailsOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsCustomerDetailsOpen(false)}></div>
          <div className="absolute top-0 right-0 h-full w-full max-w-lg bg-white shadow-xl transform transition-all">
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
                <h2 className="heading-4">{selectedCustomer.name}</h2>
                <button onClick={() => setIsCustomerDetailsOpen(false)} className="text-neutral-500 hover:text-neutral-700">
                  ✕
                </button>
              </div>
              
              <div className="flex-1 overflow-auto p-6">
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Contact Information</h3>
                  <p><span className="text-neutral-500">Email:</span> {selectedCustomer.email}</p>
                  <p><span className="text-neutral-500">Phone:</span> {selectedCustomer.phone}</p>
                  <p><span className="text-neutral-500">Customer since:</span> {selectedCustomer.created}</p>
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Notes</h3>
                    <button 
                      className="btn btn-sm btn-outline py-1 px-2 text-xs flex items-center"
                      onClick={handleAddNote}
                    >
                      <span className="mr-1">+</span> Add Note
                    </button>
                  </div>
                  <div className="bg-neutral-100 p-3 rounded-md">
                    <p className="text-sm">{selectedCustomer.notes || 'No notes available.'}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Statistics</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-neutral-100 p-3 rounded-md text-center">
                      <div className="text-2xl font-semibold text-primary">{selectedCustomer.totalBookings}</div>
                      <div className="text-xs text-neutral-500">Appointments</div>
                    </div>
                    <div className="bg-neutral-100 p-3 rounded-md text-center">
                      <div className="text-2xl font-semibold text-primary">{selectedCustomer.totalSpent}</div>
                      <div className="text-xs text-neutral-500">Total Spent</div>
                    </div>
                    <div className="bg-neutral-100 p-3 rounded-md text-center">
                      <div className="text-2xl font-semibold text-primary">
                        {selectedCustomer.favorite ? '⭐' : '☆'}
                      </div>
                      <div className="text-xs text-neutral-500">Status</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Appointment History</h3>
                  {selectedCustomer.appointments.length > 0 ? (
                    <div className="space-y-3">
                      {selectedCustomer.appointments.map((appointment: any) => (
                        <div key={appointment.id} className="bg-neutral-100 p-3 rounded-md">
                          <div className="flex justify-between mb-1">
                            <div className="font-medium">{appointment.service}</div>
                            <div>
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
                          </div>
                          <div className="flex justify-between text-sm">
                            <div className="text-neutral-500">
                              {appointment.date} at {appointment.time}
                            </div>
                            <div>{appointment.price}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-neutral-500">No appointment history.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Note Modal */}
      {isAddNoteModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="heading-4 mb-4">Add Note for {selectedCustomer.name}</h2>
            
            <div className="mb-4">
              <label className="body-small mb-1 block">Note</label>
              <textarea 
                className="input mb-2" 
                rows={4} 
                placeholder="Add your notes about this customer..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button 
                className="btn btn-outline"
                onClick={() => setIsAddNoteModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSaveNote}
                disabled={!newNote.trim()}
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage; 