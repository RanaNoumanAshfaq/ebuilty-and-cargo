import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, FileText, Activity, AlertTriangle, Check, X, Shield, 
  Package, Trash2, CheckCircle, Loader2, ArrowRight, Truck, 
  Mail, Phone, Clock, Eye, AlertCircle, FileCheck, Send, MessageSquare, 
  MapPin, Calendar, Plus, Map, Info
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { logisticsAPI, authAPI, socket } from '../../api';
import { generateBiltyPDF } from '../../utils/generateBiltyPDF';

export default function BusinessDashboard() {
  const { userData, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('new-request');
  const [loading, setLoading] = useState(true);

  // Database listings state
  const [transporters, setTransporters] = useState([]);
  const [cargoList, setCargoList] = useState([]);
  const [bookings, setBookings] = useState([]);

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
        const [transRes, cargoRes, bookingsRes] = await Promise.all([
          logisticsAPI.getTransporters(),
          logisticsAPI.getCargo({ businessOwnerId: currentUser.id || currentUser._id }),
          logisticsAPI.getBookings()
        ]);
        
        // Eager load transporter completed shipments counts from the backend user statistics
        setTransporters(transRes.data);
        setCargoList(cargoRes.data);
        setBookings(bookingsRes.data);
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
      case 'DRAFT':
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
    }
  };

  // Derive rating dynamically based on shipmentsCount to look clean
  const getTransporterRating = (count) => {
    if (count > 40) return '★ 4.8';
    if (count > 25) return '★ 4.6';
    if (count > 15) return '★ 4.5';
    return '★ 4.2';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      
      {/* Header and Title */}
      <div className="flex justify-between items-center mb-8">
        <div className="text-left">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Business Shipping Panel</h1>
          <p className="text-sm text-gray-400 mt-1">Book transporters, request shipments, and track cargo bilties in real-time.</p>
        </div>
        <div className="flex gap-2 bg-[#14141e] border border-white/5 px-4 py-2 rounded-xl text-xs text-gray-400 font-mono">
          <Clock size={14} className="text-[#00f3ff]" />
          <span>Operational Session: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-white/5 mb-8">
        <nav className="flex gap-8 overflow-x-auto pb-px">
          {[
            { id: 'new-request', name: 'New Request' },
            { id: 'track', name: 'Track Shipments' },
            { id: 'transporters', name: 'Transporters' },
            { id: 'history', name: 'History' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedCargo(null);
              }}
              className={`pb-3 text-sm font-semibold transition-all relative flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id 
                  ? 'text-[#00f3ff] border-b-2 border-[#00f3ff] font-bold' 
                  : 'text-gray-400 hover:text-white pb-3'
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
            <div className="bg-[#14141e]/30 border border-white/5 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">1. Select Transporter</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {transporters.map(t => (
                  <div
                    key={t._id}
                    onClick={() => setSelectedTransporter(t)}
                    className={`p-5 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedTransporter?._id === t._id
                        ? 'bg-[#00f3ff]/5 border-[#00f3ff]/50 shadow-[0_0_15px_rgba(0,243,255,0.05)]'
                        : 'bg-[#14141e]/50 border-white/5 hover:border-white/12'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white text-base">{t.name}</h4>
                        <p className="text-xs text-gray-400 mt-1">{t.phone || '0300-1112223'} &middot; {t.shipmentsCount || 0} shipments</p>
                        <p className="text-[11px] text-gray-500 mt-3 font-medium">Common Hubs: Lahore, Karachi, Islamabad</p>
                      </div>
                      <span className="text-xs font-bold text-amber-400">
                        {getTransporterRating(t.shipmentsCount || 0)}
                      </span>
                    </div>
                  </div>
                ))}
                {transporters.length === 0 && (
                  <div className="col-span-2 text-center py-6 text-gray-500 italic">No transporters available. Please verify registered transporters.</div>
                )}
              </div>
            </div>

            {/* Step 2: PRODUCTS */}
            <div className="bg-[#14141e]/30 border border-white/5 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">2. Products</h3>
                <button 
                  type="button"
                  onClick={addProductRow}
                  className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus size={14} /> Add Product
                </button>
              </div>

              <div className="space-y-4">
                {products.map((prod, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-[#0a0a0f]/30 border border-white/5 p-4 rounded-xl relative">
                    {products.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removeProductRow(idx)}
                        className="absolute top-2 right-2 text-gray-500 hover:text-red-400 cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    )}
                    <div className="md:col-span-4">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Product Name</label>
                      <input required type="text" value={prod.name} onChange={e => handleProductChange(idx, 'name', e.target.value)} className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs outline-none focus:border-[#00f3ff]" placeholder="e.g. Steel Coils" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Qty</label>
                      <input required type="number" value={prod.qty} onChange={e => handleProductChange(idx, 'qty', e.target.value)} className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs outline-none focus:border-[#00f3ff]" placeholder="e.g. 4" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Unit Weight (Tons)</label>
                      <input required type="number" step="any" value={prod.unitWeight} onChange={e => handleProductChange(idx, 'unitWeight', e.target.value)} className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs outline-none focus:border-[#00f3ff]" placeholder="e.g. 3" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 text-gray-500">Total Weight</label>
                      <input disabled type="text" value={`${(parseFloat(prod.qty) || 0) * (parseFloat(prod.unitWeight) || 0)} tons`} className="w-full bg-[#0a0a0f]/50 border border-white/5 rounded-xl px-3 py-1.5 text-gray-500 text-xs" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Type</label>
                      <select value={prod.type} onChange={e => handleProductChange(idx, 'type', e.target.value)} className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs outline-none focus:border-[#00f3ff]">
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
            <div className="bg-[#14141e]/30 border border-white/5 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">3. Pickup Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Street Address</label>
                  <input required type="text" value={pickupDetails.streetAddress} onChange={e => setPickupDetails({...pickupDetails, streetAddress: e.target.value})} className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs outline-none focus:border-[#00f3ff]" placeholder="Street / Area" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">City</label>
                  <input required type="text" value={pickupDetails.city} onChange={e => setPickupDetails({...pickupDetails, city: e.target.value})} className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs outline-none focus:border-[#00f3ff]" placeholder="e.g. Lahore" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Province</label>
                  <input required type="text" value={pickupDetails.province} onChange={e => setPickupDetails({...pickupDetails, province: e.target.value})} className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs outline-none focus:border-[#00f3ff]" placeholder="e.g. Punjab" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Landmark</label>
                  <input required type="text" value={pickupDetails.landmark} onChange={e => setPickupDetails({...pickupDetails, landmark: e.target.value})} className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs outline-none focus:border-[#00f3ff]" placeholder="e.g. Near Main Chowk" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Contact Person</label>
                  <input required type="text" value={pickupDetails.contactPerson} onChange={e => setPickupDetails({...pickupDetails, contactPerson: e.target.value})} className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs outline-none focus:border-[#00f3ff]" placeholder="Full name" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Contact Phone</label>
                  <input required type="text" value={pickupDetails.contactPhone} onChange={e => setPickupDetails({...pickupDetails, contactPhone: e.target.value})} className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs outline-none focus:border-[#00f3ff]" placeholder="e.g. 0300-1234567" />
                </div>
              </div>
            </div>

            {/* Step 4: RECIPIENTS / CONSIGNEES */}
            <div className="bg-[#14141e]/30 border border-white/5 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">4. Recipients / Consignees</h3>
                <button 
                  type="button"
                  onClick={addRecipientRow}
                  className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus size={14} /> Add Recipient
                </button>
              </div>

              <div className="space-y-6">
                {recipients.map((recip, idx) => (
                  <div key={idx} className="bg-[#0a0a0f]/30 border border-white/5 p-4 rounded-xl relative space-y-4">
                    {recipients.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removeRecipientRow(idx)}
                        className="absolute top-2 right-2 text-gray-500 hover:text-red-400 cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    )}
                    <h5 className="text-xs font-bold text-white border-b border-white/5 pb-1 select-none">Consignee {idx + 1}</h5>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                        <input required type="text" value={recip.fullName} onChange={e => handleRecipientChange(idx, 'fullName', e.target.value)} className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs outline-none focus:border-[#00f3ff]" placeholder="Recipient name" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Phone</label>
                        <input required type="text" value={recip.phone} onChange={e => handleRecipientChange(idx, 'phone', e.target.value)} className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs outline-none focus:border-[#00f3ff]" placeholder="0300-0000000" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">City</label>
                        <input required type="text" value={recip.city} onChange={e => handleRecipientChange(idx, 'city', e.target.value)} className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs outline-none focus:border-[#00f3ff]" placeholder="e.g. Karachi" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Province</label>
                        <input required type="text" value={recip.province} onChange={e => handleRecipientChange(idx, 'province', e.target.value)} className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs outline-none focus:border-[#00f3ff]" placeholder="e.g. Sindh" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Deadline Date</label>
                        <input required type="date" value={recip.deadline} onChange={e => handleRecipientChange(idx, 'deadline', e.target.value)} className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs outline-none focus:border-[#00f3ff]" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Street Address</label>
                        <input required type="text" value={recip.streetAddress} onChange={e => handleRecipientChange(idx, 'streetAddress', e.target.value)} className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs outline-none focus:border-[#00f3ff]" placeholder="Street / Area" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Assigned Products & Qty</label>
                        <input required type="text" value={recip.assignedProducts} onChange={e => handleRecipientChange(idx, 'assignedProducts', e.target.value)} className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs outline-none focus:border-[#00f3ff]" placeholder="e.g. Steel Coils x4" />
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
                className="flex-1 bg-[#00f3ff] hover:bg-[#00d7e2] text-black font-extrabold py-3 rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-lg"
              >
                <Send size={16} /> Submit to Transporter
              </button>
              <button 
                type="button"
                onClick={(e) => handleRequestSubmit(e, 'Draft')}
                className="flex-1 bg-transparent hover:bg-white/5 border border-white/10 text-gray-400 hover:text-white font-bold py-3 rounded-xl text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <FileText size={16} /> Save as Draft
              </button>
            </div>

          </form>
        )}

        {/* TRACK SHIPMENTS TAB */}
        {activeTab === 'track' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase text-left">
              {cargoList.filter(c => c.status !== 'Completed').length} active shipments
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[450px]">
              {/* Left active cargo list */}
              <div className="lg:col-span-5 bg-[#14141e]/30 border border-white/5 rounded-2xl p-4 overflow-y-auto max-h-[500px] space-y-3">
                {cargoList
                  .filter(c => c.status !== 'Completed')
                  .map(c => {
                    const isDraft = c.status === 'Draft';
                    return (
                      <div
                        key={c._id}
                        onClick={() => setSelectedCargo(c)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                          selectedCargo?._id === c._id
                            ? 'bg-[#00f3ff]/5 border-[#00f3ff]/40 shadow-[0_0_15px_rgba(0,243,255,0.05)]'
                            : 'bg-[#14141e]/50 border-white/5 hover:border-white/12'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-mono text-xs text-[#00f3ff] font-bold">
                              {c.assignedTruck && c.status !== 'Pending' ? `BLT-${c.id}` : `SHP-${c.id}`}
                            </h4>
                            <h4 className="font-bold text-white text-base mt-1 truncate">{c.title}</h4>
                            <p className="text-xs text-gray-400 mt-1">{c.transporterName} &middot; {c.weight} tons</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${getStatusBadgeStyle(c.status)}`}>
                            {c.status}
                          </span>
                        </div>
                        {isDraft && (
                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                            <span className="text-[10px] text-gray-500 font-bold uppercase select-none">Draft Mode</span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDraft(c._id);
                              }}
                              className="text-[10px] text-red-400 font-bold hover:underline cursor-pointer"
                            >
                              Delete Draft
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                {cargoList.filter(c => c.status !== 'Completed').length === 0 && (
                  <div className="text-center py-16 text-gray-500 text-sm">No active shipments in transit.</div>
                )}
              </div>

              {/* Right shipment progress pane */}
              <div className="lg:col-span-7 bg-[#14141e]/30 border border-white/5 rounded-2xl p-6 flex flex-col justify-between text-left">
                {selectedCargo ? (
                  <div className="space-y-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start border-b border-white/5 pb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white">{selectedCargo.title}</h3>
                          <p className="text-xs text-gray-400 mt-1">
                            Destination Hub: <span className="text-white font-bold">{selectedCargo.destination}</span>
                          </p>
                        </div>
                        <span className="text-xs font-mono font-bold text-gray-500 bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                          {selectedCargo.assignedTruck && selectedCargo.status !== 'Pending' ? `BLT-${selectedCargo.id}` : `SHP-${selectedCargo.id}`}
                        </span>
                      </div>

                      {/* Details specifications */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 text-xs text-gray-300">
                        <div>
                          <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Transporter</p>
                          <p className="font-semibold text-white mt-0.5">{selectedCargo.transporterName}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Weight</p>
                          <p className="font-semibold text-white mt-0.5">{selectedCargo.weight} tons</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Route</p>
                          <p className="font-semibold text-white mt-0.5">
                            {selectedCargo.origin} &rarr; {selectedCargo.destination.split(',')[0]}
                          </p>
                        </div>
                        {selectedCargo.assignedTruck && (
                          <div>
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Assigned Truck</p>
                            <p className="font-semibold text-[#00f3ff] font-mono mt-0.5">{selectedCargo.assignedTruck}</p>
                          </div>
                        )}
                        {/* If booking counter price or ETA exists, show it */}
                        {(() => {
                          const associatedBkg = bookings.find(b => b.cargoId === selectedCargo._id && b.status !== 'Completed');
                          return associatedBkg ? (
                            <>
                              <div>
                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Agreed Price</p>
                                <p className="font-semibold text-emerald-400 mt-0.5">Rs. {associatedBkg.price}</p>
                              </div>
                              {associatedBkg.eta && (
                                <div>
                                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider">ETA</p>
                                  <p className="font-semibold text-amber-400 mt-0.5">{associatedBkg.eta}</p>
                                </div>
                              )}
                            </>
                          ) : null;
                        })()}
                      </div>

                      {/* Transit Progression Line */}
                      {selectedCargo.status !== 'Draft' && (
                        <div className="mt-8 bg-[#0a0a0f]/40 border border-white/5 p-4 rounded-xl">
                          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">Transit Progression</h4>
                          <div className="flex justify-between items-center relative pl-2 pr-2">
                            {/* Connector line */}
                            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-white/5 -z-1"></div>
                            
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
                                <div key={index} className="flex flex-col items-center gap-1.5 z-10">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${
                                    isCompleted 
                                      ? 'bg-[#00f3ff] text-black shadow-[0_0_10px_rgba(0,243,255,0.4)]' 
                                      : 'bg-dark-bg border border-white/10 text-gray-500'
                                  }`}>
                                    {isCompleted ? <Check size={10} strokeWidth={4} /> : index + 1}
                                  </div>
                                  <span className="text-[10px] font-semibold text-gray-500">{s.label}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Pickup & Consignees details */}
                      <div className="mt-6 border-t border-white/5 pt-4 space-y-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pickup Address</h4>
                        <div className="bg-[#0a0a0f]/40 border border-white/5 p-3 rounded-xl text-xs text-gray-300">
                          <p><span className="text-gray-500 font-medium">Point:</span> {selectedCargo.pickupDetails?.address || 'Corporate depot'}</p>
                          <p className="mt-1"><span className="text-gray-500 font-medium">Contact:</span> {selectedCargo.pickupDetails?.contactName || '-'} ({selectedCargo.pickupDetails?.phone || '-'})</p>
                        </div>
                      </div>
                    </div>

                    {/* Rejection Notification if rejected */}
                    {selectedCargo.status === 'Rejected' && selectedCargo.rejectionReason && (
                      <div className="mt-6 border-t border-white/5 pt-4">
                        <div className="bg-red-500/5 border border-red-500/20 text-red-400 p-4 rounded-xl flex gap-3 text-xs leading-relaxed">
                          <AlertCircle size={16} className="shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">Shipment Request Rejected</p>
                            <p className="text-gray-400 mt-1">Reason: "{selectedCargo.rejectionReason}"</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-3 py-16">
                    <Package size={36} className="text-gray-600" />
                    <p className="text-sm font-medium font-sans">Select a shipment to track</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TRANSPORTERS DIRECTORY TAB */}
        {activeTab === 'transporters' && (
          <div className="space-y-6 text-left">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              {transporters.length} verified transporters available
            </h3>

            <div className="space-y-4">
              {transporters.map(t => (
                <div key={t._id} className="bg-[#14141e]/30 border border-white/5 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#bc13fe]/10 border border-[#bc13fe]/20 text-[#bc13fe] flex items-center justify-center shrink-0">
                      <Users size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h4 className="text-lg font-bold text-white tracking-wide">{t.name}</h4>
                        <span className="text-xs text-amber-400 font-bold bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                          {getTransporterRating(t.shipmentsCount || 0)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1.5">
                        {t.phone || '0300-1112223'} &middot; <span className="text-[#bc13fe] font-semibold">{t.email}</span>
                      </p>
                      
                      <div className="flex flex-wrap gap-1.5 mt-3 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                        <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded">Lahore</span>
                        <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded">Karachi</span>
                        <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded">Islamabad</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
                    <span className="text-sm text-gray-400 font-bold mr-2">
                      {t.shipmentsCount || 0} shipments
                    </span>
                    <button 
                      onClick={() => {
                        setSelectedTransporter(t);
                        setActiveTab('new-request');
                      }}
                      className="bg-[#bc13fe]/10 hover:bg-[#bc13fe] border border-[#bc13fe]/20 hover:border-transparent text-[#bc13fe] hover:text-black font-extrabold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer"
                    >
                      Send Request
                    </button>
                  </div>
                </div>
              ))}
              {transporters.length === 0 && (
                <div className="glass-card text-center py-16 text-gray-500">No verified transporters listed.</div>
              )}
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
                      <th className="pb-3">Transporter</th>
                      <th className="pb-3">Route</th>
                      <th className="pb-3">Weight</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cargoList
                      .filter(c => c.status === 'Completed')
                      .map((c, idx) => (
                        <tr key={c._id || idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-4 font-mono text-gray-500">SHP-{c.id || 10400 + idx}</td>
                          <td className="py-4">
                            <button 
                              onClick={() => handleBiltyClick(c)}
                              className="font-bold text-amber-400 hover:underline cursor-pointer"
                            >
                              BLT-{c.id || 88000 + idx}
                            </button>
                          </td>
                          <td className="py-4 font-bold text-white">{c.transporterName || 'Unassigned'}</td>
                          <td className="py-4 text-white">
                            {c.origin} &rarr; {c.destination.split(',')[0]}
                          </td>
                          <td className="py-4 text-gray-400">{c.weight} tons</td>
                          <td className="py-4 text-gray-500">
                            {c.createdAt ? c.createdAt.split('T')[0] : '2026-06-10'}
                          </td>
                          <td className="py-4">
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider">
                              DELIVERED
                            </span>
                          </td>
                        </tr>
                      ))}
                    {cargoList.filter(c => c.status === 'Completed').length === 0 && (
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

    </div>
  );
}
