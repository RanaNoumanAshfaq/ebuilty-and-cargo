import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Navigation } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

// Create a custom futuristic icon using Lucide and Leaflet DivIcon
const createCustomIcon = (color) => {
  const iconMarkup = renderToStaticMarkup(
    <div className={`relative flex items-center justify-center w-8 h-8 rounded-full bg-dark-bg border-2 border-${color} shadow-[0_0_15px_${color}]`}>
      <Navigation size={16} className={`text-${color} rotate-45`} style={{ color: color === 'neon-blue' ? '#00f3ff' : '#bc13fe' }} />
    </div>
  );

  return L.divIcon({
    html: iconMarkup,
    className: 'custom-leaflet-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

export default function MapViewer({ coordinates, popupText, height = '300px', color = 'neon-blue' }) {
  const [icon, setIcon] = useState(null);

  useEffect(() => {
    setIcon(createCustomIcon(color));
  }, [color]);

  if (!icon) return null;

  return (
    <div className="w-full rounded-xl overflow-hidden border border-white/10" style={{ height }}>
      <MapContainer 
        center={coordinates} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" // Dark theme futuristic map
        />
        <Marker position={coordinates} icon={icon}>
          <Popup className="futuristic-popup">
            <div className="text-sm font-semibold p-1">{popupText}</div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
