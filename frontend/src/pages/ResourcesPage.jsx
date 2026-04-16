import React from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Building2, Microscope, Zap, Users, GraduationCap, ChevronRight, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const ResourcesPage = () => {
  const resourceCategories = [
    { name: "Auditoriums", count: 8, icon: <Building2 />, desc: "High-capacity venues for symposiums and events.", img: "/auditorium.png" },
    { name: "Research Labs", count: 54, icon: <Microscope />, desc: "Specialized facilities with quantum-ready clusters.", img: "/lab.png" },
    { name: "Study Pods", count: 120, icon: <GraduationCap />, desc: "Private, soundproof spaces for deep academic focus.", img: "/campus-life.jpg" },
    { name: "Collaborative Hubs", count: 15, icon: <Users />, desc: "Dynamic zones for group research and brainstorming.", img: "/news-symposium.jpg" }
  ];

  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-40">
      <div className="max-w-7xl mx-auto px-6">
        {/* Gallery Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20">
           <div className="max-w-xl">
              <span className="text-indigo-600 font-black tracking-widest uppercase text-[11px] mb-6 block underline underline-offset-8 decoration-indigo-200">Campus Asset Registry</span>
              <h1 className="text-7xl font-prestige text-slate-900 leading-tight mb-8">World-Class <br />Infrastructure.</h1>
              <p className="text-lg text-slate-500 font-medium leading-relaxed">
                 Explore the architectural and technical landmarks available across our distributed campus network. Our facilities are engineered for the highest academic standards.
              </p>
           </div>
           <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm mb-4">
              <div className="px-6 py-2 h-12 flex items-center gap-2 border-r border-slate-100">
                 <Filter size={16} className="text-slate-400" />
                 <span className="text-xs font-black uppercase text-slate-900 tracking-widest">Filter by Type</span>
              </div>
              <div className="px-6 h-12 flex items-center gap-3">
                 <Search size={16} className="text-slate-400" />
                 <input type="text" placeholder="Search resources..." className="text-xs font-bold text-slate-900 bg-transparent outline-none w-40" />
              </div>
           </div>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-32">
           {resourceCategories.map((cat, i) => (
             <div key={i} className="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:bg-slate-900 hover:text-white transition-all cursor-pointer">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-8 transition-colors group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-xl">
                   {cat.icon}
                </div>
                <h3 className="text-2xl font-prestige mb-4">{cat.name}</h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 group-hover:text-amber-400 mb-6">{cat.count} Active Units</span>
                <p className="text-sm font-medium opacity-60 leading-relaxed mb-8">{cat.desc}</p>
                <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:border-white/20 group-hover:text-white transition-all">
                   <ChevronRight size={18} />
                </div>
             </div>
           ))}
        </div>

        {/* Visual Showcase */}
        <div className="grid md:grid-cols-2 gap-10">
           {resourceCategories.slice(0, 2).map((item, i) => (
             <div key={i} className="h-[600px] rounded-[4rem] overflow-hidden relative group cursor-pointer shadow-2xl">
                <img src={item.img} className="w-full h-full object-cover transition-transform duration-[5s] group-hover:scale-110" alt={item.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-16 left-16 text-white max-w-sm">
                   <h3 className="text-5xl font-prestige mb-6">{item.name}</h3>
                   <p className="text-white/60 font-medium leading-relaxed mb-10">Experience the cutting edge of academic resource governance.</p>
                   <Link to="/availability" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                      Check Real-Time Availability <Zap size={14} fill="currentColor" />
                   </Link>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;
