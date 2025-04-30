import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, isSameMonth, isSameDay, isToday } from 'date-fns';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faCalendarAlt, faClock } from '@fortawesome/free-solid-svg-icons';

interface AvailabilityCalendarProps {
  businessId: number;
  serviceId: number;
  serviceDuration: number;
  onDateSelect: (date: Date) => void;
  onTimeSelect: (timeSlot: string) => void;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  businessId,
  serviceId,
  serviceDuration,
  onDateSelect,
  onTimeSelect
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const onDateClick = (day: Date) => {
    // Don't allow selecting days in the past
    if (day < new Date(new Date().setHours(0, 0, 0, 0))) {
      return;
    }
    
    setSelectedDate(day);
    setSelectedTimeSlot(null);
    onDateSelect(day);
    fetchAvailableTimeSlots(day);
  };

  const fetchAvailableTimeSlots = async (date: Date) => {
    if (!businessId || !serviceId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const response = await axios.get('/api/appointments/available-slots', {
        params: {
          businessId,
          serviceId,
          date: formattedDate
        }
      });
      
      setAvailableTimeSlots(response.data);
    } catch (err) {
      console.error('Error fetching available time slots:', err);
      setError('Failed to load available times. Please try again.');
      setAvailableTimeSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSlotClick = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
    onTimeSelect(timeSlot);
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between p-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded hover:bg-gray-100 transition"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <div className="text-xl font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </div>
        <button
          onClick={nextMonth}
          className="p-2 rounded hover:bg-gray-100 transition"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map((day, i) => (
          <div 
            key={i} 
            className="text-center text-sm font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = new Date(monthStart);
    const endDate = new Date(monthEnd);
    
    // Adjust to show full weeks
    startDate.setDate(startDate.getDate() - startDate.getDay());
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    // Generate date range manually since eachDayOfInterval is not available
    const dateRange: Date[] = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dateRange.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {dateRange.map((day: Date, i: number) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelectedDay = selectedDate && isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);
          const isPastDate = day < new Date(new Date().setHours(0, 0, 0, 0));
          
          return (
            <div
              key={i}
              onClick={() => !isPastDate && onDateClick(day)}
              className={`
                p-2 h-12 flex items-center justify-center rounded cursor-pointer
                ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                ${isSelectedDay ? 'bg-blue-500 text-white' : ''}
                ${isTodayDate && !isSelectedDay ? 'border border-blue-500' : ''}
                ${isPastDate ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'}
              `}
            >
              {format(day, 'd')}
            </div>
          );
        })}
      </div>
    );
  };

  const renderTimeSlots = () => {
    if (!selectedDate) {
      return (
        <div className="text-center p-4 text-gray-500">
          <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
          Select a date to view available times
        </div>
      );
    }

    if (loading) {
      return <div className="text-center p-4">Loading available times...</div>;
    }

    if (error) {
      return <div className="text-center p-4 text-red-500">{error}</div>;
    }

    if (availableTimeSlots.length === 0) {
      return (
        <div className="text-center p-4 text-gray-500">
          No available times on {format(selectedDate, 'MMMM d, yyyy')}
        </div>
      );
    }

    return (
      <div>
        <h3 className="font-medium mb-2 px-4">
          Available Times for {format(selectedDate, 'MMMM d, yyyy')}
        </h3>
        <div className="grid grid-cols-3 gap-2 px-4 pb-4">
          {availableTimeSlots.map((timeSlot: string, i: number) => (
            <button
              key={i}
              onClick={() => handleTimeSlotClick(timeSlot)}
              className={`
                p-2 rounded text-sm flex items-center justify-center
                ${selectedTimeSlot === timeSlot
                  ? 'bg-blue-500 text-white'
                  : 'border border-gray-300 hover:border-blue-500'}
              `}
            >
              <FontAwesomeIcon icon={faClock} className="mr-1" />
              {timeSlot}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
      <div className="border-t border-gray-200 mt-4 pt-2">
        {renderTimeSlots()}
      </div>
    </div>
  );
};

export default AvailabilityCalendar; 