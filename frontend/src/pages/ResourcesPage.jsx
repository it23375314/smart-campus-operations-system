import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ResourcesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const resourceCategories = [
    { name: "Auditoriums", count: 8, icon: <Building2 />, desc: "High-capacity venues for symposiums and events.", img: "/auditorium.png", accent: "bg-indigo-600" },
    { name: "Research Labs", count: 54, icon: <Microscope />, desc: "Specialized facilities with quantum-ready clusters.", img: "/lab.png", accent: "bg-rose-500" },
    { name: "Study Pods", count: 120, icon: <GraduationCap />, desc: "Private, soundproof spaces for deep academic focus.", img: "/campus-life.jpg", accent: "bg-indigo-600" },
    { name: "Collaborative Hubs", count: 15, icon: <Users />, desc: "Dynamic zones for group research and brainstorming.", img: "/news-symposium.jpg", accent: "bg-amber-500" }
  ];

  const filteredCategories = resourceCategories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-40 pb-40 relative overflow-hidden bg-blueprint">
      <div className="absolute inset-0 bg-slate-50/95 backdrop-blur-[1px] pointer-events-none" />
      <div className="grain-overlay" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Gallery Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20">
           <motion.div 
             initial={{ opacity: 0, x: -30 }}
             animate={{ opacity: 1, x: 0 }}
             className="max-w-xl"
           >
              <div className="flex items-center gap-3 mb-6">
                <Sparkles size={16} className="text-indigo-600" />
                <span className="text-indigo-600 font-black tracking-widest uppercase text-[11px] block underline underline-offset-8 decoration-indigo-200">Campus Asset Registry</span>
              </div>
              <h1 className="text-7xl font-prestige text-slate-900 leading-tight mb-8">World-Class <br />Infrastructure.</h1>
              <p className="text-lg text-slate-500 font-medium leading-relaxed">
                 Explore the architectural and technical landmarks available across our distributed campus network. Our facilities are engineered for the highest academic standards.
              </p>
           </motion.div>
           
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="flex items-center gap-4 glass-heavy p-2 rounded-2xl border border-white/40 shadow-xl mb-4"
           >
              <div className="px-6 py-2 h-12 flex items-center gap-2 border-r border-slate-200/50">
                 <Filter size={16} className="text-slate-400" />
                 <span className="text-xs font-black uppercase text-slate-900 tracking-widest">Filter</span>
              </div>
              <div className="px-6 h-12 flex items-center gap-3">
                 <Search size={16} className="text-slate-400" />
                 <input 
                   type="text" 
                   placeholder="Search assets..." 
                   className="text-xs font-bold text-slate-900 bg-transparent outline-none w-48"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
              </div>
           </motion.div>
        </div>

        {/* Categories Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32"
        >
           <AnimatePresence mode='popLayout'>
             {filteredCategories.map((cat) => (
               <motion.div 
                 layout
                 key={cat.name}
                 variants={itemVariants}
                 initial="hidden"
                 animate="visible"
                 exit={{ opacity: 0, scale: 0.9 }}
                 whileHover={{ y: -10 }}
                 className="p-10 glass-heavy rounded-[3rem] border border-white transition-all cursor-pointer group hover:bg-slate-900 hover:border-slate-800"
               >
                  <div className={`w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 mb-8 transition-all group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white shadow-lg`}>
                     {cat.icon}
                  </div>
                  <h3 className="text-2xl font-prestige mb-4 group-hover:text-white transition-colors">{cat.name}</h3>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 group-hover:text-amber-400 mb-6 block">{cat.count} Active Units</span>
                  <p className="text-sm font-medium opacity-60 leading-relaxed mb-8 group-hover:text-white/60 transition-colors">{cat.desc}</p>
                  <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-300 group-hover:border-white/20 group-hover:text-white group-hover:translate-x-2 transition-all">
                     <ChevronRight size={18} />
                  </div>
               </motion.div>
             ))}
           </AnimatePresence>
        </motion.div>

        {/* Visual Showcase */}
        <div className="grid md:grid-cols-2 gap-10">
           {resourceCategories.slice(0, 2).map((item, i) => (
             <motion.div 
               key={i} 
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="h-[600px] rounded-[4rem] overflow-hidden relative group cursor-pointer shadow-3xl border border-white"
             >
                <img src={item.img} className="w-full h-full object-cover transition-transform duration-[6s] group-hover:scale-110" alt={item.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />
                <div className="absolute bottom-16 left-16 text-white max-w-sm">
                   <div className="flex items-center gap-3 mb-4 opacity-60">
                      <div className="w-8 h-px bg-white" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Featured Asset</span>
                   </div>
                   <h3 className="text-5xl font-prestige mb-6">{item.name}</h3>
                   <p className="text-white/60 font-medium leading-relaxed mb-10">Experience the cutting edge of academic resource governance with our flagship facilities.</p>
                   <Link to="/availability" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all shadow-2xl active:scale-95">
                      Check Real-Time Availability <Zap size={14} fill="currentColor" />
                   </Link>
                </div>
             </motion.div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;
