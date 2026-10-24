import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
const Context = createContext();
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState('');
  async function restore() {
    setLoading(true);
    setError('');
    try {
      setUser((await api('/auth/me')).user);
    } catch (e) {
      if (e.status !== 401) setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    restore();
  }, []);
  return (
    <Context.Provider
      value={{
        user,
        setUser,
        loading,
        error,
        restore,
        logout: async () => {
          await api('/auth/logout', { method: 'POST', body: {} });
          setUser(null);
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useAuth = () => useContext(Context);
