import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from '../../components/business/Sidebar';
import axios from 'axios';

interface WorkingHours {
  id?: number;
  businessProfileId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isOpen: boolean;
}

const dayNames = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY'
];

const initialWorkingHours: WorkingHours[] = dayNames.map(day => ({
  businessProfileId: 0,
  dayOfWeek: day,
  startTime: '09:00',
  endTime: '17:00',
  isOpen: day !== 'SATURDAY' && day !== 'SUNDAY'
}));

const Availability: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [businessProfile, setBusinessProfile] = useState<any>(null);
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>(initialWorkingHours);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [applyToAll, setApplyToAll] = useState(false);
  const [templateDay, setTemplateDay] = useState('MONDAY');

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
            setBusinessProfile(response.data);
            
            // Fetch working hours for this business profile
            return axios.get(`/api/working-hours/business/${response.data.id}`);
          })
          .then(response => {
            if (response.data && response.data.length > 0) {
              // Sort by day of week
              const sortedHours = [...response.data].sort((a, b) => {
                return dayNames.indexOf(a.dayOfWeek) - dayNames.indexOf(b.dayOfWeek);
              });
              setWorkingHours(sortedHours);
            } else {
              // If no working hours are set, initialize with default values and the actual business profile id
              setWorkingHours(initialWorkingHours.map(day => ({
                ...day,
                businessProfileId: businessProfile.id
              })));
            }
          })
          .catch(error => {
            console.error('Error fetching data:', error);
            setMessage({
              text: 'Failed to load business profile or working hours.',
              type: 'error'
            });
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
  }, []);

  const handleWorkingHoursChange = (index: number, field: keyof WorkingHours, value: any) => {
    const updatedHours = [...workingHours];
    updatedHours[index] = { ...updatedHours[index], [field]: value };
    
    // If toggling isOpen to false, we don't need to clear times
    // If toggling isOpen to true, we should ensure times are set
    if (field === 'isOpen' && value === true) {
      updatedHours[index].startTime = updatedHours[index].startTime || '09:00';
      updatedHours[index].endTime = updatedHours[index].endTime || '17:00';
    }
    
    setWorkingHours(updatedHours);
  };

  const applyTemplateToAll = () => {
    const templateDayData = workingHours.find(h => h.dayOfWeek === templateDay);
    if (!templateDayData) return;
    
    const updatedHours = workingHours.map(hour => ({
      ...hour,
      startTime: templateDayData.startTime,
      endTime: templateDayData.endTime,
      isOpen: templateDayData.isOpen
    }));
    
    setWorkingHours(updatedHours);
    setApplyToAll(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessProfile) {
      setMessage({
        text: 'You need to create a business profile first.',
        type: 'error'
      });
      return;
    }
    
    // Make sure all working hours have the correct business profile ID
    const hoursToSubmit = workingHours.map(hour => ({
      ...hour,
      businessProfileId: businessProfile.id
    }));
    
    axios.post('/api/working-hours/batch', hoursToSubmit)
      .then(response => {
        setWorkingHours(response.data);
        setMessage({
          text: 'Working hours saved successfully.',
          type: 'success'
        });
        
        // Hide message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      })
      .catch(error => {
        console.error('Error saving working hours:', error);
        setMessage({
          text: 'Failed to save working hours. Please try again.',
          type: 'error'
        });
      });
  };

  const formatTime = (time24: string): string => {
    if (!time24) return '';
    
    const [hourStr, minuteStr] = time24.split(':');
    const hour = parseInt(hourStr, 10);
    
    if (hour === 0) {
      return `12:${minuteStr} AM`;
    } else if (hour < 12) {
      return `${hour}:${minuteStr} AM`;
    } else if (hour === 12) {
      return `12:${minuteStr} PM`;
    } else {
      return `${hour - 12}:${minuteStr} PM`;
    }
  };

  const formatDayOfWeek = (day: string): string => {
    return day.charAt(0) + day.slice(1).toLowerCase();
  };

  // If loading, show loading indicator
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // If not logged in or not a business owner, redirect to login
  if (!user || user.role !== 'ROLE_BUSINESS_OWNER') {
    return <Navigate to="/login" />;
  }

  // If no business profile exists, prompt to create one
  if (!businessProfile) {
    return (
      <div className="flex h-screen bg-neutral-100">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="alert alert-warning mb-6">
            You need to create a business profile before setting working hours.
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/business/profile'}
          >
            Create Business Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-neutral-100">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-neutral-200 px-6 py-4">
          <h1 className="heading-3">Business Hours</h1>
        </header>
        
        <div className="p-6">
          {message && (
            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mb-6`}>
              {message.text}
            </div>
          )}
          
          <div className="card p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="heading-4">Set Your Working Hours</h2>
              
              <div className="flex items-center space-x-2">
                <button 
                  className="btn btn-outline"
                  onClick={() => setApplyToAll(!applyToAll)}
                >
                  {applyToAll ? 'Cancel' : 'Apply Hours to Multiple Days'}
                </button>
              </div>
            </div>
            
            {applyToAll ? (
              <div className="bg-neutral-50 p-4 rounded-lg mb-6">
                <h3 className="heading-5 mb-4">Apply Hours to All Days</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="label">Template Day</label>
                    <select
                      className="input w-full"
                      value={templateDay}
                      onChange={(e) => setTemplateDay(e.target.value)}
                    >
                      {dayNames.map(day => (
                        <option key={day} value={day}>
                          {formatDayOfWeek(day)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button 
                      className="btn btn-primary"
                      onClick={applyTemplateToAll}
                    >
                      Apply to All Days
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
            
            <form onSubmit={handleSubmit}>
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Open</th>
                      <th>Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workingHours.map((hours, index) => (
                      <tr key={hours.dayOfWeek}>
                        <td className="font-medium">{formatDayOfWeek(hours.dayOfWeek)}</td>
                        <td>
                          <label className="cursor-pointer label flex justify-start gap-2">
                            <input
                              type="checkbox"
                              className="toggle toggle-primary"
                              checked={hours.isOpen}
                              onChange={(e) => handleWorkingHoursChange(index, 'isOpen', e.target.checked)}
                            />
                            <span className="label-text">{hours.isOpen ? 'Open' : 'Closed'}</span>
                          </label>
                        </td>
                        <td>
                          {hours.isOpen ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="time"
                                className="input"
                                value={hours.startTime}
                                onChange={(e) => handleWorkingHoursChange(index, 'startTime', e.target.value)}
                                required={hours.isOpen}
                              />
                              <span>to</span>
                              <input
                                type="time"
                                className="input"
                                value={hours.endTime}
                                onChange={(e) => handleWorkingHoursChange(index, 'endTime', e.target.value)}
                                required={hours.isOpen}
                              />
                            </div>
                          ) : (
                            <span className="text-neutral-500">Closed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-end mt-6">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  Save Working Hours
                </button>
              </div>
            </form>
          </div>
          
          {/* Current schedule display */}
          <div className="card p-6">
            <h2 className="heading-4 mb-6">Current Schedule</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workingHours.map(hours => (
                <div 
                  key={hours.dayOfWeek}
                  className={`p-4 rounded-lg border ${hours.isOpen ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
                >
                  <h3 className="heading-5 mb-2">{formatDayOfWeek(hours.dayOfWeek)}</h3>
                  {hours.isOpen ? (
                    <p className="text-green-700">
                      Open: {formatTime(hours.startTime)} - {formatTime(hours.endTime)}
                    </p>
                  ) : (
                    <p className="text-red-700">Closed</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Availability; 