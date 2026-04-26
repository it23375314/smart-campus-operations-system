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
  Inbox,
  X,
  Package,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import bookingService from '../../services/bookingService';
import resourceService from '../../services/resourceService';
import RejectionModal from '../../components/RejectionModal';
import BookingDetailsModal from '../../components/BookingDetailsModal';
import { Eye } from 'lucide-react';

const AdminBookingPage = () => {
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Advanced Filters State
  const [filters, setFilters] = useState({
    status: '',
    date: '',
    resourceId: '',
    search: ''
  });

  const [rejectionModal, setRejectionModal] = useState({ isOpen: false, bookingId: null });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchResources = async () => {
    try {
      const data = await resourceService.getAllResources();
      setResources(data);
    } catch (error) {
      console.error("Error fetching resource inventory:", error);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Pass clean filters to the service
      const activeFilters = {};
      if (filters.status) activeFilters.status = filters.status;
      if (filters.date) activeFilters.date = filters.date;
      if (filters.resourceId) activeFilters.resourceId = filters.resourceId;
      if (filters.search) activeFilters.search = filters.search;

      const data = await bookingService.getAllBookings(activeFilters);
      setBookings(data);
    } catch (error) {
      console.error("Error fetching filtered bookings:", error);
      toast.error("Distribution Registry Synchronization Failure.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
    fetchBookings();
  }, []);

  // Trigger fetch on filter change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBookings();
    }, 400); // 400ms debounce for search

    return () => clearTimeout(delayDebounceFn);
  }, [filters]);

  const handleApprove = async (id) => {
    const loadingToast = toast.loading("Processing Approval Logic...");
    try {
      await bookingService.approveBooking(id);
      toast.success("Authorization Granted. Resource Synchronized.", { id: loadingToast });
      fetchBookings();
    } catch (error) {
      const msg = error.response?.data || error.message;
      toast.error("Approval Override Denied: " + (typeof msg === 'string' ? msg : "Conflict Detected"), { id: loadingToast });
    }
  };

  const handleRejectConfirm = async (id, reason) => {
    const loadingToast = toast.loading("Executing Rejection Sequence...");
    try {
      await bookingService.rejectBooking(id, reason);
      toast.success("Request Dissolved. Identity Records Updated.", { id: loadingToast });
      setRejectionModal({ isOpen: false, bookingId: null });
      fetchBookings();
    } catch (error) {
      toast.error("Decline Sequence Failure: " + (error.response?.data || error.message), { id: loadingToast });
    }
  };

  const handleAdminCancel = async (id) => {
    const loadingToast = toast.loading("Initiating Forced Override...");
    try {
        await bookingService.adminCancelBooking(id);
        toast.success("Operation Terminated. Registry Purged.", { id: loadingToast });
        fetchBookings();
    } catch (error) {
        toast.error("Override Failure: " + (error.response?.data || error.message), { id: loadingToast });
    }
  };

  const handleExportReport = async () => {
    const loadingToast = toast.loading("Synthesizing Institutional Report...");
    try {
        const activeFilters = {};
        if (filters.status) activeFilters.status = filters.status;
        if (filters.date) activeFilters.date = filters.date;
        if (filters.resourceId) activeFilters.resourceId = filters.resourceId;
        if (filters.search) activeFilters.search = filters.search;

        await bookingService.downloadReportPdf(activeFilters);
        toast.success("Intelligence Stream Finalized.", { id: loadingToast });
    } catch (error) {
        console.error("Export Protocol Failure:", error);
        toast.error("Export Protocol Failure.");
    } finally {
        toast.dismiss(loadingToast);
    }
  };

  const openDetails = (booking) => {
    setSelectedBooking(booking);
    setIsDetailsOpen(true);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      date: '',
      resourceId: '',
      search: ''
    });
  };

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
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="p-2 bg-indigo-600/10 rounded-lg text-indigo-600">
              <Inbox size={16} />
            </div>
            <span className="text-indigo-600 font-black tracking-widest uppercase text-[11px] block underline underline-offset-8 decoration-indigo-200">Management Dashboard</span>
          </motion.div>
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <motion.h1 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-6xl font-prestige text-slate-900 leading-tight"
            >
               Order Central.
            </motion.h1>

            <div className="flex items-center gap-4">
               <button 
                  onClick={fetchBookings}
                  className="p-5 bg-white border border-slate-200 rounded-3xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-xl group"
               >
                  <RefreshCw size={24} className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
               </button>
               {Object.values(filters).some(v => v !== '') && (
                 <button 
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-6 py-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-100 transition-all shadow-xl shadow-rose-500/5"
                 >
                    <X size={14} /> Clear Selection
                 </button>
               )}
               <button 
                  onClick={handleExportReport}
                  className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-500/20 active:scale-95"
               >
                  <Download size={14} /> Export Report
               </button>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-heavy bg-white/70 p-8 mb-12 rounded-[3.5rem] border border-white shadow-2xl flex flex-wrap gap-6 items-end"
        >
          {/* Search */}
          <div className="flex-1 min-w-[280px] space-y-3">
             <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2">
                <Search size={12} /> Global Search
             </label>
             <div className="relative">
                <input 
                  type="text"
                  placeholder="ID, Purpose, or User Identity..."
                  className="w-full px-6 py-4 bg-white/50 border border-white rounded-[2rem] text-xs font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner"
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                />
             </div>
          </div>

          {/* Status Dropdown */}
          <div className="w-56 space-y-3">
             <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2">
                <Filter size={12} /> Operational Status
             </label>
             <select
               className="w-full px-6 py-4 bg-white/50 border border-white rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner appearance-none cursor-pointer"
               value={filters.status}
               onChange={(e) => setFilters({...filters, status: e.target.value})}
             >
               <option value="">ALL SEGMENTS</option>
               <option value="PENDING">PENDING</option>
               <option value="APPROVED">APPROVED</option>
               <option value="REJECTED">REJECTED</option>
               <option value="CANCELLED">CANCELLED</option>
             </select>
          </div>

          {/* Resource Dropdown */}
          <div className="w-64 space-y-3">
             <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2">
                <Package size={12} /> Asset Target
             </label>
             <select
               className="w-full px-6 py-4 bg-white/50 border border-white rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner appearance-none cursor-pointer"
               value={filters.resourceId}
               onChange={(e) => setFilters({...filters, resourceId: e.target.value})}
             >
               <option value="">ALL RESOURCES</option>
               {resources.map(res => (
                 <option key={res.id} value={res.id}>{res.name}</option>
               ))}
             </select>
          </div>

          {/* Date Picker */}
          <div className="w-48 space-y-3">
             <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2">
                <Calendar size={12} /> Registry Date
             </label>
             <input 
               type="date"
               className="w-full px-6 py-4 bg-white/50 border border-white rounded-2xl text-[11px] font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner"
               value={filters.date}
               onChange={(e) => setFilters({...filters, date: e.target.value})}
             />
          </div>
        </motion.div>

        {/* Content */}
        {loading && bookings.length === 0 ? (
          <div className="py-40 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-8 shadow-inner"></div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Synchronizing Distribution Matrix...</p>
          </div>
        ) : bookings.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-40 flex flex-col items-center justify-center text-center opacity-30"
          >
            <Inbox size={64} className="text-slate-300 mb-8" />
            <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">No synchronization requests found in this cross-section</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {bookings.map((booking, idx) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: idx * 0.03 }}
                  className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden hover:border-indigo-200 transition-all group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-stretch">
                    {/* Status Bar Indicator */}
                    <div className={`w-2 lg:w-3 flex-shrink-0 ${
                      booking.status === 'APPROVED' ? 'bg-emerald-500' : 
                      booking.status === 'REJECTED' ? 'bg-rose-500' :
                      booking.status === 'PENDING' ? 'bg-amber-500' : 'bg-slate-300'
                    }`} />

                    <div className="flex-1 p-8 flex flex-col md:flex-row md:items-center justify-between gap-10">
                      <div className="flex-1 space-y-6">
                        <div className="flex items-center flex-wrap gap-3">
                          <span className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-md">
                            Ref: {booking.id.slice(-8).toUpperCase()}
                          </span>
                          <span className={`px-4 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest shadow-sm ${getStatusStyle(booking.status)}`}>
                            {booking.status}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-auto md:ml-0">
                            <Clock size={12} /> Received: {new Date(booking.startTime).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="text-2xl font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                          {booking.purpose}
                        </h3>

                        {/* Structured Metadata - Fixed Overlaps */}
                        <div className="flex flex-wrap items-center gap-y-4 gap-x-10 pt-4 border-t border-slate-50">
                           <div className="space-y-1">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Requesting Identity</p>
                             <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                               <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400"><User size={12} /></div>
                               {booking.userId}
                             </div>
                           </div>

                           <div className="space-y-1">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Asset Target</p>
                             <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                               <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-400 flex items-center justify-center"><Package size={12} /></div>
                               Asset #{booking.resourceId.slice(-6).toUpperCase()}
                             </div>
                           </div>

                           <div className="space-y-1">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Window</p>
                             <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                               <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-400 flex items-center justify-center"><Calendar size={12} /></div>
                               {new Date(booking.startTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                             </div>
                           </div>
                           
                           <button 
                              onClick={() => openDetails(booking)}
                              className="md:ml-auto flex items-center gap-2 px-5 py-2.5 bg-slate-50 hover:bg-indigo-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all active:scale-95"
                           >
                              <Eye size={14} /> Full Dossier
                           </button>
                        </div>
                      </div>

                      {/* Control Panel */}
                      <div className="w-full md:w-64 flex-shrink-0">
                        <AnimatePresence mode="wait">
                          {booking.status === 'PENDING' ? (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="flex flex-col gap-3"
                            >
                              <button
                                onClick={() => handleApprove(booking.id)}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/10"
                              >
                                Authorize Request
                              </button>
                              <button
                                onClick={() => setRejectionModal({ isOpen: true, bookingId: booking.id })}
                                className="w-full py-4 bg-white text-rose-500 border border-rose-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 transition-all"
                              >
                                Decline Provision
                              </button>
                            </motion.div>
                          ) : booking.status === 'APPROVED' ? (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="space-y-3"
                            >
                              <div className="px-6 py-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 flex items-center justify-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Active Sync</span>
                              </div>
                              <button
                                onClick={() => handleAdminCancel(booking.id)}
                                className="w-full py-3 text-slate-400 hover:text-rose-500 text-[9px] font-black uppercase tracking-[0.2em] transition-colors"
                              >
                                Force Override
                              </button>
                            </motion.div>
                          ) : booking.status === 'REJECTED' ? (
                            <div className="p-6 bg-rose-50/50 rounded-2xl border border-rose-100 italic text-[11px] text-rose-800 font-medium leading-relaxed line-clamp-3">
                              "{booking.rejectionReason}"
                            </div>
                          ) : (
                            <div className="text-center opacity-30 grayscale">
                              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Operation Terminated</span>
                            </div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
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

      <BookingDetailsModal 
        booking={selectedBooking}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </div>
  );
};

export default AdminBookingPage;
