import { useAuth } from '../../contexts/AuthContext';
import { PackageCheck, Clock, CheckCircle, Download, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, onSnapshot, where, doc } from 'firebase/firestore';
import MapViewer from '../../components/MapViewer';
import { generateBiltyPDF } from '../../utils/generateBiltyPDF';

export default function BusinessDashboard() {
  const { userData } = useAuth();
  const [bilties, setBilties] = useState([]);
  const [activeShipments, setActiveShipments] = useState([]);
  const [truckLocations, setTruckLocations] = useState({});

  useEffect(() => {
    // 1. Listen for bilties (completed shipments)
    const biltiesQuery = query(collection(db, 'bilties'));
    const unsubscribeBilties = onSnapshot(biltiesQuery, (querySnapshot) => {
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({ docId: doc.id, ...doc.data() });
      });
      setBilties(docs);
    }, (error) => console.error("Error fetching bilties: ", error));

    // 2. Listen for active bookings (In Transit)
    // For this MVP, we consider 'Accepted' bookings as In Transit
    const activeBookingsQuery = query(collection(db, 'bookings'), where('status', '==', 'Accepted'));
    const unsubscribeActiveBookings = onSnapshot(activeBookingsQuery, (querySnapshot) => {
      const shipments = [];
      querySnapshot.forEach((doc) => {
        shipments.push({ docId: doc.id, ...doc.data() });
      });
      setActiveShipments(shipments);
    }, (error) => console.error("Error fetching active bookings: ", error));

    return () => {
      unsubscribeBilties();
      unsubscribeActiveBookings();
    };
  }, []);

  // 3. Listen for truck location updates for active shipments
  useEffect(() => {
    if (activeShipments.length === 0) {
      setTruckLocations({});
      return;
    }

    const unsubscribes = activeShipments.map(shipment => {
      if (!shipment.truckId) return () => {};
      return onSnapshot(doc(db, 'trucks', shipment.truckId), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.coordinates) {
             setTruckLocations(prev => ({ ...prev, [shipment.truckId]: data.coordinates }));
          } else {
             // Fallback for demo if coordinates field doesn't exist yet
             setTruckLocations(prev => ({ ...prev, [shipment.truckId]: [31.5204, 74.3587] }));
          }
        }
      }, (error) => console.error(`Error fetching truck ${shipment.truckId} location: `, error));
    });

    return () => unsubscribes.forEach(unsub => unsub());
  }, [activeShipments]);

  const handleDownload = (bilty) => {
    generateBiltyPDF(bilty);
  };

  const [showHistory, setShowHistory] = useState(false);

  // Focus on first active shipment or default
  const mapData = activeShipments.length > 0 && truckLocations[activeShipments[0].truckId] 
    ? { coords: truckLocations[activeShipments[0].truckId], text: `Tracking: ${activeShipments[0].cargoTitle} (${activeShipments[0].truckPlate})` }
    : { coords: [31.5204, 74.3587], text: "No Active Deliveries" };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Business Portal</h1>
          <p className="text-gray-400">Welcome, {userData?.name || 'Business Owner'}. Track your incoming shipments and digital bilties.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-neon-blue/20 text-neon-blue">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Incoming Deliveries</p>
            <p className="text-2xl font-bold text-white">{activeShipments.length}</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-green-500/20 text-green-400">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Completed Total</p>
            <p className="text-2xl font-bold text-white">{bilties.length}</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-neon-purple/20 text-neon-purple">
            <PackageCheck size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Digital Bilties Ready</p>
            <p className="text-2xl font-bold text-white">{bilties.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card h-[500px] flex flex-col pr-2">
          <div className="flex justify-between items-center mb-6 px-2">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText size={20} className="text-neon-purple" /> {showHistory ? 'Delivery History' : 'Active Shipments'}
            </h3>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs text-neon-blue hover:underline"
            >
              {showHistory ? 'Show Active' : 'View History'}
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto px-2">
            {showHistory ? (
              bilties.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No delivery history found.</p>
              ) : (
                <div className="space-y-4">
                  {bilties.map((bilty) => (
                    <div key={bilty.docId} className="p-4 rounded-lg bg-dark-bg border border-white/10 hover:border-neon-purple/50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-white text-lg">{bilty.cargoTitle}</p>
                          <p className="text-sm text-gray-400">From: {bilty.transporterName}</p>
                          <p className="text-xs text-neon-blue mt-1">Status: Delivered via {bilty.truckPlate}</p>
                        </div>
                        <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-bold flex items-center gap-1">
                          <CheckCircle size={12} /> Verified
                        </span>
                      </div>
                      <button onClick={() => handleDownload(bilty)} className="w-full mt-2 bg-white/5 hover:bg-white/10 text-white py-2 rounded flex justify-center items-center gap-2 text-sm transition-colors border border-white/10">
                        <Download size={16} /> Download Bilty PDF
                      </button>
                    </div>
                  ))}
                </div>
              )
            ) : (
              activeShipments.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No incoming deliveries at the moment.</p>
              ) : (
                <div className="space-y-4">
                  {activeShipments.map((shipment) => (
                    <div key={shipment.docId} className="p-4 rounded-lg bg-neon-blue/5 border border-neon-blue/20">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-white">{shipment.cargoTitle}</p>
                          <p className="text-sm text-gray-400">Truck: {shipment.truckPlate}</p>
                          <p className="text-xs text-neon-blue mt-1 italic">
                            {shipment.eta ? `ETA: ${shipment.eta}` : 'ETA: Calculating...'}
                          </p>
                        </div>
                        <div className="animate-pulse flex items-center gap-2 text-neon-blue">
                          <div className="w-2 h-2 rounded-full bg-neon-blue"></div>
                          <span className="text-xs font-bold uppercase tracking-wider">In Transit</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        <div className="glass-card flex flex-col h-[500px]">
          <h3 className="text-xl font-bold text-white mb-4">Live Tracking Map</h3>
          <div className="flex-1 relative min-h-[300px]">
             <MapViewer coordinates={mapData.coords} popupText={mapData.text} color="neon-blue" height="100%" />
          </div>
        </div>
      </div>
    </div>

  );
}
