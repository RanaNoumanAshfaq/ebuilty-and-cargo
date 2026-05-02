import { useAuth } from '../../contexts/AuthContext';
import { Users, FileText, Activity, AlertTriangle, ExternalLink, Check, X, Shield, Package, Trash2, ShieldAlert, CheckCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { adminAPI, logisticsAPI, socket } from '../../api';

export default function AdminDashboard() {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState('verifications');
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ users: 0, activeShipments: 0, trucks: 0, complaints: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, bookingsRes, complaintsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        logisticsAPI.getBookings(),
        logisticsAPI.getComplaints()
      ]);

      setStats(statsRes.data);
      setAllUsers(usersRes.data);
      setPendingUsers(usersRes.data.filter(u => u.status === 'pending' || u.status === 'pending_verification'));
      setAllBookings(bookingsRes.data);
      setComplaints(complaintsRes.data);
      setLoading(false);
    } catch (e) {
      console.error("Error fetching admin data:", e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen for updates
    socket.on('booking_updated', fetchData);
    socket.on('notification', fetchData);

    return () => {
      socket.off('booking_updated');
      socket.off('notification');
    };
  }, []);

  const handleVerification = async (userId, newStatus) => {
    try {
      await adminAPI.updateUserStatus(userId, newStatus);
      fetchData(); // Refresh
    } catch (e) { console.error(e); }
  };

  const handleUserStatusUpdate = async (userId, newStatus) => {
    try {
      await adminAPI.updateUserStatus(userId, newStatus);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleResolveComplaint = async (id) => {
    try {
      await logisticsAPI.updateComplaint(id, { status: 'Resolved' });
      fetchData();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Admin Control Center</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-card">
          <p className="text-gray-400 text-sm">Total Users</p>
          <p className="text-2xl font-bold text-white">{stats.users}</p>
        </div>
        <div className="glass-card">
          <p className="text-gray-400 text-sm">Pending Verifications</p>
          <p className="text-2xl font-bold text-neon-blue">{pendingUsers.length}</p>
        </div>
        <div className="glass-card">
          <p className="text-gray-400 text-sm">Active Shipments</p>
          <p className="text-2xl font-bold text-green-400">{stats.activeShipments}</p>
        </div>
        <div className="glass-card">
          <p className="text-gray-400 text-sm">Open Complaints</p>
          <p className="text-2xl font-bold text-red-400">{stats.complaints}</p>
        </div>
      </div>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {['verifications', 'users', 'records', 'complaints'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-semibold capitalize transition-all ${activeTab === tab ? 'bg-neon-blue text-black' : 'text-gray-400 bg-white/5'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="glass-card min-h-[400px]">
        {activeTab === 'verifications' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingUsers.map(u => (
              <div key={u._id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="font-bold text-white">{u.name} <span className="text-xs font-normal text-orange-400">({u.status.replace('_', ' ')})</span></p>
                <p className="text-xs text-gray-400 mb-2 capitalize">{u.role.replace('_', ' ')}</p>
                {u.documents && u.documents.length > 0 && (
                  <div className="mb-4 space-y-2">
                    <p className="text-xs text-gray-400">Uploaded Documents:</p>
                    <div className="flex gap-2">
                      {u.documents.map((doc, i) => (
                        <a key={i} href={doc} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-neon-blue/20 text-neon-blue px-2 py-1 rounded hover:bg-neon-blue hover:text-black transition-colors border border-neon-blue/30">
                          View Doc {i + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {!u.documents?.length && u.status === 'pending_verification' && (
                  <p className="text-[10px] text-gray-500 mb-4 italic">Documents pending mock upload...</p>
                )}
                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleVerification(u._id, 'active')} className="flex-1 bg-green-500/20 text-green-400 py-1 rounded text-sm font-bold">Approve</button>
                  <button onClick={() => handleVerification(u._id, 'rejected')} className="flex-1 bg-red-500/20 text-red-400 py-1 rounded text-sm font-bold">Reject</button>
                </div>
              </div>
            ))}
            {pendingUsers.length === 0 && <p className="text-gray-400">No pending verifications.</p>}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-gray-400 text-sm border-b border-white/10">
                <tr><th className="p-3">Name</th><th className="p-3">Role</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr>
              </thead>
              <tbody>
                {allUsers.map(u => (
                  <tr key={u._id} className="border-b border-white/5 text-white">
                    <td className="p-3">{u.name}</td>
                    <td className="p-3 text-sm capitalize">{u.role.replace('_', ' ')}</td>
                    <td className="p-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>{u.status}</span></td>
                    <td className="p-3">
                      <button onClick={() => handleUserStatusUpdate(u._id, u.status === 'active' ? 'blocked' : 'active')} className={`text-xs font-bold ${u.status === 'active' ? 'text-red-400' : 'text-green-400'}`}>
                        {u.status === 'active' ? 'Block' : 'Unblock'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'records' && (
          <div className="space-y-3">
            {allBookings.map(b => (
              <div key={b._id} className="p-3 rounded-lg bg-white/5 border border-white/10 flex justify-between items-center">
                <div>
                  <p className="font-bold text-white text-sm">{b.cargoTitle}</p>
                  <p className="text-[10px] text-gray-400">Truck: {b.truckPlate} | Owner: {b.truckOwnerId}</p>
                </div>
                <div className="text-right">
                  <p className="text-neon-blue font-bold text-sm">Rs. {b.price}</p>
                  <p className={`text-[10px] font-bold ${b.status === 'Accepted' ? 'text-green-400' : 'text-orange-400'}`}>{b.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'complaints' && (
          <div className="space-y-4">
            {complaints.map(c => (
              <div key={c._id} className="p-4 rounded-lg bg-red-500/5 border border-red-500/10">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-white">{c.subject}</p>
                    <p className="text-xs text-gray-400">From: {c.userName} ({c.userRole})</p>
                  </div>
                  {c.status === 'Open' && (
                    <button onClick={() => handleResolveComplaint(c._id)} className="text-xs text-green-400 hover:underline">Resolve</button>
                  )}
                </div>
                <p className="text-sm text-gray-300 mt-2">{c.description}</p>
              </div>
            ))}
            {complaints.length === 0 && <p className="text-gray-400">No open complaints.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
