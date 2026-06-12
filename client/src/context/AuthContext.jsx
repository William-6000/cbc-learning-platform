import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../utils/api.js';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('cbc_user') || 'null'));
  const [language, setLanguage] = useState('en');
  async function login(payload) {
    const data = await api('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) });
    localStorage.setItem('cbc_token', data.token); localStorage.setItem('cbc_user', JSON.stringify(data.user)); setUser(data.user); return data.user;
  }
  async function register(payload) {
    const data = await api('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) });
    localStorage.setItem('cbc_token', data.token); localStorage.setItem('cbc_user', JSON.stringify(data.user)); setUser(data.user); return data.user;
  }
  function logout() { localStorage.removeItem('cbc_token'); localStorage.removeItem('cbc_user'); setUser(null); }
  const value = useMemo(() => ({ user, login, register, logout, language, setLanguage }), [user, language]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
