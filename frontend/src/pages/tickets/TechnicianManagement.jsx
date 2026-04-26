import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Plus, Trash2, ArrowLeft, RefreshCw,
  Mail, Tag, UserCheck, Loader2, Search, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api';

const CATEGORY_COLORS = {
  'IT Support':  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'Electrical':  'bg-amber-100 text-amber-700 border-amber-200',
  'Maintenance': 'bg-blue-100 text-blue-700 border-blue-200',
  'Network':     'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const TechnicianManagement = () => {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('IT Support');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  const fetchTechnicians = () => {
    setLoading(true);
    API.get('/technicians')
      .then((res) => {
        const data = Array.isArray(res?.data) ? res.data : [];
        setTechnicians(data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTechnicians(); }, []);

  const handleAddTechnician = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/technicians', { name, email, category });
      setName(''); setEmail(''); setCategory('IT Support');
      fetchTechnicians();
    } catch (error) {
      console.error('Error adding technician:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this technician?')) return;
    try {
      await API.delete(`/technicians/${id}`);
      fetchTechnicians();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const getInitials = (n) => n?.split(' ').map(x => x[0]).join('').substring(0, 2).toUpperCase() || '?';

  const filteredTechnicians = technicians.filter(tech => {
    const matchesSearch = tech.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tech.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeFilter === 'ALL' || tech.category === activeFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['ALL', 'IT Support', 'Electrical', 'Maintenance', 'Network'];

  return (
    <div className="max-w-6xl mx-auto pt-40 pb-12 px-4 space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 leading-none mb-2">Technician Management</h1>
          <p className="text-slate-500 font-medium">Add or remove support staff members.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchTechnicians}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all font-bold shadow-sm"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <Link
            to="/admin"
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all font-black text-xs uppercase tracking-widest shadow-sm"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Add Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="md:col-span-1 glass-card bg-white border border-slate-100 p-6 h-fit"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-2xl">
              <UserCheck size={20} />
            </div>
            <h2 className="text-lg font-black text-slate-900">Add Technician</h2>
          </div>

          <form onSubmit={handleAddTechnician} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Full Name</label>
              <input
                type="text" required value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g., Kamal Perera"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Email Address</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="tech@campus.edu"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Category</label>
              <select
                value={category} onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none"
              >
                <option value="IT Support">IT Support</option>
                <option value="Electrical">Electrical</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Network">Network</option>
              </select>
            </div>
            <button
              type="submit" disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 mt-2"
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              {submitting ? 'Adding…' : 'Add Technician'}
            </button>
          </form>
        </motion.div>

        {/* Technicians List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="md:col-span-2 glass-card bg-white border border-slate-100 overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-100 text-slate-600 rounded-2xl">
                <Users size={18} />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">Support Staff</h2>
                <p className="text-xs text-slate-400 font-medium">
                  {filteredTechnicians.length} of {technicians.length} member{technicians.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                    activeFilter === cat
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-200 hover:text-indigo-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-3" />
              <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Loading Staff…</p>
            </div>
          ) : technicians.length === 0 ? (
            <div className="text-center py-16">
              <Users className="mx-auto text-slate-200 mb-4" size={48} />
              <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">No technicians found</h3>
              <p className="text-slate-400 font-medium mt-1 text-sm">
                {technicians.length === 0 
                  ? 'Add your first staff member using the form.' 
                  : 'Try adjusting your search or filters.'}
              </p>
            </div>
          ) : filteredTechnicians.length === 0 ? (
            <div className="text-center py-16">
              <Filter className="mx-auto text-slate-200 mb-4" size={48} />
              <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">No matches</h3>
              <p className="text-slate-400 font-medium mt-1 text-sm">No technicians match your current criteria.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              <AnimatePresence mode="popLayout">
                {filteredTechnicians.map((tech, index) => (
                  <motion.li
                    key={tech.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ delay: index * 0.04 }}
                    className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-sm shrink-0">
                        {getInitials(tech.name)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{tech.name}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Mail size={11} /> {tech.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${CATEGORY_COLORS[tech.category] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        <Tag size={10} /> {tech.category}
                      </span>
                      <button
                        onClick={() => handleDelete(tech.id)}
                        className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-rose-600 border border-slate-100 hover:border-rose-100 hover:bg-rose-50 rounded-2xl transition-all font-black text-xs uppercase tracking-widest"
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TechnicianManagement;