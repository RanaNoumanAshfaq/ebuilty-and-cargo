import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, Check, X, AlertCircle } from 'lucide-react';

/**
 * SearchSelect
 * High-performance autocomplete combobox with React Portal.
 * Renders the popover menu directly into document.body to completely escape
 * parent stacking contexts, backdrop-filters, and overflow:hidden clipping.
 */
export default function SearchSelect({
  label,
  value,
  onChange,
  onBlur,
  options = [], // [{ value/id, label, subtext, icon, badge }]
  placeholder = 'Select or search...',
  quickPills = [], // Quick 1-click select pills
  error,
  touched,
  required = false,
  isUrdu = false,
  className = '',
  icon: LeadingIcon
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownStyle, setDropdownStyle] = useState({});
  const wrapperRef = useRef(null);
  const triggerBoxRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Calculate dynamic fixed positioning relative to viewport
  const updatePosition = () => {
    if (!triggerBoxRef.current) return;
    const rect = triggerBoxRef.current.getBoundingClientRect();
    const estHeight = 260; // Max dropdown height
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Flip upwards if not enough space below and more space above
    const openUp = spaceBelow < estHeight && spaceAbove > spaceBelow;

    const top = openUp
      ? Math.max(8, rect.top - Math.min(estHeight, spaceAbove - 12) - 4)
      : rect.bottom + 4;

    const maxHeight = openUp
      ? Math.min(estHeight, spaceAbove - 16)
      : Math.min(estHeight, spaceBelow - 16);

    // Keep horizontally within viewport boundaries
    const minWidth = Math.max(rect.width, 240);
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - minWidth - 8));

    setDropdownStyle({
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${Math.max(rect.width, minWidth)}px`,
      maxHeight: `${Math.max(120, maxHeight)}px`,
      zIndex: 99999,
    });
  };

  // Reposition on scroll and resize
  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const onScrollOrResize = () => {
        updatePosition();
      };
      // Use capture to catch scrolling inside modals and overflow containers
      window.addEventListener('scroll', onScrollOrResize, true);
      window.addEventListener('resize', onScrollOrResize);
      return () => {
        window.removeEventListener('scroll', onScrollOrResize, true);
        window.removeEventListener('resize', onScrollOrResize);
      };
    }
  }, [isOpen]);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        triggerBoxRef.current &&
        !triggerBoxRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        if (onBlur) onBlur();
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        triggerBoxRef.current?.focus();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onBlur]);

  // Selected option display
  const selectedOption = options.find(
    opt => (opt.value || opt.id || opt.name) === value || opt.label === value
  );

  const filteredOptions = options.filter(opt => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    const labelMatch = (opt.label || opt.name || '').toLowerCase().includes(term);
    const subMatch = (opt.subtext || opt.province || opt.hub || '').toLowerCase().includes(term);
    return labelMatch || subMatch;
  });

  const handleSelect = (opt) => {
    const val = opt.value || opt.id || opt.name || opt.label;
    onChange(val, opt);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('', null);
    setSearchQuery('');
  };

  const isInvalid = Boolean(touched && error);

  return (
    <div ref={wrapperRef} className={`space-y-1 text-left relative ${isOpen ? 'z-30' : 'z-10'} ${className}`}>
      {label && (
        <label className={`block text-[11px] font-extrabold uppercase tracking-wider ${
          isInvalid ? 'text-rose-600' : 'text-slate-700'
        } ${isUrdu ? 'font-urdu text-xs' : ''}`}>
          {label}
          {required && <span className="text-rose-500 ml-1 font-black">*</span>}
        </label>
      )}

      {/* Main Trigger Box */}
      <div 
        ref={triggerBoxRef}
        onClick={() => {
          const nextState = !isOpen;
          setIsOpen(nextState);
          if (nextState) {
            updatePosition();
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
        className={`w-full rounded-xl py-2 px-3 flex items-center justify-between gap-2 text-xs sm:text-sm font-medium transition-all cursor-pointer select-none ${
          isInvalid
            ? 'bg-rose-50/70 border-2 border-rose-500 text-rose-950 shadow-xs'
            : isOpen
              ? 'bg-white border-2 border-cyan-500 ring-2 ring-cyan-400/20 shadow-xs'
              : 'bg-white/90 border border-slate-300 text-slate-900 hover:border-slate-400 shadow-2xs'
        }`}
      >
        <div className="flex items-center gap-2 truncate flex-1">
          {LeadingIcon && <LeadingIcon size={16} className={isInvalid ? 'text-rose-500' : 'text-slate-400'} />}
          {selectedOption ? (
            <div className="flex items-center gap-2 truncate">
              {selectedOption.icon && <span className="text-sm shrink-0">{selectedOption.icon}</span>}
              <span className="font-bold text-slate-900 truncate">
                {selectedOption.label || selectedOption.name}
              </span>
              {(selectedOption.subtext || selectedOption.province) && (
                <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                  ({selectedOption.subtext || selectedOption.province})
                </span>
              )}
            </div>
          ) : value ? (
            <span className="font-bold text-slate-900 truncate">{value}</span>
          ) : (
            <span className="text-slate-400 truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {(value || selectedOption) && (
            <button 
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown size={16} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180 text-cyan-600' : ''}`} />
        </div>
      </div>

      {/* Quick Select Pills (e.g. popular cities like Karachi, Lahore, Rawalpindi) */}
      {quickPills.length > 0 && !isOpen && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Quick:</span>
          {quickPills.map((pill) => (
            <button
              key={pill}
              type="button"
              onClick={() => {
                const found = options.find(o => (o.name || o.label || o.value) === pill);
                onChange(pill, found || null);
              }}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                value === pill
                  ? 'bg-cyan-100 border-cyan-400 text-cyan-900'
                  : 'bg-slate-100/80 hover:bg-slate-200 border-slate-300 text-slate-700'
              }`}
            >
              {pill}
            </button>
          ))}
        </div>
      )}

      {/* Floating Dropdown Menu via React Portal */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div 
          ref={dropdownRef}
          style={dropdownStyle}
          className="bg-white/98 backdrop-blur-2xl border-2 border-cyan-400/90 rounded-2xl shadow-[0_25px_60px_-15px_rgba(2,132,199,0.35),0_15px_30px_rgba(15,23,42,0.22)] overflow-hidden animate-dropdown-fade flex flex-col pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input Box */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2 shrink-0">
            <Search size={14} className="text-cyan-600 shrink-0 ml-1" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Type to filter..."
              className="w-full bg-transparent text-xs py-1 text-slate-800 placeholder-slate-400 outline-none font-medium"
              onClick={e => e.stopPropagation()}
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-52 divide-y divide-slate-100/80 p-1.5 custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, i) => {
                const optVal = opt.value || opt.id || opt.name || opt.label;
                const isSelected = value === optVal;

                return (
                  <div
                    key={optVal || i}
                    onClick={() => handleSelect(opt)}
                    className={`px-3 py-2.5 rounded-xl text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-gradient-to-r from-cyan-50 to-purple-50 font-bold text-cyan-950 border border-cyan-300' 
                        : 'hover:bg-sky-50/80 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {opt.icon && <span className="text-base shrink-0">{opt.icon}</span>}
                      <div className="truncate">
                        <p className="font-semibold text-slate-900 leading-tight truncate">{opt.label || opt.name}</p>
                        {(opt.subtext || opt.province || opt.hub) && (
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                            {opt.province ? `${opt.province} • ` : ''}{opt.hub || opt.subtext}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {opt.badge && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && <Check size={15} className="text-cyan-600 font-bold" />}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-400 italic">
                No matching options found.
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Validation Error Message */}
      {isInvalid && (
        <div className="flex items-center gap-1.5 text-rose-600 text-[11px] font-bold animate-fadeIn pl-0.5">
          <AlertCircle size={13} className="shrink-0 text-rose-500" />
          <span className={isUrdu ? 'font-urdu' : ''}>{error}</span>
        </div>
      )}
    </div>
  );
}
