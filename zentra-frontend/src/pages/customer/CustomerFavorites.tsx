import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from '../../components/customer/Sidebar';

// Mock data for favorite businesses
const mockFavoriteBusinesses = [
  {
    id: 1,
    name: 'Style & Scissors Salon',
    category: 'Hair Salon',
    rating: 4.8,
    image: 'https://via.placeholder.com/300x200?text=Style+%26+Scissors',
    address: '123 Main St, Suite 101',
    phone: '(555) 123-9876',
    description: 'Premium hair salon offering cuts, colors, and styling services.',
    isFavorite: true
  },
  {
    id: 2,
    name: 'Zen Massage Center',
    category: 'Massage & Spa',
    rating: 4.7,
    image: 'https://via.placeholder.com/300x200?text=Zen+Massage',
    address: '456 Wellness Ave',
    phone: '(555) 456-7890',
    description: 'Relaxing massage therapy center with various massage options.',
    isFavorite: true
  },
  {
    id: 3,
    name: 'Polished Nail Studio',
    category: 'Nail Salon',
    rating: 4.6,
    image: 'https://via.placeholder.com/300x200?text=Polished+Nail',
    address: '789 Beauty Blvd',
    phone: '(555) 789-1234',
    description: 'Professional nail care services including manicures and pedicures.',
    isFavorite: true
  },
  {
    id: 4,
    name: 'BeautyGlow Spa',
    category: 'Spa',
    rating: 4.9,
    image: 'https://via.placeholder.com/300x200?text=BeautyGlow',
    address: '321 Glow Ave',
    phone: '(555) 555-5555',
    description: 'Full-service spa offering facials, body treatments, and more.',
    isFavorite: true
  }
];

const CustomerFavorites: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(mockFavoriteBusinesses);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

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

  // Handle removing a business from favorites
  const handleRemoveFavorite = (businessId: number) => {
    setFavorites(favorites.filter(business => business.id !== businessId));
  };

  // Filter favorites based on search term and category
  const filteredFavorites = favorites.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === '' || business.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = Array.from(new Set(favorites.map(business => business.category)));

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
          <h1 className="heading-3">Favorite Businesses</h1>
        </header>
        
        <div className="p-6">
          {/* Search and Filter */}
          <div className="card p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium text-neutral-700 mb-1">Search</label>
                <input
                  type="text"
                  id="search"
                  className="w-full rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  placeholder="Search favorites..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="w-full md:w-48">
                <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
                <select
                  id="category"
                  className="w-full rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Favorites Grid */}
          {filteredFavorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFavorites.map(business => (
                <div key={business.id} className="card overflow-hidden">
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={business.image} 
                      alt={business.name} 
                      className="w-full h-full object-cover"
                    />
                    <button 
                      onClick={() => handleRemoveFavorite(business.id)}
                      className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:bg-neutral-100 transition-colors"
                      aria-label="Remove from favorites"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="red" viewBox="0 0 24 24" stroke-width="1.5" stroke="red" className="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{business.name}</h3>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-500">
                          <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-1 font-medium">{business.rating}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-neutral-500 mb-2">{business.category}</p>
                    
                    <p className="text-sm mb-3">{business.description}</p>
                    
                    <div className="text-sm text-neutral-600 mb-1">
                      <div className="flex items-start mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-4 h-4 mr-2 mt-0.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        <span>{business.address}</span>
                      </div>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-4 h-4 mr-2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                        <span>{business.phone}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                      <a href={`/customer/book?business=${business.id}`} className="btn btn-primary flex-1">Book Now</a>
                      <a href={`/business-details/${business.id}`} className="btn btn-outline flex-1">Details</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-12 h-12 mx-auto text-neutral-400">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">No Favorite Businesses Found</h3>
              <p className="text-neutral-600 mb-4">
                {searchTerm || selectedCategory 
                  ? "No results match your search criteria. Try adjusting your filters."
                  : "You haven't added any businesses to your favorites yet."}
              </p>
              <a href="/customer/book" className="btn btn-primary inline-block">Discover Businesses</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerFavorites; 