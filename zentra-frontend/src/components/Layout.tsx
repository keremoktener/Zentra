import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-md py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-600">Zentra</Link>
          <nav className="flex space-x-4">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition">Home</Link>
            <Link to="/about" className="text-gray-700 hover:text-blue-600 transition">About</Link>
            <Link to="/login" className="text-gray-700 hover:text-blue-600 transition">Login</Link>
            <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">Sign Up</Link>
          </nav>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-4">Zentra</h2>
              <p className="text-gray-300">Smart Appointment & Planning App</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">Links</h3>
              <ul className="space-y-1">
                <li><Link to="/" className="text-gray-300 hover:text-white transition">Home</Link></li>
                <li><Link to="/about" className="text-gray-300 hover:text-white transition">About</Link></li>
                <li><Link to="/contact" className="text-gray-300 hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-gray-700 text-center text-gray-400">
            &copy; {new Date().getFullYear()} Zentra. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 