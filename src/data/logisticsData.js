/**
 * logisticsData.js
 * Standard Pakistani logistics hubs, cities, cargo classifications,
 * vehicle categories, and freight measurement units.
 */

// ─── Major Pakistan Cities & Freight Hubs ─────────────────────────────────────

export const PAKISTAN_CITIES = [
  { name: 'Karachi', province: 'Sindh', hub: 'Port Qasim & Karachi Port Dry Terminal' },
  { name: 'Lahore', province: 'Punjab', hub: 'Thokar Niaz Baig & Badami Bagh Terminal' },
  { name: 'Rawalpindi', province: 'Punjab', hub: 'Pirwadhai & I-9 Freight Terminal' },
  { name: 'Islamabad', province: 'Federal', hub: 'Islamabad Dry Port / CDA Hub' },
  { name: 'Faisalabad', province: 'Punjab', hub: 'Faisalabad Dry Port & Textile Hub' },
  { name: 'Multan', province: 'Punjab', hub: 'Chowk Kumharan & Multan Dry Port' },
  { name: 'Peshawar', province: 'Khyber Pakhtunkhwa', hub: 'Ring Road & Karkhano Freight Hub' },
  { name: 'Quetta', province: 'Balochistan', hub: 'Quetta Dry Port & Joint Road Terminal' },
  { name: 'Gujranwala', province: 'Punjab', hub: 'G.T. Road Industrial Logistics Center' },
  { name: 'Sialkot', province: 'Punjab', hub: 'Sambrial Dry Port & Export Hub' },
  { name: 'Hyderabad', province: 'Sindh', hub: 'SITE Industrial & Super Highway Depot' },
  { name: 'Sukkur', province: 'Sindh', hub: 'National Highway N-5 Junction Hub' },
  { name: 'Gwadar', province: 'Balochistan', hub: 'Gwadar Free Zone & Deep Sea Port' },
  { name: 'Rahim Yar Khan', province: 'Punjab', hub: 'South Punjab Agricultural Freight Yard' },
  { name: 'Bahawalpur', province: 'Punjab', hub: 'Sutlej Commercial Transport Hub' },
  { name: 'Sargodha', province: 'Punjab', hub: 'Citrus & Grain Freight Terminal' },
  { name: 'Sheikhupura', province: 'Punjab', hub: 'Industrial Corridor & Motorway Exit' },
  { name: 'Abbottabad', province: 'Khyber Pakhtunkhwa', hub: 'Karakoram Highway (KKH) Transit Hub' },
  { name: 'Kasur', province: 'Punjab', hub: 'Tannery & Agricultural Terminal' },
  { name: 'Okara', province: 'Punjab', hub: 'Military Farms & Dairy Logistics Hub' },
  { name: 'Hub', province: 'Balochistan', hub: 'Hub Industrial Trading Estate (HITE)' },
  { name: 'Chaman', province: 'Balochistan', hub: 'Pak-Afghan Border Cargo Depot' },
  { name: 'Torkham', province: 'Khyber Pakhtunkhwa', hub: 'Khyber Pass Border Customs Station' }
];

// ─── Cargo & Goods Categories ──────────────────────────────────────────────────

export const CARGO_CATEGORIES = [
  { id: 'Textiles', label: 'Textiles & Garments', urdu: 'کپڑا اور ٹیکسٹائل', icon: '🧵' },
  { id: 'Agricultural', label: 'Perishable & Agricultural (Grains, Fruits)', urdu: 'زرعی اجناس و پھل', icon: '🌾' },
  { id: 'Industrial', label: 'Industrial & Heavy Machinery', urdu: 'صنعتی مشینری و پرزہ جات', icon: '⚙️' },
  { id: 'Chemicals', label: 'Chemicals, Fertilizers & Liquids', urdu: 'کیمیکل، کھاد اور مائعات', icon: '🧪' },
  { id: 'Construction', label: 'Construction Materials (Cement, Steel, Tiles)', urdu: 'تعمیراتی سامان و سریا', icon: '🏗️' },
  { id: 'Electronics', label: 'Electronics & Home Appliances', urdu: 'برقی آلات', icon: '📺' },
  { id: 'FMCG', label: 'FMCG & Packaged Groceries', urdu: 'اشیائے خوردونوش و گروسری', icon: '📦' },
  { id: 'Pharmaceuticals', label: 'Pharmaceuticals & Medical Goods', urdu: 'ادویات اور طبی سامان', icon: '💊' },
  { id: 'General', label: 'General Dry Cargo & Merchandise', urdu: 'عام خشک مال', icon: '🚚' }
];

// ─── Vehicle / Fleet Categories ────────────────────────────────────────────────

export const VEHICLE_TYPES = [
  { id: '22-Wheeler', label: '22-Wheeler Heavy Articulated Trailer', multiplier: 1.30, defaultCapacity: 45, unit: 'ton', icon: '🚛' },
  { id: '18-Wheeler Trailer', label: '18-Wheeler Prime Mover Trailer', multiplier: 1.25, defaultCapacity: 35, unit: 'ton', icon: '🚛' },
  { id: 'Container (40ft)', label: '40ft High-Cube Container Carrier', multiplier: 1.20, defaultCapacity: 30, unit: 'ton', icon: '🚢' },
  { id: 'Container (20ft)', label: '20ft Standard Container Carrier', multiplier: 1.10, defaultCapacity: 22, unit: 'ton', icon: '🚢' },
  { id: '10-Wheeler', label: '10-Wheeler Full Body Heavy Truck', multiplier: 1.15, defaultCapacity: 20, unit: 'ton', icon: '🚚' },
  { id: '6-Wheeler', label: '6-Wheeler Medium Bedford / Hino Truck', multiplier: 1.05, defaultCapacity: 12, unit: 'ton', icon: '🚚' },
  { id: 'Flatbed', label: 'Flatbed / Lowbed (Machinery & Steel)', multiplier: 1.25, defaultCapacity: 35, unit: 'ton', icon: '🚜' },
  { id: 'Mazada', label: 'Mazada Titan (Rigid Medium)', multiplier: 0.95, defaultCapacity: 7, unit: 'ton', icon: '🚐' },
  { id: 'Shahzore', label: 'Hyundai Shehzore / Mini Truck (1-Ton)', multiplier: 0.85, defaultCapacity: 3, unit: 'ton', icon: '🛻' },
  { id: 'Reefer', label: 'Reefer / Temperature Controlled Truck', multiplier: 1.40, defaultCapacity: 18, unit: 'ton', icon: '❄️' },
  { id: 'Tanker', label: 'Liquid / Fuel Tanker', multiplier: 1.30, defaultCapacity: 30, unit: 'ton', icon: '🛢️' }
];

// ─── Units Configuration (Weight, Volume/Dimension, Rates) ─────────────────────

export const WEIGHT_UNITS = [
  { id: 'ton', label: 'Metric Ton (Tons)', factorToTon: 1, symbol: 'tons' },
  { id: 'kg', label: 'Kilogram (Kg)', factorToTon: 0.001, symbol: 'kg' },
  { id: 'maund', label: 'Mund / Maund (40 Kg)', factorToTon: 0.04, symbol: 'mnd' },
  { id: 'quintal', label: 'Quintal (100 Kg)', factorToTon: 0.1, symbol: 'qtl' }
];

export const DIMENSION_UNITS = [
  { id: 'cm', label: 'Centimeters (cm)', factorToCm: 1 },
  { id: 'meter', label: 'Meters (m)', factorToCm: 100 },
  { id: 'inch', label: 'Inches (in)', factorToCm: 2.54 },
  { id: 'feet', label: 'Feet (ft)', factorToCm: 30.48 }
];

export const VOLUME_UNITS = [
  { id: 'cuft', label: 'Cubic Feet (cu ft)', symbol: 'cu ft' },
  { id: 'cum', label: 'Cubic Meters (cu m)', symbol: 'cu m' },
  { id: 'liter', label: 'Liters (L)', symbol: 'L' }
];

export const RATE_TYPES = [
  { id: 'trip', label: 'PKR / Trip (Fixed Lump Sum)', symbol: 'Rs/Trip' },
  { id: 'ton', label: 'PKR / Ton (Weight-based)', symbol: 'Rs/Ton' },
  { id: 'km', label: 'PKR / Km (Distance-based)', symbol: 'Rs/Km' },
  { id: 'ton-km', label: 'PKR / Ton-Km (NHA Standard)', symbol: 'Rs/Ton-Km' }
];

/**
 * Converts any supported weight unit to standard Metric Tons
 * @param {number|string} value 
 * @param {string} unit ('ton'|'kg'|'maund'|'quintal')
 * @returns {number} tons
 */
export function convertToTons(value, unit = 'ton') {
  const num = parseFloat(value) || 0;
  const found = WEIGHT_UNITS.find(u => u.id === unit);
  return num * (found?.factorToTon || 1);
}
