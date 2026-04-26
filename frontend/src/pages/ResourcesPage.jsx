import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Building2, 
  Microscope, 
  Zap, 
  Users, 
  GraduationCap, 
  ChevronRight, 
  Filter,
  Sparkles,
  ArrowLeft,
  Activity,
  MoreHorizontal,
  Calendar,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import resourceService from '../services/resourceService';
import toast from 'react-hot-toast';

const ResourcesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const CATEGORIES = [
    { id: 'Auditorium', name: "Auditoriums", icon: <Building2 />, desc: "High-capacity venues for symposiums and major events.", img: "https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?q=80&w=1200" },
    { id: 'Laboratory', name: "Labs & Research", icon: <Microscope />, desc: "State-of-the-art facilities for technical and scientific research.", img: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?q=80&w=1200" },
    { id: 'Equipment', name: "Assets & Tools", icon: <Zap />, desc: "Specialized equipment and devices for academic projects.", img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200" },
    { id: 'Classroom', name: "Classrooms", icon: <GraduationCap />, desc: "Modern learning environments with smart infrastructure.", img: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1200" },
    { id: 'Sports', name: "Sports Facilities", icon: <Activity />, desc: "Professional athletic grounds and indoor sports arenas.", img: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200" }
  ];

  const [filters, setFilters] = useState({
    type: '',
    minCapacity: '',
    location: '',
    status: '',
    search: ''
  });
  const [selectedResource, setSelectedResource] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResources();
  }, [selectedCategory, filters]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const activeFilters = { ...filters };
      if (selectedCategory) activeFilters.category = selectedCategory.id;
      
      const data = await resourceService.getAllResources(activeFilters);
      setResources(data);
    } catch (err) {
      toast.error("Failed to retrieve campus assets.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (val) => {
    setFilters(prev => ({ ...prev, search: val }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      minCapacity: '',
      location: '',
      status: '',
      search: ''
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-40 pb-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-slate-50/20 backdrop-blur-[1px] pointer-events-none" />
      
      {/* Vibrant Colorful Background Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.15] pointer-events-none"
        style={{ 
          backgroundImage: 'url("/backgrounds/colorful-campus.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />
      <div className="grain-overlay" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <AnimatePresence mode="wait">
          {!selectedCategory ? (
            <motion.div
              key="categories"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.4 }}
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20">
                <div className="max-w-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles size={16} className="text-indigo-600" />
                    <span className="text-indigo-600 font-black tracking-widest uppercase text-[11px] block underline underline-offset-8 decoration-indigo-200">Campus Asset Registry</span>
                  </div>
                  <h1 className="text-7xl font-prestige text-slate-900 leading-tight mb-8">World-Class <br />Infrastructure.</h1>
                  <p className="text-lg text-slate-500 font-medium leading-relaxed">
                    Explore our architectural and technical landmarks across the distributed campus network. Our facilities are engineered for the highest academic excellence.
                  </p>
                </div>
                
                {/* Global Search in Category View */}
                <div className="flex items-center gap-4 glass-heavy bg-white/70 p-2 rounded-3xl border border-white/40 shadow-xl self-start md:self-end">
                  <div className="px-6 h-12 flex items-center gap-3 min-w-[320px]">
                    <Search size={16} className="text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Interrogate Global Registry..." 
                      className="text-[10px] font-black uppercase tracking-widest text-slate-900 bg-transparent outline-none w-full placeholder:text-slate-300"
                      value={filters.search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Grid */}
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {CATEGORIES.map((cat) => (
                  <motion.div 
                    layout
                    key={cat.id}
                    variants={itemVariants}
                    whileHover={{ y: -10 }}
                    onClick={() => setSelectedCategory(cat)}
                    className="p-10 glass-heavy bg-white/70 rounded-[3rem] border border-white transition-all cursor-pointer group hover:bg-slate-900"
                  >
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 mb-8 transition-all group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white shadow-lg">
                      {cat.icon}
                    </div>
                    <h3 className="text-2xl font-prestige mb-4 group-hover:text-white transition-colors">{cat.name}</h3>
                    <p className="text-sm font-medium opacity-60 leading-relaxed mb-8 group-hover:text-white/60 transition-colors">{cat.desc}</p>
                    <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-300 group-hover:border-white/20 group-hover:text-white group-hover:translate-x-2 transition-all">
                      <ChevronRight size={18} />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="resources"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Resource View Header */}
              <div className="mb-12">
                <button
                  onClick={() => { setSelectedCategory(null); clearFilters(); }}
                  className="flex items-center gap-3 text-indigo-600 font-black tracking-widest uppercase text-[11px] mb-8 group"
                >
                  <div className="w-8 h-8 rounded-full border border-indigo-100 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all mr-2">
                    <ArrowLeft size={14} />
                  </div>
                  Back to Categories
                </button>
                <div className="flex flex-col gap-8 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-6">
                    <div>
                      <h2 className="text-6xl font-prestige text-slate-900 leading-tight mb-4">{selectedCategory.name}</h2>
                      <p className="text-lg text-slate-500 font-medium max-w-2xl">{selectedCategory.desc}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 glass-heavy bg-white/70 p-2 rounded-3xl border border-white/40 shadow-xl">
                      <div className="px-6 h-12 flex items-center gap-3 min-w-[280px]">
                        <Search size={16} className="text-slate-400" />
                        <input 
                          type="text" 
                          placeholder={`Search in ${selectedCategory.name}...`} 
                          className="text-[10px] font-black uppercase tracking-widest text-slate-900 bg-transparent outline-none w-full"
                          value={filters.search}
                          onChange={(e) => handleSearchChange(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Operational Filters */}
                  <div className="flex flex-wrap gap-4 items-center">
                    <select 
                      value={filters.type}
                      onChange={(e) => setFilters({...filters, type: e.target.value})}
                      className="bg-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 border border-slate-200 outline-none hover:border-indigo-200 transition-all cursor-pointer shadow-sm"
                    >
                      <option value="">All Types</option>
                      <option value="ROOM">Institutional Room</option>
                      <option value="HALL">Grand Hall / Venue</option>
                      <option value="PROJECTOR">Digital Projector</option>
                      <option value="CAMERA">Surveillance / Camera</option>
                      <option value="INDOOR">Indoor Facility</option>
                      <option value="OUTDOOR">Outdoor Ground</option>
                    </select>

                    <select 
                      value={filters.status}
                      onChange={(e) => setFilters({...filters, status: e.target.value})}
                      className="bg-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 border border-slate-200 outline-none hover:border-indigo-200 transition-all cursor-pointer shadow-sm"
                    >
                      <option value="">Any Status</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="OUT_OF_SERVICE">OUT OF SERVICE</option>
                    </select>

                    <div className="relative">
                       <MapPin size={12} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                       <input 
                        type="text"
                        placeholder="Spatial Coord..."
                        value={filters.location}
                        onChange={(e) => setFilters({...filters, location: e.target.value})}
                        className="bg-white pl-12 pr-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 border border-slate-200 outline-none w-48 shadow-sm focus:border-indigo-200 transition-all"
                      />
                    </div>

                    <div className="relative">
                      <Users size={12} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input 
                        type="number"
                        placeholder="Min Threshold"
                        value={filters.minCapacity}
                        onChange={(e) => setFilters({...filters, minCapacity: e.target.value})}
                        className="bg-white pl-12 pr-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 border border-slate-200 outline-none w-44 shadow-sm focus:border-indigo-200 transition-all"
                      />
                    </div>

                    {(filters.type || filters.status || filters.minCapacity || filters.location || filters.search) && (
                      <button 
                        onClick={clearFilters}
                        className="text-[10px] font-black text-rose-600 uppercase tracking-widest px-4 py-2 hover:bg-rose-50 rounded-xl transition-all ml-2"
                      >
                        Reset Matrix
                      </button>
                    )}
                  </div>
                </div>
              </div>


              {/* Resource Cards */}
              {loading ? (
                <div className="py-40 text-center">
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="inline-block p-4 rounded-3xl bg-white shadow-xl"
                  >
                    <Sparkles className="text-indigo-600" size={32} />
                  </motion.div>
                  <p className="mt-6 text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Retrieving Resources...</p>
                </div>
              ) : resources.length > 0 ? (
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {resources.map((resource) => (
                    <motion.div
                      key={resource.id}
                      variants={itemVariants}
                      whileHover={{ y: -10 }}
                      className="group glass-heavy bg-white/70 rounded-[3rem] border border-white overflow-hidden flex flex-col shadow-xl hover:shadow-indigo-500/10 transition-all"
                    >
                      <div className="h-64 relative overflow-hidden bg-slate-200">
                        {resource.imageUrl ? (
                          <img src={resource.imageUrl} className="w-full h-full object-cover transition-transform duration-[4s] group-hover:scale-110" alt={resource.name} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Building2 size={48} />
                          </div>
                        )}
                        <div className="absolute top-6 left-6">
                           <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/40 shadow-lg ${
                             resource.status === 'AVAILABLE' ? 'bg-emerald-500/90 text-white' : 'bg-rose-500/90 text-white'
                           }`}>
                             {resource.status}
                           </span>
                        </div>
                      </div>
                      
                      <div className="p-10 flex-1 flex flex-col">
                        <div className="flex flex-col mb-6">
                          <h4 className="text-2xl font-prestige text-slate-900 mb-4">{resource.name}</h4>
                          <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-slate-400 text-[10px] font-black uppercase tracking-widest">
                               <MapPin size={12} className="text-indigo-500" />
                               {resource.location || "North Wing"}
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-slate-400 text-[10px] font-black uppercase tracking-widest">
                               <Users size={12} className="text-sky-500" />
                               Capacity: {resource.capacity}
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-slate-400 text-[10px] font-black uppercase tracking-widest">
                               <Activity size={12} className="text-rose-500" />
                               {resource.type || "Room"}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10 line-clamp-2">
                          {resource.description || "High-specification academic facility designed for elite performance and research."}
                        </p>
                        
                        <div className="mt-auto text-center">
                           <button 
                             onClick={() => setSelectedResource(resource)}
                             className="w-full inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
                           >
                              View Brief <ChevronRight size={12} />
                           </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="py-40 text-center bg-white/40 rounded-[4rem] border border-dashed border-slate-200">
                   <Users className="mx-auto text-slate-200 mb-6" size={48} />
                   <h3 className="text-2xl font-prestige text-slate-400">No resources found in this category.</h3>
                   <button onClick={() => setSelectedCategory(null)} className="mt-6 text-indigo-600 font-black uppercase tracking-widest text-[10px]">Back to Categories</button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Resource Details Modal */}
      <AnimatePresence>
        {selectedResource && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-5xl bg-white rounded-[4rem] overflow-hidden shadow-2xl flex flex-col md:flex-row relative"
            >
              <button 
                onClick={() => setSelectedResource(null)}
                className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-slate-900 z-10 hover:bg-white transition-all shadow-xl"
              >
                <ArrowLeft className="rotate-90 md:rotate-0" size={18} />
              </button>

              <div className="md:w-1/2 h-[400px] md:h-auto bg-slate-100">
                {selectedResource.imageUrl ? (
                  <img src={selectedResource.imageUrl} className="w-full h-full object-cover" alt={selectedResource.name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Building2 size={80} />
                  </div>
                )}
              </div>

              <div className="md:w-1/2 p-12 md:p-20 overflow-y-auto max-h-[90vh]">
                <div className="flex items-center gap-3 mb-8">
                  <span className="px-5 py-2 bg-indigo-50 text-indigo-600 text-[10px] font-black tracking-widest uppercase rounded-full border border-indigo-100">
                    {selectedResource.category}
                  </span>
                  <span className={`px-5 py-2 text-white text-[10px] font-black tracking-widest uppercase rounded-full shadow-lg ${
                    selectedResource.status === 'ACTIVE' || selectedResource.status === 'AVAILABLE' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}>
                    {selectedResource.status}
                  </span>
                </div>

                <h2 className="text-5xl font-prestige text-slate-900 mb-8">{selectedResource.name}</h2>
                
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
                      <p className="text-sm font-bold text-slate-900">{selectedResource.location || "Campus North Wing"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Capacity</p>
                      <p className="text-sm font-bold text-slate-900">{selectedResource.capacity} Persons</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                      <Activity size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Type</p>
                      <p className="text-sm font-bold text-slate-900 uppercase tracking-widest">{selectedResource.type || "Official Venue"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Asset Custodian</p>
                      <p className="text-sm font-bold text-slate-900">{selectedResource.managerName || "Institutional Office"}</p>
                    </div>
                  </div>
                </div>

                <p className="text-lg text-slate-500 font-medium leading-relaxed mb-12">
                  {selectedResource.description || "A premier institutional asset designed for multifaceted academic operations and high-end collaborative engagements."}
                </p>

                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => {
                      navigate(`/availability?resourceId=${selectedResource.id}`);
                      setSelectedResource(null);
                    }}
                    className="flex-1 min-w-[200px] h-16 bg-white border-2 border-slate-900 text-slate-900 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xl active:scale-95"
                  >
                    Check Availability
                  </button>
                  <button 
                    onClick={() => {
                      navigate('/bookings', { state: { resourceId: selectedResource.id } });
                      setSelectedResource(null);
                    }}
                    className={`flex-1 min-w-[200px] h-16 font-black text-[11px] uppercase tracking-widest rounded-3xl transition-all shadow-2xl ${
                      selectedResource.status === 'OUT_OF_SERVICE' 
                      ? 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200' 
                      : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-indigo-500/20 active:scale-95'
                    }`}
                    disabled={selectedResource.status === 'OUT_OF_SERVICE'}
                  >
                    {selectedResource.status === 'OUT_OF_SERVICE' ? 'Resource Unavailable' : 'Book Now'}
                  </button>
                </div>
                {selectedResource.status === 'OUT_OF_SERVICE' && (
                  <p className="mt-4 text-center text-rose-500 font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2">
                    <AlertCircle size={12} /> Institutional Notice: Resource is currently unavailable for synchronization.
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResourcesPage;
