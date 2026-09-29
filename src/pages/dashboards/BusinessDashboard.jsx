import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  Users, FileText, Activity, AlertTriangle, Check, X, Shield, 
  Package, Trash2, CheckCircle, Loader2, ArrowRight, Truck, 
  Mail, Phone, Clock, Eye, AlertCircle, FileCheck, Send, MessageSquare, 
  MapPin, Calendar, Plus, Map, Info
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { logisticsAPI, authAPI, socket } from '../../api';
import { generateBiltyPDF } from '../../utils/generateBiltyPDF';
import { ChamakRibbon, TruckTaj, UrduMotto, WorkshopBadge, TruckPoetryBanner, SindhiTruckTexture, TruckPatternBorder, TruckLotusArchBadge, TruckMorBadge, NazarBattuBadge } from '../../components/TruckArt';
import MapViewer, { getCoordinatesForLocation } from '../../components/MapViewer';

export default function BusinessDashboard() {
  const { userData, currentUser } = useAuth();
  const { isUrdu } = useLanguage();
  const [activeTab, setActiveTab] = useState('new-request');
  const [loading, setLoading] = useState(true);

  // Database listings state
  const [transporters, setTransporters] = useState([]);
  const [cargoList, setCargoList] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [trucks, setTrucks] = useState([]);

  // New Request Form states
  const [selectedTransporter, setSelectedTransporter] = useState(null);
  
  const [products, setProducts] = useState([
    { name: '', qty: '', unitWeight: '', type: 'Industrial' }
  ]);

  const [pickupDetails, setPickupDetails] = useState({
    streetAddress: '',
    city: '',
    province: '',
    landmark: '',
    contactPerson: '',
    contactPhone: ''
  });

  const [recipients, setRecipients] = useState([
    { fullName: '', phone: '', city: '', province: '', streetAddress: '', deadline: '', assignedProducts: '' }
  ]);

  // Track Shipments selection state
  const [selectedCargo, setSelectedCargo] = useState(null);

  const fetchData = async () => {
    if (currentUser) {
      try {
        const [transRes, cargoRes, bookingsRes, trucksRes] = await Promise.all([
          logisticsAPI.getTransporters(),
          logisticsAPI.getCargo({ businessOwnerId: currentUser.id || currentUser._id }),
          logisticsAPI.getBookings(),
          logisticsAPI.getTrucks()
        ]);
        
        // Eager load transporter completed shipments counts from the backend user statistics
        setTransporters(transRes.data);
        setCargoList(cargoRes.data);
        setBookings(bookingsRes.data);
        setTrucks(trucksRes.data);
        setLoading(false);
      } catch (e) {
        console.error("Error fetching business dashboard data:", e);
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

  // Sync selected cargo details when cargoList refreshes
  useEffect(() => {
    if (selectedCargo) {
      const updated = cargoList.find(c => c._id === selectedCargo._id);
      if (updated) setSelectedCargo(updated);
    }
  }, [cargoList]);

  // Products utilities
  const addProductRow = () => {
    setProducts([...products, { name: '', qty: '', unitWeight: '', type: 'Industrial' }]);
  };

  const removeProductRow = (idx) => {
    setProducts(products.filter((_, i) => i !== idx));
  };

  const handleProductChange = (idx, field, value) => {
    const updated = [...products];
    updated[idx][field] = value;
    setProducts(updated);
  };

  // Recipients utilities
  const addRecipientRow = () => {
    setRecipients([...recipients, { fullName: '', phone: '', city: '', province: '', streetAddress: '', deadline: '', assignedProducts: '' }]);
  };

  const removeRecipientRow = (idx) => {
    setRecipients(recipients.filter((_, i) => i !== idx));
  };

  const handleRecipientChange = (idx, field, value) => {
    const updated = [...recipients];
    updated[idx][field] = value;
    setRecipients(updated);
  };

  // Auto-calculated weight (total sum of Qty * UnitWeight)
  const calculateTotalWeight = () => {
    return products.reduce((sum, p) => {
      const qty = parseFloat(p.qty) || 0;
      const wt = parseFloat(p.unitWeight) || 0;
      return sum + (qty * wt);
    }, 0);
  };

  const handleRequestSubmit = async (e, status = 'Pending') => {
    e.preventDefault();
    if (!selectedTransporter) {
      alert("Please select a transporter first!");
      return;
    }

    const totalCalculatedWeight = calculateTotalWeight();
    const cargoTitle = products.map(p => `${p.name || 'Goods'} (x${p.qty || 1})`).join(', ');

    const payload = {
      title: cargoTitle,
      weight: totalCalculatedWeight.toString(),
      origin: pickupDetails.city || 'Depot',
      destination: recipients.map(r => r.city).join(', ') || 'Receivers',
      transporterId: selectedTransporter._id,
      status: status,
      products: products.map(p => ({
        name: p.name,
        category: p.type,
        qty: parseInt(p.qty) || 1,
        unitWeight: p.unitWeight
      })),
      pickupDetails: {
        address: `${pickupDetails.streetAddress}, ${pickupDetails.city}, ${pickupDetails.province}`,
        landmark: pickupDetails.landmark,
        contactName: pickupDetails.contactPerson,
        phone: pickupDetails.contactPhone
      },
      recipients: recipients.map(r => ({
        name: r.fullName,
        phone: r.phone,
        address: `${r.streetAddress}, ${r.city}, ${r.province}`,
        expectedDate: r.deadline
      }))
    };

    try {
      await logisticsAPI.postCargo(payload);
      alert(status === 'Draft' ? 'Shipment saved as draft!' : 'Request submitted successfully!');
      
      // Reset forms
      setSelectedTransporter(null);
      setProducts([{ name: '', qty: '', unitWeight: '', type: 'Industrial' }]);
      setPickupDetails({ streetAddress: '', city: '', province: '', landmark: '', contactPerson: '', contactPhone: '' });
      setRecipients([{ fullName: '', phone: '', city: '', province: '', streetAddress: '', deadline: '', assignedProducts: '' }]);
      
      fetchData();
      setActiveTab('track');
    } catch (err) {
      console.error("Error posting cargo:", err);
    }
  };

  const handleDeleteDraft = async (cargoId) => {
    if (!window.confirm("Delete this draft shipment?")) return;
    try {
      await logisticsAPI.deleteCargo(cargoId);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleBiltyClick = (cargo) => {
    // Locate the booking associated with this cargo to retrieve the price
    const associatedBooking = bookings.find(b => b.cargoId === cargo._id && b.status === 'Completed');
    const biltyData = {
      id: cargo._id,
      _id: cargo._id,
      cargoTitle: cargo.title,
      transporterName: cargo.transporterName || 'Unassigned',
      truckPlate: cargo.assignedTruck || 'Unassigned',
      price: associatedBooking ? associatedBooking.price : '50,000',
      completedAt: cargo.createdAt,
      origin: cargo.origin,
      destination: cargo.destination,
      weight: cargo.weight
    };
    generateBiltyPDF(biltyData);
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
      case 'DRAFT':
        return 'bg-slate-100 text-slate-700 border border-slate-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-300 font-bold';
    }
  };

  const getTransporterRating = (count) => {
    if (count > 40) return '★ 4.8';
    if (count > 25) return '★ 4.6';
    if (count > 15) return '★ 4.5';
    return '★ 4.2';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      {/* Truck Art Pattern Ribbon */}
      <TruckPatternBorder height="h-7" className="rounded-xl mb-4 shadow-sm" />

      {/* Truck Poetry Banner */}
      <div className="mb-6 relative z-10">
        <TruckPoetryBanner />
      </div>

      {/* Header and Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 relative z-10">
        <div className="text-left">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <TruckMorBadge />
            {isUrdu && <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300 font-urdu">شاہراہِ پاکستان</span>}
            <NazarBattuBadge />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{isUrdu ? 'تاجر و کسٹمر پورٹل' : 'Business Shipping Panel'}</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1 font-medium">{isUrdu ? 'ٹرانسپورٹرز بک کریں، کارگو ٹریک کریں اور بلٹی حاصل کریں' : 'Book transporters, request shipments, and track cargo bilties in real-time.'}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2 bg-white border-2 border-emerald-400 px-4 py-2 rounded-xl text-xs text-emerald-900 font-mono shadow-sm">
            <Clock size={14} className="text-red-600" />
            <span>Operational Session: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Chamak Ribbon */}
      <ChamakRibbon height="h-[5px]" className="rounded-full mb-6 relative z-10" />

      {/* Tabs Navigation */}
      <div className="border-b border-amber-200 mb-8 relative z-10">
        <nav className="flex gap-8 overflow-x-auto pb-px">
          {[
            { id: 'new-request', name: 'New Request' },
            { id: 'track', name: 'Track Shipments' },
            { id: 'transporters', name: 'Transporters Directory' },
            { id: 'history', name: 'History' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedCargo(null);
              }}
              className={`pb-3 text-sm font-semibold transition-all relative flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'text-red-700 border-b-2 border-red-600 font-extrabold drop-shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Panels */}
      <div className="space-y-6">

        {/* NEW REQUEST TAB */}
        {activeTab === 'new-request' && (
          <form onSubmit={(e) => handleRequestSubmit(e, 'Pending')} className="space-y-8 text-left">
            
            {/* Step 1: SELECT TRANSPORTER */}
            <div className="bg-white border-2 border-amber-200/90 rounded-3xl p-6 space-y-4 shadow-md">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-r from-red-600 to-amber-500 text-white font-extrabold flex items-center justify-center text-xs shadow-xs">1</span>
                  {isUrdu ? 'ٹرانسپورٹر کا انتخاب' : 'Select Transporter'}
                </h3>
                {selectedTransporter && (
                  <span className="text-xs font-mono text-red-700 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200 font-bold">
                    Selected: {selectedTransporter.name}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {transporters.map(t => (
                  <div
                    key={t._id}
                    onClick={() => setSelectedTransporter(t)}
                    className={`p-5 rounded-2xl border text-left cursor-pointer transition-all relative overflow-hidden ${
                      selectedTransporter?._id === t._id
                        ? 'bg-amber-50 border-2 border-red-600 shadow-md'
                        : 'bg-[#FAF7EE] border-amber-200 hover:border-amber-400'
                    }`}
                  >
                    {selectedTransporter?._id === t._id && (
                      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-red-600 to-amber-500" />
                    )}
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{t.name}</h4>
                        <p className="text-xs text-slate-600 mt-1 font-mono">{t.phone || '0300-1112223'} &middot; {t.shipmentsCount || 0} shipments</p>
                        <p className="text-[11px] text-slate-500 mt-3 font-medium">Common Hubs: Lahore, Karachi, Peshawar, Quetta</p>
                      </div>
                      <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300 font-mono">
                        {getTransporterRating(t.shipmentsCount || 0)}
                      </span>
                    </div>
                  </div>
                ))}
                {transporters.length === 0 && (
                  <div className="col-span-2 text-center py-8 text-slate-500 italic bg-[#FAF7EE] rounded-2xl border border-amber-200">
                    No transporters available. Please verify registered transporters in Admin panel.
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: PRODUCTS */}
            <div className="bg-white border-2 border-amber-200/90 rounded-3xl p-6 space-y-4 shadow-md">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-r from-red-600 to-amber-500 text-white font-extrabold flex items-center justify-center text-xs shadow-xs">2</span>
                  {isUrdu ? 'مال کی تفصیلات' : 'Cargo Products & Consignment'}
                </h3>
                <button 
                  type="button"
                  onClick={addProductRow}
                  className="btn-outline text-xs !py-1.5 !px-3"
                >
                  <Plus size={14} /> Add Product
                </button>
              </div>

              <div className="space-y-4">
                {products.map((prod, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-[#FAF7EE] border border-amber-200/80 p-4 rounded-2xl relative">
                    {products.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removeProductRow(idx)}
                        className="absolute top-2 right-2 text-slate-400 hover:text-red-600 cursor-pointer p-1"
                      >
                        <X size={16} />
                      </button>
                    )}
                    <div className="md:col-span-4">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Product Name</label>
                      <input required type="text" value={prod.name} onChange={e => handleProductChange(idx, 'name', e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs outline-none focus:border-amber-500" placeholder="e.g. Steel Coils" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Qty</label>
                      <input required type="number" value={prod.qty} onChange={e => handleProductChange(idx, 'qty', e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs outline-none focus:border-amber-500 font-mono" placeholder="e.g. 4" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Unit Weight (Tons)</label>
                      <input required type="number" step="any" value={prod.unitWeight} onChange={e => handleProductChange(idx, 'unitWeight', e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs outline-none focus:border-amber-500 font-mono" placeholder="e.g. 3" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Weight</label>
                      <input disabled type="text" value={`${(parseFloat(prod.qty) || 0) * (parseFloat(prod.unitWeight) || 0)} tons`} className="w-full bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-red-700 text-xs font-mono font-bold" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Type</label>
                      <select value={prod.type} onChange={e => handleProductChange(idx, 'type', e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs outline-none focus:border-amber-500">
                        <option value="Agricultural">Agricultural</option>
                        <option value="Industrial">Industrial</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Construction">Construction</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3: PICKUP DETAILS */}
            <div className="bg-white border-2 border-amber-200/90 rounded-3xl p-6 space-y-4 shadow-md">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gradient-to-r from-red-600 to-amber-500 text-white font-extrabold flex items-center justify-center text-xs shadow-xs">3</span>
                {isUrdu ? 'روانگی کا مقام' : 'Pickup Details & Dispatch Point'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Street Address</label>
                  <input required type="text" value={pickupDetails.streetAddress} onChange={e => setPickupDetails({...pickupDetails, streetAddress: e.target.value})} className="w-full bg-[#FAF7EE] border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs outline-none focus:bg-white focus:border-amber-500" placeholder="Street / Industrial Zone" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">City</label>
                  <input required type="text" value={pickupDetails.city} onChange={e => setPickupDetails({...pickupDetails, city: e.target.value})} className="w-full bg-[#FAF7EE] border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs outline-none focus:bg-white focus:border-amber-500" placeholder="e.g. Lahore" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Province</label>
                  <input required type="text" value={pickupDetails.province} onChange={e => setPickupDetails({...pickupDetails, province: e.target.value})} className="w-full bg-[#FAF7EE] border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs outline-none focus:bg-white focus:border-amber-500" placeholder="e.g. Punjab" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Landmark</label>
                  <input required type="text" value={pickupDetails.landmark} onChange={e => setPickupDetails({...pickupDetails, landmark: e.target.value})} className="w-full bg-[#FAF7EE] border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs outline-none focus:bg-white focus:border-amber-500" placeholder="e.g. Near Main Chowk" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Contact Person</label>
                  <input required type="text" value={pickupDetails.contactPerson} onChange={e => setPickupDetails({...pickupDetails, contactPerson: e.target.value})} className="w-full bg-[#FAF7EE] border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs outline-none focus:bg-white focus:border-amber-500" placeholder="Full name" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Contact Phone</label>
                  <input required type="text" value={pickupDetails.contactPhone} onChange={e => setPickupDetails({...pickupDetails, contactPhone: e.target.value})} className="w-full bg-[#FAF7EE] border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs outline-none focus:bg-white focus:border-amber-500 font-mono" placeholder="e.g. 0300-1234567" />
                </div>
              </div>
            </div>

            {/* Step 4: RECIPIENTS / CONSIGNEES */}
            <div className="bg-white border-2 border-amber-200/90 rounded-3xl p-6 space-y-4 shadow-md">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-r from-red-600 to-amber-500 text-white font-extrabold flex items-center justify-center text-xs shadow-xs">4</span>
                  {isUrdu ? 'وصول کنندگان' : 'Recipients / Consignees'}
                </h3>
                <button 
                  type="button"
                  onClick={addRecipientRow}
                  className="btn-outline text-xs !py-1.5 !px-3"
                >
                  <Plus size={14} /> Add Recipient
                </button>
              </div>

              <div className="space-y-6">
                {recipients.map((recip, idx) => (
                  <div key={idx} className="bg-[#FAF7EE] border border-amber-200/80 p-5 rounded-2xl relative space-y-4">
                    {recipients.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removeRecipientRow(idx)}
                        className="absolute top-2 right-2 text-slate-400 hover:text-red-600 cursor-pointer p-1"
                      >
                        <X size={16} />
                      </button>
                    )}
                    <h5 className="text-xs font-bold text-red-900 border-b border-amber-200 pb-2 select-none flex items-center gap-2">
                      <TruckTaj className="text-amber-600 w-4 h-3" /> Consignee Destination {idx + 1}
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Full Name</label>
                        <input required type="text" value={recip.fullName} onChange={e => handleRecipientChange(idx, 'fullName', e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs outline-none focus:border-amber-500" placeholder="Recipient name" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Phone</label>
                        <input required type="text" value={recip.phone} onChange={e => handleRecipientChange(idx, 'phone', e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs outline-none focus:border-amber-500 font-mono" placeholder="0300-0000000" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">City</label>
                        <input required type="text" value={recip.city} onChange={e => handleRecipientChange(idx, 'city', e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs outline-none focus:border-amber-500" placeholder="e.g. Karachi" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Province</label>
                        <input required type="text" value={recip.province} onChange={e => handleRecipientChange(idx, 'province', e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs outline-none focus:border-amber-500" placeholder="e.g. Sindh" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Deadline Date</label>
                        <input required type="date" value={recip.deadline} onChange={e => handleRecipientChange(idx, 'deadline', e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs outline-none focus:border-amber-500 font-mono" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Street Address</label>
                        <input required type="text" value={recip.streetAddress} onChange={e => handleRecipientChange(idx, 'streetAddress', e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs outline-none focus:border-amber-500" placeholder="Street / Area / Warehouse" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Assigned Products & Qty</label>
                        <input required type="text" value={recip.assignedProducts} onChange={e => handleRecipientChange(idx, 'assignedProducts', e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs outline-none focus:border-amber-500" placeholder="e.g. Steel Coils x4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form actions */}
            <div className="flex gap-4">
              <button 
                type="submit"
                className="flex-1 btn-primary text-white font-extrabold py-3.5 rounded-xl text-sm shadow-md"
              >
                <Send size={16} /> {isUrdu ? 'ٹرانسپورٹر کو بھیجیں' : 'Submit to Transporter'}
              </button>
              <button 
                type="button"
                onClick={(e) => handleRequestSubmit(e, 'Draft')}
                className="flex-1 btn-outline text-slate-700 font-bold py-3.5 rounded-xl text-sm"
              >
                <FileText size={16} /> Save as Draft
              </button>
            </div>

          </form>
        )}

        {/* TRACK SHIPMENTS TAB */}
        {activeTab === 'track' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-600 tracking-wider uppercase text-left font-sans">
                {cargoList.filter(c => c.status !== 'Completed').length} active shipments in network
              </h3>
              <UrduMotto />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[450px]">
              {/* Left active cargo list */}
              <div className="lg:col-span-5 bg-white border-2 border-amber-200/90 rounded-2xl p-4 overflow-y-auto max-h-[500px] space-y-3 shadow-md">
                {cargoList
                  .filter(c => c.status !== 'Completed')
                  .map(c => {
                    const isDraft = c.status === 'Draft';
                    const isSelected = selectedCargo?._id === c._id;
                    return (
                      <div
                        key={c._id}
                        onClick={() => setSelectedCargo(c)}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer text-left relative overflow-hidden ${
                          isSelected
                            ? 'bg-amber-50/80 border-amber-500 shadow-md'
                            : 'bg-[#FAF7EE] border-amber-200/70 hover:border-amber-400'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-[#B91C1C] via-[#FFB703] to-[#F59E0B]" />
                        )}
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-mono text-xs text-[#B91C1C] font-bold">
                              {c.assignedTruck && c.status !== 'Pending' ? `BLT-${c.id}` : `SHP-${c.id}`}
                            </h4>
                            <h4 className="font-bold text-slate-900 text-base mt-1 truncate">{c.title}</h4>
                            <p className="text-xs text-slate-600 mt-1 font-mono">{c.transporterName} &middot; {c.weight} tons</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${getStatusBadgeStyle(c.status)}`}>
                            {c.status}
                          </span>
                        </div>
                        {isDraft && (
                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-amber-200">
                            <span className="text-[10px] text-slate-500 font-bold uppercase select-none font-mono">Draft Mode</span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDraft(c._id);
                              }}
                              className="text-[10px] text-red-600 font-bold hover:underline cursor-pointer"
                            >
                              Delete Draft
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                {cargoList.filter(c => c.status !== 'Completed').length === 0 && (
                  <div className="text-center py-16 text-slate-500 text-sm">
                    <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2 opacity-60" />
                    No active shipments in transit.
                  </div>
                )}
              </div>

              {/* Right shipment progress pane */}
              <div className="lg:col-span-7 bg-white border-2 border-amber-200/90 rounded-2xl p-6 flex flex-col justify-between text-left shadow-md relative overflow-hidden">
                <SindhiTruckTexture />
                {selectedCargo ? (
                  <div className="space-y-6 flex-1 flex flex-col justify-between relative z-10">
                    <div>
                      <div className="flex justify-between items-start border-b border-amber-200 pb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <TruckTaj className="text-[#B91C1C] w-5 h-4" />
                            <span className="text-[10px] font-bold text-[#B91C1C] uppercase tracking-wider">
                              {isUrdu ? 'لائیو ٹیلی میٹری ٹریکنگ' : 'Live Telemetry Track'}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-slate-900">{selectedCargo.title}</h3>
                          <p className="text-xs text-slate-600 mt-1">
                            {isUrdu ? 'منزل:' : 'Destination Hub:'} <span className="text-slate-900 font-bold">{selectedCargo.destination}</span>
                          </p>
                        </div>
                        <span className="text-xs font-mono font-bold text-[#B91C1C] bg-red-50 px-3 py-1 rounded-lg border border-red-200">
                          {selectedCargo.assignedTruck && selectedCargo.status !== 'Pending' ? `BLT-${selectedCargo.id}` : `SHP-${selectedCargo.id}`}
                        </span>
                      </div>

                      {/* Interactive MapViewer Displaying Assigned Truck Live Location */}
                      {(() => {
                        const assignedTruckObj = trucks.find(t => 
                          selectedCargo.assignedTruck && (t.plateNumber === selectedCargo.assignedTruck || String(t.id) === String(selectedCargo.assignedTruck))
                        );
                        const truckCoords = getCoordinatesForLocation(
                          assignedTruckObj?.coordinates || 
                          (assignedTruckObj?.lat && assignedTruckObj?.lng ? [assignedTruckObj.lat, assignedTruckObj.lng] : null) || 
                          assignedTruckObj?.loc || 
                          selectedCargo.destination || 
                          selectedCargo.origin
                        );
                        const popupLabel = selectedCargo.assignedTruck 
                          ? `Assigned Truck: ${selectedCargo.assignedTruck} (${assignedTruckObj?.truckType || 'Freight Carrier'}) • Driver: ${assignedTruckObj?.driverName || 'Verified'} • Status: ${selectedCargo.status}`
                          : `Route: ${selectedCargo.origin} → ${selectedCargo.destination} • Status: ${selectedCargo.status}`;

                        return (
                          <div className="mt-4 mb-2">
                            <MapViewer 
                              coordinates={truckCoords}
                              popupText={popupLabel}
                              title={selectedCargo.assignedTruck ? `TRUCK ${selectedCargo.assignedTruck} LIVE GPS` : 'CARGO ROUTE TELEMETRY'}
                              color={selectedCargo.status === 'In Transit' ? 'neon-blue' : 'rose'}
                              height="260px"
                            />
                          </div>
                        );
                      })()}

                      {/* Details specifications */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 text-xs text-slate-700">
                        <div className="bg-[#FAF7EE] p-3 rounded-xl border border-amber-200">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Transporter</p>
                          <p className="font-semibold text-slate-900 mt-0.5">{selectedCargo.transporterName}</p>
                        </div>
                        <div className="bg-[#FAF7EE] p-3 rounded-xl border border-amber-200">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Weight</p>
                          <p className="font-semibold text-slate-900 mt-0.5 font-mono">{selectedCargo.weight} tons</p>
                        </div>
                        <div className="bg-[#FAF7EE] p-3 rounded-xl border border-amber-200">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Route</p>
                          <p className="font-semibold text-slate-900 mt-0.5">
                            {selectedCargo.origin} &rarr; {selectedCargo.destination.split(',')[0]}
                          </p>
                        </div>
                        {selectedCargo.assignedTruck && (
                          <div className="bg-[#FAF7EE] p-3 rounded-xl border border-amber-200">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Assigned Truck</p>
                            <p className="font-semibold text-[#B91C1C] font-mono mt-0.5">{selectedCargo.assignedTruck}</p>
                          </div>
                        )}
                        {/* If booking counter price or ETA exists, show it */}
                        {(() => {
                          const associatedBkg = bookings.find(b => b.cargoId === selectedCargo._id && b.status !== 'Completed');
                          return associatedBkg ? (
                            <>
                              <div className="bg-[#FAF7EE] p-3 rounded-xl border border-amber-200">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Agreed Price</p>
                                <p className="font-semibold text-emerald-700 mt-0.5 font-mono">Rs. {associatedBkg.price}</p>
                              </div>
                              {associatedBkg.eta && (
                                <div className="bg-[#FAF7EE] p-3 rounded-xl border border-amber-200">
                                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">ETA</p>
                                  <p className="font-semibold text-amber-700 mt-0.5 font-mono">{associatedBkg.eta}</p>
                                </div>
                              )}
                            </>
                          ) : null;
                        })()}
                      </div>

                      {/* Transit Progression Line */}
                      {selectedCargo.status !== 'Draft' && (
                        <div className="mt-8 bg-[#FAF7EE] border border-amber-200 p-5 rounded-xl shadow-sm">
                          <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-5">Transit Progression</h4>
                          <div className="flex justify-between items-center relative pl-4 pr-4">
                            {/* Connector line */}
                            <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-amber-200 -z-1"></div>
                            
                            {[
                              { label: 'Pending', step: 'Pending' },
                              { label: 'Assigned', step: 'Truck Assigned' },
                              { label: 'Transit', step: 'In Transit' },
                              { label: 'Delivered', step: 'Delivered' }
                            ].map((s, index) => {
                              const steps = ['Pending', 'Accepted', 'Truck Assigned', 'Loaded', 'In Transit', 'Delivered', 'Completed'];
                              const currentIdx = steps.indexOf(selectedCargo.status);
                              const stepIdx = steps.indexOf(s.step);
                              const isCompleted = currentIdx >= stepIdx;

                              return (
                                <div key={index} className="flex flex-col items-center gap-2 z-10">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                                    isCompleted 
                                      ? 'bg-gradient-to-r from-[#B91C1C] to-amber-500 text-white shadow-md' 
                                      : 'bg-white border-2 border-amber-300 text-slate-400'
                                  }`}>
                                    {isCompleted ? <Check size={13} strokeWidth={4} /> : index + 1}
                                  </div>
                                  <span className={`text-[10px] font-bold ${isCompleted ? 'text-[#B91C1C]' : 'text-slate-500'}`}>{s.label}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Pickup & Consignees details */}
                      <div className="mt-6 border-t border-amber-200 pt-4 space-y-4">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pickup Address</h4>
                        <div className="bg-[#FAF7EE] border border-amber-200 p-4 rounded-xl text-xs text-slate-700">
                          <p><span className="text-slate-500 font-medium">Point:</span> {selectedCargo.pickupDetails?.address || 'Corporate depot'}</p>
                          <p className="mt-1"><span className="text-slate-500 font-medium">Contact:</span> {selectedCargo.pickupDetails?.contactName || '-'} ({selectedCargo.pickupDetails?.phone || '-'})</p>
                        </div>
                      </div>
                    </div>

                    {/* Rejection Notification if rejected */}
                    {selectedCargo.status === 'Rejected' && selectedCargo.rejectionReason && (
                      <div className="mt-6 border-t border-amber-200 pt-4">
                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex gap-3 text-xs leading-relaxed">
                          <AlertCircle size={16} className="shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">Shipment Request Rejected</p>
                            <p className="text-slate-700 mt-1">Reason: "{selectedCargo.rejectionReason}"</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3 py-16 relative z-10">
                    <Package size={36} className="text-slate-400" />
                    <p className="text-sm font-medium font-sans">Select a shipment to track progress</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TRANSPORTERS DIRECTORY TAB */}
        {activeTab === 'transporters' && (
          <div className="space-y-6 text-left">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                {transporters.length} verified transporters available
              </h3>
              <UrduMotto />
            </div>

            <div className="space-y-4">
              {transporters.map(t => (
                <div key={t._id} className="bg-white border-2 border-amber-200/90 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md hover:border-amber-400 transition-all relative overflow-hidden">
                  <SindhiTruckTexture />
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-red-100 border border-red-200 text-[#B91C1C] flex items-center justify-center shrink-0 shadow-sm">
                      <Users size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h4 className="text-lg font-bold text-slate-900 tracking-wide">{t.name}</h4>
                        <span className="text-xs text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded border border-amber-300 font-mono">
                          {getTransporterRating(t.shipmentsCount || 0)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1.5 font-mono">
                        {t.phone || '0300-1112223'} &middot; <span className="text-[#B91C1C] font-sans font-semibold">{t.email}</span>
                      </p>
                      
                      <div className="flex flex-wrap gap-1.5 mt-3 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                        <span className="bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">Lahore</span>
                        <span className="bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">Karachi</span>
                        <span className="bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">Islamabad</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 self-end md:self-center relative z-10">
                    <span className="text-sm text-slate-600 font-bold mr-2 font-mono">
                      {t.shipmentsCount || 0} shipments
                    </span>
                    <button 
                      onClick={() => {
                        setSelectedTransporter(t);
                        setActiveTab('new-request');
                      }}
                      className="btn-primary px-4 py-2 text-xs"
                    >
                      Send Request
                    </button>
                  </div>
                </div>
              ))}
              {transporters.length === 0 && (
                <div className="bg-white border-2 border-amber-200/90 rounded-2xl p-16 text-center text-slate-500 shadow-md">
                  No verified transporters listed.
                </div>
              )}
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white border-2 border-amber-200/90 rounded-2xl p-6 text-left shadow-md relative overflow-hidden">
              <SindhiTruckTexture />
              <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="text-xs font-bold text-slate-700 tracking-wider uppercase">Delivery History</h3>
                <span className="text-xs text-slate-600 font-mono">Total Completed: {cargoList.filter(c => c.status === 'Completed').length}</span>
              </div>

              <div className="overflow-x-auto relative z-10">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-[10px] font-bold text-slate-600 uppercase tracking-wider border-b-2 border-amber-200 bg-amber-50/60">
                      <th className="py-3 px-3">Shipment ID</th>
                      <th className="py-3 px-3">Bilty No.</th>
                      <th className="py-3 px-3">Transporter</th>
                      <th className="py-3 px-3">Route</th>
                      <th className="py-3 px-3">Weight</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cargoList
                      .filter(c => c.status === 'Completed')
                      .map((c, idx) => (
                        <tr key={c._id || idx} className="border-b border-amber-100 hover:bg-amber-50/50 transition-colors">
                          <td className="py-4 px-3 font-mono text-slate-600">SHP-{c.id || 10400 + idx}</td>
                          <td className="py-4 px-3">
                            <button 
                              onClick={() => handleBiltyClick(c)}
                              className="font-mono font-bold text-[#B91C1C] hover:underline cursor-pointer"
                            >
                              BLT-{c.id || 88000 + idx}
                            </button>
                          </td>
                          <td className="py-4 px-3 font-bold text-slate-900">{c.transporterName || 'Unassigned'}</td>
                          <td className="py-4 px-3 text-slate-700">
                            {c.origin} &rarr; {c.destination.split(',')[0]}
                          </td>
                          <td className="py-4 px-3 text-slate-700 font-mono">{c.weight} tons</td>
                          <td className="py-4 px-3 text-slate-600 font-mono text-xs">
                            {c.createdAt ? c.createdAt.split('T')[0] : '2026-06-10'}
                          </td>
                          <td className="py-4 px-3">
                            <span className="bg-purple-100 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">
                              DELIVERED
                            </span>
                          </td>
                        </tr>
                      ))}
                    {cargoList.filter(c => c.status === 'Completed').length === 0 && (
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

    </div>
  );
}
