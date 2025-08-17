import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './components/Auth/Login.jsx';
import Register from './components/Auth/Register.jsx';
import AdminDashboard from './components/Dashboard/AdminDashboard.jsx';
import ManagerDashboard from './components/Dashboard/ManagerDashboard.jsx';
import EmployeeDashboard from './components/Dashboard/EmployeeDashboard.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/manager" element={<ManagerDashboard />} />
            <Route path="/employee" element={<EmployeeDashboard />} />
            <Route path="/" element={<Login />} />
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;