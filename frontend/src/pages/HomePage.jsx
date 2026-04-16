import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Search, 
  MapPin, 
  Calendar, 
  Activity, 
  Cpu, 
  Globe, 
  BookOpen, 
  Warehouse, 
  Trophy, 
  Monitor,
  Layout,
  Users,
  ShieldCheck,
  Star,
  CheckCircle2,
  Building2,
  Atom,
  Palette,
  Music,
  Microscope,
  Mail,
  Phone,
  ChevronRight,
  BarChart3,
  ExternalLink,
  Users2,
  Clock,
  Compass,
  Zap,
  TrendingUp,
  Newspaper,
  CalendarDays,
  Play,
  GraduationCap,
  FlaskConical,
  LifeBuoy,
  History,
  HardHat,
  Command,
  HelpCircle,
  Bell,
  Fingerprint,
  FileText,
  Gavel,
  Scale
} from 'lucide-react';
import { Link } from 'react-router-dom';
import bookingService from '../services/bookingService';

const HomePage = () => {
  const [stats, setStats] = useState({ total: 124, approved: 86, pending: 12 });
  const [isScrolled, setIsScrolled] = useState(false);
  const targetRef = useRef(null);

  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 0.4], ["0%", "15%"]);
  const headingOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const headingScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    
    const fetchStats = async () => {
      try {
        const data = await bookingService.getStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching homepage stats:", error);
      }
    };
    fetchStats();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const intelligenceData = [
    { label: "Resource Efficiency", value: "94.2%", trend: "+2.4%", desc: "Optimization rating across all academic halls." },
    { label: "Research Uptime", value: "99.9%", trend: "Stable", desc: "Digital reservation stability for high-impact labs." },
    { label: "Community Engagement", value: "12.5K", trend: "+12%", desc: "Weekly unique interactions within the portal." }
  ];

  const newsItems = [
    {
      title: "Global Research Symposium 2026",
      category: "Academic Event",
      date: "Oct 24, 2026",
      desc: "Expanding resource allocation for the upcoming international symposium in the main glass atrium.",
      img: "/news-symposium.jpg"
    },
    {
      title: "New Quantum Computing Cluster",
      category: "Facility Update",
      date: "Oct 20, 2026",
      desc: "The Advanced Physics lab now accepts automated throughput bookings for the new quantum cluster.",
      img: "/lab.png"
    },
    {
      title: "Sustainable Campus Initiative",
      category: "News",
      date: "Oct 15, 2026",
      desc: "Optimizing room occupancy to reduce energy consumption by 15% across all smart facilities.",
      img: "/auditorium.png"
    }
  ];

  const personas = [
    { 
      role: "Student", 
      title: "Empowering the Learner", 
      desc: "Secure study pods, coordinate group projects, and access library resources in seconds.",
      cta: "Student Access",
      icon: <GraduationCap size={32} />
    },
    { 
      role: "Faculty", 
      title: "Architecting Knowledge", 
      desc: "Manage lecture halls, schedule advanced research labs, and coordinate academic symposiums.",
      cta: "Faculty Portal",
      icon: <Monitor size={32} />
    },
    { 
      role: "Staff", 
      title: "Optimizing Operations", 
      desc: "Oversee maintenance schedules, monitor facility health, and ensure campus-wide compliance.",
      cta: "Staff Console",
      icon: <HardHat size={32} />
    }
  ];

  return (
    <div className="bg-white min-h-screen selection:bg-indigo-100 selection:text-indigo-900 relative">
      <div className="grain-overlay" />
      
      {/* 🏛️ FLAGSHIP HERO: Institutional Landmark */}
      <section ref={targetRef} className="relative h-screen flex items-center overflow-hidden">
        <motion.div style={{ y: backgroundY }} className="absolute inset-0 z-0">
          <img 
            src="/campus-life.jpg" 
            alt="Campus" 
            className="w-full h-full object-cover scale-110"
          />
          <div className="absolute inset-0 bg-slate-900/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
        </motion.div>

        <div className="max-w-[1440px] mx-auto px-6 grid lg:grid-cols-2 gap-20 relative z-10 w-full pt-44 pb-20">
          <motion.div style={{ opacity: headingOpacity, scale: headingScale }}>
             <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
             >
                <div className="flex items-center gap-3 mb-12">
                   <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                      <Fingerprint size={16} />
                   </div>
                   <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/60">
                      Verified Academic Governance
                   </span>
                </div>
                
                <h1 className="text-8xl md:text-[145px] leading-prestige tracking-prestige text-white mb-14 drop-shadow-2xl">
                   Campus <br />
                   <span className="italic font-normal opacity-90 text-indigo-400">Intelligence</span> <br />
                   Redefined.
                </h1>
                
                <p className="max-w-md text-xl text-white/70 font-medium leading-relaxed mb-16">
                   Welcome to the definitive digital flagship for modern campus operations. An ecosystem built for trust, scale, and excellence.
                </p>

                <div className="flex items-center gap-10">
                   <Link to="/login" className="px-16 py-6 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-2xl active:scale-95 shadow-indigo-600/20">
                      Launch Portal
                   </Link>
                   <Link to="/availability" className="flex items-center gap-3 text-white font-bold text-xs uppercase tracking-[0.2em] group">
                      Facility Inventory <ArrowRight size={18} className="group-hover:translate-x-2 transition-all text-indigo-400" />
                   </Link>
                </div>
             </motion.div>
          </motion.div>

          {/* Persona Hub: High-End Interactive Gateways */}
          <div className="hidden lg:flex flex-col gap-6 items-end justify-center">
             {personas.map((persona, i) => (
                <motion.div 
                   key={i}
                   initial={{ opacity: 0, x: 100 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ duration: 1.2, delay: 0.5 + (i * 0.2), ease: [0.16, 1, 0.3, 1] }}
                   whileHover={{ x: -20 }}
                   className="w-[450px] p-8 glass-dark rounded-[2.5rem] border border-white/10 group cursor-pointer"
                >
                   <div className="flex items-start gap-6">
                      <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xl">
                         {persona.icon}
                      </div>
                      <div>
                         <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-2 block">{persona.role}</span>
                         <h3 className="text-xl text-white font-prestige mb-3">{persona.title}</h3>
                         <p className="text-white/40 text-xs leading-relaxed mb-6 group-hover:text-white/70 transition-colors">
                            {persona.desc}
                         </p>
                         <div className="flex items-center gap-2 text-[10px] font-black text-white/50 uppercase tracking-widest group-hover:text-white transition-colors">
                            {persona.cta} <ArrowRight size={12} className="text-indigo-400" />
                         </div>
                      </div>
                   </div>
                </motion.div>
             ))}
          </div>
        </div>
      </section>

      {/* 📊 OPERATIONS INTEL: The Live Brain (Phase 5 New) */}
      <section className="py-24 bg-white border-b border-slate-50 relative z-10 rounded-t-[5rem]">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-32 items-center mb-32">
               <div>
                  <span className="text-indigo-600 font-black tracking-widest uppercase text-[11px] mb-6 block underline underline-offset-8 decoration-indigo-200">System Vitality</span>
                  <h2 className="text-6xl font-prestige text-slate-900 leading-none mb-10">Campus Integrity <br />by the Numbers.</h2>
                  <p className="text-xl text-slate-500 font-medium leading-[1.8] max-w-lg">
                     Our portal is more than a booking tool—it is the operational brain of the campus, ensuring every asset is utilized to its maximum academic potential.
                  </p>
               </div>
               <div className="grid gap-8">
                  {intelligenceData.map((intel, i) => (
                     <div key={i} className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-2xl hover:border-transparent transition-all">
                        <div className="max-w-[60%]">
                           <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">{intel.label}</h4>
                           <p className="text-xs text-slate-400 font-medium leading-relaxed">{intel.desc}</p>
                        </div>
                        <div className="text-right">
                           <div className="text-4xl font-prestige text-slate-900 mb-1">{intel.value}</div>
                           <span className="text-[11px] font-black text-emerald-500 uppercase tracking-widest">{intel.trend}</span>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* 🏙️ LANDMARK SHOWCASE: Immersive Snap Gallery (Phase 5 New) */}
      <section className="py-20 bg-slate-100">
         <div className="max-w-[1440px] mx-auto px-6 mb-16 flex items-end justify-between">
            <div className="max-w-2xl">
               <span className="text-indigo-600 font-black tracking-widest uppercase text-[11px] mb-6 block">The Landmark Collection</span>
               <h2 className="text-7xl font-prestige text-slate-900 leading-tight">Architectural Excellence <br />Meets Digital Precision.</h2>
            </div>
            <div className="pb-4">
               <button className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-xl shadow-slate-200/50 hover:bg-slate-900 hover:text-white transition-all">
                  <Play size={24} fill="currentColor" />
               </button>
            </div>
         </div>
         
         <div className="grid lg:grid-cols-2 h-[1600px] gap-6 px-6">
            <div className="flex flex-col gap-6">
               <div className="h-[900px] rounded-[4rem] overflow-hidden relative group">
                  <img src="/auditorium.png" className="w-full h-full object-cover grayscale-0 group-hover:scale-105 transition-transform duration-[4s]" alt="Auditorium" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                  <div className="absolute bottom-16 left-16 text-white max-w-md">
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-6 block">Flagship Venue</span>
                     <h3 className="text-5xl font-prestige mb-6">The Glass Auditorium</h3>
                     <p className="text-white/60 font-medium leading-relaxed mb-10">A 500-seat masterpiece of academic architecture, optimized for global symposium letters and high-fidelity acoustics.</p>
                     <div className="flex gap-4">
                        <div className="px-6 py-3 bg-white/10 backdrop-blur-3xl rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/20">Solar Powered</div>
                        <div className="px-6 py-3 bg-white/10 backdrop-blur-3xl rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/20">Aura Certified</div>
                     </div>
                  </div>
               </div>
               <div className="h-[650px] bg-white rounded-[4rem] p-20 flex flex-col justify-between shadow-2xl">
                  <div>
                     <Trophy className="text-indigo-600 mb-10" size={48} />
                     <h3 className="text-4xl font-prestige text-slate-900 mb-8">Award Winning <br />Infrastructure.</h3>
                     <p className="text-slate-500 font-medium leading-relaxed text-lg">Recognized by the World Academic Design Council for the "Best Integrated Campus Experience 2026."</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-black text-indigo-600 uppercase tracking-widest">
                     Our Standards <ArrowRight size={18} />
                  </div>
               </div>
            </div>
            <div className="flex flex-col gap-6 pt-32">
               <div className="h-[650px] bg-slate-900 rounded-[4rem] p-20 flex flex-col justify-between text-white relative overflow-hidden">
                  <div className="relative z-10">
                     <Zap className="text-indigo-400 mb-10" size={48} fill="currentColor" />
                     <h3 className="text-4xl font-prestige mb-8">High-Velocity <br />Deployment.</h3>
                     <p className="text-white/50 font-medium leading-relaxed text-lg">Every lab booking is processed through our high-throughput cluster in under 120ms.</p>
                  </div>
                  <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/20 blur-[100px] rounded-full" />
                  <div className="flex items-center justify-between relative z-10">
                     <span className="text-[12px] font-black text-indigo-400 uppercase tracking-widest">Network Speed: 100Gbps</span>
                     <Activity size={24} className="text-white/20" />
                  </div>
               </div>
               <div className="h-[900px] rounded-[4rem] overflow-hidden relative group">
                  <img src="/lab.png" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[4s]" alt="Advanced Lab" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                  <div className="absolute bottom-16 left-16 text-white max-w-md">
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-6 block">Facility Hub</span>
                     <h3 className="text-5xl font-prestige mb-6">Quantum Research Center</h3>
                     <p className="text-white/60 font-medium leading-relaxed mb-10">Equipped with the next-generation Tesla H100 clusters, this facility is the core of our technical excellence.</p>
                     <div className="flex items-center gap-10">
                        <div className="text-center">
                           <div className="text-2xl font-prestige">54</div>
                           <div className="text-[9px] font-black uppercase text-white/40">Workstations</div>
                        </div>
                        <div className="w-px h-8 bg-white/20" />
                        <div className="text-center">
                           <div className="text-2xl font-prestige">99.9%</div>
                           <div className="text-[9px] font-black uppercase text-white/40">SLA Uptime</div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 🗞️ THE REVIEW: Magazine News Experience */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
           <div className="flex items-end justify-between mb-20 border-b border-slate-100 pb-12">
              <div className="max-w-xl">
                 <span className="text-indigo-600 font-black tracking-widest uppercase text-[11px] mb-4 block underline underline-offset-8 decoration-indigo-200">The Editorial Review</span>
                 <h2 className="text-7xl font-prestige text-slate-900 leading-[1.1] tracking-tighter">Insights from the <br />Campus Pulse</h2>
              </div>
              <div className="flex gap-4">
                 {[0,1].map(i => <div key={i} className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-indigo-600' : 'bg-slate-200'}`} />)}
              </div>
           </div>

           <div className="grid md:grid-cols-3 gap-16">
              {newsItems.map((item, i) => (
                 <motion.div 
                   key={i}
                   whileHover={{ y: -10 }}
                   className="group cursor-pointer"
                 >
                    <div className="h-[450px] rounded-[3.5rem] overflow-hidden mb-10 shadow-3xl relative border border-slate-100">
                       <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                       <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-all" />
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                       <span className="text-indigo-600">{item.category}</span>
                       <div className="w-1 h-1 bg-slate-300 rounded-full" />
                       <div className="flex items-center gap-1.5 uppercase font-medium">
                          <Clock size={12} className="text-indigo-400" />
                          {item.date}
                       </div>
                    </div>
                    <h3 className="text-4xl font-prestige text-slate-900 mb-6 group-hover:text-indigo-600 transition-all leading-[1.2]">
                       {item.title}
                    </h3>
                    <p className="text-slate-500 font-medium leading-[1.8] mb-12 text-base">
                       {item.desc}
                    </p>
                    <div className="padding-8 inline-flex items-center gap-3 text-xs font-black text-slate-900 group-hover:gap-6 transition-all border-b-2 border-slate-100 pb-2">
                       READ FULL STORY <ArrowRight size={16} className="text-indigo-600" />
                    </div>
                 </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* 🏁 THE LANDMARK FOOTER: Deep Governance Ecosystem */}
      <footer className="bg-slate-950 pt-40 pb-20 rounded-t-[6rem]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-20 mb-40">
            <div className="col-span-1 md:col-span-2">
               <div className="flex items-center gap-5 mb-12">
                  <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl">
                     <Layout size={32} />
                  </div>
                  <div>
                     <span className="text-3xl font-prestige text-white tracking-tight block">SmartCampus</span>
                     <span className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.3em]">Excellence Portal</span>
                  </div>
               </div>
               <p className="text-white/40 font-medium leading-[2] mb-12 max-w-sm text-lg">
                  Providing cutting-edge digital infrastructure for the world's most innovative academic environments. Integrated. Professional. Secure.
               </p>
               <div className="flex gap-4">
                  {[Globe, Mail, Activity, Phone].map((Icon, i) => (
                    <a key={i} href="#" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all border border-white/5">
                       <Icon size={20} />
                    </a>
                  ))}
               </div>
            </div>

            {[
              { 
                title: "Intel Ecosystem", 
                links: ["Resource Management", "Live Analytics", "Research Ops", "Staff Central"],
                icon: <Cpu size={16} className="text-indigo-400" />
              },
              { 
                title: "Institutional Info", 
                links: ["Campus Map", "Department Directory", "Academic Calendar", "Event Support"],
                icon: <FileText size={16} className="text-indigo-400" />
              },
              { 
                title: "Governance", 
                links: ["Legal & Privacy", "Accessibility (WCAG 2.2)", "Title II Compliance", "System Security"],
                icon: <Scale size={16} className="text-indigo-400" />
              }
            ].map((col, i) => (
              <div key={i}>
                <div className="flex items-center gap-3 mb-12">
                   {col.icon}
                   <h5 className="font-black text-white/90 text-[11px] uppercase tracking-[0.2em]">{col.title}</h5>
                </div>
                <ul className="space-y-6">
                  {col.links.map(l => (
                    <li key={l}><a href="#" className="text-white/30 font-medium hover:text-indigo-400 transition-all text-sm">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-12 pt-20 border-t border-white/5 text-[12px] text-white/20 font-medium">
             <div className="flex items-center gap-10">
                <span>© 2026 Smart Campus Operations. All Academic Rights Reserved.</span>
                <div className="flex items-center gap-6">
                   <a href="#" className="hover:text-white transition-all">SLA Uptime: 99.98%</a>
                   <div className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
                   <a href="#" className="hover:text-white transition-all">Encryption: TLS 1.3</a>
                </div>
             </div>
             <div className="flex items-center gap-5 px-8 py-3 bg-white/5 rounded-full border border-white/5">
                <ShieldCheck size={18} className="text-emerald-500" />
                <span className="text-white/40 uppercase tracking-widest text-[10px] font-black">Certified Digital Architecture</span>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
