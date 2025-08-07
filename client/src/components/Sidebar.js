import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove the authentication token
    localStorage.removeItem('token');
    // Redirect to login page
    navigate('/login');
  };

  return (
    <div className="w-64 h-screen bg-gray-800 text-white fixed">
      <h2 className="text-2xl font-bold p-4 border-b border-gray-700">Inventory System</h2>
      <ul className="mt-4">
        <li className="p-2 hover:bg-gray-700"><Link to="/home" className="block">Dashboard</Link></li>
        <li className="p-2 hover:bg-gray-700"><Link to="/inventory" className="block">Inventory</Link></li>
        <li className="p-2 hover:bg-gray-700"><Link to="/orders" className="block">Orders</Link></li>
        <li className="p-2 hover:bg-gray-700"><Link to="/suppliers" className="block">Suppliers</Link></li>
        <li className="p-2 hover:bg-gray-700"><Link to="/reports" className="block">Reports</Link></li>
        <li className="p-2 hover:bg-gray-700"><Link to="/settings" className="block">Settings</Link></li>
        <li className="p-2 hover:bg-gray-700">
          <button onClick={handleLogout} className="w-full text-left">Logout</button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;