import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * ChamakRibbon - Radiant Multi-Color Chamak Patti reflective chevron ribbon.
 * Features vibrant Pakistani truck art reflective tape patterns (Ruby Red, Chrome Yellow, Hot Pink, Turquoise, Parrot Green, White).
 */
export const ChamakRibbon = ({ className = '', height = 'h-2' }) => (
  <div className={`w-full overflow-hidden ${height} ${className}`}>
    <div 
      className="w-full h-full"
      style={{
        background: `repeating-linear-gradient(
          135deg,
          #7C3AED 0px,
          #7C3AED 12px,
          #0284C7 12px,
          #0284C7 24px,
          #10B981 24px,
          #10B981 36px,
          #FACC15 36px,
          #FACC15 48px,
          #E11D48 48px,
          #E11D48 58px,
          #FFFFFF 58px,
          #FFFFFF 64px
        )`,
        boxShadow: '0 1px 8px rgba(2, 132, 199, 0.25), 0 1px 4px rgba(124, 58, 237, 0.2)'
      }}
    />
  </div>
);

/**
 * TruckMorBadge - Majestic Truck Art Peacock ("مور") badge.
 * Shows only the selected language (either Urdu or English, never both).
 */
export const TruckMorBadge = ({ text, subtext, className = '' }) => {
  const { isUrdu, t } = useLanguage();
  const label = isUrdu ? (text || t('badgePeacock')) : (subtext || t('badgePeacock'));
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border-2 border-cyan-400 bg-gradient-to-r from-sky-50 via-purple-50 to-emerald-50 text-slate-800 text-xs shadow-sm ${className}`}>
      <span className="text-base select-none">🦚</span>
      <span className={isUrdu ? "font-urdu font-black text-xs text-purple-900" : "font-sans font-bold text-xs text-purple-900"}>
        {label}
      </span>
    </div>
  );
};

/**
 * NazarBattuBadge - Protective talisman badge.
 * Shows only the selected language (either Urdu or English, never both).
 */
export const NazarBattuBadge = ({ text, className = '' }) => {
  const { isUrdu, t } = useLanguage();
  const label = isUrdu ? (text || t('badgeNazar')) : t('badgeNazar');
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-400 bg-purple-50 text-purple-950 text-xs font-bold shadow-xs ${className}`}>
      <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 border border-white shadow-xs"></span>
      <span className={isUrdu ? "font-urdu text-sm font-black text-purple-900" : "font-sans text-xs font-bold text-purple-900"}>
        {label}
      </span>
    </div>
  );
};

/**
 * TruckPatternBorder - Authentic Pakistani Truck Art Wavy Psychedelic Frame.
 * Recreated as crisp vector SVG directly matching the border around the Bedford truck and Peacock in the user's artwork.
 * Layered with Cyan, Royal Purple, Flame Amber, and Sun Yellow waves with ruby and emerald jewel rosettes.
 */
export const TruckPatternBorder = ({ className = '', height = 'h-7 sm:h-8', opacity = 'opacity-100' }) => (
  <div className={`w-full overflow-hidden ${height} ${className} relative shadow-sm border-y-2 border-cyan-500 bg-[#0A192F]`}>
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className={opacity}>
      <defs>
        <pattern id="peacockTruckArtWavyBorder" width="160" height="32" patternUnits="userSpaceOnUse">
          {/* Base deep navy blue from the truck art frame */}
          <rect width="160" height="32" fill="#0A192F" />
          
          {/* Layer 1: Sky Blue / Cyan Wave */}
          <path d="M0,16 Q40,-4 80,16 T160,16 L160,32 L0,32 Z" fill="#0284C7" />
          
          {/* Layer 2: Royal Violet / Purple Wave */}
          <path d="M0,19 Q40,1 80,19 T160,19 L160,32 L0,32 Z" fill="#7C3AED" />
          
          {/* Layer 3: Flame Amber / Orange Wave */}
          <path d="M0,22 Q40,6 80,22 T160,22 L160,32 L0,32 Z" fill="#F59E0B" />
          
          {/* Layer 4: Sun Chrome Yellow Highlight */}
          <path d="M0,25 Q40,11 80,25 T160,25 L160,32 L0,32 Z" fill="#FACC15" />
          
          {/* Top Counter-Wave in Peacock Cyan */}
          <path d="M0,14 Q40,32 80,14 T160,14 L160,0 L0,0 Z" fill="#0369A1" opacity="0.45" />
          <path d="M0,10 Q40,26 80,10 T160,10 L160,0 L0,0 Z" fill="#38BDF8" opacity="0.3" />
          
          {/* Decorative Ruby Rosette Jewel at Upper Crest */}
          <circle cx="40" cy="9" r="4" fill="#E11D48" stroke="#FACC15" strokeWidth="1" />
          <circle cx="40" cy="9" r="1.5" fill="#FFFFFF" />
          <circle cx="34" cy="9" r="1" fill="#FACC15" />
          <circle cx="46" cy="9" r="1" fill="#FACC15" />

          {/* Decorative Emerald Rosette Jewel at Lower Crest */}
          <circle cx="120" cy="23" r="4" fill="#10B981" stroke="#FACC15" strokeWidth="1" />
          <circle cx="120" cy="23" r="1.5" fill="#FFFFFF" />
          <circle cx="114" cy="23" r="1" fill="#FACC15" />
          <circle cx="126" cy="23" r="1" fill="#FACC15" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#peacockTruckArtWavyBorder)" />
    </svg>
  </div>
);

/**
 * TruckGhungrooTrim - Decorative hanging brass bells & tassels found under truck bumpers.
 */
export const TruckGhungrooTrim = ({ className = '' }) => (
  <div className={`flex items-center justify-center gap-2 py-1 ${className}`}>
    {Array.from({ length: 20 }).map((_, i) => (
      <div key={i} className="flex flex-col items-center">
        <div className="w-[1.5px] h-2 bg-gradient-to-b from-amber-400 to-purple-600"></div>
        <div className={`w-2 h-2 rounded-full ${i % 3 === 0 ? 'bg-cyan-400 border border-purple-600' : i % 3 === 1 ? 'bg-yellow-400 border border-rose-500' : 'bg-emerald-500 border border-cyan-300'} shadow-xs`}></div>
      </div>
    ))}
  </div>
);

/**
 * TruckLotusArchBadge - Mughal arched jharoka badge with lotus flower rosette & vibrant borders.
 * Shows only the selected language (either Urdu or English, never both).
 */
export const TruckLotusArchBadge = ({ text, subtext = '', className = '' }) => {
  const { isUrdu, t } = useLanguage();
  const label = isUrdu ? (text || t('heritageBadge')) : (subtext || t('heritageBadge'));
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-t-2xl rounded-b-lg bg-gradient-to-r from-cyan-600 via-purple-500 to-amber-500 p-[2px] shadow-sm ${className}`}>
      <div className="bg-[#FFFDF7] px-3 py-0.5 rounded-t-[14px] rounded-b-[6px] flex items-center gap-1.5 border border-cyan-200">
        <FloralRosette size={14} />
        <span className={isUrdu ? "font-urdu font-bold text-xs text-purple-900" : "font-sans font-bold text-xs text-purple-900"}>
          {label}
        </span>
      </div>
    </div>
  );
};

/**
 * AjrakRibbon - Traditional Sindhi Ajrak geometric block-print border.
 * Features the iconic Sindhi trefoil & border in crimson red and mustard gold.
 */
export const AjrakRibbon = ({ className = '', height = 'h-2' }) => (
  <div className={`w-full overflow-hidden ${height} ${className}`}>
    <div 
      className="w-full h-full"
      style={{
        background: `repeating-linear-gradient(
          90deg,
          #991B1B 0px,
          #991B1B 8px,
          #FEF3C7 8px,
          #FEF3C7 10px,
          #D97706 10px,
          #D97706 18px,
          #0284C7 18px,
          #0284C7 22px,
          #991B1B 22px,
          #991B1B 30px
        )`,
        borderBottom: '1px solid #7F1D1D'
      }}
    />
  </div>
);

/**
 * TruckBackground - Fixed Viewport Ultra-Crisp Pakistani Decorated Truck Art backdrop.
 * Uses fixed positioning to prevent vertical stretching over long pages (which caused blurriness).
 * Rendered at 100% crisp sharpness with zero milky blur or hazy overlays.
 */
export const TruckBackground = ({ 
  image = '/images/peacock_truck_art_bg.jpg',
  opacity = 'opacity-100',
  overlay = false,
  className = ''
}) => (
  <div className={`fixed inset-0 pointer-events-none overflow-hidden z-0 select-none ${className}`}>
    <img 
      src={image} 
      alt="Pakistani Decorated Truck & Peacock Art" 
      className={`w-full h-full object-cover object-center ${opacity}`}
      style={{
        imageRendering: '-webkit-optimize-contrast',
        filter: 'contrast(1.02) saturate(1.05)'
      }}
      loading="eager"
    />
    {overlay && <div className="absolute inset-0 bg-slate-900/10 pointer-events-none" />}
  </div>
);

// Backward compatibility alias so any remaining imports resolve safely
export const AjrakBackground = TruckBackground;

/**
 * TruckPhotoShowcase - Rich display card featuring authentic Pakistani decorated trucks.
 * Used on the landing page and dashboards to proudly showcase Khyber & Sindh truck art.
 * Shows only the selected language (Urdu or English, never both at once).
 */
export const TruckPhotoShowcase = ({ 
  image = '/images/peacock_truck_art_bg.jpg',
  caption = 'مور و شاہین • چشمِ بد دور',
  subcaption = 'Pakistani Bedford Truck & Truck Art Peacock • Khyber & Sindh Fleet',
  tag = 'ماشاءاللہ',
  tagEn = 'By God\'s Grace',
  className = ''
}) => {
  const { isUrdu } = useLanguage();
  const activeTitle = isUrdu ? caption : subcaption;
  const activeTag = isUrdu ? tag : tagEn;

  return (
    <div className={`relative rounded-2xl overflow-hidden border-2 border-cyan-400 shadow-xl bg-white group hover:border-purple-400 transition-all ${className}`}>
      <div className="relative h-56 sm:h-80 overflow-hidden bg-slate-900">
        <img 
          src={image} 
          alt={activeTitle}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <UrduMotto text={activeTag} translation={activeTag} />
          <NazarBattuBadge />
        </div>
        <div className="absolute bottom-3 left-3 right-3 text-white flex items-end justify-between">
          <div>
            <p className={isUrdu ? "font-urdu text-2xl font-black text-yellow-300 drop-shadow-md" : "font-sans text-base font-bold text-yellow-300 drop-shadow-md"}>
              {activeTitle}
            </p>
          </div>
          <TruckTaj size={32} />
        </div>
      </div>
      <ChamakRibbon height="h-2.5" />
    </div>
  );
};

/**
 * SindhiTruckTexture - Visible textured band/border used directly on truck cards and panel trims.
 */
export const SindhiTruckTexture = ({ className = '', height = 'h-3' }) => (
  <div className={`w-full overflow-hidden ${height} ${className} relative`}>
    <div 
      className="w-full h-full"
      style={{
        background: `repeating-linear-gradient(
          45deg,
          #991B1B 0px,
          #991B1B 10px,
          #FEF3C7 10px,
          #FEF3C7 12px,
          #D97706 12px,
          #D97706 22px,
          #FBBF24 22px,
          #FBBF24 25px,
          #B91C1C 25px,
          #B91C1C 35px
        )`,
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
      }}
    />
  </div>
);

/**
 * TruckTaj - Traditional Khyber Pass & Rawalpindi ornamental crown/taj motif.
 * Crown rendered in golden brass, ruby crimson, and turquoise enamel.
 */
export const TruckTaj = ({ size = 28, className = '', color = '#D97706' }) => (
  <svg 
    width={size} 
    height={size * 0.55} 
    viewBox="0 0 100 55" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Crown Base */}
    <path 
      d="M10 50 L90 50 L95 42 L80 40 L88 22 L72 32 L60 8 L50 25 L40 8 L28 32 L12 22 L20 40 L5 42 Z" 
      fill="url(#tajGoldRedGrad)" 
      stroke="#7F1D1D" 
      strokeWidth="1.5"
    />
    {/* Center Jewels */}
    <circle cx="50" cy="22" r="4.5" fill="#D90429" stroke="#FEF3C7" strokeWidth="1" />
    <circle cx="30" cy="30" r="3.5" fill="#0284C7" stroke="#FEF3C7" strokeWidth="1" />
    <circle cx="70" cy="30" r="3.5" fill="#0284C7" stroke="#FEF3C7" strokeWidth="1" />
    <circle cx="50" cy="38" r="5" fill="#FFB703" stroke="#991B1B" strokeWidth="1" />
    <defs>
      <linearGradient id="tajGoldRedGrad" x1="0" y1="0" x2="100" y2="55" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#D90429" />
        <stop offset="35%" stopColor="#F59E0B" />
        <stop offset="70%" stopColor="#FFB703" />
        <stop offset="100%" stopColor="#B91C1C" />
      </linearGradient>
    </defs>
  </svg>
);

/**
 * FloralRosette - Sindhi Jandi & Truck Art brass flower medallion
 */
export const FloralRosette = ({ size = 20, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 40 40" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    <circle cx="20" cy="20" r="18" stroke="#D97706" strokeWidth="1.2" fill="#FEF3C7" />
    {/* 8 Petals in Red & Yellow */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
      <ellipse 
        key={i} 
        cx="20" 
        cy="11" 
        rx="3.5" 
        ry="7" 
        fill={i % 2 === 0 ? '#D90429' : '#F59E0B'} 
        stroke="#7F1D1D" 
        strokeWidth="0.6"
        transform={`rotate(${angle} 20 20)`} 
      />
    ))}
    <circle cx="20" cy="20" r="5" fill="#0284C7" stroke="#FFFFFF" strokeWidth="1" />
  </svg>
);

/**
 * UrduMotto / TruckPoetry - Authentic Pakistani truck poetry & slogans.
 * Shows only the selected language (either Urdu or English, never both).
 */
export const UrduMotto = ({ text, translation, className = '' }) => {
  const { isUrdu, t } = useLanguage();
  const label = isUrdu ? (text || t('mottoLookLove')) : (translation || t('mottoLookLove'));
  return (
    <div 
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-300 bg-gradient-to-r from-amber-50 via-red-50 to-amber-50 text-amber-950 text-xs shadow-xs ${className}`}
      title={label}
    >
      <TruckTaj size={15} />
      <span className={isUrdu ? "font-urdu text-[12px] font-bold tracking-wide text-red-900" : "font-sans text-[11px] font-bold tracking-wide text-red-900"}>
        {label}
      </span>
    </div>
  );
};

/**
 * TruckPoetryBanner - Traditional decorated poetry ribbon found across truck body panels.
 * Shows only the selected language (either Urdu or English, never both).
 */
export const TruckPoetryBanner = ({ 
  text, 
  subtext, 
  className = '' 
}) => {
  const { isUrdu, t } = useLanguage();
  const mainText = isUrdu ? (text || t('poetryBanner')) : (subtext || t('poetryBanner'));
  const secondaryText = isUrdu ? t('poetrySubtext') : t('poetrySubtext');
  return (
    <div className={`relative px-4 py-2.5 rounded-2xl border-2 border-pink-500 bg-gradient-to-r from-yellow-100 via-pink-50 to-amber-100 text-center shadow-md overflow-hidden ${className}`}>
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 via-yellow-400 via-red-600 to-cyan-500" />
      <div className="flex items-center justify-center gap-3">
        <FloralRosette size={18} />
        <span className={isUrdu ? "font-urdu text-lg font-black text-red-900 drop-shadow-xs" : "font-sans text-sm font-black text-red-900 drop-shadow-xs"}>
          {mainText}
        </span>
        <FloralRosette size={18} />
      </div>
      {secondaryText && (
        <p className={`text-[10px] tracking-wider text-pink-950 font-bold mt-0.5 ${isUrdu ? 'font-urdu' : 'font-mono uppercase'}`}>
          {secondaryText}
        </p>
      )}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-red-600 via-yellow-400 to-pink-500" />
    </div>
  );
};

/**
 * WorkshopBadge - Decorative artisan/workshop badge.
 * Shows only the selected language (either Urdu or English, never both).
 */
export const WorkshopBadge = ({ className = '' }) => {
  const { isUrdu, t } = useLanguage();
  return (
    <div className={`flex items-center gap-2 text-[11px] text-amber-950 ${isUrdu ? 'font-urdu' : 'font-mono'} ${className}`}>
      <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shadow-xs"></span>
      <span className="font-bold text-red-900">
        {t('badgeWorkshop')}
      </span>
    </div>
  );
};
