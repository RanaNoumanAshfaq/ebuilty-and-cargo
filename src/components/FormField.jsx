import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * FormField
 * Standardized input wrapper featuring instant schema validation feedback,
 * red highlighting when invalid, leading icons, and bilingual error messages.
 */
export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  touched,
  placeholder,
  required = false,
  icon: Icon,
  rightElement,
  disabled = false,
  className = '',
  inputClassName = '',
  dir = 'ltr',
  step,
  min,
  max,
  isUrdu = false
}) {
  const isInvalid = Boolean(touched && error);

  return (
    <div className={`space-y-1 text-left ${className}`}>
      {label && (
        <div className="flex justify-between items-center">
          <label 
            htmlFor={name}
            className={`block text-[11px] font-extrabold uppercase tracking-wider ${
              isInvalid ? 'text-rose-600' : 'text-slate-700'
            } ${isUrdu ? 'font-urdu text-xs' : ''}`}
          >
            {label}
            {required && <span className="text-rose-500 ml-1 font-black">*</span>}
          </label>
        </div>
      )}

      <div className="relative rounded-xl transition-all duration-200">
        {Icon && (
          <div className={`absolute inset-y-0 ${isUrdu && dir === 'rtl' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none ${
            isInvalid ? 'text-rose-500' : 'text-slate-400'
          }`}>
            <Icon size={16} />
          </div>
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value ?? ''}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          step={step}
          min={min}
          max={max}
          dir={dir}
          className={`w-full rounded-xl text-xs sm:text-sm font-medium transition-all outline-none py-2 px-3 ${
            Icon ? (isUrdu && dir === 'rtl' ? 'pr-9 pl-3' : 'pl-9 pr-3') : ''
          } ${
            rightElement ? 'pr-10' : ''
          } ${
            isInvalid
              ? 'bg-rose-50/70 border-2 border-rose-500 text-rose-950 placeholder-rose-300 focus:ring-2 focus:ring-rose-300/40 shadow-xs'
              : 'bg-white/90 border border-slate-300 text-slate-900 placeholder-slate-400 hover:border-slate-400 focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-400/20 shadow-2xs'
          } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''} ${inputClassName}`}
        />

        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {isInvalid && (
        <div className="flex items-center gap-1.5 text-rose-600 text-[11px] font-bold animate-fadeIn pl-0.5">
          <AlertCircle size={13} className="shrink-0 text-rose-500" />
          <span className={isUrdu ? 'font-urdu' : ''}>{error}</span>
        </div>
      )}
    </div>
  );
}
