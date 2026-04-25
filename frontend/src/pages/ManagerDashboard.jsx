import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Activity, 
  Database, 
  Clock, 
  Calendar,
  AlertCircle,
  FileText
} from 'lucide-react';
import bookingService from '../services/bookingService';

const ManagerDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchManagerData = async () => {
      try {
        const [statsData, bookingsData] = await Promise.all([
          bookingService.getAnalytics(),
          bookingService.getAllBookings()
        ]);
        setAnalytics(statsData);
        setAllBookings(bookingsData);
      } catch (error) {
        console.error("Error fetching manager dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchManagerData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 leading-none mb-2">Manager Analytics</h1>
          <p className="text-slate-500 font-medium italic">High-level insight into campus resource utilization.</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-amber-50 text-amber-700 rounded-2xl border border-amber-100 font-black tracking-wider uppercase text-xs shadow-sm">
          <ShieldAlert size={18} />
          Read-Only Access Level
        </div>
      </header>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Volume', value: analytics.total, icon: <Database />, color: 'indigo' },
          { label: 'Approval Rate', value: `${analytics.ratio?.toFixed(1)}%`, icon: <TrendingUp />, color: 'emerald' },
          { label: 'Pending Queue', value: analytics.pending, icon: <Clock />, color: 'amber' },
          { label: 'Rejected Tasks', value: analytics.rejected, icon: <AlertCircle />, color: 'rose' }
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 glass-card bg-white border border-slate-100 shadow-sm"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${
              card.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
              card.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
              card.color === 'amber' ? 'bg-amber-50 text-amber-600' :
              'bg-rose-50 text-rose-600'
            }`}>
              {card.icon}
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">{card.value}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Usage Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-8 bg-white border border-slate-100 min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Activity size={20} className="text-indigo-600" />
              Resource Usage Trends
            </h3>
            <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-400">
              REAL-TIME SYNC
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 border-l-4 border-l-indigo-600">
              <div className="text-sm font-bold text-indigo-700 uppercase tracking-tight mb-2">Peak Usage Window</div>
              <div className="text-2xl font-black text-slate-800">{analytics.peakTimes}</div>
            </div>
            
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 border-l-4 border-l-emerald-600">
              <div className="text-sm font-bold text-emerald-700 uppercase tracking-tight mb-2">Top Performing Resource</div>
              <div className="text-2xl font-black text-slate-800">{analytics.usageTrends}</div>
            </div>

            <div className="p-10 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-center">
              <PieChart size={40} className="text-slate-200 mb-4" />
              <div className="text-sm font-bold text-slate-400">Monthly breakdown charts would appear here in production.</div>
            </div>
          </div>
        </div>

        <div className="glass-card p-8 bg-slate-900 text-white relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
              <FileText size={20} className="text-indigo-300" />
            </div>
            <h3 className="text-xl font-black mb-4 leading-tight">Generate Utilization Report</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Download a comprehensive PDF report containing all booking statistics, peak periods, and resource popularity data for the current semester.
            </p>
          </div>
          <button className="relative z-10 w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-black rounded-2xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
            Download Report
          </button>
        </div>
      </div>

      {/* Read-Only Global Feed */}
      <section className="space-y-6">
        <h3 className="text-lg font-black text-slate-800 ml-2 uppercase tracking-widest text-xs">Global Booking Feed (Read-Only)</h3>
        <div className="glass-card bg-white border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                  <th className="px-8 py-5">RESOURCE</th>
                  <th className="px-8 py-5">USER ID</th>
                  <th className="px-8 py-5">SCHEDULE</th>
                  <th className="px-8 py-5 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {allBookings.map((booking) => (
                  <tr key={booking.id} className="text-sm font-medium text-slate-600 hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-black">
                        RES-{booking.resourceId}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-mono text-slate-400">#{booking.userId}</td>
                    <td className="px-8 py-6">
                      <div className="text-slate-900 font-bold">{new Date(booking.startTime).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">{new Date(booking.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                    </td>
                    <td className="px-8 py-6 flex justify-center">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter ${
                        booking.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        booking.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                        'bg-slate-100 text-slate-400'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

// Simple Mock for Shield icon if not imported
const ShieldAlert = ({size}) => <AlertCircle size={size} />;

export default ManagerDashboard;
