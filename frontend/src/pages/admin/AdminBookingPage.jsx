import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Filter, 
  Search, 
  RefreshCw, 
  User, 
  Building2, 
  Calendar,
  ChevronDown,
  Inbox
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import bookingService from '../../services/bookingService';
import RejectionModal from '../../components/RejectionModal';

const AdminBookingPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING'); // Default to pending
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectionModal, setRejectionModal] = useState({ isOpen: false, bookingId: null });

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingService.getAllBookings();
      setBookings(data);
    } catch (error) {
      console.error("Error fetching admin bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleApprove = async (id) => {
    try {
      await bookingService.approveBooking(id);
      fetchBookings();
    } catch (error) {
      alert("Approval failed: " + error.message);
    }
  };

  const handleRejectConfirm = async (id, reason) => {
    try {
      await bookingService.rejectBooking(id, reason);
      setRejectionModal({ isOpen: false, bookingId: null });
      fetchBookings();
    } catch (error) {
      alert("Rejection failed: " + error.message);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesFilter = filter === 'ALL' || b.status === filter;
    const matchesSearch = b.userId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.resourceId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusStyle = (status) => {
    const styles = {
      PENDING: "bg-amber-50 text-amber-600 border-amber-100",
      APPROVED: "bg-emerald-50 text-emerald-600 border-emerald-100",
      REJECTED: "bg-rose-50 text-rose-600 border-rose-100",
      CANCELLED: "bg-slate-50 text-slate-400 border-slate-100"
    };
    return styles[status] || "bg-slate-50 text-slate-400 border-slate-100";
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-40 pb-32 px-6 relative bg-blueprint">
      <div className="absolute inset-0 bg-slate-50/90 backdrop-blur-[2px] pointer-events-none" />
      <div className="grain-overlay" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="p-2 bg-indigo-600/10 rounded-lg text-indigo-600">
                <Inbox size={16} />
              </div>
              <span className="text-indigo-600 font-black tracking-widest uppercase text-[11px] block underline underline-offset-8 decoration-indigo-200">Synchronization Registry</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-6xl font-prestige text-slate-900 leading-tight"
            >
               Booking Central.
            </motion.h1>
          </div>

          <div className="flex items-center gap-4">
             <button 
                onClick={fetchBookings}
                className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm group"
             >
                <RefreshCw size={20} className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
             </button>
             <div className="glass-heavy bg-white/70 p-2 rounded-2xl border border-white shadow-lg flex items-center gap-1">
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                      ${filter === f ? 'bg-slate-900 text-white shadow-xl translate-y-[-2px]' : 'text-slate-400 hover:text-slate-600'}
                    `}
                  >
                    {f}
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-40 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-8 shadow-inner"></div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Synchronizing Distribution Matrix...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-40 flex flex-col items-center justify-center text-center opacity-30"
          >
            <Inbox size={64} className="text-slate-300 mb-8" />
            <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">No synchronization requests found in this segment</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              {filteredBookings.map((booking, idx) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-heavy bg-white/70 p-10 rounded-[3rem] border border-white shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-10 hover:border-indigo-100 transition-all group"
                >
                  <div className="flex flex-col md:flex-row items-center gap-10 flex-1">
                    {/* Status Circle */}
                    <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center shadow-inner transition-colors
                      ${booking.status === 'APPROVED' ? 'bg-emerald-50 border-emerald-100 text-emerald-500' : 
                        booking.status === 'REJECTED' ? 'bg-rose-50 border-rose-100 text-rose-500' :
                        booking.status === 'PENDING' ? 'bg-amber-50 border-amber-100 text-amber-500' :
                        'bg-slate-50 border-slate-100 text-slate-300'}
                    `}>
                      {booking.status === 'APPROVED' ? <CheckCircle2 size={32} /> : 
                       booking.status === 'REJECTED' ? <XCircle size={32} /> :
                       <Clock size={32} />}
                    </div>

                    <div className="space-y-4 text-center md:text-left flex-1">
                      <div className="flex items-center flex-wrap gap-4 justify-center md:justify-start">
                        <span className="text-xs font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100 shadow-sm">
                          ID: {booking.id.slice(-6)}
                        </span>
                        <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${getStatusStyle(booking.status)}`}>
                          {booking.status}
                        </div>
                      </div>
                      
                      <h3 className="text-3xl font-prestige text-slate-900 leading-tight">
                        {booking.purpose}
                      </h3>

                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-8">
                         <div className="flex items-center gap-3 text-slate-400 font-bold text-xs uppercase tracking-widest">
                            <User size={16} className="text-slate-300" />
                            {booking.userId}
                         </div>
                         <div className="flex items-center gap-3 text-slate-400 font-bold text-xs uppercase tracking-widest">
                            <Building2 size={16} className="text-slate-300" />
                            {booking.resourceId}
                         </div>
                         <div className="flex items-center gap-3 text-slate-400 font-bold text-xs uppercase tracking-widest">
                            <Calendar size={16} className="text-slate-300" />
                            {new Date(booking.startTime).toLocaleDateString()} at {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {booking.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => setRejectionModal({ isOpen: true, bookingId: booking.id })}
                          className="px-8 py-4 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-[2rem] transition-all font-black text-[11px] uppercase tracking-[0.2em] bg-white group-hover:shadow-lg"
                        >
                          Decline Request
                        </button>
                        <button
                          onClick={() => handleApprove(booking.id)}
                          className="px-10 py-4 bg-slate-900 text-white rounded-[2rem] transition-all font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:bg-emerald-600 hover:shadow-emerald-200 active:scale-[0.98]"
                        >
                          Approve Provision
                        </button>
                      </>
                    )}
                    {booking.status === 'REJECTED' && (
                      <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100 max-w-xs text-left">
                        <p className="text-[9px] font-black uppercase text-rose-400 tracking-widest mb-2 flex items-center gap-2">
                           Rejection Rationale
                        </p>
                        <p className="text-xs text-rose-800 font-bold italic line-clamp-3 leading-relaxed">
                          "{booking.rejectionReason}"
                        </p>
                      </div>
                    )}
                    {booking.status === 'APPROVED' && (
                      <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 shadow-inner flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Active Reservation</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <RejectionModal 
        isOpen={rejectionModal.isOpen}
        onClose={() => setRejectionModal({ isOpen: false, bookingId: null })}
        onConfirm={handleRejectConfirm}
        bookingId={rejectionModal.bookingId}
      />
    </div>
  );
};

export default AdminBookingPage;
