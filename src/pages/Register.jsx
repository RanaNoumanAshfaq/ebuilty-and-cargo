import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader2, User, Briefcase, Phone, CreditCard, Building2 } from 'lucide-react';
import { ChamakRibbon, TruckTaj, UrduMotto, TruckBackground, TruckPoetryBanner, TruckPatternBorder, TruckMorBadge, NazarBattuBadge } from '../components/TruckArt';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [role, setRole] = useState('truck_owner');
  const [cnic, setCnic] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessRegNumber, setBusinessRegNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const { t, isUrdu } = useLanguage();
  const navigate = useNavigate();

  const getRoleDashboardPath = (userRole) => {
    switch (userRole) {
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

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== passwordConfirm) {
      return setError(isUrdu ? 'پاس ورڈز مطابقت نہیں رکھتے' : 'Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      const res = await signup(email, password, role, name, cnic, phone, businessName, businessRegNumber);
      const userRole = res?.user?.role || role;
      navigate(getRoleDashboardPath(userRole), { replace: true });
    } catch (err) {
      setError(isUrdu ? ('اکاؤنٹ بنانے میں مسئلہ پیش آیا: ' + err.message) : ('Failed to create an account. ' + err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[85vh] px-4 py-10 relative">
      {/* Authentic Pakistani Truck Art & Peacock Background - Registration Page Only */}
      <TruckBackground image="/images/peacock_truck_art_bg.jpg" opacity="opacity-100" />

      <div className="w-full max-w-lg mb-4 relative z-10">
        <TruckPoetryBanner />
      </div>

      <div className="bg-white/95 backdrop-blur-md w-full max-w-lg p-0 overflow-hidden relative border-2 border-cyan-400 shadow-2xl rounded-3xl z-10">
        {/* Top Truck Art Floral Pattern Border */}
        <TruckPatternBorder height="h-4" />
        <ChamakRibbon height="h-[4px]" />

        <div className="p-7">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-100 via-purple-50 to-amber-100 flex items-center justify-center border-2 border-cyan-400 shadow-md">
                <TruckTaj size={32} />
              </div>
            </div>
            <div className="mb-2">
              <TruckMorBadge />
            </div>
            <h2 className={`text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 via-purple-700 to-rose-600 mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
              {t('regTitle')}
            </h2>
            <p className={`text-xs text-slate-600 mb-3 font-medium ${isUrdu ? 'font-urdu text-sm' : ''}`}>
              {t('regSub')}
            </p>
            <div className="flex items-center justify-center gap-2">
              <UrduMotto />
              <NazarBattuBadge />
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-300 rounded-xl flex items-center gap-2.5 text-red-700 text-xs font-semibold">
              <AlertCircle size={16} className="text-red-600 shrink-0" />
              <span className={isUrdu ? 'font-urdu text-sm' : ''}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className={`block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ${isUrdu ? 'font-urdu text-sm' : ''}`}>
                {t('nameLabel')}
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 ${isUrdu ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none text-slate-400`}>
                  <User size={16} />
                </div>
                <input
                  type="text"
                  required
                  className={`block w-full ${isUrdu ? 'pr-10 pl-3.5 text-right' : 'pl-10 pr-3.5 text-left'} py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 text-slate-900 placeholder-slate-400 text-sm transition-all`}
                  placeholder={t('namePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    className={`block w-full ${isUrdu ? 'pr-10 pl-3.5 text-right' : 'pl-10 pr-3.5 text-left'} py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 text-slate-900 placeholder-slate-400 text-sm transition-all`}
                    placeholder={t('emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ${isUrdu ? 'font-urdu text-sm' : ''}`}>
                  {t('roleSelectLabel')}
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 ${isUrdu ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none text-slate-400`}>
                    <Briefcase size={16} />
                  </div>
                  <select
                    className={`block w-full ${isUrdu ? 'pr-10 pl-3.5 text-right font-urdu' : 'pl-10 pr-3.5 text-left'} py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 text-slate-900 text-sm transition-all cursor-pointer font-medium`}
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="truck_owner" className="bg-white text-slate-900">{t('role_truck_owner')}</option>
                    <option value="transporter" className="bg-white text-slate-900">{t('role_transporter')}</option>
                    <option value="business" className="bg-white text-slate-900">{t('role_business')}</option>
                    <option value="admin" className="bg-white text-slate-900">{t('role_admin')}</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ${isUrdu ? 'font-urdu text-sm' : ''}`}>
                  {t('cnicLabel')}
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 ${isUrdu ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none text-slate-400`}>
                    <CreditCard size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    className={`block w-full ${isUrdu ? 'pr-10 pl-3.5 text-right' : 'pl-10 pr-3.5 text-left'} py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 text-slate-900 placeholder-slate-400 text-sm font-mono transition-all`}
                    placeholder={t('cnicPlaceholder')}
                    value={cnic}
                    onChange={(e) => setCnic(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ${isUrdu ? 'font-urdu text-sm' : ''}`}>
                  {t('phoneLabel')}
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 ${isUrdu ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none text-slate-400`}>
                    <Phone size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    className={`block w-full ${isUrdu ? 'pr-10 pl-3.5 text-right' : 'pl-10 pr-3.5 text-left'} py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 text-slate-900 placeholder-slate-400 text-sm font-mono transition-all`}
                    placeholder={t('phonePlaceholder')}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {(role === 'business' || role === 'transporter') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
                <div>
                  <label className={`block text-xs font-bold text-amber-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 ${isUrdu ? 'font-urdu text-sm' : ''}`}>
                    <Building2 size={14} className="text-amber-700" />
                    <span>{t('businessNameLabel')}</span>
                  </label>
                  <input
                    type="text"
                    required
                    className={`block w-full px-3.5 py-2 bg-white border border-amber-300 rounded-xl focus:outline-none focus:border-amber-500 text-slate-900 placeholder-slate-400 text-sm transition-all ${isUrdu ? 'text-right' : 'text-left'}`}
                    placeholder={t('businessNamePlaceholder')}
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold text-amber-900 uppercase tracking-wider mb-1.5 ${isUrdu ? 'font-urdu text-sm' : ''}`}>
                    {t('businessRegLabel')}
                  </label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    className={`block w-full px-3.5 py-2 bg-white border border-amber-300 rounded-xl focus:outline-none focus:border-amber-500 text-slate-900 placeholder-slate-400 text-sm font-mono transition-all ${isUrdu ? 'text-right' : 'text-left'}`}
                    placeholder={t('businessRegPlaceholder')}
                    value={businessRegNumber}
                    onChange={(e) => setBusinessRegNumber(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    className={`block w-full ${isUrdu ? 'pr-10 pl-3.5 text-right' : 'pl-10 pr-3.5 text-left'} py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 text-slate-900 placeholder-slate-400 text-sm transition-all`}
                    placeholder={t('passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ${isUrdu ? 'font-urdu text-sm' : ''}`}>
                  {t('confirmPasswordLabel')}
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 ${isUrdu ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none text-slate-400`}>
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    required
                    dir="ltr"
                    className={`block w-full ${isUrdu ? 'pr-10 pl-3.5 text-right' : 'pl-10 pr-3.5 text-left'} py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 text-slate-900 placeholder-slate-400 text-sm transition-all`}
                    placeholder={t('passwordPlaceholder')}
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className={`w-full btn-primary flex justify-center items-center py-3 mt-6 cursor-pointer shadow-lg shadow-amber-500/20 font-bold ${isUrdu ? 'font-urdu text-base' : ''}`}
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (loading ? t('creatingAccount') : t('signUpBtn'))}
            </button>
          </form>

          <div className={`mt-6 text-center text-xs text-slate-600 ${isUrdu ? 'font-urdu text-sm' : ''}`}>
            {t('alreadyHaveAccount')}{' '}
            <Link to="/login" className="text-red-700 hover:text-amber-600 transition-colors font-bold underline">
              {t('loginHere')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
