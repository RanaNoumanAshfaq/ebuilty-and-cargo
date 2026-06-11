import { useAuth } from '../../contexts/AuthContext';
import { 
  Truck, Navigation, List, MapPin, UploadCloud, AlertCircle, 
  CheckCircle, Plus, X, Trash2, Edit, Send, MessageSquare, 
  Calendar, Clock, Check
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { logisticsAPI, authAPI, socket } from '../../api';

export default function TruckOwnerDashboard() {
  const { userData, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('fleet');

  // Fleets state
  const [trucks, setTrucks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(null); // truck object for doc update
  const [addingTruck, setAddingTruck] = useState(false);
  const [newTruck, setNewTruck] = useState({ 
    id: '', 
    capacity: '', 
    loc: '', 
    truckType: 'Full Body', 
    driverName: '', 
    driverMobile: '', 
    fitnessDoc: '', 
    insuranceDoc: '' 
  });
  const [editTruckData, setEditTruckData] = useState(null); // truck object for edit

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [eta, setEta] = useState('');
  const [completingBooking, setCompletingBooking] = useState(null); // booking object for PoD
  const [pod, setPod] = useState('');

  // Messages state
  const [selectedConversation, setSelectedConversation] = useState(null); // booking object for active chat
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
        // Mark as read
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
    // Only count messages sent by others as unread
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
      // Upload both files to server
      const [cnicUrl, vehicleUrl] = await Promise.all([
        logisticsAPI.uploadFile(cnicFile),
        logisticsAPI.uploadFile(vehicleFile)
      ]);
      // Save URLs to user profile and set status to pending_verification
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
    setAddingTruck(true);
    try {
      await logisticsAPI.addTruck({
        id: newTruck.id,
        capacity: newTruck.capacity,
        loc: newTruck.loc,
        truckType: newTruck.truckType,
        driverName: newTruck.driverName,
        driverMobile: newTruck.driverMobile,
        fitnessDoc: newTruck.fitnessDoc || null,
        insuranceDoc: newTruck.insuranceDoc || null,
        coordinates: [31.5204, 74.3587] // Default coordinates centered in Lahore
      });
      setShowAddModal(false);
      setNewTruck({
        id: '', capacity: '', loc: '', truckType: 'Full Body',
        driverName: '', driverMobile: '', fitnessDoc: '', insuranceDoc: ''
      });
      fetchData();
    } catch (error) {
      console.error("Error adding truck:", error);
    } finally {
      setAddingTruck(false);
    }
  };

  const handleEditTruckSubmit = async (e) => {
    e.preventDefault();
    setAddingTruck(true);
    try {
      await logisticsAPI.updateTruck(editTruckData._id, editTruckData);
      setEditTruckData(null);
      fetchData();
    } catch (error) {
      console.error("Error updating truck:", error);
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

      // Upload new files if selected
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
      // Transition status to In Transit and update both the Booking and Truck status
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

  const handleConfirmDelivery = async (e) => {
    e.preventDefault();
    if (!pod) return;
    try {
      await logisticsAPI.completeBooking(completingBooking._id || completingBooking.id, { pod });
      setCompletingBooking(null);
      setPod('');
      setSelectedBooking(null);
      fetchData();
    } catch (error) {
      console.error(error);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="text-left">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Fleet Operator Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Manage driver profiles, vehicle certificates, dispatch operations, and transporters chats.</p>
        </div>
        <div className="flex gap-2 bg-[#14141e] border border-white/5 px-4 py-2 rounded-xl text-xs text-gray-400 font-mono">
          <Clock size={14} className="text-[#00f3ff]" />
          <span>Live Session: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Verification Warnings */}
      {userData?.status === 'pending' && (
        <div className="glass-card mb-8 border-l-4 border-orange-500 bg-[#14141e]/50 p-6 text-left">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
            <AlertCircle className="text-orange-500" /> Identity Verification Required
          </h2>
          <p className="text-sm text-gray-400 mb-6">You must upload your CNIC photo and vehicle fitness documents before you can start registering trucks or dispatching drivers.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Scan/Upload CNIC</label>
              <input type="file" onChange={(e) => setCnicFile(e.target.files[0])} className="block w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#00f3ff]/10 file:text-[#00f3ff] hover:file:bg-[#00f3ff]/20 cursor-pointer" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Vehicle Operations License</label>
              <input type="file" onChange={(e) => setVehicleFile(e.target.files[0])} className="block w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#bc13fe]/10 file:text-[#bc13fe] hover:file:bg-[#bc13fe]/20 cursor-pointer" />
            </div>
          </div>
          
          {uploadMessage && <p className={`text-xs mt-2 font-bold ${uploadMessage.includes('submitted') ? 'text-emerald-400' : 'text-orange-400'}`}>{uploadMessage}</p>}
          
          <button onClick={handleDocumentSubmit} disabled={uploadingDocs} className="btn-primary mt-4 flex items-center gap-2 cursor-pointer">
            {uploadingDocs ? 'Submitting...' : <><UploadCloud size={16} /> Submit Documents</>}
          </button>
        </div>
      )}

      {userData?.status === 'pending_verification' && (
        <div className="glass-card mb-8 border-l-4 border-[#00f3ff] bg-[#14141e]/50 p-6 text-left">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
            <CheckCircle className="text-[#00f3ff]" /> Documents Under Review
          </h2>
          <p className="text-sm text-gray-400">Your profile registration request has been submitted to administrators. You will be verified shortly.</p>
        </div>
      )}

      {/* Dashboard Tabs */}
      <div className="border-b border-white/5 mb-8">
        <nav className="flex gap-8 overflow-x-auto pb-px">
          {[
            { id: 'fleet', name: 'Fleet' },
            { id: 'bookings', name: 'Bookings' },
            { id: 'history', name: 'Trip History' },
            { id: 'messages', name: 'Messages', badge: totalUnreadMessages }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-semibold transition-all relative flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id 
                  ? 'text-[#00f3ff] border-b-2 border-[#00f3ff] font-bold' 
                  : 'text-gray-400 hover:text-white pb-3'
              }`}
            >
              {tab.name}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="bg-emerald-500 text-black text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">
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
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400 font-bold">
                {trucks.filter(t => t.status === 'Available').length} available / {trucks.length} total trucks
              </span>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-[#00c07f] hover:bg-[#00a86f] text-black font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus size={16} /> Add Truck
              </button>
            </div>

            {/* Trucks list */}
            <div className="space-y-4">
              {trucks.map(truck => (
                <div key={truck._id} className="bg-[#14141e]/30 border border-white/5 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Truck size={22} />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2.5">
                        <h4 className="text-xl font-bold text-white tracking-wide">{truck.plateNumber}</h4>
                        <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/10 font-medium">
                          {truck.truckType} &middot; {truck.capacity}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Driver: <span className="text-white font-semibold">{truck.driverName || 'Unassigned'}</span> 
                        {truck.driverMobile && <span className="text-gray-500 ml-2">({truck.driverMobile})</span>}
                      </p>

                      {/* Documents pills list */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                          Registration Certificate &middot; Verified
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          truck.fitnessDoc ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                        }`}>
                          Fitness Certificate &middot; {truck.fitnessDoc ? 'Verified' : 'Pending'}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          truck.insuranceDoc ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                        }`}>
                          Insurance Papers &middot; {truck.insuranceDoc ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    <button 
                      onClick={() => setShowDocsModal(truck)}
                      className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-400 font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <UploadCloud size={14} /> Update Docs
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedBooking(null);
                        setEditTruckData(truck);
                      }}
                      className="bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white p-2 rounded-xl transition-all cursor-pointer"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteTruck(truck._id)}
                      className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 p-2 rounded-xl transition-all cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                    <span className={`px-3 py-1 rounded-xl text-xs font-black tracking-wider border uppercase ml-2 ${
                      truck.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      truck.status === 'In Transit' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                    }`}>
                      {truck.status}
                    </span>
                  </div>
                </div>
              ))}
              {trucks.length === 0 && (
                <div className="glass-card text-center py-16 text-gray-500">No trucks registered. Click "+ Add Truck" above to register your first vehicle.</div>
              )}
            </div>
          </div>
        )}

        {/* BOOKINGS PANEL */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase text-left">
              {bookings.filter(b => b.status !== 'Completed').length} active assignments
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[450px]">
              {/* Left assignments list */}
              <div className="lg:col-span-5 bg-[#14141e]/30 border border-white/5 rounded-2xl p-4 overflow-y-auto max-h-[500px] space-y-3">
                {bookings
                  .filter(b => b.status !== 'Completed')
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
                          <h4 className="font-mono text-xs text-gray-500">BKG-{b.id || b._id.slice(0, 4)}</h4>
                          <h4 className="font-bold text-white text-base mt-1">{b.transporterName}</h4>
                          <p className="text-xs text-gray-400 mt-1">
                            {b.cargoTitle}, {b.cargo?.weight || '12.5'} tons
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Truck: {b.truckPlate}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${getStatusBadgeStyle(b.status)}`}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))}
                {bookings.filter(b => b.status !== 'Completed').length === 0 && (
                  <div className="text-center py-16 text-gray-500 text-sm">No active assignments.</div>
                )}
              </div>

              {/* Right assignment preview */}
              <div className="lg:col-span-7 bg-[#14141e]/30 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                {selectedBooking ? (
                  <div className="flex flex-col justify-between flex-1 text-left space-y-6">
                    <div>
                      <div className="flex justify-between items-start border-b border-white/5 pb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white">{selectedBooking.cargoTitle}</h3>
                          <p className="text-xs text-gray-400 mt-1">
                            Assigned to Truck Plate: <span className="text-[#00f3ff] font-mono font-bold">{selectedBooking.truckPlate}</span>
                          </p>
                        </div>
                        <span className="text-xs font-mono text-gray-500 bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                          BKG-{selectedBooking.id || selectedBooking._id.slice(0, 4)}
                        </span>
                      </div>

                      {/* Details specs */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-sm">
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider">Transporter</p>
                          <p className="text-sm font-semibold text-white mt-0.5">{selectedBooking.transporterName}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider">Agreed Price</p>
                          <p className="text-sm font-semibold text-emerald-400 mt-0.5">Rs. {selectedBooking.price}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider">Route</p>
                          <p className="text-sm font-semibold text-white mt-0.5">
                            {selectedBooking.cargo?.origin || 'Origin'} &rarr; {selectedBooking.cargo?.destination || 'Destination'}
                          </p>
                        </div>
                        {selectedBooking.eta && (
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider">ETA</p>
                            <p className="text-sm font-semibold text-amber-400 mt-0.5">{selectedBooking.eta}</p>
                          </div>
                        )}
                      </div>

                      {/* Pickup & Recipient */}
                      <div className="mt-6 border-t border-white/5 pt-4 space-y-3">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pickup details</h4>
                        <div className="bg-[#0a0a0f]/40 border border-white/5 p-3 rounded-xl text-xs text-gray-300">
                          <p><span className="text-gray-500 font-medium">Address:</span> {selectedBooking.cargo?.pickupDetails?.address || 'Depot Location'}</p>
                          <p className="mt-1"><span className="text-gray-500 font-medium">Landmark:</span> {selectedBooking.cargo?.pickupDetails?.landmark || '-'}</p>
                          <p className="mt-1"><span className="text-gray-500 font-medium">Contact:</span> {selectedBooking.cargo?.pickupDetails?.contactName || '-'} ({selectedBooking.cargo?.pickupDetails?.phone || '-'})</p>
                        </div>
                      </div>
                    </div>

                    {/* Progress action controls */}
                    <div className="border-t border-white/5 pt-6 space-y-4">
                      {selectedBooking.status === 'Pending' ? (
                        <div className="flex gap-3">
                          <button 
                            onClick={() => handleBookingResponse(selectedBooking._id || selectedBooking.id, true)}
                            className="flex-1 bg-[#00f3ff] hover:bg-[#00d7e2] text-black font-extrabold py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
                          >
                            Accept Booking
                          </button>
                          <button 
                            onClick={() => handleBookingResponse(selectedBooking._id || selectedBooking.id, false)}
                            className="flex-1 bg-transparent border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white py-2.5 rounded-xl text-sm transition-all cursor-pointer"
                          >
                            Reject
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
                              className="flex-1 bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#00f3ff]" 
                            />
                            <button 
                              onClick={() => handleUpdateEta(selectedBooking._id || selectedBooking.id)}
                              className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-xs text-white font-bold transition-all cursor-pointer"
                            >
                              Set ETA
                            </button>
                          </div>
                          
                          <div className="flex gap-3">
                            <button
                              onClick={() => {
                                setSelectedConversation(selectedBooking);
                                setActiveTab('messages');
                              }}
                              className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-2.5 rounded-xl text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <MessageSquare size={16} /> Chat
                            </button>
                            {selectedBooking.status === 'Accepted' && (
                              <button 
                                onClick={() => handleStartTransit(selectedBooking)}
                                className="flex-1 bg-[#bc13fe] hover:bg-[#a30ee0] text-white font-bold py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
                              >
                                Start Transit
                              </button>
                            )}
                            {(selectedBooking.status === 'In Transit' || selectedBooking.status === 'Loaded') && (
                              <button 
                                onClick={() => {
                                  setCompletingBooking(selectedBooking);
                                  setPod('');
                                }}
                                className="flex-1 bg-[#00c07f] hover:bg-[#00a86f] text-black font-extrabold py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
                              >
                                Mark as Delivered
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-3 py-16">
                    <Truck size={36} className="text-gray-600" />
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
            <div className="bg-[#14141e]/30 border border-white/5 rounded-2xl p-6 text-left">
              <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-6">Completed Trips</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-[10px] font-bold text-gray-500 uppercase border-b border-b-white/5">
                      <th className="pb-3">Booking ID</th>
                      <th className="pb-3">Transporter</th>
                      <th className="pb-3">Cargo</th>
                      <th className="pb-3">Route</th>
                      <th className="pb-3">Truck</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings
                      .filter(b => b.status === 'Completed')
                      .map((b, idx) => (
                        <tr key={b._id || idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-4 font-mono text-gray-500">BKG-{b.id || b._id.slice(0, 4)}</td>
                          <td className="py-4 font-bold text-white">{b.transporterName}</td>
                          <td className="py-4 text-gray-300">
                            {b.cargoTitle}, {b.cargo?.weight || '12.5'} tons
                          </td>
                          <td className="py-4 text-white">
                            {b.cargo?.origin || 'Lahore'} &rarr; {b.cargo?.destination || 'Karachi'}
                          </td>
                          <td className="py-4 font-mono text-gray-400">{b.truckPlate}</td>
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
                        <td colSpan="7" className="text-center py-12 text-gray-500 italic">No completed trips found.</td>
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
            <div className="lg:col-span-4 bg-[#14141e]/30 border border-white/5 rounded-2xl p-4 overflow-y-auto max-h-[520px] space-y-3">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 text-left px-1">Active Chats</h3>
              {bookings
                .filter(b => b.status !== 'Completed')
                .map(b => {
                  const lastMsg = b.messages && b.messages.length > 0 
                    ? b.messages[b.messages.length - 1] 
                    : { text: 'No messages yet.', createdAt: b.createdAt };
                  
                  const unread = getUnreadCount(b);

                  return (
                    <div
                      key={b._id}
                      onClick={() => {
                        setSelectedConversation(b);
                        // Reset unread count by saving in state
                        setReadMessageCounts(prev => ({
                          ...prev,
                          [b._id]: b.messages?.length || 0
                        }));
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                        selectedConversation?._id === b._id 
                          ? 'bg-[#00f3ff]/5 border-[#00f3ff]/40 shadow-[0_0_15px_rgba(0,243,255,0.05)]' 
                          : 'bg-[#14141e]/50 border-white/5 hover:border-white/12'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-white text-sm truncate max-w-[80%]">{b.transporterName}</h4>
                        <span className="text-[9px] text-gray-500 leading-none">
                          {lastMsg.createdAt ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:32 AM'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 font-mono truncate">Cargo: {b.cargoTitle}</p>
                      <div className="flex justify-between items-center mt-3">
                        <p className="text-[11px] text-gray-500 truncate max-w-[80%]">{lastMsg.text}</p>
                        {unread > 0 && (
                          <span className="bg-emerald-500 text-black text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 shadow-lg leading-none">
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              {bookings.filter(b => b.status !== 'Completed').length === 0 && (
                <div className="text-center py-16 text-gray-500 text-sm">No active conversations.</div>
              )}
            </div>

            {/* Right chat panel */}
            <div className="lg:col-span-8 bg-[#14141e]/30 border border-white/5 rounded-2xl p-4 flex flex-col justify-between h-[520px]">
              {selectedConversation ? (
                <div className="flex flex-col justify-between h-full">
                  {/* Chat header */}
                  <div className="border-b border-white/5 pb-3 mb-4 text-left flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-white text-lg">{selectedConversation.transporterName}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Booking BKG-{selectedConversation.id || selectedConversation._id.slice(0,4)} &middot; Cargo: {selectedConversation.cargoTitle}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${getStatusBadgeStyle(selectedConversation.status)}`}>
                      {selectedConversation.status}
                    </span>
                  </div>

                  {/* Messages bubble list */}
                  <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1 scroll-smooth">
                    {(selectedConversation.messages || []).map((m, i) => {
                      const isOwner = m.sender === userData?.name;
                      return (
                        <div key={i} className={`flex ${isOwner ? 'justify-end' : 'justify-start'}`}>
                          <div className={`p-3 rounded-2xl max-w-[75%] text-left text-sm ${
                            isOwner 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-tr-none' 
                              : 'bg-white/5 text-gray-300 border border-white/5 rounded-tl-none'
                          }`}>
                            <p className="text-[10px] font-bold text-gray-500 mb-1">{m.sender}</p>
                            <p className="leading-relaxed">{m.text}</p>
                          </div>
                        </div>
                      );
                    })}
                    {(selectedConversation.messages || []).length === 0 && (
                      <div className="flex-1 flex items-center justify-center text-xs text-gray-500 italic">No messages sent yet. Send a message to start conversing!</div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Message submit form */}
                  <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-white/5 pt-3">
                    <input
                      type="text"
                      value={chatMessageText}
                      onChange={(e) => setChatMessageText(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-[#00f3ff]"
                    />
                    <button
                      type="submit"
                      className="bg-[#00f3ff] hover:bg-[#00d7e2] text-black p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-3">
                  <MessageSquare size={36} className="text-gray-600" />
                  <p className="text-sm font-medium font-sans">Select a conversation to start chatting</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* MODALS */}

      {/* Add Truck Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4">
          <div className="glass bg-[#14141e] w-full max-w-md relative p-6 rounded-2xl border border-white/10 shadow-2xl">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6 text-left">Register Truck</h2>
            <form onSubmit={handleAddTruckSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">License Plate / ID</label>
                <input required type="text" value={newTruck.id} onChange={e => setNewTruck({...newTruck, id: e.target.value})} className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#00f3ff]" placeholder="e.g. LEA-4421" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Capacity</label>
                  <input required type="text" value={newTruck.capacity} onChange={e => setNewTruck({...newTruck, capacity: e.target.value})} className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#00f3ff]" placeholder="e.g. 25 tons" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Truck Type</label>
                  <select value={newTruck.truckType} onChange={e => setNewTruck({...newTruck, truckType: e.target.value})} className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#00f3ff]">
                    <option value="Mini Truck">Mini Truck</option>
                    <option value="Half Body">Half Body</option>
                    <option value="Full Body">Full Body</option>
                    <option value="22-Wheeler">22-Wheeler</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Current Location</label>
                <input required type="text" value={newTruck.loc} onChange={e => setNewTruck({...newTruck, loc: e.target.value})} className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#00f3ff]" placeholder="e.g. Lahore Depot" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Driver Name</label>
                  <input required type="text" value={newTruck.driverName} onChange={e => setNewTruck({...newTruck, driverName: e.target.value})} className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#00f3ff]" placeholder="Nasir Hussain" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Driver Mobile</label>
                  <input required type="text" value={newTruck.driverMobile} onChange={e => setNewTruck({...newTruck, driverMobile: e.target.value})} className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#00f3ff]" placeholder="0301-2345678" />
                </div>
              </div>
              <button disabled={addingTruck} type="submit" className="w-full bg-[#00c07f] hover:bg-[#00a86f] text-black font-extrabold py-2.5 rounded-xl text-sm transition-colors cursor-pointer mt-6 flex items-center justify-center">
                {addingTruck ? 'Adding...' : 'Save Truck'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Truck Modal */}
      {editTruckData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4">
          <div className="glass bg-[#14141e] w-full max-w-md relative p-6 rounded-2xl border border-white/10 shadow-2xl">
            <button onClick={() => setEditTruckData(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6 text-left">Edit Truck Details</h2>
            <form onSubmit={handleEditTruckSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">License Plate</label>
                <input required type="text" value={editTruckData.plateNumber} onChange={e => setEditTruckData({...editTruckData, plateNumber: e.target.value})} className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#00f3ff]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Capacity</label>
                  <input required type="text" value={editTruckData.capacity} onChange={e => setEditTruckData({...editTruckData, capacity: e.target.value})} className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#00f3ff]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Truck Type</label>
                  <select value={editTruckData.truckType} onChange={e => setEditTruckData({...editTruckData, truckType: e.target.value})} className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#00f3ff]">
                    <option value="Mini Truck">Mini Truck</option>
                    <option value="Half Body">Half Body</option>
                    <option value="Full Body">Full Body</option>
                    <option value="22-Wheeler">22-Wheeler</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Current Location</label>
                <input required type="text" value={editTruckData.loc} onChange={e => setEditTruckData({...editTruckData, loc: e.target.value})} className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#00f3ff]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Driver Name</label>
                  <input required type="text" value={editTruckData.driverName} onChange={e => setEditTruckData({...editTruckData, driverName: e.target.value})} className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#00f3ff]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Driver Mobile</label>
                  <input required type="text" value={editTruckData.driverMobile} onChange={e => setEditTruckData({...editTruckData, driverMobile: e.target.value})} className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#00f3ff]" />
                </div>
              </div>
              <button disabled={addingTruck} type="submit" className="w-full bg-[#00c07f] hover:bg-[#00a86f] text-black font-extrabold py-2.5 rounded-xl text-sm transition-colors cursor-pointer mt-6 flex items-center justify-center">
                {addingTruck ? 'Updating...' : 'Update Details'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Update Documents Modal */}
      {showDocsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4">
          <div className="glass bg-[#14141e] w-full max-w-sm relative p-6 rounded-2xl border border-white/10 shadow-2xl">
            <button onClick={() => setShowDocsModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-white mb-6 text-left">Update Truck Documents</h2>
            <form onSubmit={handleDocsSubmit} className="space-y-5 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Fitness Certificate</label>
                {showDocsModal.fitnessDoc && (
                  <a href={showDocsModal.fitnessDoc} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#00f3ff] hover:underline block mb-2 truncate">
                    Current: {showDocsModal.fitnessDoc}
                  </a>
                )}
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={e => setTruckFitnessFile(e.target.files[0])}
                  className="block w-full text-xs text-gray-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500/10 file:text-amber-400 hover:file:bg-amber-500/20 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Insurance Papers</label>
                {showDocsModal.insuranceDoc && (
                  <a href={showDocsModal.insuranceDoc} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#00f3ff] hover:underline block mb-2 truncate">
                    Current: {showDocsModal.insuranceDoc}
                  </a>
                )}
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={e => setTruckInsuranceFile(e.target.files[0])}
                  className="block w-full text-xs text-gray-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500/10 file:text-amber-400 hover:file:bg-amber-500/20 cursor-pointer"
                />
              </div>
              <p className="text-[10px] text-gray-500">Accepted: Images (JPG, PNG) or PDF. Max 10MB.</p>
              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-black font-extrabold py-2.5 rounded-xl text-sm transition-colors cursor-pointer mt-6">
                Upload & Save Documents
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mark Delivered PoD Modal */}
      {completingBooking && (() => {
        // Extract recipients from the nested cargo object
        const recipients = completingBooking.cargo?.recipients || [];
        const primaryRecipient = recipients[0];
        const recipientName = primaryRecipient?.name || null;
        const recipientPhone = primaryRecipient?.phone || null;
        const allNames = recipients.map(r => r.name).filter(Boolean).join(', ');

        // Build a smart placeholder using the real name if available
        const podPlaceholder = recipientName
          ? `e.g. Goods received by ${recipientName}${recipientPhone ? ` (${recipientPhone})` : ''}, verified via OTP / signature code XXXX`
          : `e.g. Goods received by customer, verified via OTP signature code 8821`;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4">
            <div className="glass bg-[#14141e] w-full max-w-md relative p-6 rounded-2xl border border-white/10 shadow-2xl">
              <button onClick={() => setCompletingBooking(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer">
                <X size={20} />
              </button>
              <h2 className="text-2xl font-bold text-white mb-1 text-left font-sans">Mark as Delivered</h2>
              <p className="text-xs text-gray-400 mb-4 text-left">Submit final delivery confirmation (OTP / receiver signature) to complete the trip.</p>

              {/* Recipient info card — shows real customer details from cargo */}
              {recipients.length > 0 && (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 mb-4 text-left space-y-1">
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-wider mb-1.5">
                    Delivery Recipients
                  </p>
                  {recipients.map((r, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <span className="text-emerald-400 font-bold mt-0.5">→</span>
                      <div>
                        <span className="text-white font-semibold">{r.name}</span>
                        {r.phone && <span className="text-gray-400 ml-2">({r.phone})</span>}
                        {r.address && <p className="text-gray-500 text-[10px] mt-0.5">{r.address}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleConfirmDelivery} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Proof of Delivery (PoD) *</label>
                  <textarea
                    required
                    value={pod}
                    onChange={e => setPod(e.target.value)}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-white h-24 text-sm outline-none focus:border-[#00c07f]"
                    placeholder={podPlaceholder}
                  />
                  {allNames && (
                    <p className="text-[10px] text-gray-500 mt-1">
                      Tip: Mention <span className="text-emerald-400 font-bold">{allNames}</span> in your PoD for full traceability.
                    </p>
                  )}
                </div>
                <button type="submit" className="w-full bg-[#00c07f] hover:bg-[#00a86f] text-black font-extrabold py-2.5 rounded-xl text-sm transition-colors cursor-pointer">
                  Confirm Delivery Completion
                </button>
              </form>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
