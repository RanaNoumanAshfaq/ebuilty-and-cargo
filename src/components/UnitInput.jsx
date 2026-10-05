import React from 'react';
import { AlertCircle } from 'lucide-react';
import { WEIGHT_UNITS, DIMENSION_UNITS, VOLUME_UNITS, RATE_TYPES } from '../data/logisticsData';

/**
 * UnitInput
 * Numeric input seamlessly combined with a selectable unit dropdown
 * (Kg, Ton, Maund, Quintal, cu ft, liters, meters, PKR/Trip, PKR/Ton, PKR/Km).
 */
export default function UnitInput({
  label,
  value,
  unit,
  selectedUnit,
  onValueChange,
  onChange,
  onUnitChange,
  onBlur,
  unitCategory = 'weight', // 'weight' | 'dimension' | 'volume' | 'rate' | 'custom'
  customUnits = null,
  units = null,
  error,
  touched,
  required = false,
  placeholder = '0.00',
  step = 'any',
  min = '0.01',
  isUrdu = false,
  className = ''
}) {
  const isInvalid = Boolean(touched && error);
  const activeUnit = selectedUnit !== undefined ? selectedUnit : unit;

  const handleValueChange = (val) => {
    if (onValueChange) onValueChange(val);
    if (onChange) onChange(val);
  };

  const getUnits = () => {
    if (units) return units;
    if (customUnits) return customUnits;
    switch (unitCategory) {
      case 'weight':
        return WEIGHT_UNITS;
      case 'dimension':
        return DIMENSION_UNITS;
      case 'volume':
        return VOLUME_UNITS;
      case 'rate':
        return RATE_TYPES;
      default:
        return WEIGHT_UNITS;
    }
  };

  const unitsList = getUnits();

  return (
    <div className={`space-y-1 text-left ${className}`}>
      {label && (
        <label className={`block text-[11px] font-extrabold uppercase tracking-wider ${
          isInvalid ? 'text-rose-600' : 'text-slate-700'
        } ${isUrdu ? 'font-urdu text-xs' : ''}`}>
          {label}
          {required && <span className="text-rose-500 ml-1 font-black">*</span>}
        </label>
      )}

      {/* Input + Dropdown Group */}
      <div className={`flex rounded-xl overflow-hidden transition-all duration-200 border ${
        isInvalid
          ? 'bg-rose-50/70 border-2 border-rose-500 ring-2 ring-rose-300/40 shadow-xs'
          : 'bg-white border-slate-300 hover:border-slate-400 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-400/20 shadow-2xs'
      }`}>
        <input
          type="number"
          step={step}
          min={min}
          value={value ?? ''}
          onChange={(e) => handleValueChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`flex-1 py-2 px-3 text-xs sm:text-sm font-mono font-bold bg-transparent outline-none ${
            isInvalid ? 'text-rose-950 placeholder-rose-300' : 'text-slate-900 placeholder-slate-400'
          }`}
        />

        <div className="border-l border-slate-200 bg-slate-50 flex items-center">
          <select
            value={activeUnit}
            onChange={(e) => onUnitChange && onUnitChange(e.target.value)}
            className="bg-transparent text-[11px] font-bold text-slate-700 px-2.5 py-2 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
          >
            {unitsList.map((u) => (
              <option key={u.id} value={u.id} className="text-slate-900 font-medium">
                {u.label || u.name}
              </option>
            ))}
          </select>
        </div>
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
