import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  CreditCard, 
  Building2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  Truck,
  Briefcase
} from 'lucide-react';
import { 
  ChamakRibbon, 
  UrduMotto, 
  TruckBackground, 
  TruckPoetryBanner, 
  TruckPatternBorder, 
  TruckMorBadge, 
  NazarBattuBadge 
} from '../components/TruckArt';

import { 
  formatCNIC, 
  formatPhone, 
  validateEmail, 
  validatePassword, 
  validateConfirmPassword, 
  validateCNIC, 
  validatePhone, 
  validateNTN, 
  validateRequired 
} from '../utils/validation';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('business');
  const [cnic, setCnic] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessRegNumber, setBusinessRegNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50, isHovered: false });

  // Real-time validation errors and touched state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const cardRef = useRef(null);
  const { register } = useAuth();
  const { t, isUrdu } = useLanguage();
  const navigate = useNavigate();

  // Field validation helper
  const validateField = (field, val, allValues = {}) => {
    let err = null;
    switch (field) {
      case 'name':
        err = validateRequired(val, isUrdu ? 'پورا نام' : 'Full Name', isUrdu);
        break;
      case 'email':
        err = validateEmail(val, isUrdu);
        break;
      case 'password':
        err = validatePassword(val, isUrdu);
        break;
      case 'confirmPassword':
        err = validateConfirmPassword(allValues.password ?? password, val, isUrdu);
        break;
      case 'cnic':
        err = validateCNIC(val, isUrdu);
        break;
      case 'phone':
        err = validatePhone(val, isUrdu);
        break;
      case 'businessName':
        if (role === 'business' || role === 'transporter') {
          err = validateRequired(val, isUrdu ? 'کاروبار کا نام' : 'Business Name', isUrdu);
        }
        break;
      case 'businessRegNumber':
        if (role === 'business' || role === 'transporter') {
          err = validateNTN(val, isUrdu, true);
        }
        break;
      default:
        break;
    }
    return err;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    let val = '';
    if (field === 'name') val = name;
    if (field === 'email') val = email;
    if (field === 'password') val = password;
    if (field === 'confirmPassword') val = confirmPassword;
    if (field === 'cnic') val = cnic;
    if (field === 'phone') val = phone;
    if (field === 'businessName') val = businessName;
    if (field === 'businessRegNumber') val = businessRegNumber;

    const err = validateField(field, val);
    setErrors(prev => ({ ...prev, [field]: err }));
  };

  const handleFieldChange = (field, value) => {
    let cleanVal = value;
    if (field === 'cnic') cleanVal = formatCNIC(value);
    if (field === 'phone') cleanVal = formatPhone(value);

    if (field === 'name') setName(cleanVal);
    if (field === 'email') setEmail(cleanVal);
    if (field === 'password') setPassword(cleanVal);
    if (field === 'confirmPassword') setConfirmPassword(cleanVal);
    if (field === 'cnic') setCnic(cleanVal);
    if (field === 'phone') setPhone(cleanVal);
    if (field === 'businessName') setBusinessName(cleanVal);
    if (field === 'businessRegNumber') setBusinessRegNumber(cleanVal);

    if (touched[field]) {
      const err = validateField(field, cleanVal);
      setErrors(prev => ({ ...prev, [field]: err }));
    }
  };

  const validateAll = () => {
    const newErrors = {};
    newErrors.name = validateField('name', name);
    newErrors.email = validateField('email', email);
    newErrors.password = validateField('password', password);
    newErrors.confirmPassword = validateField('confirmPassword', confirmPassword, { password });
    newErrors.cnic = validateField('cnic', cnic);
    newErrors.phone = validateField('phone', phone);
    if (role === 'business' || role === 'transporter') {
      newErrors.businessName = validateField('businessName', businessName);
      newErrors.businessRegNumber = validateField('businessRegNumber', businessRegNumber);
    }

    // Filter nulls
    const filtered = {};
    let hasError = false;
    Object.keys(newErrors).forEach(k => {
      if (newErrors[k]) {
        filtered[k] = newErrors[k];
        hasError = true;
      }
    });

    setErrors(filtered);
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      cnic: true,
      phone: true,
      businessName: true,
      businessRegNumber: true
    });

    return !hasError;
  };

  const handleCardMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const maxTilt = 8;
    const rotateY = ((x - centerX) / centerX) * maxTilt;
    const rotateX = -((y - centerY) / centerY) * maxTilt;

    setTilt({
      x: rotateX,
      y: rotateY,
      glareX: (x / rect.width) * 100,
      glareY: (y / rect.height) * 100,
      isHovered: true
    });
  };

  const handleCardMouseLeave = () => {
    setTilt({
      x: 0,
      y: 0,
      glareX: 50,
      glareY: 50,
      isHovered: false
    });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateAll()) {
      setError(isUrdu ? 'برائے مہربانی سرخ نشان زدہ غلطیوں کو درست کریں' : 'Please fix the highlighted errors before submitting');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const res = await register({
        name,
        email,
        password,
        role,
        cnic,
        phone,
        businessName,
        businessRegNumber,
      });

      const userRole = res?.user?.role || role;
      if (userRole === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (userRole === 'truck_owner' || userRole === 'fleet_owner' || userRole === 'driver') navigate('/fleet/dashboard', { replace: true });
      else if (userRole === 'transporter') navigate('/transporter/dashboard', { replace: true });
      else navigate('/shipper/dashboard', { replace: true });
    } catch (err) {
      setError(isUrdu ? ('اکاؤنٹ بنانے میں مسئلہ پیش آیا: ' + err.message) : ('Failed to create an account. ' + err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-4.5rem)] py-6 sm:py-8 md:py-10 px-4 relative perspective-1200 page-enter">
      {/* Background with Ambient Vignette Overlay */}
      <TruckBackground image="/images/peacock_truck_art_bg.jpg" opacity="opacity-95" />
      <div 
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          background: 'radial-gradient(circle at 50% 45%, rgba(15, 23, 42, 0.45) 0%, rgba(10, 15, 30, 0.72) 65%, rgba(4, 8, 18, 0.9) 100%)',
          backdropFilter: 'blur(2px)'
        }}
      />

      {/* 3D Glassmorphic Registration Card (Centered with Visible Rounded Borders) */}
      <div 
        ref={cardRef}
        onMouseMove={handleCardMouseMove}
        onMouseLeave={handleCardMouseLeave}
        className="w-full max-w-xl relative z-10 preserve-3d transition-transform duration-200 ease-out my-auto"
        style={{
          transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${tilt.isHovered ? 1.01 : 1}, ${tilt.isHovered ? 1.01 : 1}, 1)`,
          willChange: 'transform'
        }}
      >
        {/* Soft Ambient Neon Glow Behind Card */}
        <div 
          className="absolute -inset-1 rounded-[28px] bg-gradient-to-r from-cyan-500/35 via-purple-600/30 to-amber-500/35 blur-lg opacity-80 pointer-events-none -z-10 animate-glow-pulse"
        />

        <div 
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/85 shadow-[0_20px_50px_-12px_rgba(2,132,199,0.35),0_12px_28px_-10px_rgba(124,58,237,0.28),inset_0_1px_2px_rgba(255,255,255,0.95)]"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(240, 249, 255, 0.82) 45%, rgba(250, 245, 255, 0.88) 100%)',
            backdropFilter: 'blur(28px) saturate(180%)',
            WebkitBackdropFilter: 'blur(28px) saturate(180%)'
          }}
        >
          {/* Top Traditional Pakistani Truck Art Border */}
          <TruckPatternBorder height="h-2" />
          <ChamakRibbon height="h-[2.5px]" />

          {/* Dynamic Light Sheen Glare */}
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-3xl overflow-hidden"
            style={{
              opacity: tilt.isHovered ? 0.35 : 0.1,
              background: `radial-gradient(circle 350px at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.85), transparent 70%)`
            }}
          />

          <div className="p-3.5 sm:p-4.5 relative z-10 preserve-3d">
            {/* Header Section */}
            <div className="text-center mb-2" style={{ transform: 'translateZ(25px)' }}>
              <div className="flex justify-center mb-1">
                <div className="relative group">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/20 via-white to-purple-400/25 flex items-center justify-center border-2 border-white shadow-[0_6px_18px_rgba(2,132,199,0.22)] animate-float-pulse overflow-hidden p-0.5">
                    <img src="/logo.jpg" alt="E-CARGO-BILTY" className="w-full h-full object-cover rounded-lg" />
                  </div>
                  <div className="w-7 h-1 mx-auto bg-slate-900/15 rounded-full blur-[2px] mt-0.5 transform scale-x-90" />
                </div>
              </div>
              
              <div className="mb-1">
                <TruckMorBadge />
              </div>
              
              <h2 className={`text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 via-purple-700 to-rose-600 mb-0.5 tracking-tight drop-shadow-xs ${isUrdu ? 'font-urdu' : ''}`}>
                {t('regTitle')}
              </h2>
              <p className={`text-[10px] sm:text-[11px] text-slate-600 mb-1 font-semibold ${isUrdu ? 'font-urdu text-xs' : ''}`}>
                {t('regSub')}
              </p>
            </div>

            {error && (
              <div 
                className="mb-2 p-2 bg-rose-50/90 border border-rose-300 rounded-xl flex items-center gap-2 text-rose-800 text-[11px] font-semibold shadow-xs"
                style={{ transform: 'translateZ(25px)' }}
              >
                <AlertCircle size={14} className="text-rose-600 shrink-0" />
                <span className={isUrdu ? 'font-urdu text-xs' : ''}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-1.5 sm:space-y-2 text-left" style={{ transform: 'translateZ(18px)' }}>
              {/* Row 1: Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className={`block text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider mb-0.5 ${
                    errors.name && touched.name ? 'text-rose-600' : 'text-slate-700'
                  } ${isUrdu ? 'font-urdu text-xs' : ''}`}>
                    {t('nameLabel')} *
                  </label>
                  <div className={`relative rounded-lg p-[1px] transition-all duration-300 ${
                    errors.name && touched.name ? 'bg-rose-500' : 'bg-gradient-to-r from-transparent via-transparent to-transparent focus-within:from-cyan-500 focus-within:to-purple-500'
                  }`}>
                    <div className={`relative rounded-[7px] overflow-hidden border ${
                      errors.name && touched.name
                        ? 'bg-rose-50/70 border-rose-400'
                        : 'bg-white/80 backdrop-blur-sm focus-within:bg-white border-slate-200/90 focus-within:border-transparent'
                    }`}>
                      <div className={`absolute inset-y-0 ${isUrdu ? 'right-0 pr-2.5' : 'left-0 pl-2.5'} flex items-center pointer-events-none ${
                        errors.name && touched.name ? 'text-rose-500' : 'text-slate-400'
                      }`}>
                        <User size={14} />
                      </div>
                      <input
                        type="text"
                        required
                        className={`block w-full ${isUrdu ? 'pr-8 pl-2.5 text-right' : 'pl-8 pr-2.5 text-left'} py-1.5 bg-transparent border-0 focus:outline-none text-slate-900 placeholder-slate-400 text-xs font-medium transition-all`}
                        placeholder={t('namePlaceholder')}
                        value={name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        onBlur={() => handleBlur('name')}
                      />
                    </div>
                  </div>
                  {errors.name && touched.name && (
                    <p className="flex items-center gap-1 text-rose-600 text-[10px] font-bold mt-0.5">
                      <AlertCircle size={11} className="shrink-0 text-rose-500" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider mb-0.5 ${
                    errors.email && touched.email ? 'text-rose-600' : 'text-slate-700'
                  } ${isUrdu ? 'font-urdu text-xs' : ''}`}>
                    {t('emailLabel')} *
                  </label>
                  <div className={`relative rounded-lg p-[1px] transition-all duration-300 ${
                    errors.email && touched.email ? 'bg-rose-500' : 'bg-gradient-to-r from-transparent via-transparent to-transparent focus-within:from-cyan-500 focus-within:to-purple-500'
                  }`}>
                    <div className={`relative rounded-[7px] overflow-hidden border ${
                      errors.email && touched.email
                        ? 'bg-rose-50/70 border-rose-400'
                        : 'bg-white/80 backdrop-blur-sm focus-within:bg-white border-slate-200/90 focus-within:border-transparent'
                    }`}>
                      <div className={`absolute inset-y-0 ${isUrdu ? 'right-0 pr-2.5' : 'left-0 pl-2.5'} flex items-center pointer-events-none ${
                        errors.email && touched.email ? 'text-rose-500' : 'text-slate-400'
                      }`}>
                        <Mail size={14} />
                      </div>
                      <input
                        type="email"
                        required
                        dir="ltr"
                        className={`block w-full ${isUrdu ? 'pr-8 pl-2.5 text-right' : 'pl-8 pr-2.5 text-left'} py-1.5 bg-transparent border-0 focus:outline-none text-slate-900 placeholder-slate-400 text-xs font-medium transition-all`}
                        placeholder={t('emailPlaceholder')}
                        value={email}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        onBlur={() => handleBlur('email')}
                      />
                    </div>
                  </div>
                  {errors.email && touched.email && (
                    <p className="flex items-center gap-1 text-rose-600 text-[10px] font-bold mt-0.5">
                      <AlertCircle size={11} className="shrink-0 text-rose-500" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Row 2: Account Role Selector */}
              <div>
                <label className={`block text-[10px] sm:text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1 ${isUrdu ? 'font-urdu text-xs' : ''}`}>
                  {t('roleSelectLabel')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: 'business', label: t('role_business'), icon: '🏢' },
                    { id: 'transporter', label: t('role_transporter'), icon: '🚛' },
                    { id: 'truck_owner', label: t('role_truck_owner'), icon: '🚚' },
                    { id: 'admin', label: t('role_admin'), icon: '👑' }
                  ].map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`px-2 py-1.5 rounded-lg border text-[11px] font-bold transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
                        role === r.id 
                          ? 'bg-gradient-to-r from-sky-50 to-purple-50 border-cyan-500 text-cyan-900 shadow-xs ring-1 ring-cyan-400/30' 
                          : 'bg-white/80 hover:bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-sm shrink-0">{r.icon}</span>
                      <span className="truncate">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 3: CNIC and Phone Fields with Auto-Formatting and Validation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className={`block text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider mb-0.5 ${
                    errors.cnic && touched.cnic ? 'text-rose-600' : 'text-slate-700'
                  } ${isUrdu ? 'font-urdu text-xs' : ''}`}>
                    {t('cnicLabel')} *
                  </label>
                  <div className={`relative rounded-lg p-[1px] transition-all duration-300 ${
                    errors.cnic && touched.cnic ? 'bg-rose-500' : 'bg-gradient-to-r from-transparent via-transparent to-transparent focus-within:from-cyan-500 focus-within:to-purple-500'
                  }`}>
                    <div className={`relative rounded-[7px] overflow-hidden border ${
                      errors.cnic && touched.cnic
                        ? 'bg-rose-50/70 border-rose-400'
                        : 'bg-white/80 backdrop-blur-sm focus-within:bg-white border-slate-200/90 focus-within:border-transparent'
                    }`}>
                      <div className={`absolute inset-y-0 ${isUrdu ? 'right-0 pr-2.5' : 'left-0 pl-2.5'} flex items-center pointer-events-none ${
                        errors.cnic && touched.cnic ? 'text-rose-500' : 'text-slate-400'
                      }`}>
                        <CreditCard size={14} />
                      </div>
                      <input
                        type="text"
                        required
                        dir="ltr"
                        maxLength={15}
                        className={`block w-full ${isUrdu ? 'pr-8 pl-2.5 text-right' : 'pl-8 pr-2.5 text-left'} py-1.5 bg-transparent border-0 focus:outline-none text-slate-900 placeholder-slate-400 text-xs font-mono transition-all`}
                        placeholder="35202-1234567-1"
                        value={cnic}
                        onChange={(e) => handleFieldChange('cnic', e.target.value)}
                        onBlur={() => handleBlur('cnic')}
                      />
                    </div>
                  </div>
                  {errors.cnic && touched.cnic && (
                    <p className="flex items-center gap-1 text-rose-600 text-[10px] font-bold mt-0.5">
                      <AlertCircle size={11} className="shrink-0 text-rose-500" />
                      <span>{errors.cnic}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider mb-0.5 ${
                    errors.phone && touched.phone ? 'text-rose-600' : 'text-slate-700'
                  } ${isUrdu ? 'font-urdu text-xs' : ''}`}>
                    {t('phoneLabel')} *
                  </label>
                  <div className={`relative rounded-lg p-[1px] transition-all duration-300 ${
                    errors.phone && touched.phone ? 'bg-rose-500' : 'bg-gradient-to-r from-transparent via-transparent to-transparent focus-within:from-cyan-500 focus-within:to-purple-500'
                  }`}>
                    <div className={`relative rounded-[7px] overflow-hidden border ${
                      errors.phone && touched.phone
                        ? 'bg-rose-50/70 border-rose-400'
                        : 'bg-white/80 backdrop-blur-sm focus-within:bg-white border-slate-200/90 focus-within:border-transparent'
                    }`}>
                      <div className={`absolute inset-y-0 ${isUrdu ? 'right-0 pr-2.5' : 'left-0 pl-2.5'} flex items-center pointer-events-none ${
                        errors.phone && touched.phone ? 'text-rose-500' : 'text-slate-400'
                      }`}>
                        <Phone size={14} />
                      </div>
                      <input
                        type="text"
                        required
                        dir="ltr"
                        maxLength={12}
                        className={`block w-full ${isUrdu ? 'pr-8 pl-2.5 text-right' : 'pl-8 pr-2.5 text-left'} py-1.5 bg-transparent border-0 focus:outline-none text-slate-900 placeholder-slate-400 text-xs font-mono transition-all`}
                        placeholder="0300-1234567"
                        value={phone}
                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                        onBlur={() => handleBlur('phone')}
                      />
                    </div>
                  </div>
                  {errors.phone && touched.phone && (
                    <p className="flex items-center gap-1 text-rose-600 text-[10px] font-bold mt-0.5">
                      <AlertCircle size={11} className="shrink-0 text-rose-500" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Row 4: Conditional Business NTN & Registration Panel */}
              {(role === 'business' || role === 'transporter') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 rounded-xl bg-sky-50/70 border border-cyan-200/80 backdrop-blur-sm">
                  <div>
                    <label className={`block text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider mb-0.5 flex items-center gap-1 ${
                      errors.businessName && touched.businessName ? 'text-rose-600' : 'text-cyan-950'
                    } ${isUrdu ? 'font-urdu text-xs' : ''}`}>
                      <Building2 size={13} className="text-cyan-700" />
                      <span>{t('businessNameLabel')} *</span>
                    </label>
                    <input
                      type="text"
                      required
                      className={`block w-full px-2.5 py-1.5 rounded-lg focus:outline-none text-slate-900 placeholder-slate-400 text-xs transition-all border ${
                        errors.businessName && touched.businessName
                          ? 'bg-rose-50 border-rose-400'
                          : 'bg-white/90 border-cyan-300 focus:border-cyan-500'
                      } ${isUrdu ? 'text-right' : 'text-left'}`}
                      placeholder={t('businessNamePlaceholder')}
                      value={businessName}
                      onChange={(e) => handleFieldChange('businessName', e.target.value)}
                      onBlur={() => handleBlur('businessName')}
                    />
                    {errors.businessName && touched.businessName && (
                      <p className="flex items-center gap-1 text-rose-600 text-[10px] font-bold mt-0.5">
                        <AlertCircle size={11} className="shrink-0 text-rose-500" />
                        <span>{errors.businessName}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider mb-0.5 ${
                      errors.businessRegNumber && touched.businessRegNumber ? 'text-rose-600' : 'text-cyan-950'
                    } ${isUrdu ? 'font-urdu text-xs' : ''}`}>
                      {t('businessRegLabel')} *
                    </label>
                    <input
                      type="text"
                      required
                      dir="ltr"
                      className={`block w-full px-2.5 py-1.5 rounded-lg focus:outline-none text-slate-900 placeholder-slate-400 text-xs font-mono transition-all border ${
                        errors.businessRegNumber && touched.businessRegNumber
                          ? 'bg-rose-50 border-rose-400'
                          : 'bg-white/90 border-cyan-300 focus:border-cyan-500'
                      } ${isUrdu ? 'text-right' : 'text-left'}`}
                      placeholder="1234567-8"
                      value={businessRegNumber}
                      onChange={(e) => handleFieldChange('businessRegNumber', e.target.value)}
                      onBlur={() => handleBlur('businessRegNumber')}
                    />
                    {errors.businessRegNumber && touched.businessRegNumber && (
                      <p className="flex items-center gap-1 text-rose-600 text-[10px] font-bold mt-0.5">
                        <AlertCircle size={11} className="shrink-0 text-rose-500" />
                        <span>{errors.businessRegNumber}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Row 5: Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className={`block text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider mb-0.5 ${
                    errors.password && touched.password ? 'text-rose-600' : 'text-slate-700'
                  } ${isUrdu ? 'font-urdu text-xs' : ''}`}>
                    {t('passwordLabel')} *
                  </label>
                  <div className={`relative rounded-lg p-[1px] transition-all duration-300 ${
                    errors.password && touched.password ? 'bg-rose-500' : 'bg-gradient-to-r from-transparent via-transparent to-transparent focus-within:from-cyan-500 focus-within:to-purple-500'
                  }`}>
                    <div className={`relative rounded-[7px] overflow-hidden border ${
                      errors.password && touched.password
                        ? 'bg-rose-50/70 border-rose-400'
                        : 'bg-white/80 backdrop-blur-sm focus-within:bg-white border-slate-200/90 focus-within:border-transparent'
                    }`}>
                      <div className={`absolute inset-y-0 ${isUrdu ? 'right-0 pr-2.5' : 'left-0 pl-2.5'} flex items-center pointer-events-none ${
                        errors.password && touched.password ? 'text-rose-500' : 'text-slate-400'
                      }`}>
                        <Lock size={14} />
                      </div>
                      <input
                        type="password"
                        required
                        dir="ltr"
                        className={`block w-full ${isUrdu ? 'pr-8 pl-2.5 text-right' : 'pl-8 pr-2.5 text-left'} py-1.5 bg-transparent border-0 focus:outline-none text-slate-900 placeholder-slate-400 text-xs transition-all`}
                        placeholder={t('passwordPlaceholder')}
                        value={password}
                        onChange={(e) => handleFieldChange('password', e.target.value)}
                        onBlur={() => handleBlur('password')}
                      />
                    </div>
                  </div>
                  {errors.password && touched.password && (
                    <p className="flex items-center gap-1 text-rose-600 text-[10px] font-bold mt-0.5">
                      <AlertCircle size={11} className="shrink-0 text-rose-500" />
                      <span>{errors.password}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider mb-0.5 ${
                    errors.confirmPassword && touched.confirmPassword ? 'text-rose-600' : 'text-slate-700'
                  } ${isUrdu ? 'font-urdu text-xs' : ''}`}>
                    {t('confirmPasswordLabel')} *
                  </label>
                  <div className={`relative rounded-lg p-[1px] transition-all duration-300 ${
                    errors.confirmPassword && touched.confirmPassword ? 'bg-rose-500' : 'bg-gradient-to-r from-transparent via-transparent to-transparent focus-within:from-cyan-500 focus-within:to-purple-500'
                  }`}>
                    <div className={`relative rounded-[7px] overflow-hidden border ${
                      errors.confirmPassword && touched.confirmPassword
                        ? 'bg-rose-50/70 border-rose-400'
                        : 'bg-white/80 backdrop-blur-sm focus-within:bg-white border-slate-200/90 focus-within:border-transparent'
                    }`}>
                      <div className={`absolute inset-y-0 ${isUrdu ? 'right-0 pr-2.5' : 'left-0 pl-2.5'} flex items-center pointer-events-none ${
                        errors.confirmPassword && touched.confirmPassword ? 'text-rose-500' : 'text-slate-400'
                      }`}>
                        <Lock size={14} />
                      </div>
                      <input
                        type="password"
                        required
                        dir="ltr"
                        className={`block w-full ${isUrdu ? 'pr-8 pl-2.5 text-right' : 'pl-8 pr-2.5 text-left'} py-1.5 bg-transparent border-0 focus:outline-none text-slate-900 placeholder-slate-400 text-xs transition-all`}
                        placeholder={t('passwordPlaceholder')}
                        value={confirmPassword}
                        onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                        onBlur={() => handleBlur('confirmPassword')}
                      />
                    </div>
                  </div>
                  {errors.confirmPassword && touched.confirmPassword && (
                    <p className="flex items-center gap-1 text-rose-600 text-[10px] font-bold mt-0.5">
                      <AlertCircle size={11} className="shrink-0 text-rose-500" />
                      <span>{errors.confirmPassword}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-1.5">
                <button
                  disabled={loading}
                  type="submit"
                  className={`w-full relative group overflow-hidden rounded-xl py-2 px-4 text-white font-bold text-xs sm:text-sm tracking-wide shadow-[0_6px_20px_-4px_rgba(2,132,199,0.5),0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_10px_28px_-3px_rgba(2,132,199,0.65),0_0_25px_rgba(124,58,237,0.45)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed ${isUrdu ? 'font-urdu text-sm' : ''}`}
                  style={{
                    background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 30%, #7C3AED 70%, #9333EA 100%)'
                  }}
                >
                  <div 
                    className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none"
                    style={{ transform: 'skewX(-25deg)' }}
                  />

                  <div className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        <span>{t('creatingAccount')}</span>
                      </>
                    ) : (
                      <>
                        <span>{t('signUpBtn')}</span>
                        <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-200" />
                      </>
                    )}
                  </div>
                </button>
              </div>
            </form>

            {/* Bottom Login Link */}
            <div className={`mt-2 text-center text-[11px] text-slate-600 font-medium ${isUrdu ? 'font-urdu text-xs' : ''}`} style={{ transform: 'translateZ(10px)' }}>
              {t('alreadyHaveAccount')}{' '}
              <Link 
                to="/login" 
                className="text-cyan-700 hover:text-purple-700 transition-colors font-bold underline underline-offset-4"
              >
                {t('loginHere')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
