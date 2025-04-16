import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { path: '/business/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/business/appointments', icon: '📅', label: 'Appointments' },
    { path: '/business/customers', icon: '👥', label: 'Customers' },
    { path: '/business/services', icon: '🧰', label: 'Services' },
    { path: '/business/availability', icon: '⏱️', label: 'Availability' },
    { path: '/business/staff', icon: '👨‍👩‍👧', label: 'Staff' },
    { path: '/business/profile', icon: '🏢', label: 'Business Profile' },
    { path: '/business/notifications', icon: '🔔', label: 'Notifications' },
    { path: '/business/analytics', icon: '📈', label: 'Analytics' },
    { path: '/business/settings', icon: '⚙️', label: 'Account Settings' },
  ];

  return (
    <div
      className={`bg-gray-800 text-white h-screen ${
        isCollapsed ? 'w-16' : 'w-64'
      } transition-all duration-300 ease-in-out flex flex-col`}
    >
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <h2 className={`font-bold text-xl ${isCollapsed ? 'hidden' : 'block'}`}>
          Zentra Business
        </h2>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-400 hover:text-white"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <ul className="py-4">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 ${
                  location.pathname === item.path
                    ? 'bg-blue-600'
                    : 'hover:bg-gray-700'
                } transition-colors duration-200`}
              >
                <span className="text-xl">{item.icon}</span>
                <span
                  className={`ml-4 ${isCollapsed ? 'hidden' : 'block'}`}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 border-t border-gray-700">
        <Link
          to="/logout"
          className="flex items-center text-gray-400 hover:text-white transition-colors duration-200"
        >
          <span className="text-xl">🚪</span>
          <span className={`ml-4 ${isCollapsed ? 'hidden' : 'block'}`}>
            Logout
          </span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar; 