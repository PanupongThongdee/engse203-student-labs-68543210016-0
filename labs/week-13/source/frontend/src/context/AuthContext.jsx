import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { clearAuth, loadAuth, saveAuth } from '../services/authStorage.js';
import { loginRequest } from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadAuth()?.user ?? null);

  useEffect(() => {
    const handleExpired = () => setUser(null);
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await loginRequest(email, password);
    saveAuth(result);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isStaff: user?.role === 'staff', login, logout }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth ต้องใช้ภายใน <AuthProvider>');
  return context;
}