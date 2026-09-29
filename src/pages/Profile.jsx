import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { User, Mail, Shield, Calendar, LogOut, AlertTriangle, Send, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { logisticsAPI } from '../api';
import { ChamakRibbon, TruckTaj, UrduMotto, TruckPoetryBanner, TruckPatternBorder, NazarBattuBadge } from '../components/TruckArt';

export default function Profile() {
  const { currentUser, userData, logout } = useAuth();
  const { t, isUrdu } = useLanguage();
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState({ subject: '', description: '' });

  const handleSendReport = async (e) => {
    e.preventDefault();
    try {
      await logisticsAPI.postComplaint(report);
      alert(isUrdu ? "رپورٹ کامیابی سے بھیج دی گئی۔ ایڈمن جلد جائزہ لے گا۔" : "Report sent successfully. Admin will review it.");
      setShowReport(false);
      setReport({ subject: '', description: '' });
    } catch (error) {
      console.error("Error sending report: ", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 relative">
      {/* Truck Art Pattern Ribbon */}
      <TruckPatternBorder height="h-6" className="rounded-xl mb-4 shadow-sm" />

      <div className="mb-6 relative z-10">
        <TruckPoetryBanner />
      </div>

      <div className="bg-white/95 backdrop-blur-md p-0 overflow-hidden relative border-2 border-cyan-400 shadow-2xl rounded-3xl z-10">
        {/* Chamak Patti Ribbon Header */}
        <ChamakRibbon height="h-[5px]" />

        <div className="p-7">
          <div className="flex flex-col md:flex-row items-center gap-6 mb-8 pb-8 border-b border-cyan-200">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-100 via-purple-50 to-amber-100 flex items-center justify-center text-purple-700 border-2 border-cyan-400 shadow-md">
                <TruckTaj size={48} />
              </div>
              <span className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-sm">
                <CheckCircle2 size={14} strokeWidth={3} />
              </span>
            </div>
            
            <div className="text-center md:text-left flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h1 className="text-3xl font-extrabold text-slate-900">{userData?.name || 'Verified User'}</h1>
                <UrduMotto className="self-center md:self-auto" />
              </div>
              <p className="text-sm font-mono text-amber-800 capitalize flex items-center justify-center md:justify-start gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-bold">{userData?.role?.replace('_', ' ')}</span>
                {userData?.businessName && (
                  <>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-700 font-sans font-semibold">{userData.businessName}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-[#FAF7EE] border border-amber-200/80 shadow-sm">
              <div className="flex items-center gap-2 text-slate-600 mb-2">
                <Mail size={16} className="text-sky-600" />
                <span className="text-xs uppercase tracking-wider font-bold">Email Address</span>
              </div>
              <p className="text-slate-900 text-sm font-semibold truncate">{currentUser?.email}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF7EE] border border-amber-200/80 shadow-sm">
              <div className="flex items-center gap-2 text-slate-600 mb-2">
                <Shield size={16} className="text-amber-600" />
                <span className="text-xs uppercase tracking-wider font-bold">Account Status</span>
              </div>
              <p className={`text-sm font-bold capitalize flex items-center gap-1.5 ${
                userData?.status === 'active' ? 'text-emerald-700' : 
                userData?.status === 'pending_verification' ? 'text-sky-700' : 
                'text-amber-700'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  userData?.status === 'active' ? 'bg-emerald-500' : 
                  userData?.status === 'pending_verification' ? 'bg-sky-500' : 
                  'bg-amber-500'
                }`}></span>
                {userData?.status?.replace('_', ' ') || 'Pending'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF7EE] border border-amber-200/80 shadow-sm">
              <div className="flex items-center gap-2 text-slate-600 mb-2">
                <Calendar size={16} className="text-red-600" />
                <span className="text-xs uppercase tracking-wider font-bold">System User ID</span>
              </div>
              <p className="text-amber-900 font-mono text-xs font-bold tracking-wider">
                BLT-USR-{String(currentUser?.id || currentUser?._id || '001').padStart(4, '0')}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={logout}
              className="btn-crimson text-xs !py-2.5 !px-5 cursor-pointer shadow-md"
            >
              <LogOut size={16} /> {isUrdu ? 'لاگ آؤٹ' : 'Sign Out Account'}
            </button>
          </div>

          {/* Support & Complaints Section */}
          <div className="mt-10 border-t border-amber-200 pt-7">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 border border-amber-300 text-amber-800">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Support & Platform Complaints</h3>
                  <p className="text-xs text-slate-600">Submit grievances for official administrative review</p>
                </div>
              </div>
              <button 
                onClick={() => setShowReport(!showReport)}
                className="btn-outline text-xs !py-1.5 !px-3 cursor-pointer"
              >
                {showReport ? 'Cancel' : 'Report an Issue'}
              </button>
            </div>
            
            {showReport ? (
              <form onSubmit={handleSendReport} className="p-5 rounded-2xl bg-amber-50/60 border border-amber-300 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Subject / Category
                  </label>
                  <input 
                    required 
                    value={report.subject} 
                    onChange={e => setReport({...report, subject: e.target.value})} 
                    placeholder="e.g. Booking payment dispute, Driver document issue" 
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Detailed Description
                  </label>
                  <textarea 
                    required 
                    value={report.description} 
                    onChange={e => setReport({...report, description: e.target.value})} 
                    placeholder="Provide full trip or booking context..." 
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 h-28" 
                  />
                </div>
                <button type="submit" className="btn-primary text-xs !py-2.5 !px-5 w-full cursor-pointer shadow-md">
                  <Send size={15} /> Submit Official Dispute
                </button>
              </form>
            ) : (
              <div className="p-4 rounded-2xl bg-[#FAF7EE] border border-amber-200/80 text-xs text-slate-600 flex items-center justify-between">
                <span>Direct dispute escalation channel to System Administrator.</span>
                <span className={isUrdu ? "font-urdu text-red-700 font-bold text-sm" : "font-mono text-slate-500 font-bold text-xs"}>
                  {isUrdu ? 'فاصلہ رکھیں ورنہ پیار ہو جائے گا' : 'Safe Transit Across Pakistan'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
