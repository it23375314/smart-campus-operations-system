import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Shield, Zap, Globe, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 z-0" />
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" />
        
        <div className="container mx-auto px-4 z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold tracking-wide uppercase mb-6 inline-block">
              Smart Campus Operations
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-tight">
              Seamless Booking for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                A Smarter Campus
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Reserve classrooms, laboratories, and equipment in seconds. Our smart validation 
              ensures no conflicts, so you can focus on what matters.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/bookings" className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2 group">
                Reserve Now
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/availability" className="px-8 py-4 bg-white text-slate-700 font-bold rounded-2xl shadow-lg border border-slate-100 hover:bg-slate-50 transition-all">
                Check Availability
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Why SmartCampus?</h2>
          <p className="text-slate-500">Industry-leading features designed for students and staff.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Zap className="text-amber-500" />, title: "Instant Approval", desc: "Automated conflict check ensures your booking is confirmed immediately if the slot is free." },
            { icon: <Shield className="text-indigo-500" />, title: "Secure & Verified", desc: "Built-in smart validation prevents unauthorized access and double-bookings." },
            { icon: <Globe className="text-purple-500" />, title: "Cloud Integration", desc: "Access the system from anywhere on campus with real-time cloud synchronization." }
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="p-8 glass-card bg-white border border-slate-100 shadow-sm"
            >
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-900 py-20 rounded-[3rem] mx-4 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-600/10 skew-x-12" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-black mb-2 text-indigo-400">500+</div>
              <div className="text-slate-400 font-medium">Daily Bookings</div>
            </div>
            <div>
              <div className="text-4xl font-black mb-2 text-indigo-400">120+</div>
              <div className="text-slate-400 font-medium">Smart Rooms</div>
            </div>
            <div>
              <div className="text-4xl font-black mb-2 text-indigo-400">99.9%</div>
              <div className="text-slate-400 font-medium">Success Rate</div>
            </div>
            <div>
              <div className="text-4xl font-black mb-2 text-indigo-400">24/7</div>
              <div className="text-slate-400 font-medium">Availability</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
