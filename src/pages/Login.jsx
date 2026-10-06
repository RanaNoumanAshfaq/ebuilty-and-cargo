import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  AlertCircle, 
  Loader2, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Radio, 
  Zap,
  CheckCircle2
} from 'lucide-react';
import { 
  ChamakRibbon, 
  UrduMotto, 
  TruckBackground, 
  TruckPatternBorder, 
  NazarBattuBadge 
} from '../components/TruckArt';

const getRoleDashboardPath = (role) => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'truck_owner':
    case 'fleet_owner':
    case 'driver':
      return '/fleet/dashboard';
    case 'transporter':
      return '/transporter/dashboard';
    case 'business':
    case 'shipper':
      return '/shipper/dashboard';
    default:
      return '/';
  }
};

/**
 * FloatingParticlesCanvas
 * Renders an interactive 60fps canvas with floating glowing nodes,
 * cyber-mesh connection lines, and parallax depth reacting to cursor position.
 */
function FloatingParticlesCanvas({ mouseNorm }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Color palette from E-Cargo truck art & cyber theme
    const colors = [
      'rgba(2, 132, 199, 0.85)',   // Peacock Cyan
      'rgba(56, 189, 248, 0.9)',   // Sky Blue
      'rgba(124, 58, 237, 0.85)',  // Electric Purple
      'rgba(192, 132, 252, 0.8)',  // Light Violet
      'rgba(245, 158, 11, 0.8)',   // Saffron Amber
      'rgba(16, 185, 129, 0.8)'    // Emerald Green
    ];

    // Generate 32 floating nodes with 3D depth (z)
    const particleCount = Math.min(36, Math.floor(window.innerWidth / 40));
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: 0.3 + Math.random() * 0.7, // depth scalar for parallax & sizing
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: 1.8 + Math.random() * 2.8,
      color: colors[Math.floor(Math.random() * colors.length)],
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.03
    }));

    let currentMouseX = 0;
    let currentMouseY = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth lerp towards normalized mouse coordinates
      currentMouseX += (mouseNorm.current.x - currentMouseX) * 0.05;
      currentMouseY += (mouseNorm.current.y - currentMouseY) * 0.05;

      // Update and draw particles
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;

        // Wrap around boundaries
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // Parallax offset based on depth (z)
        const parallaxX = currentMouseX * 45 * p.z;
        const parallaxY = currentMouseY * 45 * p.z;
        const renderX = p.x + parallaxX;
        const renderY = p.y + parallaxY;

        const currentRadius = p.radius * (1 + 0.25 * Math.sin(p.pulse));

        // Draw particle glow
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(
          renderX, renderY, 0,
          renderX, renderY, currentRadius * 3.5
        );
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.arc(renderX, renderY, currentRadius * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Draw particle core
        ctx.beginPath();
        ctx.fillStyle = '#FFFFFF';
        ctx.arc(renderX, renderY, Math.max(1, currentRadius * 0.6), 0, Math.PI * 2);
        ctx.fill();

        // Draw cyber-mesh connection lines to nearby nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const p2X = p2.x + currentMouseX * 45 * p2.z;
          const p2Y = p2.y + currentMouseY * 45 * p2.z;
          const dx = renderX - p2X;
          const dy = renderY - p2Y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            const alpha = (1 - dist / 120) * 0.25;
            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.moveTo(renderX, renderY);
            ctx.lineTo(p2X, p2Y);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [mouseNorm]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-[2] select-none"
    />
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50, isHovered: false });

  const cardRef = useRef(null);
  const mouseNorm = useRef({ x: 0, y: 0 });

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

  // Window-level mouse tracking for smooth parallax particles
  useEffect(() => {
    const handleMouseMove = (e) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = (e.clientY / window.innerHeight) * 2 - 1;
      mouseNorm.current = { x: normX, y: normY };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 3D perspective tilt calculations
  const handleCardMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const maxTilt = 10; // Max tilt degrees
    const rotateY = ((x - centerX) / centerX) * maxTilt;
    const rotateX = -((y - centerY) / centerY) * maxTilt;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({
      x: rotateX,
      y: rotateY,
      glareX,
      glareY,
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

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });

  // Instant real-time validation handlers
  const handleEmailChange = (val) => {
    setEmail(val);
    if (touched.email) {
      if (!val.trim()) {
        setEmailError(isUrdu ? 'ای میل ایڈریس درج کرنا لازمی ہے' : 'Email address is required');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) {
        setEmailError(isUrdu ? 'درست ای میل درج کریں (مثلاً name@domain.com)' : 'Please enter a valid email address');
      } else {
        setEmailError('');
      }
    }
  };

  const handlePasswordChange = (val) => {
    setPassword(val);
    if (touched.password) {
      if (!val) {
        setPasswordError(isUrdu ? 'پاس ورڈ درج کرنا لازمی ہے' : 'Password is required');
      } else if (val.length < 6) {
        setPasswordError(isUrdu ? 'پاس ورڈ کم از کم 6 حروف پر مشتمل ہونا چاہیے' : 'Password must be at least 6 characters');
      } else {
        setPasswordError('');
      }
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'email') {
      if (!email.trim()) {
        setEmailError(isUrdu ? 'ای میل ایڈریس درج کرنا لازمی ہے' : 'Email address is required');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setEmailError(isUrdu ? 'درست ای میل درج کریں (مثلاً name@domain.com)' : 'Please enter a valid email address');
      } else {
        setEmailError('');
      }
    }
    if (field === 'password') {
      if (!password) {
        setPasswordError(isUrdu ? 'پاس ورڈ درج کرنا لازمی ہے' : 'Password is required');
      } else if (password.length < 6) {
        setPasswordError(isUrdu ? 'پاس ورڈ کم از کم 6 حروف پر مشتمل ہونا چاہیے' : 'Password must be at least 6 characters');
      } else {
        setPasswordError('');
      }
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ email: true, password: true });

    // Validate email
    let eErr = '';
    if (!email.trim()) {
      eErr = isUrdu ? 'ای میل ایڈریس درج کرنا لازمی ہے' : 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      eErr = isUrdu ? 'درست ای میل درج کریں (مثلاً name@domain.com)' : 'Please enter a valid email address';
    }
    setEmailError(eErr);

    // Validate password
    let pErr = '';
    if (!password) {
      pErr = isUrdu ? 'پاس ورڈ درج کرنا لازمی ہے' : 'Password is required';
    } else if (password.length < 6) {
      pErr = isUrdu ? 'پاس ورڈ کم از کم 6 حروف پر مشتمل ہونا چاہیے' : 'Password must be at least 6 characters';
    }
    setPasswordError(pErr);

    if (eErr || pErr) {
      return;
    }

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
      } else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error' || err.message?.includes('Network')) {
        setError(isUrdu ? 'سرور (192.168.18.93:5000) سے رابطہ نہیں ہو سکا۔ برائے مہربانی چیک کریں کہ موبائل اسی وائی فائی پر ہے اور سرور چل رہا ہے۔' : 'Cannot reach backend at 192.168.18.93:5000. Please ensure your mobile device is on the same Wi-Fi.');
      } else {
        setError(err.message || (isUrdu ? 'لاگ ان نا کام رہا۔ برائے مہربانی اپنی معلومات چیک کریں۔' : 'Failed to sign in. Please check your credentials.'));
      }
      console.error('Login failed:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div 
      className="flex-1 flex items-center justify-center min-h-[calc(100vh-4.5rem)] py-6 sm:py-8 md:py-10 px-4 relative perspective-1200"
      onMouseMove={(e) => {
        // Fallback smooth tilt tracking across the surrounding hero zone
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const isOverCard = (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        );
        if (!isOverCard && tilt.isHovered) {
          handleCardMouseLeave();
        }
      }}
    >
      {/* Layer 0: Authentic Pakistani Truck Art Background */}
      <TruckBackground image="/images/peacock_truck_art_bg.jpg" opacity="opacity-95" />

      {/* Layer 1: Ambient Cinematic Dark Vignette & Mesh Blur Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          background: 'radial-gradient(circle at 50% 45%, rgba(15, 23, 42, 0.45) 0%, rgba(10, 15, 30, 0.7) 65%, rgba(4, 8, 18, 0.88) 100%)',
          backdropFilter: 'blur(2px)'
        }}
      />

      {/* Layer 2: Interactive Dynamic Floating Particles with Parallax */}
      <FloatingParticlesCanvas mouseNorm={mouseNorm} />

      {/* Layer 3: Floating Antigravity Satellites Orbiting Outside Card */}
      <div className="hidden lg:block pointer-events-none select-none">
        {/* Left Floating Orbit Badge */}
        <div 
          className="absolute left-8 xl:left-24 top-1/3 z-20 animate-float-slow"
          style={{
            transform: `translate3d(${mouseNorm.current.x * -25}px, ${mouseNorm.current.y * -25}px, 40px)`
          }}
        >
          <div className="px-4 py-2.5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_12px_32px_rgba(2,132,199,0.25)] flex items-center gap-2.5 text-xs font-bold text-slate-800">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            <Radio size={14} className="text-cyan-600 animate-pulse" />
            <span className="font-mono tracking-tight text-[11px] text-cyan-950">
              {isUrdu ? 'ملک گیر ریڈار • فعال' : 'Nationwide Radar • Active'}
            </span>
          </div>
        </div>

        {/* Right Floating Orbit Badge */}
        <div 
          className="absolute right-8 xl:right-24 top-2/5 z-20 animate-float-reverse"
          style={{
            transform: `translate3d(${mouseNorm.current.x * 30}px, ${mouseNorm.current.y * 30}px, 60px)`
          }}
        >
          <div className="px-4 py-2.5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_12px_32px_rgba(124,58,237,0.25)] flex items-center gap-2.5 text-xs font-bold text-slate-800">
            <ShieldCheck size={16} className="text-purple-600" />
            <span className="font-mono tracking-tight text-[11px] text-purple-950">
              {isUrdu ? '۱۰۰٪ مصدقہ ڈیجیٹل بلٹی' : '100% Verified e-Bilty'}
            </span>
          </div>
        </div>
      </div>

      {/* Layer 4: The 3D Tilt Glassmorphism Main Card */}
      <div 
        ref={cardRef}
        onMouseMove={handleCardMouseMove}
        onMouseLeave={handleCardMouseLeave}
        className="w-full max-w-[420px] relative z-10 preserve-3d transition-transform duration-200 ease-out my-auto"
        style={{
          transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${tilt.isHovered ? 1.015 : 1}, ${tilt.isHovered ? 1.015 : 1}, 1)`,
          willChange: 'transform'
        }}
      >
        {/* Soft Ambient Neon Glow Behind Card */}
        <div 
          className="absolute -inset-1 rounded-[28px] bg-gradient-to-r from-cyan-500/35 via-purple-600/30 to-amber-500/35 blur-lg opacity-80 pointer-events-none transition-opacity duration-500 -z-10 animate-glow-pulse"
        />

        {/* Glass Card Container */}
        <div 
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/80 shadow-[0_20px_50px_-12px_rgba(2,132,199,0.35),0_12px_28px_-10px_rgba(124,58,237,0.28),inset_0_1px_2px_rgba(255,255,255,0.95)]"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 249, 255, 0.8) 45%, rgba(250, 245, 255, 0.86) 100%)',
            backdropFilter: 'blur(28px) saturate(180%)',
            WebkitBackdropFilter: 'blur(28px) saturate(180%)'
          }}
        >
          {/* Top Traditional Pakistani Truck Art Frame */}
          <TruckPatternBorder height="h-2.5" />
          <ChamakRibbon height="h-[3px]" />

          {/* Dynamic Light Sheen / Glass Glare Reflection */}
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-3xl overflow-hidden"
            style={{
              opacity: tilt.isHovered ? 0.45 : 0.15,
              background: `radial-gradient(circle 320px at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.85), transparent 70%)`
            }}
          />

          <div className="p-6 sm:p-7 relative z-10 preserve-3d">
            {/* Header Section with 3D Antigravity Floating Crown */}
            <div className="text-center mb-5" style={{ transform: 'translateZ(25px)' }}>
              {/* Floating Logo */}
              <div className="flex justify-center mb-2">
                <div className="relative group">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-cyan-400/20 via-white to-purple-400/25 flex items-center justify-center border-2 border-white shadow-[0_6px_20px_rgba(2,132,199,0.22)] animate-float-pulse overflow-hidden p-0.5">
                    <img src="/logo.jpg" alt="E-CARGO-BILTY" className="w-full h-full object-cover rounded-xl" />
                  </div>
                  <div className="w-9 h-1.5 mx-auto bg-slate-900/15 rounded-full blur-[2px] mt-1 transform scale-x-90" />
                </div>
              </div>
              
              <h2 className={`text-2xl sm:text-[26px] font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 via-purple-700 to-rose-600 mb-1 tracking-tight drop-shadow-xs ${isUrdu ? 'font-urdu' : ''}`}>
                {t('loginWelcome')}
              </h2>
              <p className={`text-xs text-slate-600 mb-2 font-semibold ${isUrdu ? 'font-urdu text-sm' : ''}`}>
                {t('loginSub')}
              </p>

              {/* Floating Badges */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <div className="animate-float-slow">
                  <UrduMotto />
                </div>
                <div className="animate-float-reverse">
                  <NazarBattuBadge />
                </div>
              </div>
            </div>

            {/* Error Message Box */}
            {error && (
              <div 
                className="mb-3 p-3 bg-rose-50/90 border border-rose-300 rounded-xl flex items-center gap-2 text-rose-800 text-xs font-semibold shadow-xs animate-shake"
                style={{ transform: 'translateZ(30px)' }}
              >
                <AlertCircle size={15} className="text-rose-600 shrink-0" />
                <span className={isUrdu ? 'font-urdu text-xs' : ''}>{error}</span>
              </div>
            )}

            {/* Login Form (Email & Password Only - Role auto-detected from account) */}
            <form onSubmit={handleSubmit} className="space-y-4 text-left" style={{ transform: 'translateZ(20px)' }}>
              {/* Email Input Field */}
              <div className="group">
                <label className={`block text-[11px] font-extrabold uppercase tracking-wider mb-1 transition-colors ${
                  emailError && touched.email ? 'text-rose-600' : 'text-slate-700 group-focus-within:text-cyan-700'
                } ${isUrdu ? 'font-urdu text-xs' : ''}`}>
                  {t('emailLabel')}
                </label>
                <div className={`relative rounded-xl p-[1px] transition-all duration-300 shadow-xs ${
                  emailError && touched.email 
                    ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.35)]' 
                    : 'bg-gradient-to-r from-transparent via-transparent to-transparent group-focus-within:from-cyan-500 group-focus-within:via-sky-400 group-focus-within:to-purple-500 group-focus-within:shadow-[0_0_16px_rgba(2,132,199,0.22)]'
                }`}>
                  <div className={`relative rounded-[10px] overflow-hidden transition-colors border ${
                    emailError && touched.email
                      ? 'bg-rose-50/70 border-rose-400'
                      : 'bg-white/80 backdrop-blur-sm group-focus-within:bg-white border-slate-200/90 group-focus-within:border-transparent'
                  }`}>
                    <div className={`absolute inset-y-0 ${isUrdu ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none transition-all duration-300 ${
                      emailError && touched.email ? 'text-rose-500' : 'text-slate-400 group-focus-within:text-cyan-600 group-focus-within:scale-110'
                    }`}>
                      <Mail size={15} />
                    </div>
                    <input
                      type="email"
                      required
                      dir="ltr"
                      className={`block w-full ${isUrdu ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'} py-2 bg-transparent border-0 focus:outline-none text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-medium transition-all`}
                      placeholder={t('emailPlaceholder')}
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      onBlur={() => handleBlur('email')}
                    />
                  </div>
                </div>
                {emailError && touched.email && (
                  <p className="flex items-center gap-1.5 text-rose-600 text-[11px] font-bold mt-1 animate-fadeIn">
                    <AlertCircle size={12} className="shrink-0 text-rose-500" />
                    <span>{emailError}</span>
                  </p>
                )}
              </div>

              {/* Password Input Field */}
              <div className="group">
                <div className="flex items-center justify-between mb-1">
                  <label className={`block text-[11px] font-extrabold uppercase tracking-wider transition-colors ${
                    passwordError && touched.password ? 'text-rose-600' : 'text-slate-700 group-focus-within:text-purple-700'
                  } ${isUrdu ? 'font-urdu text-xs' : ''}`}>
                    {t('passwordLabel')}
                  </label>
                </div>
                <div className={`relative rounded-xl p-[1px] transition-all duration-300 shadow-xs ${
                  passwordError && touched.password
                    ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.35)]'
                    : 'bg-gradient-to-r from-transparent via-transparent to-transparent group-focus-within:from-purple-500 group-focus-within:via-pink-500 group-focus-within:to-cyan-500 group-focus-within:shadow-[0_0_16px_rgba(124,58,237,0.22)]'
                }`}>
                  <div className={`relative rounded-[10px] overflow-hidden transition-colors flex items-center border ${
                    passwordError && touched.password
                      ? 'bg-rose-50/70 border-rose-400'
                      : 'bg-white/80 backdrop-blur-sm group-focus-within:bg-white border-slate-200/90 group-focus-within:border-transparent'
                  }`}>
                    <div className={`absolute inset-y-0 ${isUrdu ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none transition-all duration-300 ${
                      passwordError && touched.password ? 'text-rose-500' : 'text-slate-400 group-focus-within:text-purple-600 group-focus-within:scale-110'
                    }`}>
                      <Lock size={15} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      dir="ltr"
                      className={`block w-full ${isUrdu ? 'pr-9 pl-9 text-right' : 'pl-9 pr-9 text-left'} py-2 bg-transparent border-0 focus:outline-none text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-medium transition-all`}
                      placeholder={t('passwordPlaceholder')}
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      onBlur={() => handleBlur('password')}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute inset-y-0 ${isUrdu ? 'left-0 pl-2.5' : 'right-0 pr-2.5'} flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer`}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                {passwordError && touched.password && (
                  <p className="flex items-center gap-1.5 text-rose-600 text-[11px] font-bold mt-1 animate-fadeIn">
                    <AlertCircle size={12} className="shrink-0 text-rose-500" />
                    <span>{passwordError}</span>
                  </p>
                )}
              </div>

              {/* Modernized Hyper-Glow "Sign In to Portal" Button */}
              <div className="pt-2">
                <button
                  disabled={loading}
                  type="submit"
                  className={`w-full relative group overflow-hidden rounded-xl py-3 px-4 text-white font-bold text-sm tracking-wide shadow-[0_6px_20px_-4px_rgba(2,132,199,0.5),0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_10px_28px_-3px_rgba(2,132,199,0.65),0_0_25px_rgba(124,58,237,0.45)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed ${isUrdu ? 'font-urdu text-base' : ''}`}
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
                        <span>{t('signingIn')}</span>
                      </>
                    ) : (
                      <>
                        <span>{t('signInBtn')}</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                      </>
                    )}
                  </div>
                </button>
              </div>
            </form>

            {/* Bottom Register Link */}
            <div className={`mt-5 pt-4 border-t border-slate-200/80 text-center text-xs text-slate-600 font-medium ${isUrdu ? 'font-urdu text-sm' : ''}`} style={{ transform: 'translateZ(10px)' }}>
              {t('dontHaveAccount')}{' '}
              <Link 
                to="/register" 
                className="text-cyan-700 hover:text-purple-700 transition-colors font-bold underline underline-offset-4"
              >
                {t('registerHere')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
