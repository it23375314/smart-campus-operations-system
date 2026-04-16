import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, X, Info, Clock, Search, Filter, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import bookingService from '../services/bookingService';

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [reason, setReason] = useState("");
  
  // Filters
  const [filters, setFilters] = useState({
    userId: '',
    resourceId: '',
    status: ''
  });

  const fetchBookings = async (appliedFilters = {}) => {
    setLoading(true);
    try {
      const data = await bookingService.getAllBookings(appliedFilters);
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

  const handleApplyFilters = () => {
    const activeFilters = {};
    if (filters.userId) activeFilters.userId = filters.userId;
    if (filters.resourceId) activeFilters.resourceId = filters.resourceId;
    if (filters.status) activeFilters.status = filters.status;
    fetchBookings(activeFilters);
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'approve') {
        await bookingService.approveBooking(id);
      } else if (action === 'reject') {
        if (!reason) {
          alert("Please provide a rejection reason.");
          return;
        }
        await bookingService.rejectBooking(id, reason);
        setRejectingId(null);
        setReason("");
      }
      fetchBookings();
    } catch (error) {
      alert(`Failed to ${action} booking: ` + error.message);
    }
  };

  const currentUser = JSON.parse(localStorage.getItem('user'));
  const isAdmin = currentUser?.role === 'ADMIN';
  const isManager = currentUser?.role === 'MANAGER';

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-slate-900 text-white rounded-[2rem] shadow-xl">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Operations Control</h1>
            <p className="text-slate-500 font-medium">Global authority view for resource management.</p>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-300" size={16} />
            <input 
              type="text" 
              placeholder="User ID" 
              className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm w-28 focus:ring-2 focus:ring-indigo-500"
              value={filters.userId}
              onChange={(e) => setFilters({...filters, userId: e.target.value})}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-2.5 text-slate-300" size={16} />
            <select 
              className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm w-36 focus:ring-2 focus:ring-indigo-500 appearance-none"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <button 
            onClick={handleApplyFilters}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all"
          >
            Apply
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                <th className="px-8 py-5">RESOURCE</th>
                <th className="px-8 py-5">ORDERED BY</th>
                <th className="px-8 py-5">TIME BLOCK</th>
                <th className="px-8 py-5">STATUS</th>
                <th className="px-8 py-5 text-center">DECISION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-300">
                      <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                      <span className="font-black text-xs uppercase tracking-widest">Loading Records</span>
                    </div>
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-bold italic">
                    No matching bookings found.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="px-8 py-6">
                      <div className="font-black text-slate-800">RES-{booking.resourceId}</div>
                      <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Info size={10} /> {booking.purpose}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-bold text-slate-600">ID: {booking.userId}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-xs font-black text-slate-800 uppercase">
                        {new Date(booking.startTime).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 mt-1">
                        {new Date(booking.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - {new Date(booking.endTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                        booking.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                        booking.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        booking.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {booking.status}
                      </span>
                      {booking.rejectionReason && (
                        <div className="text-[10px] text-rose-400 font-bold mt-1 max-w-[150px] truncate" title={booking.rejectionReason}>
                          Reason: {booking.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-2">
                        {booking.status === 'PENDING' && isAdmin ? (
                          <>
                            <button
                              onClick={() => handleAction(booking.id, 'approve')}
                              className="p-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
                              title="Approve"
                            >
                              <Check size={18} strokeWidth={3} />
                            </button>
                            <button
                              onClick={() => setRejectingId(booking.id)}
                              className="p-3 bg-rose-500 text-white rounded-2xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-100"
                              title="Reject"
                            >
                              <X size={18} strokeWidth={3} />
                            </button>
                          </>
                        ) : isManager ? (
                          <div className="text-[10px] font-black text-amber-500 flex items-center gap-1 uppercase tracking-widest">
                            <AlertCircle size={14} /> Read Only
                          </div>
                        ) : (
                          <span className="text-xs text-slate-200 italic font-bold">LOCKED</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rejection Modal */}
      <AnimatePresence>
        {rejectingId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full border border-slate-100"
            >
              <h3 className="text-xl font-black text-slate-900 mb-2">Rejection Reason</h3>
              <p className="text-slate-500 text-sm mb-6">Explain why this booking is being declined.</p>
              
              <textarea
                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-rose-500 mb-6 h-32 resize-none"
                placeholder="Overlapping with campus event..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setRejectingId(null)}
                  className="flex-1 py-3 bg-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAction(rejectingId, 'reject')}
                  className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-100"
                >
                  Confirm Reject
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
