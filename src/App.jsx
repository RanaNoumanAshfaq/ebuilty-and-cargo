import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { User, Bell, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import TruckOwnerDashboard from './pages/dashboards/TruckOwnerDashboard';
import TransporterDashboard from './pages/dashboards/TransporterDashboard';
import BusinessDashboard from './pages/dashboards/BusinessDashboard';

const Navbar = () => {
  const { currentUser, logout, userData } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'notifications'), where('userId', '==', currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = [];
      snapshot.forEach(doc => docs.push({ id: doc.id, ...doc.data() }));
      setNotifications(docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    });
    return () => unsubscribe();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const clearNotification = async (id) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <nav className="glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-full bg-neon-blue flex items-center justify-center text-black font-bold">E</div>
            <span className="text-xl font-bold tracking-widest text-white hover:text-neon-blue transition-colors">
              CARGO-BILTY
            </span>
          </div>
          <div className="flex gap-4 items-center">
            {currentUser ? (
              <>
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-gray-400 hover:text-white relative transition-colors"
                  >
                    <Bell size={20} />
                    {notifications.length > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-black animate-pulse"></span>
                    )}
                  </button>
                  
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 glass-card bg-dark-bg/95 border border-white/10 shadow-2xl z-[60] max-h-[400px] overflow-y-auto">
                      <h4 className="text-sm font-bold text-white mb-4 px-2 pt-2">Notifications</h4>
                      {notifications.length === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-4">No new notifications</p>
                      ) : (
                        <div className="space-y-2 p-2">
                          {notifications.map(n => (
                            <div key={n.id} className="p-3 rounded bg-white/5 border border-white/5 flex justify-between items-start">
                              <div>
                                <p className="text-xs text-white font-medium">{n.message}</p>
                                <p className="text-[10px] text-gray-500 mt-1">{new Date(n.createdAt).toLocaleTimeString()}</p>
                              </div>
                              <button onClick={() => clearNotification(n.id)} className="text-gray-500 hover:text-white transition-colors">
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Link to="/profile" className="text-gray-300 hover:text-neon-blue transition-colors flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-neon-blue/10 flex items-center justify-center text-neon-blue border border-neon-blue/30">
                    <User size={16} />
                  </div>
                  <span className="text-sm hidden md:inline-block">
                    {userData?.name || currentUser.email}
                  </span>
                </Link>
                <Link to={`/${userData?.role === 'admin' ? 'admin' : userData?.role === 'truck_owner' ? 'truck-owner' : userData?.role === 'transporter' ? 'transporter' : 'business'}`} className="text-neon-blue hover:text-neon-purple transition-colors text-sm font-semibold">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="btn-outline">Logout</button>
              </>
            ) : (
              <Link to="/login" className="btn-outline">Login</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const Home = () => (
  <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
    <div className="text-center max-w-3xl">
      <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
        The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">Digital Bilty</span>
      </h1>
      <p className="text-lg md:text-xl text-gray-400 mb-10">
        Next-generation logistics platform connecting truck owners, transporters, and businesses in real-time.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Link to="/admin" className="glass-card hover:-translate-y-1">
          <h3 className="text-xl font-bold text-white mb-2">Admin</h3>
          <p className="text-sm text-gray-400">Manage system, verify users, handle disputes.</p>
        </Link>
        <Link to="/truck-owner" className="glass-card hover:-translate-y-1">
          <h3 className="text-xl font-bold text-white mb-2">Truck Owner</h3>
          <p className="text-sm text-gray-400">Manage fleet, accept bookings, track cargo.</p>
        </Link>
        <Link to="/transporter" className="glass-card hover:-translate-y-1">
          <h3 className="text-xl font-bold text-white mb-2">Cargo Transporter</h3>
          <p className="text-sm text-gray-400">Post shipments, browse trucks, track delivery.</p>
        </Link>
        <Link to="/business" className="glass-card hover:-translate-y-1">
          <h3 className="text-xl font-bold text-white mb-2">Business Owner</h3>
          <p className="text-sm text-gray-400">Track shipments, get digital confirmations.</p>
        </Link>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/truck-owner" element={
                <ProtectedRoute allowedRoles={['truck_owner']}>
                  <TruckOwnerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/transporter" element={
                <ProtectedRoute allowedRoles={['transporter']}>
                  <TransporterDashboard />
                </ProtectedRoute>
              } />
              <Route path="/business" element={
                <ProtectedRoute allowedRoles={['business']}>
                  <BusinessDashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
