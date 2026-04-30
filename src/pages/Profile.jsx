import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Shield, Calendar, LogOut, AlertTriangle, Send } from 'lucide-react';
import { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function Profile() {
  const { currentUser, userData, logout } = useAuth();
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState({ subject: '', description: '' });

  const handleSendReport = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'complaints'), {
        ...report,
        userId: currentUser.uid,
        userName: userData.name,
        userRole: userData.role,
        createdAt: new Date().toISOString()
      });
      alert("Report sent successfully. Admin will review it.");
      setShowReport(false);
      setReport({ subject: '', description: '' });
    } catch (error) {
      console.error("Error sending report: ", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="glass-card">
        <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
          <div className="w-24 h-24 rounded-full bg-neon-blue/20 flex items-center justify-center text-neon-blue border-2 border-neon-blue shadow-[0_0_15px_rgba(0,243,255,0.3)]">
            <User size={48} />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-white mb-2">{userData?.name || 'User'}</h1>
            <p className="text-gray-400 capitalize">{userData?.role?.replace('_', ' ')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3 text-gray-400 mb-2">
              <Mail size={18} />
              <span className="text-sm">Email Address</span>
            </div>
            <p className="text-white font-medium">{currentUser?.email}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3 text-gray-400 mb-2">
              <Shield size={18} />
              <span className="text-sm">Account Status</span>
            </div>
            <p className={`font-medium capitalize ${
              userData?.status === 'active' ? 'text-green-400' : 
              userData?.status === 'pending_verification' ? 'text-neon-blue' : 
              'text-orange-400'
            }`}>
              {userData?.status?.replace('_', ' ') || 'Pending'}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3 text-gray-400 mb-2">
              <Calendar size={18} />
              <span className="text-sm">User ID</span>
            </div>
            <p className="text-white font-mono text-xs">{currentUser?.uid}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <button 
            onClick={logout}
            className="px-6 py-3 rounded-lg bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={18} /> Log Out Account
          </button>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <AlertTriangle size={20} className="text-orange-500" /> Support & Complaints
            </h3>
            <button 
              onClick={() => setShowReport(!showReport)}
              className="text-xs text-neon-purple hover:underline"
            >
              {showReport ? 'Cancel' : 'Report an Issue'}
            </button>
          </div>
          
          {showReport ? (
            <form onSubmit={handleSendReport} className="glass-card bg-white/5 space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Subject / Issue Type</label>
                <input required value={report.subject} onChange={e => setReport({...report, subject: e.target.value})} placeholder="e.g. Booking dispute, App bug" className="w-full bg-dark-bg border border-white/10 rounded px-3 py-2 text-white text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Description</label>
                <textarea required value={report.description} onChange={e => setReport({...report, description: e.target.value})} placeholder="Provide details about your issue..." className="w-full bg-dark-bg border border-white/10 rounded px-3 py-2 text-white text-sm h-32" />
              </div>
              <button type="submit" className="w-full bg-neon-purple text-white py-2 rounded font-bold hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2">
                <Send size={16} /> Submit Report
              </button>
            </form>
          ) : (
            <p className="text-gray-400 text-sm italic">Need help? Submit a report and our admin team will get back to you.</p>
          )}
        </div>
      </div>
    </div>
  );
}
