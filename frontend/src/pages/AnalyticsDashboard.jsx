import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  FileText, 
  TrendingUp, 
  BarChart3,
  CalendarDays,
  Target
} from 'lucide-react';
import analyticsService from '../services/analyticsService';

const AnalyticsDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [popularResources, setPopularResources] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [sum, pop, peak] = await Promise.all([
          analyticsService.getSummary(),
          analyticsService.getPopularResources(),
          analyticsService.getPeakHours()
        ]);
        setSummary(sum);
        setPopularResources(pop);
        setPeakHours(peak);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Synchronizing Intelligence Engine...</p>
      </div>
    );
  }

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

  return (
    <div className="bg-slate-50 min-h-screen pt-40 pb-32 px-6 relative bg-blueprint">
      <div className="absolute inset-0 bg-slate-50/90 backdrop-blur-[2px] pointer-events-none" />
      <div className="grain-overlay" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="p-2 bg-indigo-600/10 rounded-lg text-indigo-600">
              <TrendingUp size={16} />
            </div>
            <span className="text-indigo-600 font-black tracking-widest uppercase text-[11px] block underline underline-offset-8 decoration-indigo-200">Institutional Insights</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-7xl font-prestige text-slate-900 leading-tight mb-8"
          >
            Strategic <br />Operational Analytics.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl text-slate-500 font-medium max-w-2xl"
          >
            Evaluate institutional utilization patterns and synchronization performance through real-time resource telemetry.
          </motion.p>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {[
            { label: 'Total Volume', value: summary?.total, icon: FileText, color: 'text-slate-600', bg: 'bg-slate-100' },
            { label: 'Approval Yield', value: `${summary?.approvalRatio.toFixed(1)}%`, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100' },
            { label: 'Pending Queue', value: summary?.pending, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-100' },
            { label: 'Reject Rate', value: summary?.rejected, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-100' },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-heavy bg-white/70 p-8 rounded-[2.5rem] border border-white shadow-xl flex items-start justify-between group hover:border-indigo-100 transition-all"
            >
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{card.label}</p>
                <h4 className="text-4xl font-prestige text-slate-900">{card.value}</h4>
              </div>
              <div className={`p-4 ${card.bg} ${card.color} rounded-2xl group-hover:scale-110 transition-transform shadow-inner`}>
                <card.icon size={24} />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Popular Resources Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-heavy bg-white/70 p-10 rounded-[3rem] border border-white shadow-2xl"
          >
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-prestige text-slate-900 flex items-center gap-3">
                  <Target size={24} className="text-indigo-600" />
                  Asset Demand Distribution
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Targeting top 5 institutional resources</p>
              </div>
            </div>
            
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popularResources} layout="vertical" margin={{ left: 40, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="resourceName" 
                    type="category" 
                    width={100} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }} 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="bookingCount" radius={[0, 10, 10, 0]} barSize={32}>
                    {popularResources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Peak Hours Area Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-heavy bg-white/70 p-10 rounded-[3rem] border border-white shadow-2xl"
          >
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-prestige text-slate-900 flex items-center gap-3">
                  <Clock size={24} className="text-indigo-600" />
                  Peak Synchronization Windows
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">24-hour occupancy density heatmap</p>
              </div>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={peakHours} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="hour" 
                    tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} 
                    axisLine={false} 
                    tickLine={false}
                    tickFormatter={(h) => `${h}:00`}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
