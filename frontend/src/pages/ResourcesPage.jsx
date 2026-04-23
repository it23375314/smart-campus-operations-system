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
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const ResourcesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const CATEGORIES = [
    { id: 'Auditorium', name: "Auditoriums", icon: <Building2 />, desc: "High-capacity venues for symposiums and major events.", img: "https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?q=80&w=1200" },
    { id: 'Laboratory', name: "Research Labs", icon: <Microscope />, desc: "State-of-the-art facilities for technical and scientific research.", img: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?q=80&w=1200" },
    { id: 'Equipment', name: "Assets & Tools", icon: <Zap />, desc: "Specialized equipment and devices for academic projects.", img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200" },
    { id: 'Classroom', name: "Classrooms", icon: <GraduationCap />, desc: "Modern learning environments with smart infrastructure.", img: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1200" },
    { id: 'Sports', name: "Sports Facilities", icon: <Activity />, desc: "Professional athletic grounds and indoor sports arenas.", img: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200" },
    { id: 'Other', name: "Miscellaneous", icon: <MoreHorizontal />, desc: "Various other campus resources and shared spaces.", img: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200" }
  ];

  useEffect(() => {
    if (selectedCategory) {
      fetchResources();
    }
  }, [selectedCategory]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/resources?category=${selectedCategory.id}`);
      setResources(res.data);
    } catch (err) {
      console.error("Failed to fetch resources:", err);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const filteredResources = resources.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-slate-50 min-h-screen pt-40 pb-40 relative overflow-hidden bg-blueprint">
      <div className="absolute inset-0 bg-slate-50/95 backdrop-blur-[1px] pointer-events-none" />
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
                  onClick={() => setSelectedCategory(null)}
                  className="flex items-center gap-3 text-indigo-600 font-black tracking-widest uppercase text-[11px] mb-8 group"
                >
                  <div className="w-8 h-8 rounded-full border border-indigo-100 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all mr-2">
                    <ArrowLeft size={14} />
                  </div>
                  Back to Categories
                </button>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                  <div>
                    <h2 className="text-6xl font-prestige text-slate-900 leading-tight mb-4">{selectedCategory.name}</h2>
                    <p className="text-lg text-slate-500 font-medium max-w-2xl">{selectedCategory.desc}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 glass-heavy bg-white/70 p-2 rounded-2xl border border-white/40 shadow-xl">
                    <div className="px-6 h-12 flex items-center gap-3 min-w-[300px]">
                      <Search size={16} className="text-slate-400" />
                      <input 
                        type="text" 
                        placeholder={`Search in ${selectedCategory.name}...`} 
                        className="text-xs font-bold text-slate-900 bg-transparent outline-none w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
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
              ) : filteredResources.length > 0 ? (
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {filteredResources.map((resource) => (
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
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h4 className="text-2xl font-prestige text-slate-900 mb-2">{resource.name}</h4>
                            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                               <Users size={12} className="text-indigo-500" />
                               Capacity: {resource.capacity}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10 line-clamp-2">
                          {resource.description || "High-specification academic facility designed for elite performance and research."}
                        </p>
                        
                        <div className="mt-auto flex items-center justify-between">
                           <Link 
                             to="/bookings" 
                             state={{ resourceId: resource.id }}
                             className="inline-flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                           >
                              Book Space <Zap size={12} fill="currentColor" />
                           </Link>
                           <div className="text-[10px] font-black text-slate-200 group-hover:text-indigo-600 transition-colors uppercase tracking-widest">
                             Prestige Series
                           </div>
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
    </div>
  );
};

export default ResourcesPage;
