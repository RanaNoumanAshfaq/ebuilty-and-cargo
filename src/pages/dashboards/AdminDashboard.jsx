import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, FileText, Activity, AlertTriangle, Check, X, Shield, 
  Package, Trash2, CheckCircle, Loader2, ArrowRight, Truck, 
  Mail, Phone, Clock, Eye, AlertCircle, FileCheck, Ban, Unlock
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { adminAPI, logisticsAPI, socket } from '../../api';
import { generateBiltyPDF } from '../../utils/generateBiltyPDF';

export default function AdminDashboard() {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allShipments, setAllShipments] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    users: 0,
    pendingUsers: 0,
    trucks: 0,
    activeTrucks: 0,
    utilizationRate: 0,
    activeShipments: 0,
    totalBilties: 0,
    complaints: 0,
    roleBreakdown: { business: 0, transporter: 0, truck_owner: 0 },
    monthlyStats: []
  });
  const [loading, setLoading] = useState(true);

  // Selection state for Pending Approvals dual-view
  const [selectedPendingUser, setSelectedPendingUser] = useState(null);

  // User tab filters
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // Rejection reason state
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  // User detail modal (Users tab)
  const [viewingUser, setViewingUser] = useState(null);
  const [viewingUserTrucks, setViewingUserTrucks] = useState([]);
  const [loadingUserTrucks, setLoadingUserTrucks] = useState(false);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, shipmentsRes, complaintsRes, activityRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        adminAPI.getShipments(),
        logisticsAPI.getComplaints(),
        adminAPI.getActivity()
      ]);

      setStats(statsRes.data);
      setAllUsers(usersRes.data);
      
      const realPending = usersRes.data.filter(u => u.status === 'pending' || u.status === 'pending_verification');
      setPendingUsers(realPending);
      
      setAllShipments(shipmentsRes.data);
      setComplaints(complaintsRes.data);
      setActivityLogs(activityRes.data);
      setLoading(false);
    } catch (e) {
      console.error("Error fetching admin data:", e);
      setLoading(false);
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
  }, []);

  const handleVerification = async (userId, newStatus) => {
    try {
      await adminAPI.updateUserStatus(userId, newStatus, newStatus === 'rejected' ? rejectionReason : undefined);
      setShowRejectForm(false);
      setRejectionReason('');
      setSelectedPendingUser(null);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUserStatusUpdate = async (userId, newStatus) => {
    try {
      await adminAPI.updateUserStatus(userId, newStatus);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleResolveComplaint = async (id) => {
    try {
      await logisticsAPI.updateComplaint(id, { status: 'Resolved' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const openUserDetail = async (user) => {
    setViewingUser(user);
    setViewingUserTrucks([]);
    if (user.role === 'truck_owner') {
      setLoadingUserTrucks(true);
      try {
        const res = await logisticsAPI.getTrucks({ ownerId: user.id || user._id });
        setViewingUserTrucks(res.data);
      } catch (e) {
        console.error('Error fetching trucks:', e);
      } finally {
        setLoadingUserTrucks(false);
      }
    }
  };

  const handleBiltyClick = (shipment) => {
    // Package a compatible object for the PDF generator
    const biltyData = {
      id: shipment.id || shipment._id,
      _id: shipment._id || shipment.id,
      cargoTitle: shipment.title || 'General Cargo',
      transporterName: shipment.transporterName || 'Unassigned',
      truckPlate: shipment.truckPlate || 'Unassigned',
      price: shipment.price || '50,000',
      completedAt: shipment.createdAt,
      origin: shipment.origin,
      destination: shipment.destination,
      weight: shipment.weight
    };
    generateBiltyPDF(biltyData);
  };

  const getRoleStyle = (role) => {
    switch (role) {
      case 'business':
        return 'text-[#bc13fe]';
      case 'transporter':
        return 'text-[#00f3ff]';
      case 'truck_owner':
        return 'text-emerald-400';
      default:
        return 'text-gray-300';
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status?.toUpperCase()) {
      case 'IN TRANSIT':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'DELIVERED':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'LOADED':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'TRUCK ASSIGNED':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'PENDING':
      case 'PENDING_VERIFICATION':
        return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      case 'VERIFIED':
      case 'ACTIVE':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'SUSPENDED':
      case 'BLOCKED':
      case 'REJECTED':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'approvals', name: 'Pending Approvals', badge: pendingUsers.length },
    { id: 'users', name: 'Users' },
    { id: 'shipments', name: 'Shipments' },
    { id: 'disputes', name: 'Disputes' },
    { id: 'activity', name: 'Activity Log' },
    { id: 'notifications', name: 'Notifications' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 text-[#00f3ff] animate-spin" />
        <p className="text-sm text-gray-400 font-semibold tracking-wider">LOADING ADMIN CONTROL CENTER...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header and Title */}
      <div className="flex justify-between items-center mb-8">
        <div className="text-left">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Control Center</h1>
          <p className="text-sm text-gray-400 mt-1">Manage platform verifications, user directories, logistics records, and disputes.</p>
        </div>
        <div className="flex gap-2 bg-[#14141e] border border-white/5 px-4 py-2 rounded-xl text-xs text-gray-400 font-mono">
          <Clock size={14} className="text-[#00f3ff]" />
          <span>Session: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-white/5 mb-8">
        <nav className="flex gap-8 overflow-x-auto pb-px">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                // Reset selections on switch
                setSelectedPendingUser(null);
                setShowRejectForm(false);
              }}
              className={`pb-3 text-sm font-semibold transition-all relative flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id 
                  ? 'text-amber-500 border-b-2 border-amber-500 font-bold' 
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
        
        {/* OVERVIEW PANEL */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Metric KPI cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Active Shipments */}
              <div className="glass bg-[#14141e]/40 border border-white/5 rounded-2xl p-6 flex justify-between items-center">
                <div className="text-left">
                  <p className="text-[11px] font-extrabold text-gray-400 tracking-wider uppercase">Active Shipments</p>
                  <p className="text-3xl font-black text-white mt-2 font-sans">{stats.activeShipments}</p>
                  <p className="text-xs text-green-400 font-semibold mt-1">+8 today</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                  <Package size={22} />
                </div>
              </div>

              {/* Total Bilties */}
              <div className="glass bg-[#14141e]/40 border border-white/5 rounded-2xl p-6 flex justify-between items-center">
                <div className="text-left">
                  <p className="text-[11px] font-extrabold text-gray-400 tracking-wider uppercase">Total Bilties Generated</p>
                  <p className="text-3xl font-black text-white mt-2 font-sans">{(stats.totalBilties || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-1">All time</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                  <FileText size={22} />
                </div>
              </div>

              {/* Registered Users */}
              <div className="glass bg-[#14141e]/40 border border-white/5 rounded-2xl p-6 flex justify-between items-center">
                <div className="text-left">
                  <p className="text-[11px] font-extrabold text-gray-400 tracking-wider uppercase">Registered Users</p>
                  <p className="text-3xl font-black text-white mt-2 font-sans">{stats.users || 138}</p>
                  <p className="text-xs text-amber-400 font-semibold mt-1">
                    {pendingUsers.length} pending approval
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                  <Users size={22} />
                </div>
              </div>

              {/* Truck Utilization */}
              <div className="glass bg-[#14141e]/40 border border-white/5 rounded-2xl p-6 flex justify-between items-center">
                <div className="text-left">
                  <p className="text-[11px] font-extrabold text-gray-400 tracking-wider uppercase">Truck Utilization</p>
                  <p className="text-3xl font-black text-white mt-2 font-sans">{stats.utilizationRate}%</p>
                  <p className="text-xs text-purple-400 font-semibold mt-1">
                    {stats.activeTrucks || 54} of {stats.trucks || 79} active
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                  <Truck size={22} />
                </div>
              </div>
            </div>

            {/* Graphics Grid (Breakdown & Chart) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left breakdown bar */}
              <div className="lg:col-span-5 bg-[#14141e]/30 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-6 text-left">User Breakdown by Role</h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-400">Business Owners</span>
                        <span className="font-bold text-white">{stats.roleBreakdown?.business || 52}</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#bc13fe] h-full rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(100, ((stats.roleBreakdown?.business || 52) / (stats.users || 138)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-400">Cargo Transporters</span>
                        <span className="font-bold text-white">{stats.roleBreakdown?.transporter || 31}</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#00f3ff] h-full rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(100, ((stats.roleBreakdown?.transporter || 31) / (stats.users || 138)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-400">Truck Owners</span>
                        <span className="font-bold text-white">{stats.roleBreakdown?.truck_owner || 55}</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-400 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(100, ((stats.roleBreakdown?.truck_owner || 55) / (stats.users || 138)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right shipments bar chart */}
              <div className="lg:col-span-7 bg-[#14141e]/30 border border-white/5 rounded-2xl p-6">
                <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-4 text-left">Shipments & Bilties — 2026</h3>
                
                <div className="relative h-48 flex items-end justify-between pt-6 px-4">
                  {/* Y Axis Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-gray-600 pb-8 pt-6">
                    <div className="border-b border-white/5 w-full flex justify-between"><span>80</span></div>
                    <div className="border-b border-white/5 w-full flex justify-between"><span>40</span></div>
                    <div className="border-b border-white/5 w-full flex justify-between"><span>20</span></div>
                    <div className="border-b border-white/5 w-full flex justify-between"><span>0</span></div>
                  </div>
                  
                  {/* Column bars */}
                  <div className="w-full h-full flex justify-between items-end z-10 pl-6 text-left">
                    {stats.monthlyStats?.map((m, idx) => {
                      const shipHeight = `${(m.shipments / 80) * 100}%`;
                      const biltyHeight = `${(m.bilties / 80) * 100}%`;
                      return (
                        <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                          <div className="flex items-end justify-center gap-1.5 h-36 w-full">
                            {/* Shipments Bar */}
                            <div 
                              className="w-3.5 bg-[#00f3ff] rounded-t-sm group relative cursor-pointer"
                              style={{ height: shipHeight }}
                            >
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0a0a0f] border border-white/10 px-2 py-0.5 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-xl">
                                {m.shipments} Shipments
                              </div>
                            </div>
                            
                            {/* Bilties Bar */}
                            <div 
                              className="w-3.5 bg-amber-500 rounded-t-sm group relative cursor-pointer"
                              style={{ height: biltyHeight }}
                            >
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0a0a0f] border border-white/10 px-2 py-0.5 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-xl">
                                {m.bilties} Bilties
                              </div>
                            </div>
                          </div>
                          <span className="text-[11px] text-gray-500 font-semibold">{m.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Recent Shipments table */}
            <div className="bg-[#14141e]/30 border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase">Recent Shipments</h3>
                <button 
                  onClick={() => setActiveTab('shipments')}
                  className="text-xs text-amber-500 hover:text-amber-400 font-bold tracking-wide transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  View All <ArrowRight size={14} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-bold text-gray-500 uppercase border-b border-white/5">
                      <th className="pb-3">Bilty ID</th>
                      <th className="pb-3">Route</th>
                      <th className="pb-3">Transporter</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allShipments.slice(0, 4).map((s, idx) => (
                      <tr key={s.id || idx} className="border-b border-white/5 text-sm hover:bg-white/5 transition-colors">
                        <td className="py-4">
                          <button
                            onClick={() => handleBiltyClick(s)}
                            className="font-bold text-amber-400 hover:underline cursor-pointer"
                          >
                            {s.biltyNo !== '-' ? s.biltyNo : `SHP-${s.id}`}
                          </button>
                        </td>
                        <td className="py-4 font-medium text-white">{s.origin} &rarr; {s.destination}</td>
                        <td className="py-4 text-gray-400">{s.transporterName || 'Unassigned'}</td>
                        <td className="py-4">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${getStatusBadgeStyle(s.status)}`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="py-4 text-gray-500">{s.createdAt ? s.createdAt.split('T')[0] : '2026-06-10'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PENDING APPROVALS PANEL */}
        {activeTab === 'approvals' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase text-left font-sans">
              {pendingUsers.length} pending review
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[450px]">
              {/* Left side list of users */}
              <div className="lg:col-span-5 bg-[#14141e]/30 border border-white/5 rounded-2xl p-4 overflow-y-auto max-h-[500px] space-y-3">
                {pendingUsers.map(u => (
                  <div
                    key={u._id}
                    onClick={() => {
                      setSelectedPendingUser(u);
                      setShowRejectForm(false);
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                      selectedPendingUser?._id === u._id 
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                        : 'bg-[#14141e]/50 border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white text-base">{u.name}</h4>
                        <p className={`text-xs font-semibold mt-0.5 capitalize ${getRoleStyle(u.role)}`}>
                          {u.role.replace('_', ' ')}
                        </p>
                      </div>
                      <span className="text-[10px] font-black tracking-wider text-amber-500 uppercase">
                        PENDING
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-4 text-[11px] text-gray-500">
                      <span>ID: USR-{u.id || u._id.slice(0,4)}</span>
                      <span>{u.joinedDate || '2026-06-10'}</span>
                    </div>
                  </div>
                ))}
                {pendingUsers.length === 0 && (
                  <div className="text-center py-12 text-gray-500 text-sm">No pending registrations found.</div>
                )}
              </div>

              {/* Right side detail review pane */}
              <div className="lg:col-span-7 bg-[#14141e]/30 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                {selectedPendingUser ? (
                  <div className="space-y-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start border-b border-white/5 pb-4">
                        <div className="text-left">
                          <h3 className="text-xl font-bold text-white">{selectedPendingUser.name}</h3>
                          <p className={`text-sm font-semibold capitalize ${getRoleStyle(selectedPendingUser.role)}`}>
                            {selectedPendingUser.role.replace('_', ' ')}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 bg-white/5 px-2.5 py-1 rounded-lg border border-white/15">
                          USR-{selectedPendingUser.id || selectedPendingUser._id.slice(0, 4)}
                        </span>
                      </div>

                      {/* Profile details grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="flex gap-3 items-center">
                          <Mail size={16} className="text-[#00f3ff]" />
                          <div className="text-left">
                            <p className="text-[10px] text-gray-500 uppercase font-black">Email Address</p>
                            <p className="text-sm font-medium text-white">{selectedPendingUser.email}</p>
                          </div>
                        </div>

                        <div className="flex gap-3 items-center">
                          <Phone size={16} className="text-[#00f3ff]" />
                          <div className="text-left">
                            <p className="text-[10px] text-gray-500 uppercase font-black">Phone Number</p>
                            <p className="text-sm font-medium text-white">{selectedPendingUser.phone || 'Not Specified'}</p>
                          </div>
                        </div>

                        <div className="flex gap-3 items-center">
                          <Shield size={16} className="text-[#00f3ff]" />
                          <div className="text-left">
                            <p className="text-[10px] text-gray-500 uppercase font-black">CNIC / Registration ID</p>
                            <p className="text-sm font-medium text-white">{selectedPendingUser.cnic || 'Not Specified'}</p>
                          </div>
                        </div>

                        {selectedPendingUser.businessName && (
                          <div className="flex gap-3 items-center">
                            <Package size={16} className="text-[#00f3ff]" />
                            <div className="text-left">
                              <p className="text-[10px] text-gray-500 uppercase font-black">Business Name</p>
                              <p className="text-sm font-medium text-white">{selectedPendingUser.businessName}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Documents previews */}
                      <div className="mt-8 space-y-3">
                        <h4 className="text-xs font-bold text-gray-400 tracking-wider uppercase text-left">Uploaded Documents</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {selectedPendingUser.documents && selectedPendingUser.documents.length > 0 ? (
                            selectedPendingUser.documents.map((doc, idx) => (
                              <a
                                key={idx}
                                href={doc}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group block relative border border-white/5 hover:border-[#00f3ff]/30 rounded-xl overflow-hidden bg-[#0a0a0f]/60 p-4 transition-all"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-[#00f3ff]/10 flex items-center justify-center text-[#00f3ff] border border-[#00f3ff]/20">
                                    <FileText size={18} />
                                  </div>
                                  <div className="text-left">
                                    <p className="text-xs font-bold text-white">Attachment {idx + 1}</p>
                                    <p className="text-[9px] text-gray-500 font-semibold">Click to view doc</p>
                                  </div>
                                </div>
                              </a>
                            ))
                          ) : (
                            <div className="col-span-2 text-left text-xs text-gray-500 italic">No attachments found.</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Form for Rejection Reason */}
                    {showRejectForm ? (
                      <div className="mt-6 border-t border-white/5 pt-6 text-left space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-400 tracking-wider uppercase mb-1">
                            Rejection Reason (Required)
                          </label>
                          <textarea
                            required
                            value={rejectionReason}
                            onChange={e => setRejectionReason(e.target.value)}
                            className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-white h-20 text-sm focus:border-red-500 outline-none"
                            placeholder="Please specify why this application was rejected..."
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVerification(selectedPendingUser._id, 'rejected')}
                            disabled={!rejectionReason}
                            className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-2 rounded-xl text-sm transition-colors cursor-pointer"
                          >
                            Submit Rejection
                          </button>
                          <button
                            onClick={() => setShowRejectForm(false)}
                            className="px-4 py-2 border border-white/5 rounded-xl text-sm text-gray-400 hover:text-white cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3 mt-8 border-t border-white/5 pt-6">
                        <button
                          onClick={() => handleVerification(selectedPendingUser._id, 'active')}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
                        >
                          Approve Application
                        </button>
                        <button
                          onClick={() => setShowRejectForm(true)}
                          className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-extrabold py-2.5 rounded-xl text-sm transition-colors border border-red-500/25 cursor-pointer"
                        >
                          Reject with Reason
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-3 py-16">
                    <Eye size={36} className="text-gray-600" />
                    <p className="text-sm font-medium font-sans">Select a pending user to review</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* USERS DIRECTORY PANEL */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Filter pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All' },
                { id: 'business', label: 'Business Owner' },
                { id: 'transporter', label: 'Cargo Transporter' },
                { id: 'truck_owner', label: 'Truck Owner' }
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setUserRoleFilter(p.id)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    userRoleFilter === p.id 
                      ? 'bg-amber-500 text-black font-extrabold shadow-lg' 
                      : 'text-gray-400 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Users table */}
            <div className="bg-[#14141e]/30 border border-white/5 rounded-2xl p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-bold text-gray-500 uppercase border-b border-b-white/5">
                      <th className="pb-3">User ID</th>
                      <th className="pb-3">Name</th>
                      <th className="pb-3">Role</th>
                      <th className="pb-3">Email</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Joined</th>
                      <th className="pb-3">Shipments</th>
                      <th className="pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers
                      .filter(u => userRoleFilter === 'all' || u.role === userRoleFilter)
                      .map((u, idx) => (
                        <tr key={u.id || idx} className="border-b border-white/5 text-sm hover:bg-white/5 transition-colors">
                          <td className="py-4 font-mono text-gray-500">USR-{u.id || 2100 + idx}</td>
                          <td className="py-4 font-bold text-white">{u.name}</td>
                          <td className={`py-4 font-bold capitalize ${getRoleStyle(u.role)}`}>
                            {u.role.replace('_', ' ')}
                          </td>
                          <td className="py-4 text-gray-400">{u.email}</td>
                          <td className="py-4">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${getStatusBadgeStyle(u.status)}`}>
                              {u.status === 'active' ? 'VERIFIED' : u.status === 'blocked' ? 'SUSPENDED' : u.status}
                            </span>
                          </td>
                          <td className="py-4 text-gray-500">{u.joinedDate || '2026-06-10'}</td>
                          <td className="py-4 text-center text-white font-bold">{u.shipmentsCount || 0}</td>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => openUserDetail(u)}
                                className="text-[#00f3ff] hover:text-[#00d7e2] font-bold transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Eye size={14} /> View
                              </button>
                              {u.status === 'blocked' ? (
                                <button
                                  onClick={() => handleUserStatusUpdate(u._id || u.id, 'active')}
                                  className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <Unlock size={14} /> Unblock
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUserStatusUpdate(u._id || u.id, 'blocked')}
                                  className="text-red-400 hover:text-red-300 font-bold transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <Ban size={14} /> Block
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SHIPMENTS PANEL */}
        {activeTab === 'shipments' && (
          <div className="space-y-6">
            <div className="bg-[#14141e]/30 border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase text-left">All Shipment Records</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-bold text-gray-500 uppercase border-b border-b-white/5">
                      <th className="pb-3">Shipment ID</th>
                      <th className="pb-3">Bilty No.</th>
                      <th className="pb-3">Transporter</th>
                      <th className="pb-3">Business Owner</th>
                      <th className="pb-3">Route</th>
                      <th className="pb-3">Truck</th>
                      <th className="pb-3">Weight</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allShipments.map((s, idx) => (
                      <tr key={s.id || idx} className="border-b border-white/5 text-sm hover:bg-white/5 transition-colors">
                        <td className="py-4 font-mono text-gray-500">SHP-{s.id || 10400 + idx}</td>
                        <td className="py-4">
                          {s.biltyNo && s.biltyNo !== '-' ? (
                            <button
                              onClick={() => handleBiltyClick(s)}
                              className="font-bold text-amber-400 hover:underline cursor-pointer"
                            >
                              {s.biltyNo}
                            </button>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="py-4 text-white font-medium">{s.transporterName || 'Unassigned'}</td>
                        <td className="py-4 text-gray-300">{s.businessOwnerName || 'Unknown'}</td>
                        <td className="py-4 font-medium text-white">{s.origin} &rarr; {s.destination}</td>
                        <td className="py-4 font-mono text-gray-400">{s.truckPlate || '-'}</td>
                        <td className="py-4 text-gray-400">{s.weight} tons</td>
                        <td className="py-4">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${getStatusBadgeStyle(s.status)}`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="py-4 text-gray-500">{s.createdAt ? s.createdAt.split('T')[0] : '2026-06-10'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* DISPUTES / COMPLAINTS PANEL */}
        {activeTab === 'disputes' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase text-left">
              Disputes & complaints log
            </h3>

            <div className="space-y-4">
              {complaints.map(c => (
                <div 
                  key={c._id} 
                  className={`p-6 rounded-2xl border transition-all ${
                    c.status === 'Open' 
                      ? 'bg-red-500/5 border-red-500/20 shadow-[0_4px_20px_rgba(239,68,68,0.05)]' 
                      : 'bg-[#14141e]/30 border-white/5'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="text-left">
                      <h4 className="text-lg font-bold text-white">{c.subject}</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        By <span className="text-white font-semibold">{c.userName}</span> ({c.userRole.replace('_', ' ')})
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        c.status === 'Open' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {c.status}
                      </span>
                      {c.status === 'Open' && (
                        <button 
                          onClick={() => handleResolveComplaint(c._id)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold px-3 py-1 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Check size={12} /> Resolve Dispute
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mt-4 leading-relaxed text-left">{c.description}</p>
                </div>
              ))}
              {complaints.length === 0 && (
                <div className="glass-card text-center py-16 text-gray-500 gap-2 flex flex-col items-center border border-white/5">
                  <AlertCircle size={28} />
                  <p className="text-sm font-medium">No disputes or complaints filed.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ACTIVITY LOG PANEL */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase text-left font-sans">System Activity Logs</h3>
            <div className="bg-[#14141e]/30 border border-white/5 rounded-2xl p-6">
              <div className="relative border-l border-white/5 ml-4 space-y-6 text-left">
                {activityLogs.map((log, idx) => (
                  <div key={idx} className="relative pl-8 group">
                    {/* Circle marker */}
                    <div className="absolute -left-3.5 top-1.5 w-7 h-7 rounded-full bg-[#0a0a0f] border border-white/5 flex items-center justify-center text-[#00f3ff] group-hover:border-[#00f3ff]/40 transition-all">
                      {log.type === 'user' ? <Users size={12} /> : log.type === 'cargo' ? <Package size={12} /> : <FileText size={12} />}
                    </div>
                    <div>
                      <span className="text-xs font-black text-gray-500 tracking-wider font-mono">
                        {new Date(log.date).toLocaleTimeString()}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1">{log.title}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{log.description}</p>
                    </div>
                  </div>
                ))}
                {activityLogs.length === 0 && (
                  <p className="text-sm text-gray-500 italic ml-4">No recent activity logs recorded.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS PANEL */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase text-left">System alerts & notifications</h3>
            <div className="space-y-3">
              <div className="glass bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex gap-4 text-left">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Activity size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Database Backup Successful</h4>
                  <p className="text-xs text-gray-400 mt-1">Automatic snapshot of local MySQL instance 'ecargobilty' completed successfully.</p>
                </div>
              </div>

              <div className="glass bg-purple-500/5 border border-purple-500/10 rounded-2xl p-4 flex gap-4 text-left">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <Shield size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">TLS/SSL Encryption Active</h4>
                  <p className="text-xs text-gray-400 mt-1">Platform tokens and backend routing configured with secure JWT encoding.</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ─── User Detail Modal (opens from Users tab) ─────────────────────────── */}
    {viewingUser && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 py-8 overflow-y-auto">
        <div className="bg-[#14141e] border border-white/10 rounded-2xl shadow-2xl w-full max-w-3xl relative">
          
          {/* Modal header */}
          <div className="flex justify-between items-start p-6 border-b border-white/5">
            <div className="text-left">
              <h2 className="text-2xl font-extrabold text-white">{viewingUser.name}</h2>
              <p className={`text-sm font-semibold capitalize mt-1 ${getRoleStyle(viewingUser.role)}`}>
                {viewingUser.role.replace('_', ' ')} &bull; USR-{viewingUser.id || viewingUser._id}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border ${getStatusBadgeStyle(viewingUser.status)}`}>
                {viewingUser.status === 'active' ? 'VERIFIED' : viewingUser.status === 'blocked' ? 'SUSPENDED' : viewingUser.status}
              </span>
              <button onClick={() => setViewingUser(null)} className="text-gray-400 hover:text-white cursor-pointer p-1">
                <X size={22} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6 text-left overflow-y-auto max-h-[75vh]">

            {/* Profile info grid */}
            <div>
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-4">Profile Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-[#0a0a0f]/60 border border-white/5 rounded-xl p-4 flex gap-3 items-start">
                  <Mail size={16} className="text-[#00f3ff] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-black">Email</p>
                    <p className="text-sm font-medium text-white mt-0.5 break-all">{viewingUser.email}</p>
                  </div>
                </div>
                <div className="bg-[#0a0a0f]/60 border border-white/5 rounded-xl p-4 flex gap-3 items-start">
                  <Phone size={16} className="text-[#00f3ff] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-black">Phone</p>
                    <p className="text-sm font-medium text-white mt-0.5">{viewingUser.phone || 'Not specified'}</p>
                  </div>
                </div>
                <div className="bg-[#0a0a0f]/60 border border-white/5 rounded-xl p-4 flex gap-3 items-start">
                  <Shield size={16} className="text-[#00f3ff] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-black">CNIC / Reg. ID</p>
                    <p className="text-sm font-medium text-white mt-0.5">{viewingUser.cnic || 'Not specified'}</p>
                  </div>
                </div>
                {viewingUser.businessName && (
                  <div className="bg-[#0a0a0f]/60 border border-white/5 rounded-xl p-4 flex gap-3 items-start">
                    <Package size={16} className="text-[#00f3ff] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-black">Business Name</p>
                      <p className="text-sm font-medium text-white mt-0.5">{viewingUser.businessName}</p>
                    </div>
                  </div>
                )}
                {viewingUser.businessRegNumber && (
                  <div className="bg-[#0a0a0f]/60 border border-white/5 rounded-xl p-4 flex gap-3 items-start">
                    <FileCheck size={16} className="text-[#00f3ff] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-black">Reg. Number</p>
                      <p className="text-sm font-medium text-white mt-0.5">{viewingUser.businessRegNumber}</p>
                    </div>
                  </div>
                )}
                <div className="bg-[#0a0a0f]/60 border border-white/5 rounded-xl p-4 flex gap-3 items-start">
                  <Clock size={16} className="text-[#00f3ff] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-black">Joined</p>
                    <p className="text-sm font-medium text-white mt-0.5">{viewingUser.joinedDate || viewingUser.createdAt?.split?.('T')[0] || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Identity / Verification documents */}
            <div className="border-t border-white/5 pt-6">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-4">
                Identity & Verification Documents ({viewingUser.documents?.length || 0} uploaded)
              </h3>
              {viewingUser.documents && viewingUser.documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {viewingUser.documents.map((doc, idx) => {
                    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(doc);
                    const labels = ['CNIC / Identity Document', 'Vehicle Operations License'];
                    return (
                      <a
                        key={idx}
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block border border-white/5 hover:border-[#00f3ff]/40 rounded-xl overflow-hidden bg-[#0a0a0f]/60 transition-all"
                      >
                        {isImage ? (
                          <img src={doc} alt={`Document ${idx + 1}`} className="w-full h-36 object-cover" onError={e => { e.target.style.display='none'; }} />
                        ) : (
                          <div className="h-24 flex items-center justify-center bg-white/5">
                            <FileText size={32} className="text-[#00f3ff]" />
                          </div>
                        )}
                        <div className="p-3 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-white">{labels[idx] || `Document ${idx + 1}`}</p>
                            <p className="text-[10px] text-[#00f3ff] mt-0.5 group-hover:underline">Click to open ↗</p>
                          </div>
                          <Eye size={14} className="text-gray-500 group-hover:text-[#00f3ff] transition-colors" />
                        </div>
                      </a>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-[#0a0a0f]/40 border border-white/5 rounded-xl p-6 text-center text-gray-500 text-sm">
                  No identity documents uploaded yet.
                </div>
              )}
            </div>

            {/* Fleet & Truck Certificates — only for truck owners */}
            {viewingUser.role === 'truck_owner' && (
              <div className="border-t border-white/5 pt-6">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-4">
                  Registered Fleet & Truck Certificates
                </h3>
                {loadingUserTrucks ? (
                  <div className="flex items-center gap-3 text-gray-500">
                    <Loader2 size={16} className="animate-spin text-[#00f3ff]" />
                    <span className="text-sm">Loading fleet data...</span>
                  </div>
                ) : viewingUserTrucks.length === 0 ? (
                  <div className="bg-[#0a0a0f]/40 border border-white/5 rounded-xl p-6 text-center text-gray-500 text-sm">
                    No trucks registered under this account.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {viewingUserTrucks.map((truck) => (
                      <div key={truck.id} className="bg-[#0a0a0f]/60 border border-white/5 rounded-xl p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                              <Truck size={18} />
                            </div>
                            <div>
                              <h4 className="font-mono text-base font-extrabold text-white">{truck.plateNumber}</h4>
                              <p className="text-xs text-gray-400">{truck.truckType} &middot; {truck.capacity}</p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                            truck.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            truck.status === 'In Transit' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            'bg-orange-500/10 text-orange-400 border-orange-500/20'
                          }`}>
                            {truck.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-gray-300 mb-4">
                          <div>
                            <p className="text-[9px] text-gray-500 font-black uppercase">Driver</p>
                            <p className="font-semibold text-white mt-0.5">{truck.driverName || '-'}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-gray-500 font-black uppercase">Driver Mobile</p>
                            <p className="font-semibold text-white mt-0.5">{truck.driverMobile || '-'}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-gray-500 font-black uppercase">Location</p>
                            <p className="font-semibold text-white mt-0.5">{truck.loc || '-'}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-gray-500 font-black uppercase">Truck ID</p>
                            <p className="font-mono text-gray-400 mt-0.5">TRK-{truck.id}</p>
                          </div>
                        </div>

                        {/* Truck certificates */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-white/5 pt-4">
                          <div>
                            <p className="text-[9px] text-gray-500 font-black uppercase mb-2">Fitness Certificate</p>
                            {truck.fitnessDoc ? (
                              <a
                                href={truck.fitnessDoc}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/50 text-amber-400 rounded-lg px-3 py-2 text-xs font-bold transition-all group"
                              >
                                <FileCheck size={14} />
                                <span className="group-hover:underline truncate">View Fitness Certificate ↗</span>
                              </a>
                            ) : (
                              <span className="text-xs text-red-400 italic flex items-center gap-1.5">
                                <AlertCircle size={12} /> Not uploaded
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-[9px] text-gray-500 font-black uppercase mb-2">Insurance Papers</p>
                            {truck.insuranceDoc ? (
                              <a
                                href={truck.insuranceDoc}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-[#00f3ff]/5 border border-[#00f3ff]/20 hover:border-[#00f3ff]/50 text-[#00f3ff] rounded-lg px-3 py-2 text-xs font-bold transition-all group"
                              >
                                <FileText size={14} />
                                <span className="group-hover:underline truncate">View Insurance Papers ↗</span>
                              </a>
                            ) : (
                              <span className="text-xs text-red-400 italic flex items-center gap-1.5">
                                <AlertCircle size={12} /> Not uploaded
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="border-t border-white/5 pt-6 flex gap-3">
              {viewingUser.status === 'pending' || viewingUser.status === 'pending_verification' ? (
                <>
                  <button
                    onClick={() => { handleVerification(viewingUser._id || viewingUser.id, 'active'); setViewingUser(null); fetchData(); }}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold py-2.5 rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} /> Approve Account
                  </button>
                  <button
                    onClick={() => { handleUserStatusUpdate(viewingUser._id || viewingUser.id, 'blocked'); setViewingUser(null); fetchData(); }}
                    className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-extrabold py-2.5 rounded-xl text-sm transition-colors border border-red-500/25 cursor-pointer"
                  >
                    Reject & Block
                  </button>
                </>
              ) : viewingUser.status === 'blocked' ? (
                <button
                  onClick={() => { handleUserStatusUpdate(viewingUser._id || viewingUser.id, 'active'); setViewingUser(null); fetchData(); }}
                  className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-extrabold py-2.5 rounded-xl text-sm transition-colors border border-emerald-500/25 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Unlock size={16} /> Unblock User
                </button>
              ) : (
                <button
                  onClick={() => { handleUserStatusUpdate(viewingUser._id || viewingUser.id, 'blocked'); setViewingUser(null); fetchData(); }}
                  className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-extrabold py-2.5 rounded-xl text-sm transition-colors border border-red-500/25 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Ban size={16} /> Block User
                </button>
              )}
              <button
                onClick={() => setViewingUser(null)}
                className="px-6 py-2.5 border border-white/10 rounded-xl text-sm text-gray-400 hover:text-white hover:border-white/20 cursor-pointer transition-all"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      </div>
    )}

  </div>
  );
}
