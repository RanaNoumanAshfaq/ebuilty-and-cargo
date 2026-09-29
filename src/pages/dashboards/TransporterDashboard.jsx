import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  Users, FileText, Activity, AlertTriangle, Check, X, XCircle, Shield, 
  Package, Trash2, CheckCircle, Loader2, ArrowRight, Truck, 
  Mail, Phone, Clock, Eye, AlertCircle, FileCheck, Send, MessageSquare, 
  MapPin, Calendar, LayoutGrid, Radio
} from 'lucide-react';
import { logisticsAPI, authAPI, adminAPI, socket } from '../../api';
import BiltyModal from '../../components/BiltyModal';
import { ChamakRibbon, TruckTaj, UrduMotto, WorkshopBadge, TruckPoetryBanner, TruckPatternBorder, TruckLotusArchBadge, TruckMorBadge, NazarBattuBadge } from '../../components/TruckArt';
import MapViewer from '../../components/MapViewer';

const safeJsonParse = (val, fallback) => {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    const res = JSON.parse(val);
    return res != null ? res : fallback;
  } catch (e) {
    return fallback;
  }
};

export default function TransporterDashboard() {
  const { userData, currentUser } = useAuth();
  const { isUrdu } = useLanguage();
  const [activeTab, setActiveTab] = useState('requests');
  const [loading, setLoading] = useState(true);

  // Live state arrays
  const [cargoRequests, setCargoRequests] = useState([]); // All cargo
  const [availableTrucks, setAvailableTrucks] = useState([]); // All available trucks
  const [bookings, setBookings] = useState([]); // Active and completed bookings
  const [trucksViewMode, setTrucksViewMode] = useState('grid'); // 'grid' | 'radar'

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
    setBiltyModalBooking(booking);
  };

  const getStatusBadgeStyle = (status) => {
    switch (status?.toUpperCase()) {
      case 'IN TRANSIT':
        return 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold';
      case 'DELIVERED':
      case 'COMPLETED':
        return 'bg-purple-50 text-purple-800 border border-purple-300 font-bold';
      case 'LOADED':
        return 'bg-amber-50 text-amber-800 border border-amber-300 font-bold';
      case 'TRUCK ASSIGNED':
        return 'bg-sky-50 text-sky-800 border border-sky-300 font-bold';
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-800 border border-yellow-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-300 font-bold';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
        <p className="text-sm text-amber-900 font-bold tracking-wider font-mono">
          {isUrdu ? 'براہ کرم انتظار کریں...' : 'LOADING OPERATOR CENTER...'}
        </p>
      </div>
    );
  }

  const pendingRequests = cargoRequests.filter(c => c.status === 'Pending');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      {/* Truck Art Pattern Ribbon */}
      <TruckPatternBorder height="h-7" className="rounded-xl mb-4 shadow-sm" />

      {/* Truck Poetry Banner */}
      <div className="mb-6 relative z-10">
        <TruckPoetryBanner />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 relative z-10">
        <div className="text-left">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <TruckMorBadge />
            <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-900 bg-cyan-100 px-2 py-0.5 rounded-md border border-cyan-300">Fleet Operations</span>
            <NazarBattuBadge />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{isUrdu ? 'کارگو ٹرانسپورٹر ڈیش بورڈ' : 'Cargo Transporter Dashboard'}</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1 font-medium">{isUrdu ? 'کارپوریٹ شپنگ کی درخواستیں قبول کریں اور گاڑی ڈسپیچ کریں' : 'Accept corporate shipping requests, coordinate fleet logistics, and dispatch verified drivers.'}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2 bg-white border-2 border-cyan-400 px-4 py-2 rounded-xl text-xs text-cyan-950 font-mono shadow-sm">
            <Clock size={14} className="text-purple-600" />
            <span>Operations Live: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Chamak Ribbon */}
      <ChamakRibbon height="h-[5px]" className="rounded-full mb-6 relative z-10" />

      {/* Tabs navigation */}
      <div className="border-b border-amber-200 mb-8 relative z-10">
        <nav className="flex gap-8 overflow-x-auto pb-px">
          {[
            { id: 'requests', name: 'Incoming Requests', badge: pendingRequests.length },
            { id: 'trucks', name: 'Available Trucks' },
            { id: 'shipments', name: 'Active Shipments' },
            { id: 'history', name: 'Delivery History' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedBooking(null);
              }}
              className={`pb-3 text-sm font-semibold transition-all relative flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'text-red-700 border-b-2 border-red-600 font-extrabold drop-shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.name}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none animate-pulse shadow-sm">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Panels */}
      <div className="space-y-6 relative z-10">

        {/* REQUESTS TAB */}
        {activeTab === 'requests' && (
          <div className="space-y-6 text-left">
            {pendingRequests.map(req => {
              const reqProducts = Array.isArray(req.products) ? req.products : safeJsonParse(req.products, []);
              const reqPickup = (req.pickupDetails && typeof req.pickupDetails === 'object') ? req.pickupDetails : safeJsonParse(req.pickupDetails, {});
              const reqRecipients = Array.isArray(req.recipients) ? req.recipients : safeJsonParse(req.recipients, []);

              return (
              <div key={req._id || req.id} className="bg-white border-2 border-amber-200/90 rounded-3xl p-6 space-y-4 shadow-md">
                <div className="flex justify-between items-center border-b border-amber-200 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <TruckTaj className="text-amber-600 w-4 h-3" />
                      REQ-{req.id || (req._id ? String(req._id).slice(0, 8) : '')} <span className="font-normal text-sm text-slate-600">from {req.businessOwnerName}</span>
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    {req.createdAt ? new Date(req.createdAt).toLocaleString() : '2026-06-10 08:45'}
                  </span>
                </div>

                {/* Details split column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm">
                  {/* Products */}
                  <div className="bg-[#FAF7EE] border border-amber-200/80 p-4 rounded-2xl space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Consignment</p>
                    <div className="space-y-1.5 mt-2">
                      <p className="font-bold text-slate-900 text-sm">{req.title}</p>
                      <p className="text-xs text-amber-800 font-bold font-mono">{req.weight} tons</p>
                      {reqProducts.map((p, idx) => (
                        <p key={idx} className="text-xs text-slate-600 font-mono">
                          &middot; {p.name || p.title} ({p.quantity || p.qty || '1'} units)
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Pickup */}
                  <div className="bg-[#FAF7EE] border border-amber-200/80 p-4 rounded-2xl space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Pickup Point</p>
                    <div className="space-y-1 mt-2 text-xs text-slate-700">
                      <p className="font-bold text-slate-900 text-sm">{req.origin}</p>
                      <p><span className="text-slate-500">Address:</span> {reqPickup.address || 'Gulberg Industrial Area, Lahore'}</p>
                      <p><span className="text-slate-500">Landmark:</span> {reqPickup.landmark || 'Near Main Chowk'}</p>
                      <p><span className="text-slate-500">Contact:</span> {reqPickup.contactName || reqPickup.contact || 'Ahmed Raza'} ({reqPickup.phone || reqPickup.contactPhone || '0311-9988776'})</p>
                    </div>
                  </div>

                  {/* Recipients */}
                  <div className="bg-[#FAF7EE] border border-amber-200/80 p-4 rounded-2xl space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Recipients</p>
                    <div className="space-y-1 mt-2 text-xs text-slate-700">
                      <p className="font-bold text-slate-900 text-sm">{req.destination}</p>
                      {reqRecipients.map((r, idx) => (
                        <div key={idx} className="mt-1">
                          <p><span className="text-slate-500">To:</span> {r.name || r.fullName} ({r.phone})</p>
                          <p><span className="text-slate-500">Delivery Address:</span> {r.address || r.streetAddress}</p>
                          <p className="text-emerald-700 mt-1 font-bold font-mono">Deadline: {r.expectedDate || r.deadline ? (r.expectedDate || r.deadline).split('T')[0] : '2026-06-14'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Accept/Reject triggers */}
                <div className="flex gap-4 pt-2">
                  <button 
                    onClick={() => handleCargoResponse(req._id || req.id, 'Accepted')}
                    className="flex-1 btn-primary text-sm font-bold py-2.5 rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-md"
                  >
                    <CheckCircle size={16} /> {isUrdu ? 'درخواست قبول کریں' : 'Accept Request'}
                  </button>
                  <button 
                    onClick={() => handleCargoResponse(req._id || req.id, 'Rejected')}
                    className="flex-1 btn-outline text-sm font-bold py-2.5 rounded-xl cursor-pointer flex items-center justify-center gap-2"
                  >
                    <XCircle size={16} className="shrink-0" /> {isUrdu ? 'مسترد کریں' : 'Reject Request'}
                  </button>
                </div>
              </div>
              );
            })}
            {pendingRequests.length === 0 && (
              <div className="bg-white border-2 border-amber-200/90 rounded-3xl p-16 text-center text-slate-600 shadow-md">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2 opacity-70" />
                <p className="font-bold text-slate-800">No incoming shipping requests found.</p>
                <p className="text-xs text-slate-500 mt-1">All incoming shipments are processed!</p>
              </div>
            )}
          </div>
        )}

        {/* AVAILABLE TRUCKS TAB */}
        {activeTab === 'trucks' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-xs font-bold text-slate-600 tracking-wider uppercase text-left">
                  {isUrdu ? 'دستیاب گاڑیوں کی ڈائریکٹری' : 'Available Trucks Directory'}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {isUrdu ? 'گاڑیاں تلاش کریں اور فوری طور پر کارگو کے لیے مقرر کریں' : 'Locate verified fleet carriers and dispatch them directly to accepted cargo.'}
                </p>
              </div>

              {/* View Switcher: Grid vs Live Fleet Radar */}
              <div className="flex items-center gap-2">
                <div className="flex bg-[#FAF7EE] p-1 rounded-xl border border-amber-300 shadow-xs">
                  <button
                    onClick={() => setTrucksViewMode('grid')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      trucksViewMode === 'grid'
                        ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LayoutGrid size={14} />
                    <span>{isUrdu ? 'گرڈ منظر' : 'Cards'}</span>
                  </button>
                  <button
                    onClick={() => setTrucksViewMode('radar')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      trucksViewMode === 'radar'
                        ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Radio size={14} className={trucksViewMode === 'radar' ? 'animate-pulse text-cyan-300' : ''} />
                    <span>{isUrdu ? 'لائیو ریڈار نقشہ' : 'Live Fleet Radar'}</span>
                  </button>
                </div>
                <UrduMotto />
              </div>
            </div>
            
            {trucksViewMode === 'radar' ? (
              /* Live Fleet Radar Map View */
              <div className="space-y-4">
                <div className="bg-slate-950 border-2 border-amber-300 rounded-3xl p-4 shadow-xl overflow-hidden relative">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 px-2">
                    <div className="flex items-center gap-2">
                      <Radio size={16} className="text-cyan-400 animate-pulse" />
                      <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                        {isUrdu ? 'ملک گیر بیڑے کا لائیو ریڈار' : 'Nationwide Fleet Radar Telemetry'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {isUrdu ? `${availableTrucks.length} گاڑیاں آن لائن` : `${availableTrucks.length} Available Vehicles Online`}
                    </span>
                  </div>

                  <MapViewer 
                    trucks={availableTrucks}
                    onAssignTruck={(truck) => {
                      setSelectedTruckForAssign(truck);
                      setSelectedCargoForAssign(null);
                      setAssignPrice('');
                      setShowAssignModal(true);
                    }}
                    height="500px"
                    zoom={6}
                  />
                </div>

                {/* Fleet Quick Selection Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {availableTrucks.map(truck => (
                    <div 
                      key={truck._id || truck.id}
                      onClick={() => {
                        setSelectedTruckForAssign(truck);
                        setSelectedCargoForAssign(null);
                        setAssignPrice('');
                        setShowAssignModal(true);
                      }}
                      className="bg-white border border-amber-200 rounded-xl p-3 text-left hover:border-amber-400 transition-all cursor-pointer shadow-sm hover:shadow-md flex items-center justify-between group"
                    >
                      <div>
                        <p className="font-mono font-bold text-xs text-slate-900 group-hover:text-red-700 transition-colors">{truck.plateNumber}</p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={10} className="text-red-500 shrink-0" /> {truck.loc}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                          {truck.capacity}
                        </span>
                        <p className="text-[9px] text-slate-400 mt-0.5 capitalize">{truck.truckType || 'Heavy'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Grid Cards View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableTrucks.map(truck => (
                  <div key={truck._id} className="bg-white border-2 border-amber-200/90 rounded-3xl p-5 text-left flex flex-col justify-between h-[290px] shadow-md hover:border-amber-400 hover:shadow-lg transition-all relative overflow-hidden group">
                    <div>
                      <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Truck size={20} />
                        </div>
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-md font-mono">
                          Available
                        </span>
                      </div>

                      <h4 className="text-xl font-black text-slate-900 mt-4 font-mono">{truck.plateNumber}</h4>
                      <p className="text-xs text-amber-800 font-semibold mt-1">{truck.truckType} &middot; {truck.capacity}</p>

                      <div className="mt-4 space-y-1 text-xs text-slate-700">
                        <p><span className="text-slate-500">Owner:</span> <span className="text-slate-900 font-bold">{truck.ownerName}</span></p>
                        <p><span className="text-slate-500">Driver:</span> <span className="text-slate-900 font-bold">{truck.driverName}</span> <span className="text-slate-500 font-mono">({truck.driverMobile})</span></p>
                        <p className="flex items-center gap-1 mt-2 text-slate-600 font-medium">
                          <MapPin size={12} className="text-red-600" /> {truck.loc}
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
                      className="w-full btn-primary font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer mt-4 shadow-md"
                    >
                      {isUrdu ? 'گاڑی مقرر کریں' : 'Assign to Shipment'}
                    </button>
                  </div>
                ))}
                {availableTrucks.length === 0 && (
                  <div className="col-span-3 bg-white border-2 border-amber-200/90 rounded-3xl text-center py-16 text-slate-600 shadow-md">
                    No available trucks found. Register or clear trips to free vehicles.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ACTIVE SHIPMENTS TAB */}
        {activeTab === 'shipments' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-600 tracking-wider uppercase text-left">
              {bookings.filter(b => b.status !== 'Completed' && b.status !== 'Rejected').length} active transits in dispatch
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[480px]">
              {/* Left pane listings */}
              <div className="lg:col-span-4 bg-white border-2 border-amber-200/90 rounded-3xl p-4 overflow-y-auto max-h-[500px] space-y-3 shadow-md">
                {bookings
                  .filter(b => b.status !== 'Completed' && b.status !== 'Rejected')
                  .map(b => {
                    const isSelected = selectedBooking?._id === b._id;
                    return (
                      <div
                        key={b._id}
                        onClick={() => setSelectedBooking(b)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden ${
                          isSelected 
                            ? 'bg-amber-50 border-2 border-red-600 shadow-md' 
                            : 'bg-[#FAF7EE] border-amber-200 hover:border-amber-400'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-red-600 to-amber-500" />
                        )}
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-mono text-xs text-red-700 font-bold">BLT-{b.cargoId || (b._id ? String(b._id).slice(0, 8) : '')}</h4>
                            <h4 className="font-bold text-slate-900 text-base mt-1 truncate">{b.cargoTitle}</h4>
                            <p className="text-xs text-slate-600 mt-1 font-mono">Truck: {b.truckPlate}</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${getStatusBadgeStyle(b.status)}`}>
                            {b.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                {bookings.filter(b => b.status !== 'Completed' && b.status !== 'Rejected').length === 0 && (
                  <div className="text-center py-16 text-slate-500 text-sm">No active shipments in progress.</div>
                )}
              </div>

              {/* Right details review & chat panel */}
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Details card */}
                <div className="md:col-span-7 bg-white border-2 border-amber-200/90 rounded-3xl p-6 flex flex-col justify-between text-left shadow-md">
                  {selectedBooking ? (
                    <div className="space-y-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start border-b border-amber-200 pb-4">
                          <div>
                            <h3 className="text-lg font-black text-slate-900">{selectedBooking.cargoTitle}</h3>
                            <p className="text-xs text-slate-600 mt-1">
                              Owner ID: USR-{selectedBooking.truckOwnerId} &middot; Plate: <span className="font-mono font-bold text-slate-900">{selectedBooking.truckPlate}</span>
                            </p>
                          </div>
                          <span className="text-xs font-mono font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                            BLT-{selectedBooking.cargoId || (selectedBooking._id ? String(selectedBooking._id).slice(0, 8) : '')}
                          </span>
                        </div>

                        {/* Specifications */}
                        <div className="grid grid-cols-2 gap-4 mt-6 text-xs text-slate-700">
                          <div className="bg-[#FAF7EE] p-3 rounded-2xl border border-amber-200/80">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Route</p>
                            <p className="font-bold text-slate-900 mt-0.5">
                              {selectedBooking.cargo?.origin || 'Lahore'} &rarr; {selectedBooking.cargo?.destination || 'Karachi'}
                            </p>
                          </div>
                          <div className="bg-[#FAF7EE] p-3 rounded-2xl border border-amber-200/80">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Agreed Price</p>
                            <p className="font-bold text-emerald-700 mt-0.5 font-mono">Rs. {selectedBooking.price}</p>
                          </div>
                          {selectedBooking.cargo?.weight && (
                            <div className="bg-[#FAF7EE] p-3 rounded-2xl border border-amber-200/80">
                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Weight</p>
                              <p className="font-bold text-slate-900 mt-0.5 font-mono">{selectedBooking.cargo?.weight} tons</p>
                            </div>
                          )}
                          {selectedBooking.eta && (
                            <div className="bg-[#FAF7EE] p-3 rounded-2xl border border-amber-200/80">
                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">ETA</p>
                              <p className="font-bold text-amber-800 mt-0.5 font-mono">{selectedBooking.eta}</p>
                            </div>
                          )}
                        </div>

                        {/* Pickup details */}
                        {(() => {
                          const pickup = (selectedBooking.cargo?.pickupDetails && typeof selectedBooking.cargo?.pickupDetails === 'object')
                            ? selectedBooking.cargo.pickupDetails
                            : safeJsonParse(selectedBooking.cargo?.pickupDetails, {});
                          return (
                            <div className="mt-6 border-t border-amber-200 pt-4 space-y-2">
                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Pickup Address</p>
                              <div className="bg-[#FAF7EE] border border-amber-200/80 p-3 rounded-2xl text-xs text-slate-700">
                                <p><span className="text-slate-500 font-medium">Point:</span> {pickup.address || 'Corporate depot'}</p>
                                <p className="mt-1"><span className="text-slate-500 font-medium">Contact:</span> {pickup.contactName || pickup.contact || '-'} ({pickup.phone || pickup.contactPhone || '-'})</p>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* PDF download */}
                      <button 
                        onClick={() => handleBiltyClick(selectedBooking)}
                        className="w-full btn-primary font-bold py-3 rounded-xl text-sm transition-all cursor-pointer mt-8 flex justify-center items-center gap-2 shadow-md"
                      >
                        <FileText size={16} /> {isUrdu ? 'بلٹی دیکھیں' : 'View & Print Digital Bilty'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3 py-16">
                      <Package size={36} className="text-slate-400" />
                      <p className="text-sm font-bold font-sans">Select a shipment to view details</p>
                    </div>
                  )}
                </div>

                {/* Chat pane */}
                <div className="md:col-span-5 bg-white border-2 border-amber-200/90 rounded-3xl p-4 flex flex-col justify-between h-[400px] md:h-full shadow-md">
                  {selectedBooking ? (
                    <div className="flex flex-col justify-between h-full text-left">
                      <div className="border-b border-amber-200 pb-2 mb-3 flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">Fleet Radio / Chat</h4>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">Plate: {selectedBooking.truckPlate}</p>
                        </div>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      </div>

                      {/* messages bubble log */}
                      <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
                        {(selectedBooking.messages || []).map((m, idx) => {
                          const isTransporter = m.sender === userData?.name;
                          return (
                            <div key={idx} className={`flex ${isTransporter ? 'justify-end' : 'justify-start'}`}>
                              <div className={`p-2.5 rounded-2xl max-w-[85%] text-xs text-left shadow-sm ${
                                isTransporter 
                                  ? 'bg-gradient-to-r from-red-700 to-amber-700 text-white rounded-tr-none' 
                                  : 'bg-[#FAF7EE] text-slate-900 border border-amber-200 rounded-tl-none'
                              }`}>
                                <p className={`text-[9px] font-bold mb-0.5 ${isTransporter ? 'text-amber-200' : 'text-slate-500'}`}>{m.sender}</p>
                                <p className="leading-relaxed">{m.text}</p>
                              </div>
                            </div>
                          );
                        })}
                        {(selectedBooking.messages || []).length === 0 && (
                          <div className="flex-1 flex items-center justify-center text-[10px] text-slate-500 italic">No messages exchanged. Type below to text the driver.</div>
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Chat text input submit */}
                      <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-amber-200 pt-3">
                        <input 
                          type="text" 
                          value={chatMessageText}
                          onChange={e => setChatMessageText(e.target.value)}
                          placeholder="Type dispatch message..."
                          className="flex-1 bg-[#FAF7EE] border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-amber-500"
                        />
                        <button 
                          type="submit"
                          className="btn-primary p-2.5 rounded-xl cursor-pointer flex items-center justify-center shadow-sm"
                        >
                          <Send size={14} />
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2">
                      <MessageSquare size={28} className="text-slate-400" />
                      <p className="text-xs font-bold">Select a shipment to open chat</p>
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
            <div className="bg-white border-2 border-amber-200/90 rounded-3xl p-6 text-left shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-bold text-slate-700 tracking-wider uppercase">Delivery History</h3>
                <span className="text-xs font-mono font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                  Completed Trips: {bookings.filter(b => b.status === 'Completed').length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-[10px] font-bold text-slate-700 uppercase tracking-wider border-b border-amber-200 bg-amber-50/70">
                      <th className="p-3">Shipment ID</th>
                      <th className="p-3">Bilty No.</th>
                      <th className="p-3">Business Owner</th>
                      <th className="p-3">Route</th>
                      <th className="p-3">Weight</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings
                      .filter(b => b.status === 'Completed')
                      .map((b, idx) => (
                        <tr key={b._id || idx} className="border-b border-slate-100 hover:bg-amber-50/40 transition-colors">
                          <td className="p-3 font-mono text-slate-600">SHP-{b.cargoId || 10400 + idx}</td>
                          <td className="p-3">
                            <button 
                              onClick={() => handleBiltyClick(b)}
                              className="font-mono font-bold text-red-700 hover:underline cursor-pointer"
                            >
                              BLT-{b.cargoId || 88000 + idx}
                            </button>
                          </td>
                          <td className="p-3 font-bold text-slate-900">{b.cargo?.businessOwnerName || 'Unknown Owner'}</td>
                          <td className="p-3 text-slate-700">
                            {b.cargo?.origin || 'Lahore'} &rarr; {b.cargo?.destination || 'Karachi'}
                          </td>
                          <td className="p-3 text-slate-800 font-mono font-bold">{b.cargo?.weight || '12.5'} tons</td>
                          <td className="p-3 text-slate-500 font-mono text-xs">
                            {b.completedAt ? b.completedAt.split('T')[0] : '2026-06-10'}
                          </td>
                          <td className="p-3">
                            <span className="bg-purple-50 text-purple-700 border border-purple-300 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">
                              DELIVERED
                            </span>
                          </td>
                        </tr>
                      ))}
                    {bookings.filter(b => b.status === 'Completed').length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center py-12 text-slate-500 italic">No completed delivery history found.</td>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
          <div className="bg-white w-full max-w-md relative p-6 rounded-3xl border-2 border-red-300 shadow-2xl overflow-hidden">
            <ChamakRibbon height="h-[5px]" />
            <button onClick={() => { setRejectingCargoId(null); setRejectionReason(''); }} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-black text-slate-900 mb-2 mt-2 text-left">Reject Shipment Request</h2>
            <p className="text-xs text-slate-600 mb-6 text-left">Please provide a mandatory reason for rejecting this corporate shipment request.</p>
            <form onSubmit={handleConfirmRejection} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-red-700 uppercase tracking-wider mb-1">Rejection Reason *</label>
                <textarea 
                  required 
                  value={rejectionReason} 
                  onChange={e => setRejectionReason(e.target.value)} 
                  className="w-full bg-[#FAF7EE] border border-slate-300 rounded-2xl px-3.5 py-2.5 text-slate-900 h-24 text-sm outline-none focus:bg-white focus:border-red-500" 
                  placeholder="e.g. Schedule conflict or route unavailable. We cannot dispatch vehicles to this route next week." 
                />
              </div>
              <button type="submit" className="w-full btn-crimson text-white font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer shadow-md">
                {isUrdu ? 'مسترد کریں' : 'Confirm Rejection'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Assign Truck popup form */}
      {showAssignModal && selectedTruckForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
          <div className="bg-white w-full max-w-md relative p-6 rounded-3xl border-2 border-amber-300 shadow-2xl overflow-hidden">
            <ChamakRibbon height="h-[5px]" />
            <button onClick={() => setShowAssignModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer">
              <X size={20} />
            </button>
            <div className="flex items-center gap-2 mb-1 mt-2 text-left">
              <TruckTaj className="text-amber-600 w-4 h-3" />
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Fleet Dispatch Assignment</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2 text-left">Assign Truck to Shipment</h2>
            <p className="text-xs text-slate-600 mb-6 text-left">Select an accepted cargo shipment request to assign vehicle <span className="text-red-700 font-bold font-mono">{selectedTruckForAssign.plateNumber}</span>.</p>
            <form onSubmit={handleAssignConfirm} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Select Accepted Shipment *</label>
                <select 
                  required
                  onChange={e => setSelectedCargoForAssign(cargoRequests.find(c => Number(c._id) === Number(e.target.value)))}
                  className="w-full bg-[#FAF7EE] border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs outline-none focus:bg-white focus:border-amber-500">
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
                  <p className="text-[10px] text-amber-700 mt-1 font-semibold">No accepted shipments are available. Accept requests first.</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Agreed Price (PKR) *</label>
                <input 
                  required
                  type="number"
                  value={assignPrice}
                  onChange={e => setAssignPrice(e.target.value)}
                  placeholder="e.g. 75000"
                  className="w-full bg-[#FAF7EE] border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs outline-none focus:bg-white focus:border-amber-500 font-mono"
                />
              </div>
              <button 
                type="submit" 
                disabled={!assignPrice || !selectedCargoForAssign}
                className="w-full btn-primary disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-all cursor-pointer mt-4 shadow-md"
              >
                {isUrdu ? 'گاڑی مقرر کریں' : 'Confirm Assignment & Request'}
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
