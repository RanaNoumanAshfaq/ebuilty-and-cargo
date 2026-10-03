import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { User, Bell, X, Shield, Truck, Briefcase, Building2, ArrowRight, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { logisticsAPI, socket } from './api';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import TruckOwnerDashboard from './pages/dashboards/TruckOwnerDashboard';
import TransporterDashboard from './pages/dashboards/TransporterDashboard';
import BusinessDashboard from './pages/dashboards/BusinessDashboard';
import { ChamakRibbon, AjrakRibbon, TruckPhotoShowcase, TruckPatternBorder, TruckGhungrooTrim, TruckLotusArchBadge, TruckTaj, UrduMotto, WorkshopBadge, TruckPoetryBanner, TruckMorBadge, NazarBattuBadge } from './components/TruckArt';

const Navbar = () => {
  const { currentUser, logout, userData } = useAuth();
  const { language, toggleLanguage, t, isUrdu } = useLanguage();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = async () => {
    if (!currentUser) return;
    try {
      const res = await logisticsAPI.getNotifications();
      setNotifications(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchNotifications();
    socket.on('notification', (n) => {
      setNotifications(prev => [n, ...prev]);
    });
    return () => socket.off('notification');
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
      await logisticsAPI.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-cyan-200/80 shadow-xs transition-colors">
      {/* Top Authentic Pakistani Truck Art Pattern Border */}
      <TruckPatternBorder height="h-2.5 sm:h-3" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => {
              if (currentUser && userData?.role) {
                const target = 
                  userData.role === 'admin' ? '/admin/dashboard' :
                  (userData.role === 'truck_owner' || userData.role === 'fleet_owner' || userData.role === 'driver') ? '/fleet-owner/dashboard' :
                  userData.role === 'transporter' ? '/transporter/dashboard' :
                  '/shipper/dashboard';
                navigate(target);
              } else {
                navigate('/');
              }
            }}
          >
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 via-purple-600 to-amber-500 p-0.5 shadow-md group-hover:scale-105 transition-transform shrink-0">
              <div className="w-full h-full bg-[#FFFDF7] rounded-[10px] flex items-center justify-center overflow-hidden">
                <img src="/logo.jpg" alt="E-CARGO-BILTY" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-lg font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 via-purple-700 to-rose-600">
                {t('brandTitle')}
              </span>
              <span className={`text-[10px] tracking-wider flex items-center gap-1.5 -mt-0.5 text-slate-500 ${isUrdu ? 'font-urdu font-bold text-purple-700' : 'font-mono'}`}>
                {t('brandSubtitle')}
              </span>
            </div>
          </div>

          {/* Center Truck Art Peacock Badge */}
          <div className="hidden md:flex items-center gap-2">
            <TruckMorBadge />
          </div>

          {/* Right Navigation & User Controls */}
          <div className="flex gap-2 sm:gap-3 items-center">
            {/* Language Change Toggle Button */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-cyan-400 bg-sky-50/80 hover:bg-cyan-100 text-slate-800 text-xs font-bold shadow-xs transition-all cursor-pointer"
              title={language === 'en' ? 'Switch website to Urdu' : 'Switch website to English'}
            >
              <Globe size={15} className="text-cyan-700 shrink-0" />
              <span className="font-sans font-bold text-xs text-slate-800">
                {t('langToggle')}
              </span>
            </button>

            {currentUser ? (
              <>
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-slate-600 hover:text-cyan-700 relative transition-colors rounded-lg hover:bg-sky-50 cursor-pointer"
                    title={t('transitAlerts')}
                  >
                    <Bell size={19} />
                    {notifications.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-600 rounded-full border border-white shadow-xs animate-pulse"></span>
                    )}
                  </button>
                  
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-84 bg-white/90 backdrop-blur-2xl border border-cyan-200/90 shadow-[0_20px_50px_rgba(2,132,199,0.25)] rounded-2xl z-[60] max-h-[420px] overflow-y-auto p-4 modal-enter">
                      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <TruckTaj size={18} />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-800">{t('transitAlerts')}</h4>
                        </div>
                      </div>
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-6 font-mono">{t('noNotifications')}</p>
                      ) : (
                        <div className="space-y-2">
                          {notifications.map(n => (
                            <div key={n._id} className="p-3 rounded-xl bg-white/70 backdrop-blur-md border border-cyan-200/80 hover:border-purple-400 hover:shadow-xs flex justify-between items-start gap-2 transition-all">
                              <div>
                                <p className="text-xs text-slate-800 font-medium leading-relaxed">{n.message}</p>
                                <p className="text-[10px] font-mono text-cyan-700 mt-1 flex items-center gap-1 font-semibold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                  {new Date(n.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                              <button onClick={() => clearNotification(n._id)} className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer">
                                <X size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Link to="/profile" className="text-slate-700 hover:text-cyan-700 transition-colors flex items-center gap-2.5 px-2 py-1 rounded-lg hover:bg-sky-50">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-100 to-purple-100 flex items-center justify-center text-purple-700 border border-cyan-300 shadow-xs">
                    <User size={15} />
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 truncate max-w-[130px]">
                      {userData?.name || currentUser.email}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-700 font-bold capitalize leading-tight">
                      {t(`role_${userData?.role}`) || userData?.role?.replace('_', ' ') || 'User'}
                    </span>
                  </div>
                </Link>

                <Link 
                  to={`/${userData?.role === 'admin' ? 'admin' : userData?.role === 'truck_owner' ? 'truck-owner' : userData?.role === 'transporter' ? 'transporter' : 'business'}`} 
                  className="btn-primary text-xs !py-1.5 !px-3.5 shadow-sm"
                >
                  {t('dashboard')}
                </Link>
                <button onClick={handleLogout} className="btn-outline text-xs !py-1.5 !px-3 cursor-pointer">{t('logout')}</button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-primary text-xs !py-1.5 !px-4 shadow-sm">{t('login')}</Link>
                <Link to="/register" className="btn-outline text-xs !py-1.5 !px-3.5">{t('register')}</Link>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Signature Peacock Chamak Patti Ribbon border along bottom edge */}
      <ChamakRibbon height="h-[3px]" />
    </nav>
  );
};

const Home = () => {
  const { currentUser, userData } = useAuth();
  const { t, isUrdu } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser && userData?.role) {
      const target = 
        userData.role === 'admin' ? '/admin' :
        userData.role === 'truck_owner' ? '/truck-owner' :
        userData.role === 'transporter' ? '/transporter' :
        userData.role === 'business' ? '/business' : null;
      if (target) {
        navigate(target, { replace: true });
      }
    }
  }, [currentUser, userData, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 py-12 relative overflow-hidden bg-[#F0F9FF] page-enter">
      <div className="text-center max-w-4xl relative z-10">
        {/* Top Tag - Single Language with Antigravity Floating */}
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-cyan-400/90 bg-white/80 backdrop-blur-md shadow-md mb-6 animate-float-slow select-none">
          <span className="text-xl">🦚</span>
          <span className={`text-xs tracking-widest uppercase font-extrabold ${isUrdu ? 'font-urdu text-sm text-purple-900' : 'font-mono text-cyan-800'}`}>
            {t('homeTag')}
          </span>
        </div>

        <h1 className={`text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight text-slate-900 ${isUrdu ? 'font-urdu leading-normal' : ''}`}>
          {t('homeTitle1')} <br className="hidden md:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-purple-600 via-emerald-600 to-amber-500">
            {t('homeTitle2')}
          </span>
        </h1>
        
        <p className={`text-base md:text-xl text-slate-700 max-w-2xl mx-auto mb-8 leading-relaxed font-medium ${isUrdu ? 'font-urdu' : ''}`}>
          {t('homeDesc')}
        </p>

        {/* Truck Art Poetry Banner */}
        <div className="max-w-md mx-auto mb-4 animate-float-slow">
          <TruckPoetryBanner />
          <TruckGhungrooTrim className="opacity-95" />
        </div>

        {/* Authentic Decorated Trucks Showcase */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto my-8 text-left">
          <TruckPhotoShowcase 
            image="/images/peacock_truck_art_bg.jpg"
            caption="قومی شاہراہ نیٹ ورک • ہیوی کیریئر فلیٹ"
            subcaption="National Commercial Carrier • Verified Logistics Fleet"
            tag="معیاری خدمات"
            tagEn="Quality Logistics"
          />
          <TruckPhotoShowcase 
            image="/images/peacock_truck_art_bg.jpg"
            caption="ای کارگو باربرداری • محفوظ اور بروقت ترسیل"
            subcaption="E-Cargo Bilty Network • Verified Nationwide Dispatch"
            tag="محفوظ ترسیل"
            tagEn="Safe Transit"
          />
        </div>

        {/* Truck Art Pattern Divider Ribbon */}
        <div className="max-w-3xl mx-auto mb-10 rounded-2xl overflow-hidden shadow-md border-2 border-cyan-400">
          <TruckPatternBorder height="h-7 sm:h-9" />
        </div>
        
        {/* 4 Role Portal Cards with 3D Glassmorphism & Hover Elevation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto text-left">
          {/* Admin Card */}
          <Link to="/admin" className="glass-card-3d border-2 border-purple-300/80 hover:border-purple-500 group relative overflow-hidden transition-all">
            <div className="absolute top-0 left-0 bottom-0 w-2 bg-gradient-to-b from-purple-600 via-indigo-600 to-cyan-400"></div>
            <div className="flex items-start justify-between mb-3 pl-2">
              <div className="w-12 h-12 rounded-xl bg-purple-50 border-2 border-purple-300 flex items-center justify-center text-purple-700 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-xs">
                <Shield size={24} />
              </div>
              <span className={`text-xs font-bold text-purple-900 bg-purple-100/90 backdrop-blur-sm px-3 py-1 rounded-full border border-purple-300 shadow-xs ${isUrdu ? 'font-urdu text-sm' : 'font-sans'}`}>
                {t('role_admin')}
              </span>
            </div>
            <div className="pl-2">
              <h3 className={`text-lg font-bold text-slate-900 mb-1 group-hover:text-purple-700 transition-colors flex items-center justify-between ${isUrdu ? 'font-urdu' : ''}`}>
                <span>{t('adminCardTitle')}</span>
                <ArrowRight size={18} className={`text-purple-600 group-hover:translate-x-1.5 transition-transform ${isUrdu ? 'rotate-180' : ''}`} />
              </h3>
              <p className={`text-xs text-slate-600 leading-relaxed font-medium ${isUrdu ? 'font-urdu text-sm' : ''}`}>
                {t('adminCardDesc')}
              </p>
            </div>
          </Link>

          {/* Truck Owner Card */}
          <Link to="/truck-owner" className="glass-card-3d border-2 border-cyan-300/80 hover:border-cyan-500 group relative overflow-hidden transition-all">
            <div className="absolute top-0 left-0 bottom-0 w-2 bg-gradient-to-b from-cyan-400 via-amber-500 to-rose-500"></div>
            <div className="flex items-start justify-between mb-3 pl-2">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 border-2 border-cyan-300 flex items-center justify-center text-cyan-800 group-hover:scale-110 group-hover:-rotate-3 transition-transform shadow-xs">
                <Truck size={24} />
              </div>
              <span className={`text-xs font-bold text-cyan-900 bg-cyan-100/90 backdrop-blur-sm px-3 py-1 rounded-full border border-cyan-300 shadow-xs ${isUrdu ? 'font-urdu text-sm' : 'font-sans'}`}>
                {t('role_truck_owner')}
              </span>
            </div>
            <div className="pl-2">
              <h3 className={`text-lg font-bold text-slate-900 mb-1 group-hover:text-cyan-700 transition-colors flex items-center justify-between ${isUrdu ? 'font-urdu' : ''}`}>
                <span>{t('truckOwnerCardTitle')}</span>
                <ArrowRight size={18} className={`text-cyan-600 group-hover:translate-x-1.5 transition-transform ${isUrdu ? 'rotate-180' : ''}`} />
              </h3>
              <p className={`text-xs text-slate-600 leading-relaxed font-medium ${isUrdu ? 'font-urdu text-sm' : ''}`}>
                {t('truckOwnerCardDesc')}
              </p>
            </div>
          </Link>

          {/* Transporter Card */}
          <Link to="/transporter" className="glass-card-3d border-2 border-cyan-400/80 hover:border-cyan-600 group relative overflow-hidden transition-all">
            <div className="absolute top-0 left-0 bottom-0 w-2 bg-gradient-to-b from-cyan-500 via-blue-600 to-pink-500"></div>
            <div className="flex items-start justify-between mb-3 pl-2">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 border-2 border-cyan-400 flex items-center justify-center text-cyan-800 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-xs">
                <Briefcase size={24} />
              </div>
              <span className={`text-xs font-bold text-cyan-900 bg-cyan-100/90 backdrop-blur-sm px-3 py-1 rounded-full border border-cyan-300 shadow-xs ${isUrdu ? 'font-urdu text-sm' : 'font-sans'}`}>
                {t('role_transporter')}
              </span>
            </div>
            <div className="pl-2">
              <h3 className={`text-lg font-bold text-slate-900 mb-1 group-hover:text-cyan-700 transition-colors flex items-center justify-between ${isUrdu ? 'font-urdu' : ''}`}>
                <span>{t('transporterCardTitle')}</span>
                <ArrowRight size={18} className={`text-cyan-600 group-hover:translate-x-1.5 transition-transform ${isUrdu ? 'rotate-180' : ''}`} />
              </h3>
              <p className={`text-xs text-slate-600 leading-relaxed font-medium ${isUrdu ? 'font-urdu text-sm' : ''}`}>
                {t('transporterCardDesc')}
              </p>
            </div>
          </Link>

          {/* Business Shipper Card */}
          <Link to="/business" className="glass-card-3d border-2 border-emerald-400/80 hover:border-emerald-600 group relative overflow-hidden transition-all">
            <div className="absolute top-0 left-0 bottom-0 w-2 bg-gradient-to-b from-emerald-500 via-yellow-400 to-red-600"></div>
            <div className="flex items-start justify-between mb-3 pl-2">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border-2 border-emerald-400 flex items-center justify-center text-emerald-800 group-hover:scale-110 group-hover:-rotate-3 transition-transform shadow-xs">
                <Building2 size={24} />
              </div>
              <span className={`text-xs font-bold text-emerald-900 bg-emerald-100/90 backdrop-blur-sm px-3 py-1 rounded-full border border-emerald-300 shadow-xs ${isUrdu ? 'font-urdu text-sm' : 'font-sans'}`}>
                {t('role_business')}
              </span>
            </div>
            <div className="pl-2">
              <h3 className={`text-lg font-bold text-slate-900 mb-1 group-hover:text-emerald-700 transition-colors flex items-center justify-between ${isUrdu ? 'font-urdu' : ''}`}>
                <span>{t('businessCardTitle')}</span>
                <ArrowRight size={18} className={`text-emerald-600 group-hover:translate-x-1.5 transition-transform ${isUrdu ? 'rotate-180' : ''}`} />
              </h3>
              <p className={`text-xs text-slate-600 leading-relaxed font-medium ${isUrdu ? 'font-urdu text-sm' : ''}`}>
                {t('businessCardDesc')}
              </p>
            </div>
          </Link>
        </div>

        {/* Workshop Artisan Tag Footer */}
        <div className="mt-14 pt-8 border-t border-amber-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-3">
          <WorkshopBadge />
          <span className={`text-[11px] text-slate-500 font-bold ${isUrdu ? 'font-urdu' : 'font-mono'}`}>
            {t('footerText')}
          </span>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-[#F0F9FF] text-slate-900">
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
                {/* Admin Portals */}
                <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

                {/* Fleet Owner / Truck Owner Portals */}
                <Route path="/truck-owner" element={<ProtectedRoute allowedRoles={['truck_owner', 'fleet_owner', 'driver']}><TruckOwnerDashboard /></ProtectedRoute>} />
                <Route path="/truck-owner/dashboard" element={<ProtectedRoute allowedRoles={['truck_owner', 'fleet_owner', 'driver']}><TruckOwnerDashboard /></ProtectedRoute>} />
                <Route path="/fleet-owner" element={<ProtectedRoute allowedRoles={['truck_owner', 'fleet_owner', 'driver']}><TruckOwnerDashboard /></ProtectedRoute>} />
                <Route path="/fleet-owner/dashboard" element={<ProtectedRoute allowedRoles={['truck_owner', 'fleet_owner', 'driver']}><TruckOwnerDashboard /></ProtectedRoute>} />
                <Route path="/fleet" element={<ProtectedRoute allowedRoles={['truck_owner', 'fleet_owner', 'driver']}><TruckOwnerDashboard /></ProtectedRoute>} />
                <Route path="/fleet/dashboard" element={<ProtectedRoute allowedRoles={['truck_owner', 'fleet_owner', 'driver']}><TruckOwnerDashboard /></ProtectedRoute>} />

                {/* Transporter Portals */}
                <Route path="/transporter" element={<ProtectedRoute allowedRoles={['transporter']}><TransporterDashboard /></ProtectedRoute>} />
                <Route path="/transporter/dashboard" element={<ProtectedRoute allowedRoles={['transporter']}><TransporterDashboard /></ProtectedRoute>} />

                {/* Business / Shipper Portals */}
                <Route path="/business" element={<ProtectedRoute allowedRoles={['business', 'shipper']}><BusinessDashboard /></ProtectedRoute>} />
                <Route path="/business/dashboard" element={<ProtectedRoute allowedRoles={['business', 'shipper']}><BusinessDashboard /></ProtectedRoute>} />
                <Route path="/shipper" element={<ProtectedRoute allowedRoles={['business', 'shipper']}><BusinessDashboard /></ProtectedRoute>} />
                <Route path="/shipper/dashboard" element={<ProtectedRoute allowedRoles={['business', 'shipper']}><BusinessDashboard /></ProtectedRoute>} />
              </Routes>
            </main>
          </div>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
