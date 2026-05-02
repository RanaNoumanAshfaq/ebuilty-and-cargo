import { useAuth } from '../../contexts/AuthContext';
import { Package, Search, PlusCircle, Map, X, DollarSign, CheckCircle, Navigation, Truck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { logisticsAPI, socket } from '../../api';
import MapViewer from '../../components/MapViewer';

export default function TransporterDashboard() {
  const { userData, currentUser } = useAuth();
  
  const [cargoList, setCargoList] = useState([]);
  const [availableTrucks, setAvailableTrucks] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [truckLocations, setTruckLocations] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const [showChat, setShowChat] = useState(null);
  const [msg, setMsg] = useState('');

  // Modal & Form States
  const [showCargoModal, setShowCargoModal] = useState(false);
  const [addingCargo, setAddingCargo] = useState(false);
  const [newCargo, setNewCargo] = useState({ title: '', weight: '', origin: '', destination: '' });
  
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [bookingForm, setBookingForm] = useState({ cargoId: '', price: '' });
  const [sendingRequest, setSendingRequest] = useState(false);

  const fetchData = async () => {
    if (currentUser) {
      try {
        const [truckRes, cargoRes, bookingRes] = await Promise.all([
          logisticsAPI.getTrucks(),
          logisticsAPI.getCargo({ transporterId: currentUser._id }),
          logisticsAPI.getBookings({ transporterId: currentUser._id })
        ]);
        
        setAvailableTrucks(truckRes.data.filter(t => t.status === 'Available'));
        setCargoList(cargoRes.data);
        setBookings(bookingRes.data);
        
        const locs = {};
        truckRes.data.forEach(t => {
          if (t.coordinates) locs[t._id] = t.coordinates;
        });
        setTruckLocations(locs);
      } catch (e) { console.error("Error fetching transporter data:", e); }
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

  const handlePostCargo = async (e) => {
    e.preventDefault();
    setAddingCargo(true);
    try {
      await logisticsAPI.postCargo(newCargo);
      setShowCargoModal(false);
      setNewCargo({ title: '', weight: '', origin: '', destination: '' });
      fetchData();
    } catch (error) {
      console.error("Error posting cargo: ", error);
    } finally {
      setAddingCargo(false);
    }
  };

  const handleBookTruck = async (e) => {
    e.preventDefault();
    if (!bookingForm.cargoId || !bookingForm.price) return;
    setSendingRequest(true);
    try {
      const selectedCargo = cargoList.find(c => c._id === bookingForm.cargoId);
      const bookingData = {
        truckId: selectedTruck._id,
        truckPlate: selectedTruck.id,
        truckOwnerId: selectedTruck.ownerId,
        cargoId: bookingForm.cargoId,
        cargoTitle: selectedCargo.title,
        price: bookingForm.price,
        transporterName: userData.name
      };
      await logisticsAPI.createBooking(bookingData);
      setShowBookingModal(false);
      setBookingForm({ cargoId: '', price: '' });
      fetchData();
    } catch (error) {
      console.error("Error creating booking: ", error);
    } finally {
      setSendingRequest(false);
    }
  };

  const handleCounterResponse = async (booking, isAccepted) => {
    try {
      const status = isAccepted ? 'Accepted' : 'Rejected';
      await logisticsAPI.updateBooking(booking._id, { status });
      fetchData();
    } catch (error) {
      console.error("Error updating counter offer: ", error);
    }
  };

  const handleSendMessage = async (booking) => {
    if (!msg) return;
    try {
      const newMessages = [...(booking.messages || []), {
        sender: userData.name,
        text: msg,
        time: new Date().toISOString()
      }];
      await logisticsAPI.updateBooking(booking._id, { messages: newMessages });
      setMsg('');
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleCancelBooking = async (booking) => {
    if (!window.confirm("Are you sure you want to cancel this booking request?")) return;
    try {
      await logisticsAPI.updateBooking(booking._id, { status: 'Cancelled' });
      fetchData();
    } catch (error) {
      console.error("Error cancelling booking: ", error);
    }
  };

  const pendingCargos = cargoList.filter(c => c.status === 'Pending');
  const activeShipments = bookings.filter(b => b.status === 'Accepted');

  const mapData = activeShipments.length > 0 && truckLocations[activeShipments[0].truckId]
    ? { coords: truckLocations[activeShipments[0].truckId], text: `Tracking: ${activeShipments[0].cargoTitle}` }
    : { coords: [31.5204, 74.3587], text: "No Active Shipments" };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Transporter Hub</h1>
          <p className="text-gray-400">Welcome, {userData?.name || 'Transporter'}. Post shipments and find available trucks.</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowCargoModal(true)}>
          <PlusCircle size={18} /> Post Cargo
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-neon-blue/20 text-neon-blue"><Package size={24} /></div>
          <div><p className="text-sm text-gray-400">My Cargo</p><p className="text-2xl font-bold text-white">{cargoList.length}</p></div>
        </div>
        <div className="glass-card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-neon-purple/20 text-neon-purple"><Truck size={24} /></div>
          <div><p className="text-sm text-gray-400">Available Trucks</p><p className="text-2xl font-bold text-white">{availableTrucks.length}</p></div>
        </div>
        <div className="glass-card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-green-500/20 text-green-400"><CheckCircle size={24} /></div>
          <div><p className="text-sm text-gray-400">Active Bookings</p><p className="text-2xl font-bold text-white">{activeShipments.length}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="glass-card h-[400px] flex flex-col">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Map size={20} className="text-neon-blue" /> Live Tracking</h3>
          <div className="flex-1 relative rounded-lg overflow-hidden border border-white/5">
            <MapViewer coordinates={mapData.coords} popupText={mapData.text} color="neon-blue" height="100%" />
          </div>
        </div>

        <div className="glass-card h-[400px] flex flex-col">
          <h3 className="text-xl font-bold text-white mb-4">Pending Requests</h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {bookings.filter(b => b.status === 'Pending' || b.status === 'Counter-Offered').map(b => (
              <div key={b._id} className="p-3 rounded bg-white/5 border border-white/10 flex justify-between items-center">
                <div><p className="text-white font-bold text-sm">{b.cargoTitle}</p><p className="text-[10px] text-gray-400">Truck: {b.truckPlate}</p></div>
                <div className="text-right">
                  <p className="text-neon-blue font-bold text-sm">Rs. {b.price}</p>
                  <p className="text-[10px] text-orange-400">{b.status}</p>
                </div>
              </div>
            ))}
            {bookings.filter(b => b.status === 'Pending' || b.status === 'Counter-Offered').length === 0 && <p className="text-gray-400 text-center py-8">No pending requests.</p>}
          </div>
        </div>
      </div>
      {showCargoModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="glass-card w-full max-w-md relative">
            <button onClick={() => setShowCargoModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">Post New Cargo</h2>
            <form onSubmit={handlePostCargo} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Cargo Title / Type</label>
                <input required type="text" value={newCargo.title} onChange={e => setNewCargo({...newCargo, title: e.target.value})} className="w-full bg-dark-bg border border-white/10 rounded-lg px-3 py-2 text-white" placeholder="e.g. Textile Goods" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Weight</label>
                <input required type="text" value={newCargo.weight} onChange={e => setNewCargo({...newCargo, weight: e.target.value})} className="w-full bg-dark-bg border border-white/10 rounded-lg px-3 py-2 text-white" placeholder="e.g. 12 Tons" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Origin</label>
                  <input required type="text" value={newCargo.origin} onChange={e => setNewCargo({...newCargo, origin: e.target.value})} className="w-full bg-dark-bg border border-white/10 rounded-lg px-3 py-2 text-white" placeholder="e.g. Faisalabad" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Destination</label>
                  <input required type="text" value={newCargo.destination} onChange={e => setNewCargo({...newCargo, destination: e.target.value})} className="w-full bg-dark-bg border border-white/10 rounded-lg px-3 py-2 text-white" placeholder="e.g. Karachi" />
                </div>
              </div>
              <button disabled={addingCargo} type="submit" className="w-full btn-primary flex justify-center items-center mt-4">
                {addingCargo ? 'Posting...' : 'Post Cargo'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="glass-card w-full max-w-md relative">
            <button onClick={() => setShowBookingModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-2">Request Booking</h2>
            <p className="text-sm text-gray-400 mb-6">Offering price to truck: {selectedTruck?.id}</p>
            
            <form onSubmit={handleBookTruck} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Select Cargo to Ship</label>
                <select 
                  required 
                  value={bookingForm.cargoId} 
                  onChange={e => setBookingForm({...bookingForm, cargoId: e.target.value})} 
                  className="w-full bg-dark-bg border border-white/10 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">-- Choose Pending Cargo --</option>
                  {pendingCargos.map(c => (
                    <option key={c._id} value={c._id}>{c.title} ({c.origin} to {c.destination})</option>
                  ))}
                </select>
                {pendingCargos.length === 0 && <p className="text-xs text-orange-400 mt-1">You have no pending cargo. Post cargo first.</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Offer Price (Rs.)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <DollarSign size={18} />
                  </div>
                  <input required type="number" value={bookingForm.price} onChange={e => setBookingForm({...bookingForm, price: e.target.value})} className="w-full bg-dark-bg border border-white/10 rounded-lg pl-10 pr-3 py-2 text-white" placeholder="e.g. 45000" />
                </div>
              </div>
              
              <button disabled={sendingRequest || pendingCargos.length === 0} type="submit" className="w-full btn-primary flex justify-center items-center mt-4">
                {sendingRequest ? 'Sending Request...' : 'Send Booking Offer'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="glass-card mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign size={20} className="text-neon-blue" /> {showHistory ? 'Booking History' : 'Negotiations & Booking Status'}
          </h3>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs text-neon-blue hover:underline"
          >
            {showHistory ? 'Show Active' : 'View History'}
          </button>
        </div>
        
        {(() => {
          const filteredBookings = showHistory 
            ? bookings.filter(b => b.status === 'Completed')
            : bookings.filter(b => b.status !== 'Completed');

          if (filteredBookings.length === 0) {
            return <p className="text-gray-400 text-center py-4">{showHistory ? 'No history found.' : 'No active booking requests.'}</p>;
          }

          return (
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {filteredBookings.map(booking => (
                <div key={booking._id} className={`p-4 rounded-lg bg-dark-bg border-l-4 ${booking.status === 'Counter-Offered' ? 'border-neon-purple' : booking.status === 'Accepted' ? 'border-neon-blue' : booking.status === 'Completed' ? 'border-green-500' : 'border-gray-500'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="font-bold text-white">{booking.cargoTitle}</p>
                      <p className="text-sm text-gray-400">Truck: {booking.truckPlate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Current Price</p>
                      <p className="text-white font-bold text-lg">Rs. {booking.price}</p>
                    </div>
                  </div>
                  
                  {booking.status === 'Counter-Offered' ? (
                    <div className="mt-3 bg-neon-purple/10 p-3 rounded border border-neon-purple/20">
                      <p className="text-sm text-white mb-3">Truck owner countered with Rs. {booking.price}</p>
                      <div className="flex gap-2">
                        <button onClick={() => handleCounterResponse(booking, true)} className="flex-1 bg-neon-blue text-black font-semibold py-1.5 rounded hover:bg-white transition-colors text-sm">Accept Offer</button>
                        <button onClick={() => handleCounterResponse(booking, false)} className="flex-1 bg-transparent border border-gray-500 text-gray-300 py-1.5 rounded hover:bg-white/5 transition-colors text-sm">Reject</button>
                      </div>
                    </div>
                  ) : booking.status === 'Pending' ? (
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-orange-400">Waiting for truck owner...</p>
                      <button onClick={() => handleCancelBooking(booking)} className="text-xs text-red-400 hover:underline">Cancel Request</button>
                    </div>
                  ) : (
                    <div className="mt-2 space-y-2">
                      <p className="text-xs text-gray-400">Status: <span className={booking.status === 'Accepted' || booking.status === 'Completed' ? 'text-green-400' : 'text-red-400'}>{booking.status}</span></p>
                      {booking.eta && <p className="text-xs text-neon-blue">ETA: {booking.eta}</p>}
                      {booking.status === 'Accepted' && (
                        <>
                          <button onClick={() => setShowChat(booking._id)} className="w-full mt-2 bg-white/5 border border-white/10 text-[10px] py-1.5 rounded hover:bg-white/10 text-white font-bold transition-colors">Open Chat</button>
                          {showChat === booking._id && (
                            <div className="mt-2 p-2 rounded bg-black/40 border border-white/5">
                              <div className="max-h-24 overflow-y-auto space-y-1 mb-2 pr-1 custom-scrollbar">
                                {(booking.messages || []).map((m, i) => (
                                  <div key={i} className={`p-1.5 rounded text-[10px] ${m.sender === userData.name ? 'bg-neon-blue/10 ml-2 border-r border-neon-blue' : 'bg-white/5 mr-2 border-l border-gray-500'}`}>
                                    <p className="text-gray-300">{m.text}</p>
                                  </div>
                                ))}
                              </div>
                              <div className="flex gap-1">
                                <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Type..." className="flex-1 bg-dark-bg border border-white/10 rounded px-2 py-1 text-[10px] text-white outline-none" />
                                <button onClick={() => handleSendMessage(booking)} className="bg-neon-blue text-black px-2 py-1 rounded text-[10px] font-bold">Send</button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="glass-card">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Search size={20} className="text-neon-blue" /> Find Available Trucks
          </h3>
          <div className="relative mb-4">
            <input 
              type="text" 
              placeholder="Search by location..." 
              className="w-full bg-dark-bg border border-white/10 rounded-lg pl-4 pr-10 py-3 text-white focus:outline-none focus:border-neon-blue transition-colors"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-neon-blue">
              <Search size={18} />
            </button>
          </div>
          
          <div className="space-y-3 h-[400px] overflow-y-auto pr-2">
            {availableTrucks.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No available trucks at the moment.</p>
            ) : (
              availableTrucks.map(truck => (
                <div key={truck._id} className="p-3 rounded-lg bg-white/5 border border-white/5 flex justify-between items-center">
                  <div>
                    <p className="text-white font-semibold">{truck.capacity}</p>
                    <p className="text-xs text-gray-400">Location: {truck.loc} • Plate: {truck.id}</p>
                  </div>
                  <button 
                    onClick={() => { setSelectedTruck(truck); setShowBookingModal(true); }}
                    className="text-xs font-semibold px-3 py-1 bg-neon-blue/10 text-neon-blue border border-neon-blue rounded hover:bg-neon-blue hover:text-black transition-colors"
                  >
                    Request
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-card">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Package size={20} className="text-neon-purple" /> My Posted Cargo
          </h3>
          {cargoList.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No cargo posted. Click "Post Cargo" to begin.</p>
          ) : (
            <div className="space-y-4 h-[400px] overflow-y-auto pr-2">
              {cargoList.map(cargo => (
                <div key={cargo._id} className={`p-4 rounded-lg bg-dark-bg border-l-4 ${cargo.status === 'Pending' ? 'border-orange-500' : cargo.status === 'In Transit' ? 'border-neon-blue' : 'border-green-500'} relative overflow-hidden`}>
                  <div className="flex justify-between items-start mb-2 relative z-10">
                    <div>
                      <p className="font-bold text-white">{cargo.title} ({cargo.weight})</p>
                      <p className="text-sm text-gray-400">{cargo.origin} → {cargo.destination}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${cargo.status === 'Pending' ? 'bg-orange-500/20 text-orange-400' : cargo.status === 'In Transit' ? 'bg-neon-blue/20 text-neon-blue' : 'bg-green-500/20 text-green-400'}`}>
                      {cargo.status}
                    </span>
                  </div>
                  {cargo.status === 'In Transit' && (
                    <button className="mt-3 flex items-center gap-1 text-xs text-gray-300 hover:text-white transition-colors relative z-10">
                      <Map size={14} /> Track Location
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
