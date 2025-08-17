import React, { createContext, useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';


import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { email, password });
    const { token } = response.data;
    if (token) {
      localStorage.setItem('token', token);
     const decoded = jwtDecode(token);

      setUser({ ...decoded, token });
      return decoded;
    }
    throw new Error('Login failed');
  };

  const register = async (name, email, password, role) => {
    await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, { name, email, password, role });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setUser({ ...decoded, token });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};