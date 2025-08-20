/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // ---- LOGIN ----
  const login = async (email, password) => {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/auth/login`,
      { email, password }
    );

    const { token } = response.data;
    if (!token) throw new Error('Login failed');

    try {
      const decoded = jwtDecode(token);

      // check expiration
      if (decoded.exp * 1000 < Date.now()) {
        throw new Error('Token expired');
      }

      localStorage.setItem('token', token);
      setUser({ ...decoded, token });
      return decoded;
    } catch (err) {
      console.error("Invalid token:", err);
      logout();
      throw err;
    }
  };

  // ---- REGISTER ----
  const register = async (name, email, password, role) => {
    await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
      name,
      email,
      password,
      role,
    });
  };

  // ---- LOGOUT ----
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // ---- LOAD TOKEN ON REFRESH ----
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const decoded = jwtDecode(token);

      if (decoded.exp * 1000 < Date.now()) {
        logout();
        return;
      }

      setUser({ ...decoded, token });
    } catch (err) {
      console.error("Error decoding token:", err);
      logout();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
