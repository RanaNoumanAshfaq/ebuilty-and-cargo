import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { ChamakRibbon, TruckTaj, UrduMotto, TruckBackground, TruckPatternBorder, NazarBattuBadge } from '../components/TruckArt';

const getRoleDashboardPath = (role) => {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'truck_owner':
      return '/truck-owner';
    case 'transporter':
      return '/transporter';
    case 'business':
      return '/business';
    default:
      return '/';
  }
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, currentUser, userData } = useAuth();
  const { t, isUrdu } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (currentUser && userData?.role) {
      const targetPath = getRoleDashboardPath(userData.role);
      navigate(targetPath, { replace: true });
    }
  }, [currentUser, userData, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      const res = await login(email, password);
      const userRole = res?.user?.role;
      const rolePath = getRoleDashboardPath(userRole);
      const fromPath = location.state?.from?.pathname;
      const targetPath = (fromPath && fromPath !== '/' && fromPath !== '/login') ? fromPath : rolePath;
      navigate(targetPath, { replace: true });
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      if (serverMsg) {
        setError(serverMsg);
      } else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError(isUrdu ? 'سرور سے رابطہ نہیں ہو سکا۔ برائے مہربانی چیک کریں کہ بیک اینڈ چل رہا ہے۔' : 'Cannot connect to server. Please ensure the backend is running on port 5000.');
      } else {
        setError(isUrdu ? 'لاگ ان نا کام رہا۔ برائے مہربانی اپنی معلومات چیک کریں۔' : 'Failed to sign in. Please check your credentials.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center min-h-[85vh] px-4 py-8 relative">
      {/* Authentic Pakistani Truck Art & Peacock Background - Login Page Only */}
      <TruckBackground image="/images/peacock_truck_art_bg.jpg" opacity="opacity-100" />

      <div className="w-full max-w-md bg-white/95 backdrop-blur-md p-0 overflow-hidden relative border-2 border-cyan-400 shadow-2xl rounded-3xl z-10">
        {/* Top Truck Art Floral Pattern Border */}
        <TruckPatternBorder height="h-4" />
        <ChamakRibbon height="h-[4px]" />

        <div className="p-7">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-100 to-purple-100 flex items-center justify-center border border-cyan-300 shadow-sm">
                <TruckTaj size={28} />
              </div>
            </div>
            
            <h2 className={`text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 via-purple-700 to-rose-600 mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
              {t('loginWelcome')}
            </h2>
            <p className={`text-xs text-slate-600 mb-3 font-medium ${isUrdu ? 'font-urdu text-sm' : ''}`}>
              {t('loginSub')}
            </p>
            <div className="flex items-center justify-center gap-2">
              <UrduMotto />
              <NazarBattuBadge />
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-300 rounded-xl flex items-center gap-2 text-red-700 text-xs font-medium">
              <AlertCircle size={15} />
              <span className={isUrdu ? 'font-urdu text-sm' : ''}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className={`block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ${isUrdu ? 'font-urdu text-sm' : ''}`}>
                {t('emailLabel')}
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 ${isUrdu ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none text-slate-400`}>
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  dir="ltr"
                  className={`block w-full ${isUrdu ? 'pr-10 pl-3.5 text-right' : 'pl-10 pr-3.5 text-left'} py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white text-slate-900 placeholder-slate-400 text-sm transition-all`}
                  placeholder={t('emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ${isUrdu ? 'font-urdu text-sm' : ''}`}>
                {t('passwordLabel')}
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 ${isUrdu ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none text-slate-400`}>
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  required
                  dir="ltr"
                  className={`block w-full ${isUrdu ? 'pr-10 pl-3.5 text-right' : 'pl-10 pr-3.5 text-left'} py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white text-slate-900 placeholder-slate-400 text-sm transition-all`}
                  placeholder={t('passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className={`w-full btn-primary flex justify-center items-center py-2.5 mt-6 cursor-pointer shadow-md ${isUrdu ? 'font-urdu text-base' : ''}`}
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (loading ? t('signingIn') : t('signInBtn'))}
            </button>
          </form>

          {/* Quick Demo Credentials 1-Click Fill */}
          <div className="mt-5 pt-4 border-t border-slate-200">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
              Quick Demo Logins (1-Click Fill)
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => { setEmail('admin@ecargo.com'); setPassword('password123'); }}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium transition-colors text-left"
              >
                👑 <strong>Admin</strong>
              </button>
              <button
                type="button"
                onClick={() => { setEmail('business@ecargo.com'); setPassword('password123'); }}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium transition-colors text-left"
              >
                🏢 <strong>Business</strong>
              </button>
              <button
                type="button"
                onClick={() => { setEmail('transporter@ecargo.com'); setPassword('password123'); }}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium transition-colors text-left"
              >
                🚛 <strong>Transporter</strong>
              </button>
              <button
                type="button"
                onClick={() => { setEmail('driver@ecargo.com'); setPassword('password123'); }}
                className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-lg font-medium transition-colors text-left"
              >
                🚚 <strong>Driver / Owner</strong>
              </button>
            </div>
          </div>

          <div className={`mt-5 text-center text-xs text-slate-600 ${isUrdu ? 'font-urdu text-sm' : ''}`}>
            {t('dontHaveAccount')}{' '}
            <Link to="/register" className="text-red-700 hover:text-amber-700 transition-colors font-bold underline">
              {t('registerHere')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
