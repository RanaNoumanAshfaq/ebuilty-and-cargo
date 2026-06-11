import { createContext, useContext, useEffect, useState } from 'react';
import { authAPI, socket } from '../api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, role, name, cnic, phone, businessName, businessRegNumber) {
    const { data } = await authAPI.register({ email, password, role, name, cnic, phone, businessName, businessRegNumber });
    localStorage.setItem('token', data.token);
    setCurrentUser(data.user);
    setUserData(data.user);
    return data;
  }

  async function login(email, password) {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('token', data.token);
    setCurrentUser(data.user);
    setUserData(data.user);
    return data;
  }

  function logout() {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setUserData(null);
    socket.disconnect();
  }

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await authAPI.getMe();
          setCurrentUser(data);
          setUserData(data);
          socket.connect();
          socket.emit('join', data._id);
        } catch (e) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const value = { currentUser, userData, login, signup, logout };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-t-2 border-neon-blue animate-spin"></div>
          </div>
          <p className="mt-4 text-xs font-bold tracking-widest text-neon-blue uppercase animate-pulse">Connecting to MongoDB Hub</p>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
}
