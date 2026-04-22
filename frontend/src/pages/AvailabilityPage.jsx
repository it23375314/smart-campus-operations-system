import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight,
  Search,
  Building2,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import availabilityService from '../services/availabilityService';
import resourceService from '../services/resourceService';

const AvailabilityPage = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resourcesLoading, setResourcesLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const data = await resourceService.getAllResources();
        setResources(data);
      } catch (error) {
        console.error("Error fetching resources:", error);
      } finally {
        setResourcesLoading(false);
      }
    };
    fetchResources();
  }, []);

  useEffect(() => {
    if (selectedResourceId && selectedDate) {
      handleSearch();
    }
  }, [selectedResourceId, selectedDate]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await availabilityService.getAvailability(selectedResourceId, selectedDate);
      setSlots(data);
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotClick = (slot) => {
    if (slot.status === 'BOOKED') {
      alert("This slot is already booked. Please select an available slot.");
      return;
    }
    
    // Redirect to booking form with pre-filled state
    // Note: The backend expects startTime/endTime as LocalDateTime strings (YYYY-MM-DDTHH:mm)
    const startTime = `${selectedDate}T${slot.startTime}`;
    const endTime = `${selectedDate}T${slot.endTime}`;
    
    navigate('/bookings', { 
      state: { 
        resourceId: selectedResourceId,
        startTime,
        endTime
      } 
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-40 pb-32 px-6 relative bg-blueprint">
      <div className="absolute inset-0 bg-slate-50/90 backdrop-blur-[2px] pointer-events-none" />
      <div className="grain-overlay" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="p-2 bg-indigo-600/10 rounded-lg text-indigo-600">
              <Sparkles size={16} />
            </div>
            <span className="text-indigo-600 font-black tracking-widest uppercase text-[11px] block underline underline-offset-8 decoration-indigo-200">Real-Time Inventory</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-7xl font-prestige text-slate-900 leading-tight mb-8"
          >
            Facility <br />Occupancy Scan.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl text-slate-500 font-medium max-w-2xl"
          >
            Interrogate our distributed infrastructure database to identify optimal reservation windows across the campus landmark network.
          </motion.p>
        </div>

        {/* Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-heavy bg-white/70 p-8 mb-16 rounded-[3rem] border border-white shadow-2xl flex flex-col md:flex-row gap-8 items-end"
        >
          <div className="flex-1 space-y-4 w-full">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
              <Building2 size={12} /> Target Resource
            </label>
            <select
              className="w-full px-6 py-4 bg-white/50 border border-white rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner cursor-pointer appearance-none"
              value={selectedResourceId}
              onChange={(e) => setSelectedResourceId(e.target.value)}
              disabled={resourcesLoading}
            >
              <option value="">Select a Resource...</option>
              {resources.map(res => (
                <option key={res.id} value={res.id}>{res.name} ({res.category})</option>
              ))}
            </select>
          </div>

          <div className="flex-1 space-y-4 w-full">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
              <CalendarDays size={12} /> Verification Date
            </label>
            <input
              type="date"
              className="w-full px-6 py-4 bg-white/50 border border-white rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="flex h-[58px] items-center gap-4 px-6 bg-slate-900/5 rounded-2xl border border-slate-900/5">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black uppercase text-slate-500">Available</span>
             </div>
             <div className="w-px h-4 bg-slate-200" />
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-[10px] font-black uppercase text-slate-500">Booked</span>
             </div>
          </div>
        </motion.div>

        {/* Slots Grid */}
        <div className="relative min-h-[400px]">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-8 shadow-inner"></div>
              <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Synchronizing Availability Matrix...</p>
            </div>
          ) : selectedResourceId ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {slots.map((slot, idx) => (
                <motion.div 
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ y: -5, scale: 1.02 }}
                  onClick={() => handleSlotClick(slot)}
                  className={`p-8 rounded-[2.5rem] border transition-all shadow-xl cursor-pointer group flex flex-col items-center justify-center text-center
                    ${slot.status === 'AVAILABLE' 
                      ? 'bg-white/70 border-white hover:bg-emerald-50 hover:border-emerald-200' 
                      : 'bg-slate-100/50 border-transparent grayscale opacity-50 cursor-not-allowed'}
                  `}
                >
                  <div className={`p-4 rounded-2xl mb-4 transition-all
                    ${slot.status === 'AVAILABLE' 
                      ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white' 
                      : 'bg-slate-200 text-slate-400'}
                  `}>
                    <Clock size={24} />
                  </div>
                  <div className={`text-xl font-prestige mb-2 transition-colors
                    ${slot.status === 'AVAILABLE' ? 'text-slate-900 group-hover:text-emerald-900' : 'text-slate-400'}
                  `}>
                    {slot.startTime} - {slot.endTime}
                  </div>
                  <div className={`text-[10px] font-black uppercase tracking-widest transition-colors
                    ${slot.status === 'AVAILABLE' ? 'text-emerald-500 group-hover:text-emerald-700' : 'text-rose-400'}
                  `}>
                    {slot.status}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="py-40 flex flex-col items-center justify-center text-center opacity-30">
              <Building2 size={64} className="text-slate-300 mb-8" />
              <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Select Resource Identity to Initialize Data Stream</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailabilityPage;
