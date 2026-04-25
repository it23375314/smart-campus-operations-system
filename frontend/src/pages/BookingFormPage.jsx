import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, FileText, Send, CheckCircle, Package, ArrowLeft, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import bookingService from '../services/bookingService';
import resourceService from '../services/resourceService';

const BookingFormPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const passedResourceId = location.state?.resourceId || '';

  const [formData, setFormData] = useState({
    resourceId: passedResourceId,
    bookingDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    attendees: 1
  });

  const [resources, setResources] = useState([]);
  const [resourceInfo, setResourceInfo] = useState(null);
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    fetchAllResources();
    if (passedResourceId) {
      fetchResourceDetails(passedResourceId);
    }
  }, [passedResourceId]);

  useEffect(() => {
    if (formData.resourceId && formData.bookingDate) {
      fetchAvailability(formData.resourceId, formData.bookingDate);
    } else {
      setAvailabilitySlots([]);
    }
  }, [formData.resourceId, formData.bookingDate]);

  const fetchAllResources = async () => {
    try {
      const data = await resourceService.getAllResources();
      setResources(data);
    } catch (err) {
      console.error("Failed to fetch resources list:", err);
    }
  };

  const fetchResourceDetails = async (id) => {
    try {
      const data = await resourceService.getResourceById(id);
      setResourceInfo(data);
    } catch (err) {
      console.error("Failed to fetch resource details:", err);
    }
  };

  const fetchAvailability = async (resId, date) => {
    try {
      const slots = await bookingService.getAvailability(resId, date);
      setAvailabilitySlots(slots);
    } catch (err) {
      console.error("Failed to fetch availability:", err);
    }
  };

  const validateForm = () => {
    const errors = {};
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (!formData.resourceId) errors.resourceId = "Institutional asset selection is mandatory.";
    if (!formData.bookingDate) errors.bookingDate = "A target reservation date must be declared.";
    if (formData.bookingDate < todayStr) errors.bookingDate = "Retroactive reservations are prohibited.";

    if (!formData.startTime) errors.startTime = "Start time is required.";
    if (!formData.endTime) errors.endTime = "End time is required.";

    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      errors.endTime = "Chronological violation: End time must follow start time.";
    }

    if (formData.bookingDate === todayStr && formData.startTime) {
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      const [h, m] = formData.startTime.split(':').map(Number);
      if (h < currentHour || (h === currentHour && m <= currentMin)) {
        errors.startTime = "Temporal constraint: Start time must exist in the future.";
      }
    }

    if (!formData.purpose || formData.purpose.trim().length < 5) {
      errors.purpose = "Comprehensive justification (minimum 5 characters) is required.";
    }

    if (formData.attendees <= 0) {
      errors.attendees = "Synchronization payload requires at least 1 attendee.";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const clientErrors = validateForm();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      toast.error("Form integrity check failed. Please correct the highlighted segments.");
      return;
    }

    setLoading(true);

    const userJson = localStorage.getItem('user');
    if (!userJson) {
      toast.error('Identity not verified. Please authenticat again.');
      setLoading(false);
      return;
    }

    const currentUser = JSON.parse(userJson);
    const startDateTime = `${formData.bookingDate}T${formData.startTime}:00`;
    const endDateTime = `${formData.bookingDate}T${formData.endTime}:00`;

    try {
      await bookingService.createBooking({
        resourceId: formData.resourceId,
        attendees: parseInt(formData.attendees),
        startTime: startDateTime,
        endTime: endDateTime,
        purpose: formData.purpose
      });

      toast.success('Resource synchronized successfully! Registry updated.');

      setFormData({
        resourceId: passedResourceId,
        bookingDate: '',
        startTime: '',
        endTime: '',
        purpose: '',
        attendees: 1
      });

    } catch (error) {
      if (error.response?.status === 400 && typeof error.response.data === 'object') {
        // Map Spring MethodArgumentNotValidException errors
        setFieldErrors(error.response.data);
        toast.error("Structural validation failure. See specific field metrics.");
      } else if (error.response?.status === 409) {
        toast.error("Temporal Conflict: Selected slot has active synchronization.");
      } else {
        toast.error(error.response?.data || error.message || "An unexpected synchronization error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-40 pb-20 relative overflow-hidden">
      {/* Architectural Background Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none grayscale"
        style={{ 
          backgroundImage: 'url("/backgrounds/architecture.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />
      
      <div className="absolute inset-0 bg-slate-50/60 backdrop-blur-[1px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <Link to="/resources" className="inline-flex items-center gap-2 text-indigo-600 font-black tracking-widest uppercase text-[10px] mb-8 hover:gap-3 transition-all">
          <ArrowLeft size={14} /> Back to Assets Matrix
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-heavy bg-white/70 p-10 rounded-[3.5rem] border border-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center gap-6 mb-12">
            <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl">
              <Calendar size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-prestige text-slate-900">Resource Registry.</h1>
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Formal Authorization Submission</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">

              {/* Resource Target */}
              <div className="space-y-4 col-span-1 md:col-span-2">
                <div className="flex justify-between items-end px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Distribution Target</label>
                  {fieldErrors.resourceId && <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter flex items-center gap-1"><AlertCircle size={10} /> {fieldErrors.resourceId}</span>}
                </div>
                <div className="relative">
                  <Package className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.resourceId ? 'text-rose-400' : 'text-slate-300'}`} size={18} />
                  <select
                    className={`w-full pl-14 pr-6 py-5 bg-white/70 border rounded-[2rem] font-bold text-slate-900 focus:ring-4 outline-none transition-all shadow-inner appearance-none cursor-pointer
                      ${fieldErrors.resourceId ? 'border-rose-200 focus:ring-rose-500/10 focus:border-rose-400' : 'border-white focus:ring-indigo-500/10 focus:border-indigo-500/30'}
                    `}
                    value={formData.resourceId}
                    onChange={(e) => {
                      setFieldErrors({ ...fieldErrors, resourceId: null });
                      setFormData({ ...formData, resourceId: e.target.value });
                      if (e.target.value) fetchResourceDetails(e.target.value);
                    }}
                    disabled={!!passedResourceId}
                  >
                    <option value="" disabled>Search organizational unit inventory...</option>
                    {resources.map(r => (
                      <option key={r.id} value={r.id}>{r.name} — {r.category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date */}
              <div className="space-y-4">
                <div className="flex justify-between items-end px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Temporal Anchor (Date)</label>
                  {fieldErrors.bookingDate && <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter flex items-center gap-1 text-right"><AlertCircle size={10} /> {fieldErrors.bookingDate}</span>}
                </div>
                <div className="relative">
                  <Calendar className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.bookingDate ? 'text-rose-400' : 'text-slate-300'}`} size={18} />
                  <input
                    type="date"
                    className={`w-full pl-14 pr-6 py-5 bg-white/70 border rounded-2xl font-bold text-slate-900 focus:ring-4 outline-none transition-all shadow-inner
                      ${fieldErrors.bookingDate ? 'border-rose-200 focus:ring-rose-500/10 focus:border-rose-400' : 'border-white focus:ring-indigo-500/10 focus:border-indigo-500/30'}
                    `}
                    value={formData.bookingDate}
                    onChange={(e) => {
                      setFieldErrors({ ...fieldErrors, bookingDate: null });
                      setFormData({ ...formData, bookingDate: e.target.value });
                    }}
                  />
                </div>
              </div>

              {/* Attendees */}
              <div className="space-y-4">
                <div className="flex justify-between items-end px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Synchronization Payload (Attendees)</label>
                  {fieldErrors.attendees && <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter flex items-center gap-1 text-right"><AlertCircle size={10} /> {fieldErrors.attendees}</span>}
                </div>
                <div className="relative">
                  <Users className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.attendees ? 'text-rose-400' : 'text-slate-300'}`} size={18} />
                  <input
                    type="number"
                    min="1"
                    className={`w-full pl-14 pr-6 py-5 bg-white/70 border rounded-2xl font-bold text-slate-900 focus:ring-4 outline-none transition-all shadow-inner
                      ${fieldErrors.attendees ? 'border-rose-200 focus:ring-rose-500/10 focus:border-rose-400' : 'border-white focus:ring-indigo-500/10 focus:border-indigo-500/30'}
                    `}
                    value={formData.attendees}
                    onChange={(e) => {
                      setFieldErrors({ ...fieldErrors, attendees: null });
                      setFormData({ ...formData, attendees: e.target.value });
                    }}
                  />
                </div>
              </div>

              {/* Times */}
              <div className="space-y-4">
                <div className="flex justify-between items-end px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initiation Time</label>
                  {fieldErrors.startTime && <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter flex items-center gap-1 text-right"><AlertCircle size={10} /> {fieldErrors.startTime}</span>}
                </div>
                <div className="relative">
                  <Clock className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.startTime ? 'text-rose-400' : 'text-slate-300'}`} size={18} />
                  <input
                    type="time"
                    className={`w-full pl-14 pr-6 py-5 bg-white/70 border rounded-2xl font-bold text-slate-900 focus:ring-4 outline-none transition-all shadow-inner
                      ${fieldErrors.startTime ? 'border-rose-200 focus:ring-rose-500/10 focus:border-rose-400' : 'border-white focus:ring-indigo-500/10 focus:border-indigo-500/30'}
                    `}
                    value={formData.startTime}
                    onChange={(e) => {
                      setFieldErrors({ ...fieldErrors, startTime: null });
                      setFormData({ ...formData, startTime: e.target.value });
                    }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Termination Time</label>
                  {fieldErrors.endTime && <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter flex items-center gap-1 text-right"><AlertCircle size={10} /> {fieldErrors.endTime}</span>}
                </div>
                <div className="relative">
                  <Clock className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.endTime ? 'text-rose-400' : 'text-slate-300'}`} size={18} />
                  <input
                    type="time"
                    className={`w-full pl-14 pr-6 py-5 bg-white/70 border rounded-2xl font-bold text-slate-900 focus:ring-4 outline-none transition-all shadow-inner
                      ${fieldErrors.endTime ? 'border-rose-200 focus:ring-rose-500/10 focus:border-rose-400' : 'border-white focus:ring-indigo-500/10 focus:border-indigo-500/30'}
                    `}
                    value={formData.endTime}
                    onChange={(e) => {
                      setFieldErrors({ ...fieldErrors, endTime: null });
                      setFormData({ ...formData, endTime: e.target.value });
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Live Availability Heatmap */}
            <AnimatePresence>
              {availabilitySlots.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-8 bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden"
                >
                  <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.3em] mb-6 flex items-center gap-2">
                    <Clock size={12} className="animate-pulse" /> Asset Occupancy Heatmap
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {availabilitySlots.map((slot, i) => (
                      <div key={i} className={`p-3 rounded-2xl text-center border text-[10px] font-bold tracking-widest transition-all ${slot.status === 'AVAILABLE'
                          ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-indigo-500 hover:text-white'
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-500 shadow-[inset_0_0_10px_rgba(244,63,94,0.05)]'
                        }`}>
                        <div>{slot.startTime}</div>
                        <div className="opacity-40 text-[7px] uppercase mt-1 tracking-tighter">{slot.status}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Purpose */}
            <div className="space-y-4">
              <div className="flex justify-between items-end px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Authorization Justification / Purpose</label>
                {fieldErrors.purpose && <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter flex items-center gap-1 text-right"><AlertCircle size={10} /> {fieldErrors.purpose}</span>}
              </div>
              <textarea
                rows="4"
                placeholder="Declare the strategic or academic intent of this resource synchronization..."
                className={`w-full px-8 py-5 bg-white/70 border rounded-[2.5rem] font-bold text-slate-900 focus:ring-4 outline-none transition-all shadow-inner resize-none
                    ${fieldErrors.purpose ? 'border-rose-200 focus:ring-rose-500/10 focus:border-rose-400' : 'border-white focus:ring-indigo-500/10 focus:border-indigo-500/30'}
                `}
                value={formData.purpose}
                onChange={(e) => {
                  setFieldErrors({ ...fieldErrors, purpose: null });
                  setFormData({ ...formData, purpose: e.target.value });
                }}
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-slate-900 text-white font-black uppercase tracking-[0.4em] text-[12px] rounded-[2.5rem] shadow-2xl transition-all hover:bg-indigo-600 hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 group flex items-center justify-center gap-4 relative overflow-hidden"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Commit Synchronization Cycle
                  <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
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
