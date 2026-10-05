import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  Truck, Navigation, List, MapPin, UploadCloud, AlertCircle, 
  CheckCircle, Plus, X, Trash2, Edit, Send, MessageSquare, 
  Calendar, Clock, Check, Camera, FileCheck, PenTool, RotateCcw, AlertTriangle, ShieldCheck, Radio, FileText
} from 'lucide-react';
import BiltyModal from '../../components/BiltyModal';
import { useState, useEffect, useRef } from 'react';
import { logisticsAPI, authAPI, socket } from '../../api';
import { ChamakRibbon, TruckTaj, UrduMotto, WorkshopBadge, TruckPoetryBanner, SindhiTruckTexture, TruckPatternBorder, TruckLotusArchBadge, TruckMorBadge, NazarBattuBadge } from '../../components/TruckArt';
import MapViewer, { CITY_COORDINATES, getCoordinatesForLocation } from '../../components/MapViewer';
import SearchSelect from '../../components/SearchSelect';
import UnitInput from '../../components/UnitInput';
import FormField from '../../components/FormField';
import { 
  PAKISTAN_CITIES, 
  VEHICLE_TYPES, 
  WEIGHT_UNITS 
} from '../../data/logisticsData';
import { 
  formatPhone, 
  validatePhone, 
  validateLicensePlate, 
  validatePositiveNumber, 
  validateRequired 
} from '../../utils/validation';

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

export default function TruckOwnerDashboard() {
  const { userData, currentUser } = useAuth();
  const { isUrdu } = useLanguage();
  const [activeTab, setActiveTab] = useState('fleet');

  // Fleets state
  const [trucks, setTrucks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(null);
  const [addingTruck, setAddingTruck] = useState(false);
  const [newTruck, setNewTruck] = useState({ 
    id: '', 
    capacity: '', 
    capacityUnit: 'ton',
    loc: '', 
    truckType: 'Full Body Truck', 
    driverName: '', 
    driverMobile: '', 
    fitnessDoc: '', 
    insuranceDoc: '' 
  });
  const [truckFormErrors, setTruckFormErrors] = useState({});
  const [editTruckData, setEditTruckData] = useState(null);
  const [editTruckErrors, setEditTruckErrors] = useState({});

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [biltyModalBooking, setBiltyModalBooking] = useState(null);
  const [eta, setEta] = useState('');
  const [completingBooking, setCompletingBooking] = useState(null);
  const [pod, setPod] = useState('');

  // Touchscreen e-POD states
  const [deliveryCode, setDeliveryCode] = useState('');
  const [podPhotoFile, setPodPhotoFile] = useState(null);
  const [conditionStatus, setConditionStatus] = useState('Good Condition');
  const [discrepancyNotes, setDiscrepancyNotes] = useState('');
  const [isSubmittingDelivery, setIsSubmittingDelivery] = useState(false);
  const signatureCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Messages state
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [chatMessageText, setChatMessageText] = useState('');
  const chatEndRef = useRef(null);

  // Chat tracking for unread notifications
  const [readMessageCounts, setReadMessageCounts] = useState({});

  // Account verification uploads
  const [cnicFile, setCnicFile] = useState(null);
  const [vehicleFile, setVehicleFile] = useState(null);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  const fetchData = async () => {
    if (currentUser) {
      try {
        const [truckRes, bookingRes] = await Promise.all([
          logisticsAPI.getTrucks({ ownerId: currentUser.id || currentUser._id }),
          logisticsAPI.getBookings({ truckOwnerId: currentUser.id || currentUser._id })
        ]);
        setTrucks(truckRes.data);
        setBookings(bookingRes.data);
      } catch (e) {
        console.error("Error fetching truck owner data:", e);
      }
    }
  };

  useEffect(() => {
    fetchData();
    socket.on('notification', fetchData);
    socket.on('booking_updated', fetchData);
    return () => {
      socket.off('notification');
      socket.off('booking_updated');
    };
  }, [currentUser]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConversation?.messages]);

  // Sync selected booking and selected conversation when bookings refresh
  useEffect(() => {
    if (selectedBooking) {
      const updated = bookings.find(b => b._id === selectedBooking._id);
      if (updated) setSelectedBooking(updated);
    }
    if (selectedConversation) {
      const updated = bookings.find(b => b._id === selectedConversation._id);
      if (updated) {
        setSelectedConversation(updated);
        setReadMessageCounts(prev => ({
          ...prev,
          [updated._id]: updated.messages?.length || 0
        }));
      }
    }
  }, [bookings]);

  // Calculate unread counts for messages tab
  const getUnreadCount = (booking) => {
    const totalMsgs = booking.messages?.length || 0;
    const readMsgs = readMessageCounts[booking._id] || 0;
    const count = Math.max(0, totalMsgs - readMsgs);
    if (count > 0 && booking.messages) {
      const lastMsg = booking.messages[booking.messages.length - 1];
      if (lastMsg.sender === userData?.name) return 0;
    }
    return count;
  };

  const totalUnreadMessages = bookings
    .filter(b => b.status !== 'Completed')
    .reduce((sum, b) => sum + getUnreadCount(b), 0);

  const handleDocumentSubmit = async () => {
    if (!cnicFile || !vehicleFile) {
      setUploadMessage('Please upload both files');
      return;
    }
    setUploadingDocs(true);
    setUploadMessage('Uploading documents...');
    try {
      const [cnicUrl, vehicleUrl] = await Promise.all([
        logisticsAPI.uploadFile(cnicFile),
        logisticsAPI.uploadFile(vehicleFile)
      ]);
      await authAPI.updateProfile({
        status: 'pending_verification',
        documents: [cnicUrl, vehicleUrl]
      });
      setUploadMessage('Documents submitted! Awaiting administrator approval.');
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) {
      console.error(e);
      setUploadMessage('Error submitting: ' + (e.response?.data?.message || e.message));
    } finally {
      setUploadingDocs(false);
    }
  };

  const handleAddTruckSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    const plateErr = validateLicensePlate(newTruck.id, isUrdu);
    if (plateErr) errors.id = plateErr;

    const capErr = validatePositiveNumber(newTruck.capacity, 'Payload Capacity', isUrdu);
    if (capErr) errors.capacity = capErr;

    if (!newTruck.loc) {
      errors.loc = isUrdu ? 'براہ کرم گاڑی کا موجودہ مقام منتخب کریں' : 'Please select a base depot / city';
    }

    const driverNameErr = validateRequired(newTruck.driverName, 'Driver Name', isUrdu);
    if (driverNameErr) errors.driverName = driverNameErr;

    const phoneErr = validatePhone(newTruck.driverMobile, isUrdu);
    if (phoneErr) errors.driverMobile = phoneErr;

    if (Object.keys(errors).length > 0) {
      setTruckFormErrors(errors);
      return;
    }

    setAddingTruck(true);
    try {
      const fullCapacity = `${newTruck.capacity} ${newTruck.capacityUnit || 'ton'}`;
      await logisticsAPI.addTruck({
        id: (newTruck.id || '').toUpperCase().trim(),
        capacity: fullCapacity,
        loc: newTruck.loc,
        truckType: newTruck.truckType,
        driverName: newTruck.driverName,
        driverMobile: newTruck.driverMobile,
        fitnessDoc: newTruck.fitnessDoc || null,
        insuranceDoc: newTruck.insuranceDoc || null,
        coordinates: [31.5204, 74.3587]
      });
      setShowAddModal(false);
      setNewTruck({
        id: '', capacity: '', capacityUnit: 'ton', loc: '', truckType: 'Full Body Truck',
        driverName: '', driverMobile: '', fitnessDoc: '', insuranceDoc: ''
      });
      setTruckFormErrors({});
      fetchData();
    } catch (error) {
      console.error("Error adding truck:", error);
      alert(error.response?.data?.message || 'Failed to add truck');
    } finally {
      setAddingTruck(false);
    }
  };

  const handleEditTruckSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    const plateVal = editTruckData.plateNumber || editTruckData.id;
    const plateErr = validateLicensePlate(plateVal, isUrdu);
    if (plateErr) errors.plateNumber = plateErr;

    if (!editTruckData.loc) {
      errors.loc = isUrdu ? 'مقام منتخب کریں' : 'Location is required';
    }
    const nameErr = validateRequired(editTruckData.driverName, 'Driver Name', isUrdu);
    if (nameErr) errors.driverName = nameErr;

    const phoneErr = validatePhone(editTruckData.driverMobile, isUrdu);
    if (phoneErr) errors.driverMobile = phoneErr;

    if (Object.keys(errors).length > 0) {
      setEditTruckErrors(errors);
      return;
    }

    setAddingTruck(true);
    try {
      await logisticsAPI.updateTruck(editTruckData._id, editTruckData);
      setEditTruckData(null);
      setEditTruckErrors({});
      fetchData();
    } catch (error) {
      console.error("Error updating truck:", error);
      alert(error.response?.data?.message || 'Failed to update truck');
    } finally {
      setAddingTruck(false);
    }
  };

  const [truckFitnessFile, setTruckFitnessFile] = useState(null);
  const [truckInsuranceFile, setTruckInsuranceFile] = useState(null);

  const handleDocsSubmit = async (e) => {
    e.preventDefault();
    try {
      let fitnessUrl = showDocsModal.fitnessDoc || '';
      let insuranceUrl = showDocsModal.insuranceDoc || '';

      if (truckFitnessFile) fitnessUrl = await logisticsAPI.uploadFile(truckFitnessFile);
      if (truckInsuranceFile) insuranceUrl = await logisticsAPI.uploadFile(truckInsuranceFile);

      await logisticsAPI.updateTruck(showDocsModal._id || showDocsModal.id, {
        fitnessDoc: fitnessUrl,
        insuranceDoc: insuranceUrl
      });
      setShowDocsModal(null);
      setTruckFitnessFile(null);
      setTruckInsuranceFile(null);
      fetchData();
    } catch (error) {
      console.error('Error updating docs:', error.response?.data || error.message);
      alert('Upload failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteTruck = async (truckId) => {
    if (!window.confirm("Are you sure you want to remove this truck from your fleet?")) return;
    try {
      await logisticsAPI.deleteTruck(truckId);
      fetchData();
    } catch (error) {
      console.error("Error deleting truck:", error);
    }
  };

  const handleBookingResponse = async (bookingId, isAccepted) => {
    try {
      const status = isAccepted ? 'Accepted' : 'Rejected';
      await logisticsAPI.updateBooking(bookingId, { status });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartTransit = async (booking) => {
    try {
      const bookingId = booking._id || booking.id;
      const truckId = booking.truckId;
      await Promise.all([
        logisticsAPI.updateBooking(bookingId, { status: 'In Transit' }),
        logisticsAPI.updateTruck(truckId, { status: 'In Transit' })
      ]);
      fetchData();
    } catch (e) {
      console.error('Start transit error:', e.response?.data || e.message);
      alert(`Error: ${e.response?.data?.message || e.message}`);
    }
  };

  const handleUpdateEta = async (bookingId) => {
    if (!eta) return;
    try {
      await logisticsAPI.updateBooking(bookingId, { eta });
      setEta('');
      alert("ETA updated successfully");
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // Real-time location updater for fleet inventory
  const handleLocationUpdate = async (truckId, newCity) => {
    try {
      const coords = CITY_COORDINATES[newCity.toLowerCase()] || [31.5204, 74.3587];
      await logisticsAPI.updateTruck(truckId, { loc: newCity, lat: coords[0], lng: coords[1] });
      setTrucks(trucks.map(t => (t._id === truckId || t.id === truckId) ? { ...t, loc: newCity, lat: coords[0], lng: coords[1], coordinates: coords } : t));
    } catch (e) {
      console.error('Error updating truck location:', e);
    }
  };

  // Canvas drawing event handlers for touchscreen e-POD signature
  const startDrawing = (e) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0B101D';
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleConfirmDelivery = async (e) => {
    e.preventDefault();
    if (!pod && !hasSignature) {
      alert("Please provide PoD notes or consignee signature!");
      return;
    }
    setIsSubmittingDelivery(true);
    try {
      let signatureData = null;
      if (hasSignature && signatureCanvasRef.current) {
        signatureData = signatureCanvasRef.current.toDataURL('image/png');
      }

      let uploadedPhotoUrl = null;
      if (podPhotoFile) {
        uploadedPhotoUrl = await logisticsAPI.uploadFile(podPhotoFile);
      }

      await logisticsAPI.completeBooking(completingBooking._id || completingBooking.id, {
        pod: pod || 'Delivered with verified digital signature',
        deliveryCode: deliveryCode || null,
        receiverSignature: signatureData || null,
        podPhotoUrl: uploadedPhotoUrl || null,
        conditionStatus: conditionStatus || 'Good Condition',
        discrepancyNotes: conditionStatus === 'Damage / Shortage Reported' ? discrepancyNotes : null
      });

      setCompletingBooking(null);
      setPod('');
      setDeliveryCode('');
      setPodPhotoFile(null);
      setConditionStatus('Good Condition');
      setDiscrepancyNotes('');
      setHasSignature(false);
      setSelectedBooking(null);
      fetchData();
      alert('Trip marked as Delivered! Electronic Proof of Delivery (e-POD) and signature recorded.');
    } catch (error) {
      console.error(error);
      alert('Error completing delivery: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmittingDelivery(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessageText || !selectedConversation) return;
    try {
      const bookingId = selectedConversation._id || selectedConversation.id;
      await logisticsAPI.updateBooking(bookingId, {
        $push: { messages: { sender: userData.name, text: chatMessageText } }
      });
      setChatMessageText('');
      fetchData();
    } catch (e) {
      console.error(e);
    }
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative page-enter">
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
            {isUrdu && <span className="text-[11px] font-bold uppercase tracking-widest text-amber-900 bg-yellow-100 px-2.5 py-0.5 rounded-md border border-yellow-400 font-urdu">شاہراہِ پاکستان</span>}
            <NazarBattuBadge />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{isUrdu ? 'ٹرک مالک ڈیش بورڈ' : 'Fleet Operator Dashboard'}</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1 font-medium">{isUrdu ? 'ڈرائیورز، گاڑیوں، ڈسپیچ اور ٹرانسپورٹرز سے بات چیت کا مکمل نظام' : 'Manage driver profiles, vehicle certificates, dispatch operations, and transporters chats.'}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2 bg-white/90 backdrop-blur-md border-2 border-amber-400 px-4 py-2 rounded-xl text-xs text-amber-900 font-mono shadow-sm">
            <Clock size={14} className="text-red-600 animate-pulse" />
            <span>Live Session: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Chamak Ribbon */}
      <ChamakRibbon height="h-[5px]" className="rounded-full mb-6 relative z-10" />

      {/* Verification Warnings */}
      {userData?.status === 'pending' && (
        <div className="mb-8 border-l-4 border-amber-500 glass-card border-2 border-amber-300 rounded-3xl p-6 text-left shadow-xl relative z-10">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
            <AlertCircle className="text-amber-600" /> Identity Verification Required
          </h2>
          <p className="text-sm text-slate-600 mb-6">You must upload your CNIC photo and vehicle fitness documents before you can start registering trucks or dispatching drivers.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div className="bg-[#FAF7EE] p-4 rounded-2xl border border-amber-200">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Scan/Upload CNIC</label>
              <input type="file" onChange={(e) => setCnicFile(e.target.files[0])} className="block w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer" />
            </div>
            <div className="bg-[#FAF7EE] p-4 rounded-2xl border border-amber-200">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Vehicle Operations License</label>
              <input type="file" onChange={(e) => setVehicleFile(e.target.files[0])} className="block w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-100 file:text-red-700 hover:file:bg-red-200 cursor-pointer" />
            </div>
          </div>
          
          {uploadMessage && <p className={`text-xs mt-2 font-bold ${uploadMessage.includes('submitted') ? 'text-emerald-700' : 'text-amber-700'}`}>{uploadMessage}</p>}
          
          <button onClick={handleDocumentSubmit} disabled={uploadingDocs} className="btn-primary text-white font-extrabold px-5 py-2.5 rounded-xl text-sm transition-all mt-4 flex items-center gap-2 cursor-pointer shadow-md">
            {uploadingDocs ? (isUrdu ? 'جمع ہو رہا ہے...' : 'Submitting...') : <><UploadCloud size={16} /> {isUrdu ? 'دستاویزات جمع کریں' : 'Submit Documents'}</>}
          </button>
        </div>
      )}

      {userData?.status === 'pending_verification' && (
        <div className="mb-8 border-l-4 border-sky-500 glass-card border-2 border-sky-200 rounded-3xl p-6 text-left shadow-xl relative z-10">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
            <CheckCircle className="text-sky-600" /> Documents Under Review
          </h2>
          <p className="text-sm text-slate-600">Your profile registration request has been submitted to administrators. You will be verified shortly.</p>
        </div>
      )}

      {/* Dashboard Tabs */}
      <div className="border-b border-amber-200 mb-8 relative z-10">
        <nav className="flex gap-8 overflow-x-auto pb-px">
          {[
            { id: 'fleet', name: 'Fleet Inventory' },
            { id: 'bookings', name: 'Active Bookings' },
            { id: 'history', name: 'Trip History' },
            { id: 'messages', name: 'Messages & Radio', badge: totalUnreadMessages }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-semibold transition-all duration-300 relative flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'text-red-700 border-b-2 border-red-600 font-extrabold drop-shadow-sm scale-[1.02]' 
                  : 'text-slate-600 hover:text-slate-900 hover:scale-[1.01]'
              }`}
            >
              {tab.name}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none shadow-sm">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Panels */}
      <div className={userData?.status !== 'active' ? 'opacity-40 pointer-events-none' : ''}>
        
        {/* FLEETS PANEL */}
        {activeTab === 'fleet' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center glass-card border border-white/60 rounded-3xl p-5 shadow-xl">
              <div className="flex items-center gap-3">
                <TruckTaj className="text-amber-600 w-5 h-4" />
                <span className="text-sm text-slate-800 font-bold font-mono">
                  {trucks.filter(t => t.status === 'Available').length} available / {trucks.length} registered trucks
                </span>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="btn-primary text-xs !py-2 !px-4 shadow-md hover:scale-105 active:scale-95 transition-all"
              >
                <Plus size={16} /> {isUrdu ? 'گاڑی شامل کریں' : 'Register Truck'}
              </button>
            </div>

            {/* Live Fleet Radar Map */}
            <div className="glass-card border border-white/60 rounded-3xl p-5 shadow-xl text-left">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TruckTaj className="text-amber-600 w-5 h-4" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                    {isUrdu ? 'لائیو فلیٹ راڈار اور ٹرمینل ڈپوز' : 'Live Fleet Radar & Depot Terminals'}
                  </h3>
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-500">
                  {trucks.length} Units Active
                </span>
              </div>
              <MapViewer trucks={trucks} height="360px" title="MY FLEET RADAR & ACTIVE TELEMETRY" />
            </div>

            {/* Trucks list */}
            <div className="space-y-4">
              {trucks.map(truck => (
                <div key={truck._id} className="glass-card-3d border border-white/60 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
                  <SindhiTruckTexture height="h-1.5" className="mb-4 rounded-full" />
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-red-700 flex items-center justify-center shrink-0 shadow-xs">
                        <Truck size={24} />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2.5">
                          <h4 className="text-2xl font-black text-slate-900 tracking-wide font-mono">{truck.plateNumber}</h4>
                          <span className="text-xs text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200 font-mono font-bold">
                            {truck.truckType} &middot; {truck.capacity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-2">
                          Driver: <span className="text-slate-900 font-bold">{truck.driverName || 'Unassigned'}</span> 
                          {truck.driverMobile && <span className="text-amber-800 font-mono ml-2 font-semibold">({truck.driverMobile})</span>}
                          {truck.loc && <span className="text-slate-500 ml-2">&bull; Depot: <span className="text-slate-700 font-medium">{truck.loc}</span></span>}
                        </p>

                        {/* Interactive Relocate Depot Dropdown */}
                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 font-mono">
                            <MapPin size={13} className="text-red-600" /> Relocate Depot:
                          </span>
                          <select
                            value={PAKISTAN_CITIES.find(c => (c.name || '').toLowerCase() === (truck.loc || '').toLowerCase())?.name || truck.loc || 'Lahore'}
                            onChange={(e) => handleLocationUpdate(truck._id || truck.id, e.target.value)}
                            className="text-xs bg-[#FAF7EE] border border-amber-300 rounded-lg px-2.5 py-1 text-slate-800 font-semibold outline-none focus:border-red-600 focus:bg-white cursor-pointer shadow-xs"
                            title="Update truck real-time GPS terminal location"
                          >
                            {PAKISTAN_CITIES.map(c => {
                              const cityName = typeof c === 'string' ? c : (c.name || c.id || c.label);
                              return (
                                <option key={cityName} value={cityName}>
                                  {cityName} {c.province ? `(${c.province})` : ''}
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        {/* Documents pills list */}
                        <div className="flex flex-wrap gap-2 mt-4">
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider font-mono">
                            Registration &middot; Verified
                          </span>
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider font-mono ${
                            truck.fitnessDoc ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-amber-50 text-amber-800 border border-amber-300'
                          }`}>
                            Fitness &middot; {truck.fitnessDoc ? 'Verified' : 'Pending'}
                          </span>
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider font-mono ${
                            truck.insuranceDoc ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-amber-50 text-amber-800 border border-amber-300'
                          }`}>
                            Insurance &middot; {truck.insuranceDoc ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                      <button 
                        onClick={() => setShowDocsModal(truck)}
                        className="btn-outline text-xs !py-1.5 !px-3"
                      >
                        <UploadCloud size={14} /> Update Docs
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedBooking(null);
                          setEditTruckData(truck);
                        }}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-amber-100 border border-slate-300 text-slate-700 hover:text-red-700 transition-all cursor-pointer"
                        title="Edit Truck"
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteTruck(truck._id)}
                        className="p-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 transition-all cursor-pointer"
                        title="Delete Truck"
                      >
                        <Trash2 size={14} />
                      </button>
                      <span className={`px-3 py-1 rounded-xl text-xs font-black tracking-wider border uppercase ml-2 ${
                        truck.status === 'Available' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                        truck.status === 'In Transit' ? 'bg-sky-50 text-sky-800 border-sky-300' :
                        'bg-amber-50 text-amber-800 border-amber-300'
                      }`}>
                        {truck.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {trucks.length === 0 && (
                <div className="bg-white border-2 border-amber-200/90 rounded-3xl text-center py-16 text-slate-500 shadow-md">
                  No trucks registered. Click "+ Register Truck" above to register your first vehicle.
                </div>
              )}
            </div>
          </div>
        )}

        {/* BOOKINGS PANEL */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-600 tracking-wider uppercase text-left">
                {bookings.filter(b => b.status !== 'Completed').length} active assignments in dispatch
              </h3>
              <UrduMotto />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[450px]">
              {/* Left assignments list */}
              <div className="lg:col-span-5 bg-white border-2 border-amber-200/90 rounded-3xl p-4 overflow-y-auto max-h-[500px] space-y-3 shadow-md">
                {bookings
                  .filter(b => b.status !== 'Completed')
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
                            <h4 className="font-mono text-xs text-red-700 font-bold">BKG-{b.id || (b._id ? String(b._id).slice(0, 8) : '')}</h4>
                            <h4 className="font-bold text-slate-900 text-base mt-1">{b.transporterName}</h4>
                            <p className="text-xs text-slate-600 mt-1 font-mono">
                              {b.cargoTitle}, {b.cargo?.weight || '12.5'} tons
                            </p>
                            <p className="text-xs text-amber-800 font-semibold mt-1 font-mono">Truck: {b.truckPlate}</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${getStatusBadgeStyle(b.status)}`}>
                            {b.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                {bookings.filter(b => b.status !== 'Completed').length === 0 && (
                  <div className="text-center py-16 text-slate-500 text-sm">No active assignments found.</div>
                )}
              </div>

              {/* Right assignment preview */}
              <div className="lg:col-span-7 bg-white border-2 border-amber-200/90 rounded-3xl p-6 flex flex-col justify-between shadow-md">
                {selectedBooking ? (
                  <div className="flex flex-col justify-between flex-1 text-left space-y-6">
                    <div>
                      <div className="flex justify-between items-start border-b border-amber-200 pb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <TruckTaj className="text-amber-600 w-4 h-3" />
                            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Assignment Details</span>
                          </div>
                          <h3 className="text-xl font-black text-slate-900">{selectedBooking.cargoTitle}</h3>
                          <p className="text-xs text-slate-600 mt-1">
                            Assigned to Truck: <span className="text-red-700 font-mono font-bold">{selectedBooking.truckPlate}</span>
                          </p>
                        </div>
                        <span className="text-xs font-mono font-bold text-red-700 bg-red-50 px-3 py-1 rounded-lg border border-red-200">
                          BKG-{selectedBooking.id || (selectedBooking._id ? String(selectedBooking._id).slice(0, 8) : '')}
                        </span>
                      </div>

                      {/* Details specs */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-sm">
                        <div className="bg-[#FAF7EE] p-3 rounded-2xl border border-amber-200/80">
                          <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Transporter</p>
                          <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedBooking.transporterName}</p>
                        </div>
                        <div className="bg-[#FAF7EE] p-3 rounded-2xl border border-amber-200/80">
                          <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Agreed Price</p>
                          <p className="text-sm font-bold text-emerald-700 mt-0.5 font-mono">Rs. {selectedBooking.price}</p>
                        </div>
                        <div className="bg-[#FAF7EE] p-3 rounded-2xl border border-amber-200/80">
                          <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Route</p>
                          <p className="text-sm font-semibold text-slate-900 mt-0.5">
                            {selectedBooking.cargo?.origin || 'Origin'} &rarr; {selectedBooking.cargo?.destination || 'Destination'}
                          </p>
                        </div>
                        {selectedBooking.eta && (
                          <div className="bg-[#FAF7EE] p-3 rounded-2xl border border-amber-200/80">
                            <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">ETA</p>
                            <p className="text-sm font-bold text-amber-800 mt-0.5 font-mono">{selectedBooking.eta}</p>
                          </div>
                        )}
                      </div>

                      {/* Pickup & Recipient */}
                      {(() => {
                        const pickup = (selectedBooking.cargo?.pickupDetails && typeof selectedBooking.cargo?.pickupDetails === 'object')
                          ? selectedBooking.cargo.pickupDetails
                          : safeJsonParse(selectedBooking.cargo?.pickupDetails, {});
                        return (
                          <div className="mt-6 border-t border-amber-200 pt-4 space-y-3">
                            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Pickup details</h4>
                            <div className="bg-[#FAF7EE] border border-amber-200/80 p-3 rounded-2xl text-xs text-slate-700">
                              <p><span className="text-slate-500 font-medium">Address:</span> {pickup.address || 'Depot Location'}</p>
                              <p className="mt-1"><span className="text-slate-500 font-medium">Landmark:</span> {pickup.landmark || '-'}</p>
                              <p className="mt-1"><span className="text-slate-500 font-medium">Contact:</span> {pickup.contactName || pickup.contact || '-'} ({pickup.phone || pickup.contactPhone || '-'})</p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Progress action controls */}
                    <div className="border-t border-amber-200 pt-6 space-y-4">
                      {selectedBooking.status === 'Pending' ? (
                        <div className="flex gap-3">
                          <button 
                            onClick={() => handleBookingResponse(selectedBooking._id || selectedBooking.id, true)}
                            className="flex-1 btn-primary text-white font-extrabold py-3 rounded-xl text-sm shadow-md"
                          >
                            {isUrdu ? 'بکنگ قبول کریں' : 'Accept Booking'}
                          </button>
                          <button 
                            onClick={() => handleBookingResponse(selectedBooking._id || selectedBooking.id, false)}
                            className="flex-1 btn-outline text-red-700 font-bold py-3 rounded-xl text-sm"
                          >
                            {isUrdu ? 'مسترد کریں' : 'Reject'}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              value={eta} 
                              onChange={e => setEta(e.target.value)} 
                              placeholder="Update ETA (e.g. 1.5 days or 5 hrs)" 
                              className="flex-1 bg-[#FAF7EE] border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs outline-none focus:bg-white focus:border-amber-500 font-mono" 
                            />
                            <button 
                              onClick={() => handleUpdateEta(selectedBooking._id || selectedBooking.id)}
                              className="btn-outline px-4 py-2 rounded-xl text-xs font-bold"
                            >
                              Set ETA
                            </button>
                          </div>
                          
                          <div className="flex flex-wrap gap-2.5">
                            <button
                              onClick={() => {
                                setSelectedConversation(selectedBooking);
                                setActiveTab('messages');
                              }}
                              className="flex-1 btn-outline text-slate-800 font-bold py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5"
                            >
                              <MessageSquare size={16} /> Radio Chat
                            </button>
                            {selectedBooking.status !== 'Pending' && selectedBooking.status !== 'Rejected' && (
                              <button
                                type="button"
                                onClick={() => setBiltyModalBooking(selectedBooking)}
                                className="btn-outline text-amber-900 border-amber-400 bg-amber-50/80 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-amber-100 cursor-pointer shadow-xs"
                              >
                                <FileText size={15} className="text-amber-700" />
                                <span>{isUrdu ? 'بلٹی دیکھیں' : 'View e-Bilty'}</span>
                              </button>
                            )}
                            {selectedBooking.status === 'Accepted' && (
                              <button 
                                onClick={() => handleStartTransit(selectedBooking)}
                                className="flex-1 btn-crimson text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm shadow-md"
                              >
                                {isUrdu ? 'روانہ کریں' : 'Start Transit'}
                              </button>
                            )}
                            {(selectedBooking.status === 'In Transit' || selectedBooking.status === 'Loaded') && (
                              <button 
                                onClick={() => {
                                  setCompletingBooking(selectedBooking);
                                  setPod('');
                                }}
                                className="flex-1 btn-primary text-white font-extrabold py-2.5 rounded-xl text-sm shadow-md"
                              >
                                {isUrdu ? 'ترسیل مکمل' : 'Mark as Delivered'}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3 py-16">
                    <Truck size={36} className="text-slate-400" />
                    <p className="text-sm font-medium font-sans">Select a booking to view details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TRIP HISTORY PANEL */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white border-2 border-amber-200/90 rounded-3xl p-6 text-left shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-bold text-slate-700 tracking-wider uppercase">Completed Trips</h3>
                <span className="text-xs font-mono font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                  Total Completed: {bookings.filter(b => b.status === 'Completed').length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-[10px] font-bold text-slate-700 uppercase tracking-wider border-b border-amber-200 bg-amber-50/70">
                      <th className="p-3">Booking ID</th>
                      <th className="p-3">Transporter</th>
                      <th className="p-3">Cargo</th>
                      <th className="p-3">Route</th>
                      <th className="p-3">Truck</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings
                      .filter(b => b.status === 'Completed')
                      .map((b, idx) => (
                        <tr key={b._id || idx} className="border-b border-slate-100 hover:bg-amber-50/40 transition-colors">
                          <td className="p-3 font-mono text-slate-600">BKG-{b.id || (b._id ? String(b._id).slice(0, 8) : '')}</td>
                          <td className="p-3 font-bold text-slate-900">{b.transporterName}</td>
                          <td className="p-3 text-slate-700">
                            {b.cargoTitle}, {b.cargo?.weight || '12.5'} tons
                          </td>
                          <td className="p-3 text-slate-700">
                            {b.cargo?.origin || 'Lahore'} &rarr; {b.cargo?.destination || 'Karachi'}
                          </td>
                          <td className="p-3 font-mono text-slate-600 font-bold">{b.truckPlate}</td>
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
                        <td colSpan="7" className="text-center py-12 text-slate-500 italic">No completed trips found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MESSAGES PANEL */}
        {activeTab === 'messages' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[480px]">
            {/* Left chat listings */}
            <div className="lg:col-span-4 bg-white border-2 border-amber-200/90 rounded-3xl p-4 overflow-y-auto max-h-[520px] space-y-3 shadow-md">
              <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2 text-left px-1">Active Dispatch Radios</h3>
              {bookings
                .filter(b => b.status !== 'Completed')
                .map(b => {
                  const lastMsg = b.messages && b.messages.length > 0 
                    ? b.messages[b.messages.length - 1] 
                    : { text: 'No messages yet.', createdAt: b.createdAt };
                  
                  const unread = getUnreadCount(b);
                  const isSelected = selectedConversation?._id === b._id;

                  return (
                    <div
                      key={b._id}
                      onClick={() => {
                        setSelectedConversation(b);
                        setReadMessageCounts(prev => ({
                          ...prev,
                          [b._id]: b.messages?.length || 0
                        }));
                      }}
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
                        <h4 className="font-bold text-slate-900 text-sm truncate max-w-[80%]">{b.transporterName}</h4>
                        <span className="text-[9px] text-slate-500 font-mono leading-none">
                          {lastMsg.createdAt ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:32 AM'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 font-mono truncate">Cargo: {b.cargoTitle}</p>
                      <div className="flex justify-between items-center mt-3">
                        <p className="text-[11px] text-slate-600 truncate max-w-[80%]">{lastMsg.text}</p>
                        {unread > 0 && (
                          <span className="bg-red-600 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 shadow-sm leading-none animate-pulse">
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              {bookings.filter(b => b.status !== 'Completed').length === 0 && (
                <div className="text-center py-16 text-slate-500 text-sm">No active conversations.</div>
              )}
            </div>

            {/* Right chat panel */}
            <div className="lg:col-span-8 bg-white border-2 border-amber-200/90 rounded-3xl p-5 flex flex-col justify-between h-[520px] shadow-md">
              {selectedConversation ? (
                <div className="flex flex-col justify-between h-full">
                  {/* Chat header */}
                  <div className="border-b border-amber-200 pb-3 mb-4 text-left flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <TruckTaj className="text-amber-600 w-4 h-3" />
                        <h3 className="font-black text-slate-900 text-lg">{selectedConversation.transporterName}</h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 font-mono">Booking BKG-{selectedConversation.id || (selectedConversation._id ? String(selectedConversation._id).slice(0,8) : '')} &middot; Cargo: {selectedConversation.cargoTitle}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${getStatusBadgeStyle(selectedConversation.status)}`}>
                      {selectedConversation.status}
                    </span>
                  </div>

                  {/* Messages bubble list */}
                  <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1 scroll-smooth">
                    {(selectedConversation.messages || []).map((m, i) => {
                      const isOwner = m.sender === userData?.name;
                      return (
                        <div key={i} className={`flex ${isOwner ? 'justify-end' : 'justify-start'}`}>
                          <div className={`p-3 rounded-2xl max-w-[75%] text-left text-sm shadow-xs ${
                            isOwner 
                              ? 'bg-gradient-to-r from-red-700 to-amber-700 text-white rounded-tr-none' 
                              : 'bg-[#FAF7EE] text-slate-900 border border-amber-200 rounded-tl-none'
                          }`}>
                            <p className={`text-[10px] font-bold mb-1 ${isOwner ? 'text-amber-200' : 'text-slate-500'}`}>{m.sender}</p>
                            <p className="leading-relaxed">{m.text}</p>
                          </div>
                        </div>
                      );
                    })}
                    {(selectedConversation.messages || []).length === 0 && (
                      <div className="flex-1 flex items-center justify-center text-xs text-slate-500 italic">No messages sent yet. Send a message to start conversing!</div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Message submit form */}
                  <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-amber-200 pt-3">
                    <input
                      type="text"
                      value={chatMessageText}
                      onChange={(e) => setChatMessageText(e.target.value)}
                      placeholder="Type fleet message..."
                      className="flex-1 bg-[#FAF7EE] border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-amber-500"
                    />
                    <button
                      type="submit"
                      className="btn-primary p-3 rounded-xl cursor-pointer flex items-center justify-center shadow-md"
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3">
                  <MessageSquare size={36} className="text-slate-400" />
                  <p className="text-sm font-medium font-sans">Select a conversation to start radio dispatch</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* MODALS */}

      {/* Add Truck Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4">
          <div className="bg-white/95 backdrop-blur-2xl w-full max-w-md relative p-6 rounded-3xl border-2 border-amber-400/90 shadow-2xl overflow-hidden modal-enter">
            <ChamakRibbon height="h-[5px]" />
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer">
              <X size={20} />
            </button>
            <div className="flex items-center gap-2 mb-1 mt-2 text-left">
              <TruckTaj className="text-amber-600 w-4 h-3" />
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Fleet Registration</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-6 text-left">{isUrdu ? 'نئی گاڑی رجسٹر کریں' : 'Register Vehicle'}</h2>
            <form onSubmit={handleAddTruckSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  License Plate / Reg No. (e.g. LEA-4421) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={newTruck.id} 
                  onChange={e => {
                    const val = e.target.value.toUpperCase();
                    setNewTruck({...newTruck, id: val});
                    if (truckFormErrors.id) {
                      setTruckFormErrors(prev => {
                        const copy = { ...prev };
                        delete copy.id;
                        return copy;
                      });
                    }
                  }} 
                  className={`w-full bg-[#FAF7EE] border rounded-xl px-3 py-2 text-slate-900 text-xs outline-none font-mono transition-colors ${
                    truckFormErrors.id ? 'border-red-500 ring-2 ring-red-200' : 'border-slate-300 focus:bg-white focus:border-amber-500'
                  }`} 
                  placeholder="e.g. LEA-4421 / TLA-891" 
                />
                {truckFormErrors.id && (
                  <p className="text-[10px] text-red-600 mt-1 font-medium">{truckFormErrors.id}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <UnitInput
                    label="Payload Capacity"
                    value={newTruck.capacity}
                    onChange={(val) => {
                      setNewTruck({...newTruck, capacity: val});
                      if (truckFormErrors.capacity) {
                        setTruckFormErrors(prev => {
                          const copy = { ...prev };
                          delete copy.capacity;
                          return copy;
                        });
                      }
                    }}
                    selectedUnit={newTruck.capacityUnit || 'ton'}
                    onUnitChange={(unit) => setNewTruck({...newTruck, capacityUnit: unit})}
                    units={WEIGHT_UNITS}
                    placeholder="e.g. 25"
                    required
                    error={truckFormErrors.capacity}
                    isUrdu={isUrdu}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Body Type</label>
                  <select 
                    value={newTruck.truckType} 
                    onChange={e => setNewTruck({...newTruck, truckType: e.target.value})} 
                    className="w-full bg-[#FAF7EE] border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs outline-none focus:bg-white focus:border-amber-500 font-semibold"
                  >
                    {VEHICLE_TYPES.map(vt => (
                      <option key={vt.id} value={vt.name}>
                        {vt.name} ({vt.capacityTons}t max)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <SearchSelect 
                  label="Base / Depot City"
                  options={PAKISTAN_CITIES}
                  value={newTruck.loc}
                  onChange={(val) => {
                    setNewTruck({...newTruck, loc: val});
                    if (truckFormErrors.loc) {
                      setTruckFormErrors(prev => {
                        const copy = { ...prev };
                        delete copy.loc;
                        return copy;
                      });
                    }
                  }}
                  placeholder="Search hub or city..."
                  error={truckFormErrors.loc}
                  required
                  isUrdu={isUrdu}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Assigned Driver <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={newTruck.driverName} 
                    onChange={e => {
                      setNewTruck({...newTruck, driverName: e.target.value});
                      if (truckFormErrors.driverName) {
                        setTruckFormErrors(prev => {
                          const copy = { ...prev };
                          delete copy.driverName;
                          return copy;
                        });
                      }
                    }} 
                    className={`w-full bg-[#FAF7EE] border rounded-xl px-3 py-2 text-slate-900 text-xs outline-none transition-colors ${
                      truckFormErrors.driverName ? 'border-red-500 ring-2 ring-red-200' : 'border-slate-300 focus:bg-white focus:border-amber-500'
                    }`} 
                    placeholder="Nasir Hussain" 
                  />
                  {truckFormErrors.driverName && (
                    <p className="text-[10px] text-red-600 mt-1 font-medium">{truckFormErrors.driverName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Driver Contact (03XX-XXXXXXX) <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={newTruck.driverMobile} 
                    onChange={e => {
                      const val = formatPhone(e.target.value);
                      setNewTruck({...newTruck, driverMobile: val});
                      if (truckFormErrors.driverMobile) {
                        setTruckFormErrors(prev => {
                          const copy = { ...prev };
                          delete copy.driverMobile;
                          return copy;
                        });
                      }
                    }} 
                    className={`w-full bg-[#FAF7EE] border rounded-xl px-3 py-2 text-slate-900 text-xs outline-none font-mono transition-colors ${
                      truckFormErrors.driverMobile ? 'border-red-500 ring-2 ring-red-200' : 'border-slate-300 focus:bg-white focus:border-amber-500'
                    }`} 
                    placeholder="0301-2345678" 
                  />
                  {truckFormErrors.driverMobile && (
                    <p className="text-[10px] text-red-600 mt-1 font-medium">{truckFormErrors.driverMobile}</p>
                  )}
                </div>
              </div>

              <button disabled={addingTruck} type="submit" className="w-full btn-primary text-white font-extrabold py-3 rounded-xl text-sm transition-all cursor-pointer mt-6 shadow-md hover:scale-[1.01] active:scale-[0.99]">
                {addingTruck ? (isUrdu ? 'گاڑی رجسٹر ہو رہی ہے...' : 'Registering...') : (isUrdu ? 'گاڑی محفوظ کریں' : 'Save & Enlist Vehicle')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Truck Modal */}
      {editTruckData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4">
          <div className="bg-white/95 backdrop-blur-2xl w-full max-w-md relative p-6 rounded-3xl border-2 border-amber-400/90 shadow-2xl overflow-hidden modal-enter">
            <ChamakRibbon height="h-[5px]" />
            <button onClick={() => setEditTruckData(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-black text-slate-900 mb-6 mt-2 text-left">{isUrdu ? 'گاڑی کی تفصیلات تبدیل کریں' : 'Edit Truck Details'}</h2>
            <form onSubmit={handleEditTruckSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  License Plate <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={editTruckData.plateNumber || editTruckData.id} 
                  onChange={e => setEditTruckData({...editTruckData, plateNumber: e.target.value.toUpperCase()})} 
                  className={`w-full bg-[#FAF7EE] border rounded-xl px-3 py-2 text-slate-900 text-xs outline-none font-mono transition-colors ${
                    editTruckErrors.plateNumber ? 'border-red-500 ring-2 ring-red-200' : 'border-slate-300 focus:bg-white focus:border-amber-500'
                  }`} 
                />
                {editTruckErrors.plateNumber && (
                  <p className="text-[10px] text-red-600 mt-1 font-medium">{editTruckErrors.plateNumber}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Capacity</label>
                  <input 
                    type="text" 
                    value={editTruckData.capacity} 
                    onChange={e => setEditTruckData({...editTruckData, capacity: e.target.value})} 
                    className="w-full bg-[#FAF7EE] border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs outline-none focus:bg-white focus:border-amber-500 font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Truck Type</label>
                  <select 
                    value={editTruckData.truckType} 
                    onChange={e => setEditTruckData({...editTruckData, truckType: e.target.value})} 
                    className="w-full bg-[#FAF7EE] border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs outline-none focus:bg-white focus:border-amber-500 font-semibold"
                  >
                    {VEHICLE_TYPES.map(vt => (
                      <option key={vt.id} value={vt.name}>{vt.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <SearchSelect 
                  label="Current Location"
                  options={PAKISTAN_CITIES}
                  value={editTruckData.loc}
                  onChange={(val) => setEditTruckData({...editTruckData, loc: val})}
                  placeholder="Select current city..."
                  error={editTruckErrors.loc}
                  required
                  isUrdu={isUrdu}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Driver Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={editTruckData.driverName} 
                    onChange={e => setEditTruckData({...editTruckData, driverName: e.target.value})} 
                    className={`w-full bg-[#FAF7EE] border rounded-xl px-3 py-2 text-slate-900 text-xs outline-none transition-colors ${
                      editTruckErrors.driverName ? 'border-red-500 ring-2 ring-red-200' : 'border-slate-300 focus:bg-white focus:border-amber-500'
                    }`} 
                  />
                  {editTruckErrors.driverName && (
                    <p className="text-[10px] text-red-600 mt-1 font-medium">{editTruckErrors.driverName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Driver Mobile <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={editTruckData.driverMobile} 
                    onChange={e => setEditTruckData({...editTruckData, driverMobile: formatPhone(e.target.value)})} 
                    className={`w-full bg-[#FAF7EE] border rounded-xl px-3 py-2 text-slate-900 text-xs outline-none font-mono transition-colors ${
                      editTruckErrors.driverMobile ? 'border-red-500 ring-2 ring-red-200' : 'border-slate-300 focus:bg-white focus:border-amber-500'
                    }`} 
                  />
                  {editTruckErrors.driverMobile && (
                    <p className="text-[10px] text-red-600 mt-1 font-medium">{editTruckErrors.driverMobile}</p>
                  )}
                </div>
              </div>
              <button disabled={addingTruck} type="submit" className="w-full btn-primary text-white font-extrabold py-3 rounded-xl text-sm transition-all cursor-pointer mt-6 shadow-md">
                {addingTruck ? (isUrdu ? 'تبدیل ہو رہا ہے...' : 'Updating...') : (isUrdu ? 'معلومات تبدیل کریں' : 'Update Vehicle Records')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Update Documents Modal */}
      {showDocsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4">
          <div className="bg-white/95 backdrop-blur-2xl w-full max-w-sm relative p-6 rounded-3xl border-2 border-amber-400/90 shadow-2xl overflow-hidden modal-enter">
            <ChamakRibbon height="h-[5px]" />
            <button onClick={() => setShowDocsModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer">
              <X size={20} />
            </button>
            <div className="flex items-center gap-2 mb-1 mt-2 text-left">
              <TruckTaj className="text-amber-600 w-4 h-3" />
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Compliance Documents</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-6 text-left">Update Truck Papers</h2>
            <form onSubmit={handleDocsSubmit} className="space-y-5 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Fitness Certificate</label>
                {showDocsModal.fitnessDoc && (
                  <a href={showDocsModal.fitnessDoc} target="_blank" rel="noopener noreferrer" className="text-xs text-red-700 font-bold hover:underline block mb-2 truncate">
                    Current: {showDocsModal.fitnessDoc}
                  </a>
                )}
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={e => setTruckFitnessFile(e.target.files[0])}
                  className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-900 hover:file:bg-amber-200 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Insurance Papers</label>
                {showDocsModal.insuranceDoc && (
                  <a href={showDocsModal.insuranceDoc} target="_blank" rel="noopener noreferrer" className="text-xs text-red-700 font-bold hover:underline block mb-2 truncate">
                    Current: {showDocsModal.insuranceDoc}
                  </a>
                )}
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={e => setTruckInsuranceFile(e.target.files[0])}
                  className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-red-100 file:text-red-900 hover:file:bg-red-200 cursor-pointer"
                />
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Accepted: Images (JPG, PNG) or PDF. Max 10MB.</p>
              <button type="submit" className="w-full btn-primary text-white font-extrabold py-3 rounded-xl text-sm transition-all cursor-pointer mt-6 shadow-md hover:scale-[1.01] active:scale-[0.99]">
                {isUrdu ? 'دستاویزات اپلوڈ کریں' : 'Upload & Save Documents'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mark Delivered PoD Modal */}
      {completingBooking && (() => {
        const rawRecipients = completingBooking.cargo?.recipients;
        const recipients = Array.isArray(rawRecipients)
          ? rawRecipients
          : safeJsonParse(rawRecipients, []);
        const primaryRecipient = recipients[0];
        const recipientName = primaryRecipient?.name || primaryRecipient?.fullName || null;
        const recipientPhone = primaryRecipient?.phone || null;
        const allNames = recipients.map(r => r.name || r.fullName).filter(Boolean).join(', ');

        const podPlaceholder = recipientName
          ? `e.g. Goods received by ${recipientName}${recipientPhone ? ` (${recipientPhone})` : ''}, verified via OTP / signature code XXXX`
          : `e.g. Goods received by customer, verified via OTP signature code 8821`;

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4">
            <div className="bg-white/95 backdrop-blur-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto relative p-6 rounded-3xl border-2 border-amber-400/90 shadow-2xl modal-enter">
              <ChamakRibbon height="h-[5px]" />
              <button onClick={() => setCompletingBooking(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={20} />
              </button>
              <div className="flex items-center gap-2 mb-1 mt-2 text-left">
                <TruckTaj className="text-amber-600 w-4 h-3" />
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Touchscreen e-POD (Electronic Proof of Delivery)</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-1 text-left font-sans">{isUrdu ? 'ترسیل مکمل کریں' : 'Confirm Delivery & e-POD'}</h2>
              <p className="text-xs text-slate-600 mb-4 text-left">Capture consignee physical touchscreen signature, stamped gate pass photo, and verify delivery status.</p>

              {recipients.length > 0 && (
                <div className="bg-amber-50/70 border border-amber-300 rounded-2xl p-3 mb-4 text-left space-y-1">
                  <p className="text-[10px] font-black text-amber-900 uppercase tracking-wider mb-1.5">
                    Authorized Delivery Recipients
                  </p>
                  {recipients.map((r, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <span className="text-red-700 font-bold mt-0.5">&rarr;</span>
                      <div>
                        <span className="text-slate-900 font-bold">{r.name}</span>
                        {r.phone && <span className="text-amber-800 font-mono ml-2 font-semibold">({r.phone})</span>}
                        {r.address && <p className="text-slate-600 text-[10px] mt-0.5">{r.address}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleConfirmDelivery} className="space-y-4 text-left">
                {/* Touchscreen Digital Signature Canvas */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <PenTool size={14} className="text-red-700" /> Receiver / Consignee Signature *
                    </label>
                    {hasSignature && (
                      <button
                        type="button"
                        onClick={clearSignature}
                        className="text-[11px] text-red-600 hover:text-red-800 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw size={12} /> Clear Signature
                      </button>
                    )}
                  </div>
                  <div className="border-2 border-dashed border-amber-300 rounded-2xl bg-white overflow-hidden relative shadow-inner">
                    <canvas
                      ref={signatureCanvasRef}
                      width={520}
                      height={120}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-32 touch-none cursor-crosshair bg-white"
                    />
                    {!hasSignature && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-400 text-xs font-mono">
                        ✍ Sign on screen with finger or stylus
                      </div>
                    )}
                  </div>
                </div>

                {/* Stamped Gate Pass / Challan Photo Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Camera size={14} className="text-amber-700" /> Stamped Delivery Challan / Gate Pass Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={e => setPodPhotoFile(e.target.files[0])}
                    className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-900 hover:file:bg-amber-200 cursor-pointer"
                  />
                  {podPhotoFile && (
                    <p className="text-[11px] text-emerald-700 font-bold mt-1">
                      Attached: {podPhotoFile.name} ({(podPhotoFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>

                {/* Security Delivery Code & Condition */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-emerald-600" /> Security Delivery Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={deliveryCode}
                      onChange={e => setDeliveryCode(e.target.value)}
                      placeholder="e.g. 8821"
                      className="w-full bg-[#FAF7EE] border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-mono tracking-widest outline-none focus:bg-white focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Cargo Condition</label>
                    <select
                      value={conditionStatus}
                      onChange={e => setConditionStatus(e.target.value)}
                      className="w-full bg-[#FAF7EE] border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-medium outline-none focus:bg-white focus:border-amber-500"
                    >
                      <option value="Good Condition">Full Delivery in Good Condition</option>
                      <option value="Damage / Shortage Reported">Damage / Shortage Reported</option>
                    </select>
                  </div>
                </div>

                {conditionStatus === 'Damage / Shortage Reported' && (
                  <div>
                    <label className="block text-xs font-bold text-red-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <AlertTriangle size={13} /> Discrepancy & Damage Notes
                    </label>
                    <textarea
                      value={discrepancyNotes}
                      onChange={e => setDiscrepancyNotes(e.target.value)}
                      placeholder="Describe damaged cartons, missing seals, or weight discrepancy..."
                      className="w-full bg-red-50/50 border border-red-300 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-red-500"
                      rows={2}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Proof of Delivery Notes</label>
                  <textarea
                    value={pod}
                    onChange={e => setPod(e.target.value)}
                    className="w-full bg-[#FAF7EE] border border-slate-300 rounded-xl px-3 py-2 text-slate-900 h-20 text-xs outline-none focus:bg-white focus:border-amber-500"
                    placeholder={podPlaceholder}
                  />
                  {allNames && (
                    <p className="text-[10px] text-slate-600 mt-1">
                      Tip: Mention <span className="text-red-700 font-bold">{allNames}</span> in your PoD notes for audit verification.
                    </p>
                  )}
                </div>

                <button 
                  disabled={isSubmittingDelivery}
                  type="submit" 
                  className="w-full btn-primary text-white font-extrabold py-3 rounded-xl text-sm transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSubmittingDelivery ? (isUrdu ? 'ترسیل جمع ہو رہی ہے...' : 'Verifying & Submitting e-POD...') : (isUrdu ? 'ترسیل کی تصدیق کریں' : 'Confirm Delivery Completion')}
                </button>
              </form>
            </div>
          </div>
        );
      })()}

      {/* Official Bilty Preview & Print Modal */}
      <BiltyModal 
        booking={biltyModalBooking} 
        onClose={() => setBiltyModalBooking(null)} 
      />

    </div>
  );
}
