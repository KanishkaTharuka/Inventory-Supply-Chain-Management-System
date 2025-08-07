import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import Sidebar from './components/Sidebar';
import Inventory from './pages/Inventory';
import Order from './pages/Orders';


function App() {
  const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';

  return (
    <Router>
      <div className="flex">
        {!isAuthPage && (
          <ProtectedRoute>
            <Sidebar />
          </ProtectedRoute>
        )}
        <div className={`flex-1 ${!isAuthPage ? 'ml-0' : ''}`}>
          <Routes>
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/login" element={<LoginForm />} />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <Inventory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Order />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;