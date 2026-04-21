import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CalendarDays, Clock, MapPin, CheckCircle2, ShieldCheck, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import bookingService from '../services/bookingService';

const AvailabilityView = () => {
  const [resourceId, setResourceId] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchAvailability = async () => {
    if (!resourceId) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const data = await bookingService.getAllBookings(null, resourceId);
      // Filter for only APPROVED ones to show actual occupancy
      setBookings(data.filter(b => b.status === 'APPROVED'));
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-40 pb-32 px-6 relative bg-blueprint">
      <div className="absolute inset-0 bg-slate-50/90 backdrop-blur-[2px] pointer-events-none" />
      <div className="grain-overlay" />
      
      {/* Header Section */}
      <div className="mb-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="p-2 bg-indigo-600/10 rounded-lg">
            <Sparkles size={16} className="text-indigo-600" />
          </div>
          <span className="text-indigo-600 font-black tracking-widest uppercase text-[11px] block underline underline-offset-8 decoration-indigo-200">Real-Time Intelligence</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-7xl font-prestige text-slate-900 leading-tight mb-8"
        >
          Asset Status <br />Registry.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-slate-500 font-medium max-w-2xl"
        >
          Query the institutional synchronization engine to verify current occupancy and future allocations for any campus resource.
        </motion.p>
      </div>

      {/* Search Console */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-heavy bg-white/40 p-10 mb-20 rounded-[3rem] border border-white shadow-2xl relative overflow-hidden group"
      >
        <div className="flex flex-col md:flex-row gap-8 items-end relative z-10">
          <div className="flex-1 space-y-4 w-full">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Terminal Resource Identifier</label>
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="number"
                placeholder="Enter Asset ID (e.g. 101)"
                className="w-full pl-16 pr-6 py-5 bg-white/80 border border-white rounded-[2rem] text-lg font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner placeholder:text-slate-300"
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchAvailability()}
              />
            </div>
          </div>
          <button
            onClick={fetchAvailability}
            disabled={loading || !resourceId}
            className="w-full md:w-auto px-12 py-5 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.3em] rounded-[2rem] hover:bg-indigo-600 transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? "Syncing..." : "Scan Identity"}
            <ArrowRight size={18} />
          </button>
        </div>
      </motion.div>

      {/* Results Rendering */}
      <div className="relative min-h-[400px]">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-8 shadow-inner"></div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Interrogating Database...</p>
          </div>
        ) : bookings.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {bookings.map((booking, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={booking.id} 
                className="p-8 glass-heavy bg-white border border-white rounded-[2.5rem] flex items-center gap-6 group hover:border-indigo-100 transition-all shadow-lg"
              >
                <div className="p-5 bg-slate-50 text-indigo-600 rounded-2xl shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Clock size={28} />
                </div>
                <div>
                  <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none mb-2">Current Occupancy</div>
                  <div className="text-xl font-prestige text-slate-900">Resource Locked</div>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-3 font-bold">
                    <CalendarDays size={14} />
                    {new Date(booking.startTime).toLocaleDateString()}
                    <span className="text-slate-200">|</span>
                    {new Date(booking.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - {new Date(booking.endTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : hasSearched && resourceId && !loading ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-24 px-10 text-center bg-emerald-50/50 backdrop-blur-3xl border-2 border-dashed border-emerald-200 rounded-[4rem] relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-emerald-400/5 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
            
            <div className="relative z-10">
              <div className="w-24 h-24 bg-white text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-emerald-200 group-hover:scale-110 transition-transform">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-4xl font-prestige text-emerald-900 mb-4">Resource Available</h3>
              <p className="text-emerald-700 font-medium max-w-lg mx-auto mb-12">No synchronization conflicts detected for the specified asset. You may proceed with the reservation protocol.</p>
              
              <Link
                to="/booking"
                className="inline-flex items-center gap-3 px-10 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 hover:shadow-2xl hover:shadow-emerald-200 transition-all active:scale-95"
              >
                Initialize Booking <ShieldCheck size={16} />
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="py-40 flex flex-col items-center justify-center text-center opacity-30">
            <AlertCircle size={64} className="text-slate-300 mb-8" />
            <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Enter Unified ID to Begin Scan</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailabilityView;
