import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  CalendarDays, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight,
  Package,
  Calendar as CalendarIcon,
  ChevronRight,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import bookingService from '../services/bookingService';
import resourceService from '../services/resourceService';
import toast from 'react-hot-toast';

const AvailabilityView = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [resourceId, setResourceId] = useState(searchParams.get('resourceId') || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [resources, setResources] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    fetchResources();
    if (resourceId) {
        handleSearch();
    }
  }, []);

  const fetchResources = async () => {
    try {
        const data = await resourceService.getAllResources();
        setResources(data);
    } catch (error) {
        console.error("Resource inventory sync failure:", error);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!resourceId || !date) {
        toast.error("Please identify a resource and target date.");
        return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const data = await bookingService.getAvailability(resourceId, date);
      setAvailability(data);
      toast.success("Synchronized with Registry.");
    } catch (error) {
      console.error("Error fetching availability:", error);
      toast.error("Database Interrogation Failure.");
    } finally {
      setLoading(false);
    }
  };

  const handleSlotClick = (slot) => {
    if (slot.status === 'BOOKED') {
        toast.error("Temporal Conflict: Resource currently allocated.");
        return;
    }
    
    // Format for BookingFormPage
    navigate('/bookings', { 
        state: { 
            resourceId, 
            bookingDate: date,
            startTime: slot.startTime,
            endTime: slot.endTime
        } 
    });
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-40 pb-32 px-6 relative bg-blueprint">
      <div className="absolute inset-0 bg-slate-50/90 backdrop-blur-[2px] pointer-events-none" />
      <div className="grain-overlay" />
      
      <div className="max-w-7xl mx-auto relative z-10">
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
            <span className="text-indigo-600 font-black tracking-widest uppercase text-[11px] block underline underline-offset-8 decoration-indigo-200">Temporal Status Engine</span>
            </motion.div>
            
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="max-w-3xl">
                    <motion.h1 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-8xl font-prestige text-slate-900 leading-none mb-10"
                    >
                    Availability <br />Registry.
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed"
                    >
                    Analyze institutional synchronization windows to identify available operational cycles for campus assets.
                    </motion.p>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-8 bg-white/50 backdrop-blur px-8 py-5 rounded-3xl border border-white shadow-xl h-fit">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Operational</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Reserved</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Console */}
        <motion.form 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSearch}
          className="glass-heavy bg-white/50 p-10 mb-20 rounded-[3.5rem] border border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] flex flex-wrap lg:flex-nowrap gap-8 items-end"
        >
          <div className="flex-1 min-w-[300px] space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
                <Package size={12} /> Asset Identifier
            </label>
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <select
                className="w-full pl-16 pr-6 py-5 bg-white border border-white rounded-[2rem] text-lg font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner appearance-none cursor-pointer"
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
              >
                <option value="">Select Resource Focus...</option>
                {resources.map(res => (
                    <option key={res.id} value={res.id}>{res.name} — {res.category}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="w-full lg:w-72 space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
                <CalendarIcon size={12} /> Baseline Date
            </label>
            <div className="relative">
                <CalendarDays className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                    type="date"
                    className="w-full pl-16 pr-8 py-5 bg-white border border-white rounded-[2rem] text-lg font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner"
                    value={date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDate(e.target.value)}
                />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full lg:w-auto px-12 py-5 bg-slate-950 text-white font-black text-xs uppercase tracking-[0.4em] rounded-[2rem] hover:bg-indigo-600 transition-all shadow-2xl active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4 group"
          >
            {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
                <>
                    Interrogate Feed
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
            )}
          </button>
        </motion.form>

        {/* Result Matrix */}
        <div className="relative min-h-[500px]">
          {loading && availability.length === 0 ? (
            <div className="py-40 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-8 shadow-inner"></div>
              <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Synchronizing Matrix...</p>
            </div>
          ) : availability.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"
            >
              <AnimatePresence>
                {availability.map((slot, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        onClick={() => handleSlotClick(slot)}
                        className={`group relative p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer overflow-hidden
                            ${slot.status === 'AVAILABLE' 
                                ? 'bg-white border-white hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-500/5' 
                                : 'bg-slate-100/50 border-slate-200/50 cursor-not-allowed opacity-60'
                            }
                        `}
                    >
                        {slot.status === 'AVAILABLE' && (
                            <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        )}
                        
                        <div className={`p-4 rounded-2xl mb-6 inline-block shadow-inner
                            ${slot.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-400'}
                        `}>
                            {slot.status === 'AVAILABLE' ? <ShieldCheck size={24} /> : <Lock size={24} />}
                        </div>

                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-2">Timestamp</p>
                            <h4 className={`text-2xl font-bold ${slot.status === 'AVAILABLE' ? 'text-slate-900' : 'text-slate-500'}`}>
                                {slot.startTime}
                            </h4>
                            <div className="flex items-center justify-between mt-4">
                                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border
                                    ${slot.status === 'AVAILABLE' 
                                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                                        : 'bg-slate-200 border-slate-200 text-slate-400'
                                    }
                                `}>
                                    {slot.status}
                                </span>
                                {slot.status === 'AVAILABLE' && (
                                    <ChevronRight size={14} className="text-emerald-500 group-hover:translate-x-1 transition-transform" />
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : hasSearched && !loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-40 flex flex-col items-center justify-center text-center opacity-30"
            >
              <AlertCircle size={80} className="text-slate-300 mb-8" />
              <p className="text-slate-400 font-black uppercase tracking-[0.5em] text-[10px]">No Registry Entries Found for Asset Target</p>
            </motion.div>
          ) : (
            <div className="py-40 flex flex-col items-center justify-center text-center opacity-30">
              <Package size={80} className="text-slate-200 mb-8" />
              <p className="text-slate-400 font-black uppercase tracking-[0.5em] text-[10px]">Initiate Asset Scan to Begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailabilityView;
