import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faFilter, faSearch, faChevronLeft, faChevronRight, faCalendarAlt, faClock } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../../components/customer/Sidebar';
import AvailabilityCalendar from '../../components/customer/AvailabilityCalendar';
import axios from 'axios';

// Mock data for businesses
const mockBusinesses = [
  {
    id: 1,
    name: "Serenity Spa & Wellness",
    category: "Wellness",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    services: [
      { id: 1, name: "Massage Therapy", duration: 60, price: 80 },
      { id: 2, name: "Facial Treatment", duration: 45, price: 65 },
      { id: 3, name: "Body Scrub", duration: 30, price: 45 }
    ]
  },
  {
    id: 2,
    name: "Elite Fitness Studio",
    category: "Fitness",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    services: [
      { id: 1, name: "Personal Training", duration: 60, price: 70 },
      { id: 2, name: "Group Workout", duration: 45, price: 30 },
      { id: 3, name: "Yoga Session", duration: 60, price: 25 }
    ]
  },
  {
    id: 3,
    name: "Hair & Style Boutique",
    category: "Beauty",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    services: [
      { id: 1, name: "Haircut & Styling", duration: 45, price: 55 },
      { id: 2, name: "Hair Coloring", duration: 90, price: 120 },
      { id: 3, name: "Blowout", duration: 30, price: 40 }
    ]
  },
  {
    id: 4,
    name: "The Nail Studio",
    category: "Beauty",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    services: [
      { id: 1, name: "Manicure", duration: 30, price: 35 },
      { id: 2, name: "Pedicure", duration: 45, price: 45 },
      { id: 3, name: "Gel Nails", duration: 60, price: 60 }
    ]
  },
  {
    id: 5,
    name: "Holistic Healing Center",
    category: "Wellness",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    services: [
      { id: 1, name: "Acupuncture", duration: 45, price: 75 },
      { id: 2, name: "Reiki Session", duration: 60, price: 65 },
      { id: 3, name: "Meditation Class", duration: 30, price: 25 }
    ]
  }
];

// Available categories for filtering
const categories = ["All", "Beauty", "Wellness", "Fitness"];

interface Service {
  id: number;
  name: string;
  price: number;
  duration: number;
}

const CustomerBooking: React.FC = () => {
  const navigate = useNavigate();
  
  // User info state
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Booking flow states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [businesses, setBusinesses] = useState(mockBusinesses); // In a real implementation, this would be fetched from API

  // Check if user is authenticated
  useEffect(() => {
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      if (parsedUser.role === 'ROLE_CUSTOMER') {
        setUser(parsedUser);
        // Fetch businesses from API in a real implementation
        // fetchBusinesses();
      } else {
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
    setLoading(false);
  }, [navigate]);

  // Filter businesses based on search and category
  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || business.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Available time slots (mock data)
  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
  ];
  
  // Book appointment function
  const bookAppointment = async () => {
    if (!selectedBusiness || !selectedService || !selectedDate || !selectedTime) {
      setErrorMessage("Please complete all fields before booking.");
      return;
    }
    
    try {
      // In a real implementation, this would be an API call
      // const response = await axios.post('/api/appointments', {
      //   customerId: user.id,
      //   businessId: selectedBusiness.id,
      //   serviceId: selectedService.id,
      //   date: format(selectedDate, 'yyyy-MM-dd'),
      //   startTime: selectedTime,
      //   durationMinutes: selectedService.duration,
      //   notes: ""
      // });
      
      // Simulate API call for demo
      setTimeout(() => {
        setBookingSuccess(true);
        
        // Reset form after successful booking
        setTimeout(() => {
          setCurrentStep(1);
          setSelectedBusiness(null);
          setSelectedService(null);
          setSelectedDate(null);
          setSelectedTime("");
          setBookingSuccess(false);
        }, 3000);
      }, 1000);
    } catch (error) {
      console.error('Error booking appointment:', error);
      setErrorMessage("Failed to book appointment. Please try again.");
    }
  };

  // Handle navigation between steps
  const nextStep = () => {
    if (currentStep === 1 && !selectedBusiness) {
      setErrorMessage("Please select a business to continue.");
      return;
    }
    if (currentStep === 2 && !selectedService) {
      setErrorMessage("Please select a service to continue.");
      return;
    }
    if (currentStep === 3 && (!selectedDate || !selectedTime)) {
      setErrorMessage("Please select both date and time.");
      return;
    }
    setErrorMessage("");
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setErrorMessage("");
  };

  const handleBusinessSelection = (business: any) => {
    setSelectedBusiness(business);
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime("");
    setCurrentStep(2);
  };

  const handleServiceSelection = (service: Service) => {
    setSelectedService(service);
    setSelectedDate(null);
    setSelectedTime("");
    setCurrentStep(3);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(""); // Reset time when date changes
  };

  const handleTimeSelect = (timeSlot: string) => {
    setSelectedTime(timeSlot);
  };

  const renderBusinessSelection = () => {
    return (
      <div>
        <div className="mb-6">
          <div className="flex mb-4">
            <div className="relative flex-1 mr-2">
              <input
                type="text"
                placeholder="Search businesses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
              />
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
            </div>
            <div className="w-1/3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBusinesses.map((business) => (
              <div 
                key={business.id}
                onClick={() => handleBusinessSelection(business)}
                className={`
                  cursor-pointer border rounded-lg overflow-hidden hover:shadow-lg transition
                  ${selectedBusiness && selectedBusiness.id === business.id ? 'ring-2 ring-blue-500' : ''}
                `}
              >
                <div className="h-40 overflow-hidden">
                  <img 
                    src={business.image} 
                    alt={business.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{business.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{business.category}</p>
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faStar} className="text-yellow-400 mr-1" />
                    <span>{business.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderServiceSelection = () => {
    if (!selectedBusiness) return null;
    
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Select a Service from {selectedBusiness.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {selectedBusiness.services.map((service: Service) => (
            <div
              key={service.id}
              onClick={() => handleServiceSelection(service)}
              className={`
                p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition
                ${selectedService && selectedService.id === service.id ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500' : ''}
              `}
            >
              <h3 className="font-medium text-lg">{service.name}</h3>
              <div className="flex justify-between mt-2">
                <span className="text-gray-500">{service.duration} min</span>
                <span className="font-medium">${service.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDateTimeSelection = () => {
    if (!selectedBusiness || !selectedService) return null;
    
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Select Date & Time for {selectedService.name} at {selectedBusiness.name}
        </h2>
        <div className="mb-6">
          <AvailabilityCalendar
            businessId={selectedBusiness.id}
            serviceId={selectedService.id}
            serviceDuration={selectedService.duration}
            onDateSelect={handleDateSelect}
            onTimeSelect={handleTimeSelect}
          />
        </div>
      </div>
    );
  };

  const renderConfirmation = () => {
    if (!selectedBusiness || !selectedService || !selectedDate || !selectedTime) return null;
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <h2 className="text-xl font-semibold mb-4">Confirm Your Appointment</h2>
        <div className="mb-6 space-y-3">
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Business:</span>
            <span className="font-medium">{selectedBusiness.name}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Service:</span>
            <span className="font-medium">{selectedService.name}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium">{selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : ''}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Time:</span>
            <span className="font-medium">{selectedTime}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Duration:</span>
            <span className="font-medium">{selectedService.duration} minutes</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-gray-600 font-semibold">Total:</span>
            <span className="font-semibold">${selectedService.price}</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto p-8">
        <h1 className="text-3xl font-semibold mb-6">Book an Appointment</h1>
        
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${currentStep >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-400'}`}>
              {currentStep > 1 ? <FontAwesomeIcon icon={faFilter} /> : 1}
            </div>
            <span className="ml-2">Select Business</span>
          </div>
          <div className={`w-12 h-1 mx-2 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${currentStep >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-400'}`}>
              {currentStep > 2 ? <FontAwesomeIcon icon={faFilter} /> : 2}
            </div>
            <span className="ml-2">Select Service</span>
          </div>
          <div className={`w-12 h-1 mx-2 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${currentStep >= 3 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-400'}`}>
              {currentStep > 3 ? <FontAwesomeIcon icon={faFilter} /> : 3}
            </div>
            <span className="ml-2">Select Time</span>
          </div>
          <div className={`w-12 h-1 mx-2 ${currentStep >= 4 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center ${currentStep >= 4 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${currentStep >= 4 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-400'}`}>
              4
            </div>
            <span className="ml-2">Confirm</span>
          </div>
        </div>
        
        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {errorMessage}
          </div>
        )}
        
        {/* Success Message */}
        {bookingSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Appointment booked successfully! You will receive a confirmation email shortly.
          </div>
        )}
        
        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          {currentStep === 1 && renderBusinessSelection()}
          {currentStep === 2 && renderServiceSelection()}
          {currentStep === 3 && renderDateTimeSelection()}
          {currentStep === 4 && renderConfirmation()}
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-6 py-2 rounded-lg ${currentStep === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            <FontAwesomeIcon icon={faChevronLeft} className="mr-2" />
            Back
          </button>
          
          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Next
              <FontAwesomeIcon icon={faChevronRight} className="ml-2" />
            </button>
          ) : (
            <button
              onClick={bookAppointment}
              className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
              disabled={bookingSuccess}
            >
              Book Appointment
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerBooking; 