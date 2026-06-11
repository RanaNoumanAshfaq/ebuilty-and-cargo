import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, FileText, Activity, AlertTriangle, Check, X, XCircle, Shield, 
  Package, Trash2, CheckCircle, Loader2, ArrowRight, Truck, 
  Mail, Phone, Clock, Eye, AlertCircle, FileCheck, Send, MessageSquare, 
  MapPin, Calendar
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { logisticsAPI, authAPI, adminAPI, socket } from '../../api';
import BiltyModal from '../../components/BiltyModal';

export default function TransporterDashboard() {
  const { userData, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('requests');
  const [loading, setLoading] = useState(true);

  // Live state arrays
  const [cargoRequests, setCargoRequests] = useState([]); // All cargo
  const [availableTrucks, setAvailableTrucks] = useState([]); // All available trucks
  const [bookings, setBookings] = useState([]); // Active and completed bookings

  // Action states
  const [rejectingCargoId, setRejectingCargoId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Assign Truck states
  const [selectedTruckForAssign, setSelectedTruckForAssign] = useState(null);
  const [selectedCargoForAssign, setSelectedCargoForAssign] = useState(null);
  const [assignPrice, setAssignPrice] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Active Shipments state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [chatMessageText, setChatMessageText] = useState('');

  // Bilty modal state
  const [biltyModalBooking, setBiltyModalBooking] = useState(null);
  const chatEndRef = useRef(null);

  const fetchData = async () => {
    if (currentUser) {
      try {
        const [cargoRes, trucksRes, bookingsRes] = await Promise.all([
          logisticsAPI.getCargo({ transporterId: currentUser.id || currentUser._id }),
          logisticsAPI.getTrucks({ status: 'Available' }),
          logisticsAPI.getBookings({ transporterId: currentUser.id || currentUser._id })
        ]);
        setCargoRequests(cargoRes.data);
        setAvailableTrucks(trucksRes.data);
        setBookings(bookingsRes.data);
        setLoading(false);
      } catch (e) {
        console.error("Error fetching transporter data:", e);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();

    socket.on('booking_updated', fetchData);
    socket.on('notification', fetchData);

    return () => {
      socket.off('booking_updated');
      socket.off('notification');
    };
  }, [currentUser]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedBooking?.messages]);

  // Sync selected booking details when bookings refresh
  useEffect(() => {
    if (selectedBooking) {
      const updated = bookings.find(b => b._id === selectedBooking._id);
      if (updated) setSelectedBooking(updated);
    }
  }, [bookings]);

  const handleCargoResponse = async (cargoId, status) => {
    if (status === 'Rejected') {
      setRejectingCargoId(cargoId);
      setRejectionReason('');
      return;
    }
    try {
      await logisticsAPI.respondToCargo(cargoId, { status });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmRejection = async (e) => {
    e.preventDefault();
    if (!rejectionReason) return;
    try {
      await logisticsAPI.respondToCargo(rejectingCargoId, { status: 'Rejected', rejectionReason });
      setRejectingCargoId(null);
      setRejectionReason('');
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAssignConfirm = async (e) => {
    e.preventDefault();
    if (!selectedCargoForAssign || !assignPrice) return;
    try {
      const truckId = selectedTruckForAssign._id || selectedTruckForAssign.id;
      const cargoId = selectedCargoForAssign._id || selectedCargoForAssign.id;
      // Create a booking request for the selected truck and cargo
      await logisticsAPI.createBooking({
        truckId: truckId,
        truckPlate: selectedTruckForAssign.plateNumber,
        truckOwnerId: selectedTruckForAssign.ownerId,
        cargoId: cargoId,
        cargoTitle: selectedCargoForAssign.title,
        price: assignPrice,
        transporterName: userData.name
      });
      // Automatically update the Cargo status to show Truck Assigned
      await logisticsAPI.updateCargo(cargoId, {
        status: 'Truck Assigned',
        assignedTruck: selectedTruckForAssign.plateNumber
      });
      setShowAssignModal(false);
      setAssignPrice('');
      setSelectedCargoForAssign(null);
      setSelectedTruckForAssign(null);
      fetchData();
      alert("Booking request submitted to Truck Owner!");
    } catch (error) {
      console.error("Error creating booking:", error.response?.data || error.message);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessageText || !selectedBooking) return;
    try {
      await logisticsAPI.updateBooking(selectedBooking._id || selectedBooking.id, {
        $push: { messages: { sender: userData.name, text: chatMessageText } }
      });
      setChatMessageText('');
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleBiltyClick = (booking) => {
    // Open the bilty preview modal instead of direct download
    setBiltyModalBooking(booking);
  };

  const getStatusBadgeStyle = (status) => {
    switch (status?.toUpperCase()) {
      case 'IN TRANSIT':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'DELIVERED':
      case 'COMPLETED':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'LOADED':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'TRUCK ASSIGNED':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'PENDING':
        return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 text-[#00f3ff] animate-spin" />
        <p className="text-sm text-gray-400 font-semibold tracking-wider">LOADING OPERATOR CENTER...</p>
      </div>
    );
  }

  const pendingRequests = cargoRequests.filter(c => c.status === 'Pending');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="text-left">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Cargo Transporter Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Accept corporate shipping requests, coordinate fleet logistics, and dispatch verified drivers.</p>
        </div>
        <div className="flex gap-2 bg-[#14141e] border border-white/5 px-4 py-2 rounded-xl text-xs text-gray-400 font-mono">
          <Clock size={14} className="text-[#00f3ff]" />
          <span>Operations Live: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-white/5 mb-8">
        <nav className="flex gap-8 overflow-x-auto pb-px">
          {[
            { id: 'requests', name: 'Requests', badge: pendingRequests.length },
            { id: 'trucks', name: 'Available Trucks' },
            { id: 'shipments', name: 'Active Shipments' },
            { id: 'history', name: 'History' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedBooking(null);
              }}
              className={`pb-3 text-sm font-semibold transition-all relative flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id 
                  ? 'text-[#00f3ff] border-b-2 border-[#00f3ff] font-bold' 
                  : 'text-gray-400 hover:text-white pb-3'
              }`}
            >
              {tab.name}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none animate-pulse">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">

        {/* REQUESTS TAB */}
        {activeTab === 'requests' && (
          <div className="space-y-6 text-left">
            {pendingRequests.map(req => (
              <div key={req._id} className="bg-[#14141e]/30 border border-white/5 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      REQ-{req.id || req._id.slice(0, 4)} <span className="font-normal text-sm text-gray-400">from {req.businessOwnerName}</span>
                    </h3>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">
                    {req.createdAt ? new Date(req.createdAt).toLocaleString() : '2026-06-10 08:45'}
                  </span>
                </div>

                {/* Details split column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm">
                  {/* Products */}
                  <div className="bg-[#0a0a0f]/40 border border-white/5 p-4 rounded-xl space-y-2">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Products</p>
                    <div className="space-y-1.5 mt-2">
                      <p className="font-bold text-white text-sm">{req.title}</p>
                      <p className="text-xs text-amber-500 font-bold">{req.weight} tons</p>
                      {req.products && req.products.map((p, idx) => (
                        <p key={idx} className="text-xs text-gray-400">
                          &middot; {p.name || p.title} ({p.qty} units)
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Pickup */}
                  <div className="bg-[#0a0a0f]/40 border border-white/5 p-4 rounded-xl space-y-2">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Pickup Point</p>
                    <div className="space-y-1 mt-2 text-xs text-gray-300">
                      <p className="font-semibold text-white text-sm">{req.origin}</p>
                      <p><span className="text-gray-500">Address:</span> {req.pickupDetails?.address || 'Gulberg Industrial Area, Lahore'}</p>
                      <p><span className="text-gray-500">Landmark:</span> {req.pickupDetails?.landmark || 'Near Main Chowk'}</p>
                      <p><span className="text-gray-500">Contact:</span> {req.pickupDetails?.contactName || 'Ahmed Raza'} ({req.pickupDetails?.phone || '0311-9988776'})</p>
                    </div>
                  </div>

                  {/* Recipients */}
                  <div className="bg-[#0a0a0f]/40 border border-white/5 p-4 rounded-xl space-y-2">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Recipients</p>
                    <div className="space-y-1 mt-2 text-xs text-gray-300">
                      <p className="font-semibold text-white text-sm">{req.destination}</p>
                      {req.recipients && req.recipients.map((r, idx) => (
                        <div key={idx}>
                          <p><span className="text-gray-500">To:</span> {r.name} ({r.phone})</p>
                          <p><span className="text-gray-500">Delivery Address:</span> {r.address}</p>
                          <p className="text-[#00f3ff] mt-1 font-bold">Deadline: {r.expectedDate ? r.expectedDate.split('T')[0] : '2026-06-14'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Accept/Reject triggers */}
                <div className="flex gap-4 pt-2">
                  <button 
                    onClick={() => handleCargoResponse(req._id, 'Accepted')}
                    className="flex-1 bg-transparent hover:bg-emerald-500/5 border border-emerald-500/35 hover:border-emerald-500 text-emerald-400 font-extrabold py-2.5 rounded-xl text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} /> Accept Request
                  </button>
                  <button 
                    onClick={() => handleCargoResponse(req._id, 'Rejected')}
                    className="flex-1 bg-transparent hover:bg-red-500/5 border border-red-500/35 hover:border-red-500 text-red-400 font-extrabold py-2.5 rounded-xl text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <XCircle size={16} className="shrink-0" /> Reject
                  </button>
                </div>
              </div>
            ))}
            {pendingRequests.length === 0 && (
              <div className="glass-card text-center py-16 text-gray-500">No incoming shipping requests found.</div>
            )}
          </div>
        )}

        {/* AVAILABLE TRUCKS TAB */}
        {activeTab === 'trucks' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase text-left">Available Trucks Directory</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableTrucks.map(truck => (
                <div key={truck._id} className="bg-[#14141e]/30 border border-white/5 rounded-2xl p-5 text-left flex flex-col justify-between h-[280px]">
                  <div>
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Truck size={20} />
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md">
                        Available
                      </span>
                    </div>

                    <h4 className="text-xl font-bold text-white mt-4">{truck.plateNumber}</h4>
                    <p className="text-xs text-gray-400 mt-1">{truck.truckType} &middot; {truck.capacity}</p>

                    <div className="mt-4 space-y-1 text-xs text-gray-300">
                      <p><span className="text-gray-500">Owner:</span> <span className="text-white font-semibold">{truck.ownerName}</span></p>
                      <p><span className="text-gray-500">Driver:</span> <span className="text-white font-semibold">{truck.driverName}</span> <span className="text-gray-500">({truck.driverMobile})</span></p>
                      <p className="flex items-center gap-1 mt-2 text-gray-400">
                        <MapPin size={12} className="text-[#00f3ff]" /> {truck.loc}
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setSelectedTruckForAssign(truck);
                      setSelectedCargoForAssign(null);
                      setAssignPrice('');
                      setShowAssignModal(true);
                    }}
                    className="w-full bg-[#00f3ff]/10 hover:bg-[#00f3ff] border border-[#00f3ff]/20 hover:border-transparent text-[#00f3ff] hover:text-black font-extrabold py-2 rounded-xl text-xs transition-all cursor-pointer mt-4"
                  >
                    Assign to Shipment
                  </button>
                </div>
              ))}
              {availableTrucks.length === 0 && (
                <div className="col-span-3 glass-card text-center py-16 text-gray-500 border border-white/5">No available trucks found. Register or clear trips to free vehicles.</div>
              )}
            </div>
          </div>
        )}

        {/* ACTIVE SHIPMENTS TAB */}
        {activeTab === 'shipments' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase text-left">
              {bookings.filter(b => b.status !== 'Completed' && b.status !== 'Rejected').length} active transits
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[480px]">
              {/* Left pane listings */}
              <div className="lg:col-span-4 bg-[#14141e]/30 border border-white/5 rounded-2xl p-4 overflow-y-auto max-h-[500px] space-y-3">
                {bookings
                  .filter(b => b.status !== 'Completed' && b.status !== 'Rejected')
                  .map(b => (
                    <div
                      key={b._id}
                      onClick={() => setSelectedBooking(b)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                        selectedBooking?._id === b._id 
                          ? 'bg-[#00f3ff]/5 border-[#00f3ff]/40 shadow-[0_0_15px_rgba(0,243,255,0.05)]' 
                          : 'bg-[#14141e]/50 border-white/5 hover:border-white/12'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-mono text-xs text-[#00f3ff] font-bold">BLT-{b.cargoId || b._id.slice(0, 4)}</h4>
                          <h4 className="font-bold text-white text-base mt-1 truncate">{b.cargoTitle}</h4>
                          <p className="text-xs text-gray-400 mt-1">Truck: {b.truckPlate}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${getStatusBadgeStyle(b.status)}`}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))}
                {bookings.filter(b => b.status !== 'Completed' && b.status !== 'Rejected').length === 0 && (
                  <div className="text-center py-16 text-gray-500 text-sm">No active shipments in progress.</div>
                )}
              </div>

              {/* Right details review & chat panel */}
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Details card */}
                <div className="md:col-span-7 bg-[#14141e]/30 border border-white/5 rounded-2xl p-6 flex flex-col justify-between text-left">
                  {selectedBooking ? (
                    <div className="space-y-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start border-b border-white/5 pb-4">
                          <div>
                            <h3 className="text-lg font-bold text-white">{selectedBooking.cargoTitle}</h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Owner ID: USR-{selectedBooking.truckOwnerId} &middot; Plate: <span className="font-mono font-bold text-white">{selectedBooking.truckPlate}</span>
                            </p>
                          </div>
                          <span className="text-xs font-mono font-bold text-gray-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                            BLT-{selectedBooking.cargoId || selectedBooking._id.slice(0, 4)}
                          </span>
                        </div>

                        {/* Specifications */}
                        <div className="grid grid-cols-2 gap-4 mt-6 text-xs text-gray-300">
                          <div>
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Route</p>
                            <p className="font-semibold text-white mt-0.5">
                              {selectedBooking.cargo?.origin || 'Lahore'} &rarr; {selectedBooking.cargo?.destination || 'Karachi'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Agreed Price</p>
                            <p className="font-semibold text-emerald-400 mt-0.5">Rs. {selectedBooking.price}</p>
                          </div>
                          {selectedBooking.cargo?.weight && (
                            <div>
                              <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Weight</p>
                              <p className="font-semibold text-white mt-0.5">{selectedBooking.cargo?.weight} tons</p>
                            </div>
                          )}
                          {selectedBooking.eta && (
                            <div>
                              <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider">ETA</p>
                              <p className="font-semibold text-amber-400 mt-0.5">{selectedBooking.eta}</p>
                            </div>
                          )}
                        </div>

                        {/* Pickup details */}
                        <div className="mt-6 border-t border-white/5 pt-4 space-y-2">
                          <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Pickup Address</p>
                          <div className="bg-[#0a0a0f]/40 border border-white/5 p-3 rounded-xl text-xs text-gray-300">
                            <p><span className="text-gray-500 font-medium">Point:</span> {selectedBooking.cargo?.pickupDetails?.address || 'Corporate depot'}</p>
                            <p className="mt-1"><span className="text-gray-500 font-medium">Contact:</span> {selectedBooking.cargo?.pickupDetails?.contactName || '-'} ({selectedBooking.cargo?.pickupDetails?.phone || '-'})</p>
                          </div>
                        </div>
                      </div>

                      {/* PDF download */}
                      <button 
                        onClick={() => handleBiltyClick(selectedBooking)}
                        className="w-full bg-[#00f3ff] hover:bg-[#00d7e2] text-black font-extrabold py-2.5 rounded-xl text-sm transition-colors cursor-pointer mt-8 flex justify-center items-center gap-1.5"
                      >
                        <FileText size={16} /> Download Digital Bilty
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-3 py-16">
                      <Package size={36} className="text-gray-600" />
                      <p className="text-sm font-medium font-sans">Select a shipment to view details</p>
                    </div>
                  )}
                </div>

                {/* Chat pane */}
                <div className="md:col-span-5 bg-[#14141e]/30 border border-white/5 rounded-2xl p-4 flex flex-col justify-between h-[400px] md:h-full">
                  {selectedBooking ? (
                    <div className="flex flex-col justify-between h-full text-left">
                      <div className="border-b border-white/5 pb-2 mb-3">
                        <h4 className="text-sm font-bold text-white">Chat with Truck Owner</h4>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">Plate: {selectedBooking.truckPlate}</p>
                      </div>

                      {/* messages bubble log */}
                      <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
                        {(selectedBooking.messages || []).map((m, idx) => {
                          const isTransporter = m.sender === userData?.name;
                          return (
                            <div key={idx} className={`flex ${isTransporter ? 'justify-end' : 'justify-start'}`}>
                              <div className={`p-2.5 rounded-xl max-w-[85%] text-xs text-left ${
                                isTransporter 
                                  ? 'bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/20 rounded-tr-none' 
                                  : 'bg-white/5 text-gray-300 border border-white/5 rounded-tl-none'
                              }`}>
                                <p className="text-[9px] font-bold text-gray-500 mb-0.5">{m.sender}</p>
                                <p className="leading-relaxed">{m.text}</p>
                              </div>
                            </div>
                          );
                        })}
                        {(selectedBooking.messages || []).length === 0 && (
                          <div className="flex-1 flex items-center justify-center text-[10px] text-gray-500 italic">No messages exchanged. Type below to text the driver.</div>
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Chat text input submit */}
                      <form onSubmit={handleSendMessage} className="flex gap-1.5 border-t border-white/5 pt-3">
                        <input 
                          type="text" 
                          value={chatMessageText}
                          onChange={e => setChatMessageText(e.target.value)}
                          placeholder="Type..."
                          className="flex-1 bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-[#00f3ff]"
                        />
                        <button 
                          type="submit"
                          className="bg-[#00f3ff] hover:bg-[#00d7e2] text-black p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                        >
                          <Send size={14} />
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-2">
                      <MessageSquare size={28} className="text-gray-600" />
                      <p className="text-xs font-semibold">Select a shipment to chat</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-[#14141e]/30 border border-white/5 rounded-2xl p-6 text-left">
              <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-6">Delivery History</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-[10px] font-bold text-gray-500 uppercase border-b border-b-white/5">
                      <th className="pb-3">Shipment ID</th>
                      <th className="pb-3">Bilty No.</th>
                      <th className="pb-3">Business Owner</th>
                      <th className="pb-3">Route</th>
                      <th className="pb-3">Weight</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings
                      .filter(b => b.status === 'Completed')
                      .map((b, idx) => (
                        <tr key={b._id || idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-4 font-mono text-gray-500">SHP-{b.cargoId || 10400 + idx}</td>
                          <td className="py-4">
                            <button 
                              onClick={() => handleBiltyClick(b)}
                              className="font-bold text-amber-400 hover:underline cursor-pointer"
                            >
                              BLT-{b.cargoId || 88000 + idx}
                            </button>
                          </td>
                          <td className="py-4 font-bold text-white">{b.cargo?.businessOwnerName || 'Unknown Owner'}</td>
                          <td className="py-4 text-white">
                            {b.cargo?.origin || 'Lahore'} &rarr; {b.cargo?.destination || 'Karachi'}
                          </td>
                          <td className="py-4 text-gray-400">{b.cargo?.weight || '12.5'} tons</td>
                          <td className="py-4 text-gray-500">
                            {b.completedAt ? b.completedAt.split('T')[0] : '2026-06-10'}
                          </td>
                          <td className="py-4">
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider">
                              DELIVERED
                            </span>
                          </td>
                        </tr>
                      ))}
                    {bookings.filter(b => b.status === 'Completed').length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center py-12 text-gray-500 italic">No completed delivery history found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* MODALS */}

      {/* Rejection popup form */}
      {rejectingCargoId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4">
          <div className="glass bg-[#14141e] w-full max-w-md relative p-6 rounded-2xl border border-white/10 shadow-2xl">
            <button onClick={() => { setRejectingCargoId(null); setRejectionReason(''); }} className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-2 text-left">Reject Shipment Request</h2>
            <p className="text-xs text-gray-400 mb-6 text-left">Please provide a mandatory reason for rejecting this corporate shipment request.</p>
            <form onSubmit={handleConfirmRejection} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Rejection Reason *</label>
                <textarea 
                  required 
                  value={rejectionReason} 
                  onChange={e => setRejectionReason(e.target.value)} 
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-white h-24 text-sm outline-none focus:border-red-500" 
                  placeholder="e.g. Schedule conflict or route unavailable. We cannot dispatch vehicles to this route next week." 
                />
              </div>
              <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors cursor-pointer">
                Confirm Rejection
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Assign Truck popup form */}
      {showAssignModal && selectedTruckForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4">
          <div className="glass bg-[#14141e] w-full max-w-md relative p-6 rounded-2xl border border-white/10 shadow-2xl">
            <button onClick={() => setShowAssignModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-2 text-left">Assign Truck to Shipment</h2>
            <p className="text-xs text-gray-400 mb-6 text-left">Select an accepted cargo shipment request to assign vehicle <span className="text-[#00f3ff] font-bold">{selectedTruckForAssign.plateNumber}</span>.</p>
            <form onSubmit={handleAssignConfirm} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Select Accepted Shipment *</label>
                <select 
                  required
                  onChange={e => setSelectedCargoForAssign(cargoRequests.find(c => Number(c._id) === Number(e.target.value)))}
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#00f3ff]">
                  <option value="">-- Choose Cargo --</option>
                  {cargoRequests
                    .filter(c => c.status === 'Accepted')
                    .map(c => (
                      <option key={c._id} value={String(c._id)}>
                        {c.title} ({c.weight} tons) &rarr; {c.destination}
                      </option>
                    ))}
                </select>
                {cargoRequests.filter(c => c.status === 'Accepted').length === 0 && (
                  <p className="text-[10px] text-orange-400 mt-1">No accepted shipments are available. Accept requests first.</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Agreed Price (PKR) *</label>
                <input 
                  required
                  type="number"
                  value={assignPrice}
                  onChange={e => setAssignPrice(e.target.value)}
                  placeholder="e.g. 75000"
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#00f3ff]"
                />
              </div>
              <button 
                type="submit" 
                disabled={!assignPrice || !selectedCargoForAssign}
                className="w-full bg-[#00f3ff] hover:bg-[#00d7e2] disabled:opacity-50 text-black font-extrabold py-2.5 rounded-xl text-sm transition-colors cursor-pointer mt-4"
              >
                Confirm Assignment & Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bilty PDF Preview Modal */}
      <BiltyModal
        booking={biltyModalBooking}
        onClose={() => setBiltyModalBooking(null)}
      />

    </div>
  );
}
