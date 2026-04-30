import { useAuth } from '../../contexts/AuthContext';
import { Truck, Navigation, List, MapPin, UploadCloud, AlertCircle, CheckCircle, Plus, X, PackageCheck, Edit, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { storage, db, addNotification } from '../../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, collection, addDoc, query, where, getDocs, onSnapshot, deleteDoc } from 'firebase/firestore';

export default function TruckOwnerDashboard() {
  const { userData, currentUser } = useAuth();
  const [cnicFile, setCnicFile] = useState(null);
  const [vehicleFile, setVehicleFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  const [trucks, setTrucks] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showTruckModal, setShowTruckModal] = useState(false);
  const [newTruck, setNewTruck] = useState({ id: '', capacity: '', loc: '' });
  const [addingTruck, setAddingTruck] = useState(false);
  const [editingTruck, setEditingTruck] = useState(null);
  const [counterOfferBookingId, setCounterOfferBookingId] = useState(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showChat, setShowChat] = useState(null); // bookingId
  const [msg, setMsg] = useState('');
  const [eta, setEta] = useState('');

  useEffect(() => {
    let unsubscribeTrucks;
    let unsubscribeBookings;

    if (userData?.status === 'active' && currentUser) {
      const trucksQuery = query(collection(db, 'trucks'), where('ownerId', '==', currentUser.uid));
      unsubscribeTrucks = onSnapshot(trucksQuery, (querySnapshot) => {
        const fleet = [];
        querySnapshot.forEach((doc) => {
          fleet.push({ docId: doc.id, ...doc.data() });
        });
        setTrucks(fleet);
      }, (error) => console.error("Error fetching trucks: ", error));

      // Fetch Pending, Accepted, and Counter-Offered bookings
      const bookingsQuery = query(collection(db, 'bookings'), where('truckOwnerId', '==', currentUser.uid), where('status', 'in', ['Pending', 'Accepted', 'Counter-Offered']));
      unsubscribeBookings = onSnapshot(bookingsQuery, (querySnapshot) => {
        const reqs = [];
        querySnapshot.forEach((doc) => {
          reqs.push({ docId: doc.id, ...doc.data() });
        });
        setBookings(reqs);
      }, (error) => console.error("Error fetching bookings: ", error));
    }

    return () => {
      if (unsubscribeTrucks) unsubscribeTrucks();
      if (unsubscribeBookings) unsubscribeBookings();
    };
  }, [userData?.status, currentUser]);

  const handleUpload = async () => {
    if (!cnicFile || !vehicleFile) {
      setUploadMessage('Please select both documents');
      return;
    }
    setUploading(true);
    setUploadMessage('Uploading documents...');
    try {
      const cnicRef = ref(storage, `documents/${currentUser.uid}/cnic_${cnicFile.name}`);
      await uploadBytesResumable(cnicRef, cnicFile);
      const cnicUrl = await getDownloadURL(cnicRef);

      const vehicleRef = ref(storage, `documents/${currentUser.uid}/vehicle_${vehicleFile.name}`);
      await uploadBytesResumable(vehicleRef, vehicleFile);
      const vehicleUrl = await getDownloadURL(vehicleRef);

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        documents: { cnic: cnicUrl, vehicleRegistration: vehicleUrl },
        status: 'pending_verification'
      });

      setUploadMessage('Documents uploaded successfully! Awaiting Admin verification.');
    } catch (error) {
      console.error(error);
      setUploadMessage('Error uploading documents: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddTruck = async (e) => {
    e.preventDefault();
    setAddingTruck(true);
    try {
      const truckData = {
        ...newTruck,
        ownerId: currentUser.uid,
        status: 'Available',
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'trucks'), truckData);
      setShowTruckModal(false);
      setNewTruck({ id: '', capacity: '', loc: '' });
      // fetchTrucks() removed (real-time sync handles it)
    } catch (error) {
      console.error("Error adding truck: ", error);
    } finally {
      setAddingTruck(false);
    }
  };

  const handleBookingResponse = async (booking, isAccepted) => {
    try {
      const bookingRef = doc(db, 'bookings', booking.docId);
      
      if (isAccepted) {
        await updateDoc(bookingRef, { status: 'Accepted' });
        const truckRef = doc(db, 'trucks', booking.truckId);
        await updateDoc(truckRef, { status: 'In Transit' });
        const cargoRef = doc(db, 'cargo', booking.cargoId);
        await updateDoc(cargoRef, { status: 'In Transit', assignedTruck: booking.truckPlate });
        await addNotification(booking.transporterId, `Booking for ${booking.cargoTitle} has been Accepted by the Truck Owner.`);
      } else {
        await updateDoc(bookingRef, { status: 'Rejected' });
        await addNotification(booking.transporterId, `Booking for ${booking.cargoTitle} was Rejected.`);
      }
    } catch (error) {
      console.error("Error updating booking: ", error);
    }
  };

  const handleCounterOffer = async (booking) => {
    if (!counterPrice) return;
    try {
      const bookingRef = doc(db, 'bookings', booking.docId);
      await updateDoc(bookingRef, { status: 'Counter-Offered', price: counterPrice });
      await addNotification(booking.transporterId, `Truck owner proposed a counter-offer of Rs. ${counterPrice} for ${booking.cargoTitle}.`);
      setCounterOfferBookingId(null);
      setCounterPrice('');
    } catch (error) {
      console.error("Error sending counter offer: ", error);
    }
  };

  const handleDeleteTruck = async (truckId) => {
    if (!window.confirm("Are you sure you want to remove this truck from your fleet?")) return;
    try {
      await deleteDoc(doc(db, 'trucks', truckId));
    } catch (error) {
      console.error("Error deleting truck: ", error);
    }
  };

  const handleUpdateTruck = async (e) => {
    e.preventDefault();
    setAddingTruck(true);
    try {
      const truckRef = doc(db, 'trucks', editingTruck.docId);
      await updateDoc(truckRef, {
        id: editingTruck.id,
        capacity: editingTruck.capacity,
        loc: editingTruck.loc
      });
      setEditingTruck(null);
    } catch (error) {
      console.error("Error updating truck: ", error);
    } finally {
      setAddingTruck(false);
    }
  };

  const handleMarkDelivered = async (booking) => {
    try {
      // 1. Update Booking
      const bookingRef = doc(db, 'bookings', booking.docId);
      await updateDoc(bookingRef, { status: 'Completed', completedAt: new Date().toISOString() });
      
      // 2. Update Truck
      const truckRef = doc(db, 'trucks', booking.truckId);
      await updateDoc(truckRef, { status: 'Available' });
      
      // 3. Update Cargo
      const cargoRef = doc(db, 'cargo', booking.cargoId);
      await updateDoc(cargoRef, { status: 'Completed' });

      // 4. Generate Bilty Record
      const biltyData = {
        bookingId: booking.docId,
        cargoTitle: booking.cargoTitle,
        truckPlate: booking.truckPlate,
        transporterName: booking.transporterName,
        truckOwnerId: booking.truckOwnerId,
        price: booking.price,
        status: 'Generated',
        generatedAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'bilties'), biltyData);
      
      await addNotification(booking.transporterId, `Delivery completed for ${booking.cargoTitle}.`);
      if (booking.businessOwnerId) {
        await addNotification(booking.businessOwnerId, `Your shipment ${booking.cargoTitle} has arrived! Digital Bilty is available.`);
      }
    } catch (error) {
      console.error("Error marking delivered: ", error);
    }
  };

  const handleSendMessage = async (booking) => {
    if (!msg) return;
    try {
      const bookingRef = doc(db, 'bookings', booking.docId);
      const newMessages = [...(booking.messages || []), {
        sender: userData.name,
        text: msg,
        time: new Date().toISOString()
      }];
      await updateDoc(bookingRef, { messages: newMessages });
      setMsg('');
      await addNotification(booking.transporterId, `New message from Truck Owner regarding ${booking.cargoTitle}`);
    } catch (e) { console.error(e); }
  };

  const handleUpdateEta = async (booking) => {
    try {
      await updateDoc(doc(db, 'bookings', booking.docId), { eta });
      await addNotification(booking.transporterId, `ETA updated for ${booking.cargoTitle}: ${eta}`);
      alert("ETA Updated");
    } catch (e) { console.error(e); }
  };

  const updateMockLocation = async (truckId) => {
    try {
      const truckRef = doc(db, 'trucks', truckId);
      // Simulate movement around Lahore [31.52, 74.35]
      const newLat = 31.5204 + (Math.random() - 0.5) * 0.02;
      const newLng = 74.3587 + (Math.random() - 0.5) * 0.02;
      await updateDoc(truckRef, { coordinates: [newLat, newLng] });
    } catch (error) {
      console.error("Error updating location: ", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Fleet Dashboard</h1>
          <p className="text-gray-400">Welcome, {userData?.name || 'Owner'}. Manage your trucks and bookings.</p>
        </div>
        <button 
          className="btn-primary flex items-center gap-2" 
          disabled={userData?.status !== 'active'}
          onClick={() => setShowTruckModal(true)}
        >
          <Truck size={18} /> Add New Truck
        </button>
      </div>

      {/* Truck Modal */}
      {showTruckModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="glass-card w-full max-w-md relative">
            <button onClick={() => setShowTruckModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">Register Truck</h2>
            <form onSubmit={handleAddTruck} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">License Plate / ID</label>
                <input required type="text" value={newTruck.id} onChange={e => setNewTruck({...newTruck, id: e.target.value})} className="w-full bg-dark-bg border border-white/10 rounded-lg px-3 py-2 text-white" placeholder="e.g. LHR-1234" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Capacity</label>
                <input required type="text" value={newTruck.capacity} onChange={e => setNewTruck({...newTruck, capacity: e.target.value})} className="w-full bg-dark-bg border border-white/10 rounded-lg px-3 py-2 text-white" placeholder="e.g. 22-Wheeler (40 Tons)" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Current Location</label>
                <input required type="text" value={newTruck.loc} onChange={e => setNewTruck({...newTruck, loc: e.target.value})} className="w-full bg-dark-bg border border-white/10 rounded-lg px-3 py-2 text-white" placeholder="e.g. Lahore Depot" />
              </div>
              <button disabled={addingTruck} type="submit" className="w-full btn-primary flex justify-center items-center mt-4">
                {addingTruck ? 'Adding...' : 'Save Truck'}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Edit Truck Modal */}
      {editingTruck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="glass-card w-full max-w-md relative">
            <button onClick={() => setEditingTruck(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">Edit Truck Details</h2>
            <form onSubmit={handleUpdateTruck} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">License Plate / ID</label>
                <input required type="text" value={editingTruck.id} onChange={e => setEditingTruck({...editingTruck, id: e.target.value})} className="w-full bg-dark-bg border border-white/10 rounded-lg px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Capacity</label>
                <input required type="text" value={editingTruck.capacity} onChange={e => setEditingTruck({...editingTruck, capacity: e.target.value})} className="w-full bg-dark-bg border border-white/10 rounded-lg px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Current Location</label>
                <input required type="text" value={editingTruck.loc} onChange={e => setEditingTruck({...editingTruck, loc: e.target.value})} className="w-full bg-dark-bg border border-white/10 rounded-lg px-3 py-2 text-white" />
              </div>
              <button disabled={addingTruck} type="submit" className="w-full btn-primary flex justify-center items-center mt-4">
                {addingTruck ? 'Updating...' : 'Update Truck'}
              </button>
            </form>
          </div>
        </div>
      )}

      {userData?.status === 'pending' && (
        <div className="glass-card mb-8 border-l-4 border-orange-500">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
            <AlertCircle className="text-orange-500" /> Account Verification Required
          </h2>
          <p className="text-gray-400 mb-6">Before you can add trucks and accept bookings, you must upload your CNIC and Vehicle Registration for Admin approval.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Upload CNIC</label>
              <input type="file" onChange={(e) => setCnicFile(e.target.files[0])} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-neon-blue/10 file:text-neon-blue hover:file:bg-neon-blue/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Vehicle Registration Document</label>
              <input type="file" onChange={(e) => setVehicleFile(e.target.files[0])} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-neon-purple/10 file:text-neon-purple hover:file:bg-neon-purple/20" />
            </div>
          </div>
          
          {uploadMessage && <p className={`mt-2 text-sm ${uploadMessage.includes('success') ? 'text-green-400' : 'text-orange-400'}`}>{uploadMessage}</p>}
          
          <button onClick={handleUpload} disabled={uploading} className="btn-primary mt-4 flex items-center gap-2">
            {uploading ? 'Uploading...' : <><UploadCloud size={18} /> Submit Documents</>}
          </button>
        </div>
      )}

      {userData?.status === 'pending_verification' && (
        <div className="glass-card mb-8 border-l-4 border-neon-blue">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
            <CheckCircle className="text-neon-blue" /> Documents Submitted
          </h2>
          <p className="text-gray-400">Your documents are currently under review by an administrator. You will be able to manage your fleet once approved.</p>
        </div>
      )}

      <div className={userData?.status !== 'active' ? 'opacity-50 pointer-events-none' : ''}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card">
            <h3 className="text-gray-400 text-sm mb-1">Total Trucks</h3>
            <p className="text-3xl font-bold text-white">{trucks.length}</p>
          </div>
          <div className="glass-card">
            <h3 className="text-gray-400 text-sm mb-1">Active Deliveries</h3>
            <p className="text-3xl font-bold text-neon-blue">{trucks.filter(t => t.status === 'In Transit').length}</p>
          </div>
          <div className="glass-card">
            <h3 className="text-gray-400 text-sm mb-1">Action Items</h3>
            <p className="text-3xl font-bold text-neon-purple">{bookings.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card min-h-[400px]">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <List size={20} className="text-neon-blue" /> My Fleet Status
            </h3>
            {trucks.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No trucks registered yet. Click "Add New Truck" to begin.</p>
            ) : (
              <div className="space-y-4 h-[350px] overflow-y-auto pr-2">
                {trucks.map((truck) => (
                  <div key={truck.docId} className={`flex justify-between items-center p-4 rounded-lg bg-dark-bg border ${truck.status === 'In Transit' ? 'border-neon-blue' : 'border-white/5'}`}>
                    <div>
                      <p className="font-bold text-white">{truck.id}</p>
                      <p className="text-xs text-gray-400 mb-1">{truck.capacity}</p>
                      <p className="text-sm text-gray-400 flex items-center gap-1">
                        <MapPin size={14} /> {truck.loc}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        truck.status === 'Available' ? 'bg-green-500/20 text-green-400' :
                        truck.status === 'In Transit' ? 'bg-neon-blue/20 text-neon-blue' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {truck.status}
                      </span>
                      <div className="flex gap-1">
                        <button onClick={() => setEditingTruck(truck)} className="p-1.5 text-gray-400 hover:text-neon-blue hover:bg-neon-blue/10 rounded transition-colors">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDeleteTruck(truck.docId)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card min-h-[400px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Navigation size={20} className="text-neon-purple" /> {showHistory ? 'Booking History' : 'Active Bookings & Requests'}
              </h3>
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="text-xs text-neon-blue hover:underline"
              >
                {showHistory ? 'Show Active' : 'View History'}
              </button>
            </div>
            <div className="space-y-4 h-[350px] overflow-y-auto pr-2">
               {(() => {
                 const filteredBookings = showHistory 
                   ? bookings.filter(b => b.status === 'Completed')
                   : bookings.filter(b => b.status !== 'Completed');

                 if (filteredBookings.length === 0) {
                   return <p className="text-gray-400 text-center py-8">{showHistory ? 'No history found.' : 'No active bookings.'}</p>;
                 }

                 return filteredBookings.map(booking => (
                   <div key={booking.docId} className={`p-4 rounded-lg bg-white/5 transition-colors border-l-4 ${booking.status === 'Accepted' ? 'border-neon-blue' : booking.status === 'Completed' ? 'border-green-500' : 'border-neon-purple'}`}>
                     <div className="flex justify-between items-start mb-2">
                       <div>
                         <p className="font-bold text-white">{booking.cargoTitle}</p>
                         <p className="text-sm text-gray-400">Truck: <span className="text-white">{booking.truckPlate}</span></p>
                         <p className="text-xs text-gray-400 mt-1">Transporter: {booking.transporterName}</p>
                       </div>
                       <div className="text-right">
                         <p className="text-xs text-gray-400">Price</p>
                         <p className="text-white font-bold text-lg">Rs. {booking.price}</p>
                       </div>
                     </div>
                     
                     {!showHistory && (
                       <>
                         {booking.status === 'Pending' ? (
                           <div className="mt-4">
                             {counterOfferBookingId === booking.docId ? (
                               <div className="flex gap-2">
                                 <input type="number" value={counterPrice} onChange={e => setCounterPrice(e.target.value)} placeholder="New Price" className="flex-1 bg-dark-bg border border-white/10 rounded px-2 py-1 text-white text-sm" />
                                 <button onClick={() => handleCounterOffer(booking)} className="bg-neon-blue text-black font-semibold px-3 py-1 rounded hover:bg-white transition-colors text-sm">Send</button>
                                 <button onClick={() => setCounterOfferBookingId(null)} className="bg-transparent border border-gray-500 text-gray-300 px-3 py-1 rounded hover:bg-white/5 transition-colors text-sm">Cancel</button>
                               </div>
                             ) : (
                               <div className="flex gap-2">
                                 <button onClick={() => handleBookingResponse(booking, true)} className="flex-1 bg-neon-blue text-black font-semibold py-1 rounded hover:bg-white transition-colors text-sm">Accept</button>
                                 <button onClick={() => setCounterOfferBookingId(booking.docId)} className="flex-1 bg-neon-purple text-white font-semibold py-1 rounded hover:bg-white hover:text-black transition-colors text-sm">Counter</button>
                                 <button onClick={() => handleBookingResponse(booking, false)} className="flex-1 bg-transparent border border-gray-500 text-gray-300 py-1 rounded hover:bg-white/5 transition-colors text-sm">Reject</button>
                               </div>
                             )}
                           </div>
                         ) : booking.status === 'Counter-Offered' ? (
                           <div className="mt-4 bg-orange-500/20 text-orange-400 p-2 rounded text-sm text-center border border-orange-500/50">
                             Waiting for Transporter's response to your Counter Offer of Rs. {booking.price}
                           </div>
                         ) : (
                            <div className="space-y-3 mt-4">
                              <div className="flex gap-2">
                                <input value={eta} onChange={e => setEta(e.target.value)} placeholder="ETA (e.g. 2h)" className="flex-1 bg-dark-bg border border-white/10 rounded px-2 py-1 text-[10px] text-white" />
                                <button onClick={() => handleUpdateEta(booking)} className="text-[10px] bg-neon-blue/20 text-neon-blue px-2 py-1 rounded font-bold transition-colors">Set ETA</button>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => setShowChat(booking.docId)} className="flex-1 text-[10px] font-bold py-1.5 bg-white/5 border border-white/10 rounded hover:bg-white/10 text-white transition-colors">Chat</button>
                                <button onClick={() => handleMarkDelivered(booking)} className="flex-1 text-[10px] font-bold py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded hover:bg-green-500 hover:text-black transition-colors">Deliver</button>
                              </div>
                              {showChat === booking.docId && (
                                <div className="mt-2 p-2 rounded bg-black/40 border border-white/5">
                                  <div className="max-h-24 overflow-y-auto mb-2 pr-1 custom-scrollbar">
                                    {(booking.messages || []).map((m, i) => (
                                      <div key={i} className={`p-1.5 rounded text-[10px] mb-1 ${m.sender === userData.name ? 'bg-neon-blue/10 ml-2' : 'bg-white/5 mr-2'}`}>
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
                            </div>
                         )}
                       </>
                     )}
                   </div>
                 ));
               })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
