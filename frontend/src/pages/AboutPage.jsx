import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Microscope, Users, Globe, ArrowRight, ShieldCheck, Mail, Phone, Activity } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="bg-white min-h-screen pt-40 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Institutional Hero */}
        <div className="grid lg:grid-cols-2 gap-20 items-center mb-40">
           <motion.div 
             initial={{ opacity: 0, x: -50 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 1.2 }}
           >
              <span className="text-indigo-600 font-black tracking-widest uppercase text-[11px] mb-8 block underline underline-offset-8 decoration-indigo-200">Institutional Governance</span>
              <h1 className="text-7xl font-prestige text-slate-900 leading-tight mb-12">Architecting the <br />Future of Higher <br />Education.</h1>
              <p className="text-xl text-slate-500 leading-relaxed font-medium max-w-lg mb-12">
                 The SmartCampus Excellence Portal is the definitive operational flagship of our institution. We integrate advanced AI resource allocation with human-centric design to ensure every academic asset is utilized to its highest potential.
              </p>
              <div className="flex gap-4">
                 <button className="px-10 py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all shadow-2xl">
                    View Governance Report
                 </button>
              </div>
           </motion.div>
           <div className="relative">
              <div className="h-[600px] rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-8 border-white">
                 <img src="/campus-life.jpg" className="w-full h-full object-cover" alt="Campus Life" />
              </div>
              <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-50">
                 <Activity size={48} className="text-indigo-600 mb-6" />
                 <div className="text-3xl font-prestige text-slate-900 mb-1">99.98%</div>
                 <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">SLA Efficiency</div>
              </div>
           </div>
        </div>

        {/* Pillars of Excellence */}
        <div className="grid md:grid-cols-3 gap-12 mb-40">
           {[
             { title: "Academic Scale", icon: <Globe size={32} />, desc: "Providing global-tier infrastructure for over 12,000 students and faculty." },
             { title: "Research Integrity", icon: <Microscope size={32} />, desc: "Ensuring high-fidelity resource uptime for mission-critical laboratories." },
             { title: "Operational Trust", icon: <ShieldCheck size={32} />, desc: "Rigorous governance and privacy standards at every digital touchpoint." }
           ].map((pillar, i) => (
              <div key={i} className="p-12 bg-slate-50 rounded-[3.5rem] border border-slate-100 group hover:bg-white hover:shadow-2xl transition-all">
                 <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-xl mb-10 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    {pillar.icon}
                 </div>
                 <h3 className="text-3xl font-prestige text-slate-900 mb-6">{pillar.title}</h3>
                 <p className="text-slate-500 font-medium leading-[1.8]">{pillar.desc}</p>
              </div>
           ))}
        </div>

        {/* Contact Strip */}
        <div className="p-20 bg-slate-950 rounded-[4rem] text-white flex flex-col md:flex-row items-center justify-between">
           <div>
              <h2 className="text-5xl font-prestige mb-4">Connect with Governance.</h2>
              <p className="text-white/40 font-medium">For media inquiries or policy discussions.</p>
           </div>
           <div className="flex gap-10 mt-10 md:mt-0">
              <div className="flex items-center gap-4">
                 <Mail className="text-indigo-400" size={24} />
                 <span className="text-sm font-black uppercase tracking-widest">governance@campus.edu</span>
              </div>
              <div className="flex items-center gap-4">
                 <Phone className="text-indigo-400" size={24} />
                 <span className="text-sm font-black uppercase tracking-widest">+1 (800) SC-PORTAL</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
