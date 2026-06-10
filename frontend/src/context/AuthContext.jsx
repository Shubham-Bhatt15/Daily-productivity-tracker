import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    api.get('/auth/me')
      .then(res => setUser(res.data)) // ← res.data IS the user
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  } else {
    setLoading(false);
  }
}, []);

const login = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  const { token, ...user } = res.data; // ← split token from user fields
  localStorage.setItem('token', token);
  setUser(user);
  return res.data;
};

const register = async (name, email, password) => {
  const res = await api.post('/auth/register', { name, email, password });
  const { token, ...user } = res.data; // ← same fix
  localStorage.setItem('token', token);
  setUser(user);
  return res.data;
};

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);