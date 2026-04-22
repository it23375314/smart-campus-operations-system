import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, FileText, Send, CheckCircle, Package, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import bookingService from '../services/bookingService';

const BookingFormPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const passedResourceId = location.state?.resourceId || '';
  const passedStartTime = location.state?.startTime || '';
  const passedEndTime = location.state?.endTime || '';

  const [formData, setFormData] = useState({
    resourceId: passedResourceId,
    startTime: passedStartTime,
    endTime: passedEndTime,
    purpose: '',
    attendees: 1
  });

  const [resourceInfo, setResourceInfo] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [fetchingResource, setFetchingResource] = useState(!!passedResourceId);

  useEffect(() => {
    if (passedResourceId) {
      fetchResourceDetails(passedResourceId);
    }
  }, [passedResourceId]);

  const fetchResourceDetails = async (id) => {
    setFetchingResource(true);
    try {
      const res = await axios.get(`http://localhost:8085/api/resources/${id}`);
      setResourceInfo(res.data);
    } catch (err) {
      console.error("Failed to fetch resource details:", err);
    } finally {
      setFetchingResource(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    // Get current user from localStorage
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      setStatus({ type: 'error', message: 'User not authenticated. Please login again.' });
      setLoading(false);
      return;
    }

    const currentUser = JSON.parse(userJson);

    try {
      await bookingService.createBooking({
        ...formData,
        userId: currentUser.id,
        resourceId: formData.resourceId,
        attendees: parseInt(formData.attendees),
        startTime: formData.startTime.replace(' ', 'T'),
        endTime: formData.endTime.replace(' ', 'T')
      });
      setStatus({ type: 'success', message: 'Booking created successfully! Pending approval.' });
      
      // Clear form except for resource if it was passed
      setFormData({
        resourceId: passedResourceId,
        startTime: '',
        endTime: '',
        purpose: '',
        attendees: 1
      });
      
      // Redirect after short delay
      setTimeout(() => navigate('/my-bookings'), 2000);
      
    } catch (error) {
      const errorMsg = error.response?.data || error.message;
      setStatus({ 
        type: 'error', 
        message: typeof errorMsg === 'object' ? Object.values(errorMsg).join(', ') : errorMsg 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-40 pb-20 relative overflow-hidden bg-blueprint">
      <div className="absolute inset-0 bg-slate-50/95 backdrop-blur-[1px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <Link to="/resources" className="inline-flex items-center gap-2 text-indigo-600 font-black tracking-widest uppercase text-[10px] mb-8 hover:gap-3 transition-all">
          <ArrowLeft size={14} /> Back to Assets
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-heavy bg-white/70 p-10 rounded-[3rem] border border-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center gap-6 mb-12">
            <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl">
              <Calendar size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-prestige text-slate-900">Resource Registration</h1>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Reserve Excellence for your next project</p>
            </div>
          </div>

          {/* Selected Resource Info Card */}
          {resourceInfo && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-10 p-6 bg-slate-900 rounded-3xl text-white flex items-center gap-6 border border-slate-800 shadow-2xl"
            >
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-800 flex-shrink-0">
                {resourceInfo.imageUrl ? (
                  <img src={resourceInfo.imageUrl} className="w-full h-full object-cover" alt={resourceInfo.name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    <Package size={30} />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-1 block">Requesting Access to</span>
                <h3 className="text-xl font-prestige">{resourceInfo.name}</h3>
                <div className="flex items-center gap-4 mt-2">
                   <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                     <Users size={12} /> {resourceInfo.capacity} Capacity
                   </div>
                   <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                     <Package size={12} /> {resourceInfo.category}
                   </div>
                </div>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {!passedResourceId && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Reference ID</label>
                  <div className="relative">
                    <FileText className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                      type="text"
                      placeholder="e.g. 65f...123"
                      className="w-full pl-14 pr-6 py-4 bg-white/70 border border-white rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 outline-none transition-all shadow-inner"
                      value={formData.resourceId}
                      onChange={(e) => setFormData({...formData, resourceId: e.target.value})}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expected Attendance</label>
                <div className="relative">
                  <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="number"
                    min="1"
                    className="w-full pl-14 pr-6 py-4 bg-white/70 border border-white rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 outline-none transition-all shadow-inner"
                    value={formData.attendees}
                    onChange={(e) => setFormData({...formData, attendees: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Commencement Time</label>
                <div className="relative">
                  <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="datetime-local"
                    className="w-full pl-14 pr-6 py-4 bg-white/70 border border-white rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 outline-none transition-all shadow-inner"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Conclusion Time</label>
                <div className="relative">
                  <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="datetime-local"
                    className="w-full pl-14 pr-6 py-4 bg-white/70 border border-white rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 outline-none transition-all shadow-inner"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Executive Summary / Purpose</label>
              <textarea
                rows="4"
                placeholder="Briefly state the research or administrative justification for this reservation..."
                className="w-full px-6 py-4 bg-white/70 border border-white rounded-[2rem] font-medium text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 outline-none transition-all shadow-inner resize-none"
                value={formData.purpose}
                onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                required
              ></textarea>
            </div>

            {status.message && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-6 rounded-[2rem] flex items-center gap-4 ${
                  status.type === 'success' 
                    ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-700 border border-rose-500/20'
                }`}
              >
                <CheckCircle size={24} />
                <p className="text-sm font-bold uppercase tracking-widest">{status.message}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-slate-900 text-white font-black uppercase tracking-[0.3em] text-[11px] rounded-[2rem] shadow-2xl transition-all hover:bg-slate-800 hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 group flex items-center justify-center gap-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Submit Authorization Request
                  <Send size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default BookingFormPage;
