import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X, AlertCircle } from 'lucide-react';

/**
 * SearchSelect
 * Autocomplete combobox to minimize manual typing for cities, routes,
 * cargo classifications, and vehicle categories.
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
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        if (onBlur) onBlur();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onBlur]);

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
    <div ref={wrapperRef} className={`space-y-1 text-left relative ${className}`}>
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
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className={`w-full rounded-xl py-2 px-3 flex items-center justify-between gap-2 text-xs sm:text-sm font-medium transition-all cursor-pointer ${
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
              className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
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

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-[120] left-0 right-0 mt-1 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-dropdown-fade max-h-64 flex flex-col">
          {/* Search Input Box */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/70 flex items-center gap-2">
            <Search size={14} className="text-slate-400 shrink-0 ml-1" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Type to filter..."
              className="w-full bg-transparent text-xs py-1 text-slate-800 placeholder-slate-400 outline-none"
              onClick={e => e.stopPropagation()}
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-48 divide-y divide-slate-100/80 p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, i) => {
                const optVal = opt.value || opt.id || opt.name || opt.label;
                const isSelected = value === optVal;

                return (
                  <div
                    key={optVal || i}
                    onClick={() => handleSelect(opt)}
                    className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-cyan-50 font-bold text-cyan-900 border border-cyan-200' 
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {opt.icon && <span className="text-base shrink-0">{opt.icon}</span>}
                      <div>
                        <p className="font-semibold text-slate-900 leading-tight">{opt.label || opt.name}</p>
                        {(opt.subtext || opt.province || opt.hub) && (
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {opt.province ? `${opt.province} • ` : ''}{opt.hub || opt.subtext}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {opt.badge && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && <Check size={14} className="text-cyan-600 font-bold" />}
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
        </div>
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
