import React, { useState, useEffect } from 'react';
import {
  Search,
  Edit2,
  Trash2,
  Eye,
  Users,
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Package,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/resources';

const MOCK_RESOURCES = [
  {
    id: '1',
    name: 'Main Auditorium',
    category: 'Auditorium',
    capacity: 500,
    status: 'AVAILABLE',
    description: 'Large venue for university events and seminars.',
    imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd20df0f1?w=600&q=80',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  },
  {
    id: '2',
    name: 'Computer Lab 302',
    category: 'Laboratory',
    capacity: 40,
    status: 'UNAVAILABLE',
    description: 'Fully equipped computer lab with high-speed internet.',
    imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08759dfc3f0?w=600&q=80',
    availableDays: ['Monday', 'Wednesday', 'Friday'],
  },
  {
    id: '3',
    name: 'Projector Pro X-90',
    category: 'Equipment',
    capacity: 1,
    status: 'MAINTENANCE',
    description: '4K projector available for lectures and presentations.',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  },
  {
    id: '4',
    name: 'Seminar Room A',
    category: 'Classroom',
    capacity: 80,
    status: 'AVAILABLE',
    description: 'Air-conditioned seminar room with projector and whiteboard.',
    imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80',
    availableDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
  },
];

const CATEGORIES = ['All', 'Auditorium', 'Laboratory', 'Equipment', 'Classroom', 'Sports'];

const StatusBadge = ({ status }) => {
  const config = {
    AVAILABLE: {
      icon: <CheckCircle2 size={13} />,
      label: 'Available',
      cls: 'bg-emerald-50 text-emerald-600 ring-emerald-500/20',
    },
    UNAVAILABLE: {
      icon: <XCircle size={13} />,
      label: 'Unavailable',
      cls: 'bg-rose-50 text-rose-500 ring-rose-500/20',
    },
    MAINTENANCE: {
      icon: <AlertCircle size={13} />,
      label: 'Maintenance',
      cls: 'bg-amber-50 text-amber-600 ring-amber-500/20',
    },
  };
  const c = config[status] || config.UNAVAILABLE;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${c.cls}`}>
      {c.icon} {c.label}
    </span>
  );
};

const ResourceList = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [error, setError] = useState(null);

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(API_BASE);
      setResources(res.data.length > 0 ? res.data : MOCK_RESOURCES);
    } catch {
      // Fallback to mock data if backend is not running
      setResources(MOCK_RESOURCES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    try {
      await axios.delete(`${API_BASE}/${id}`);
      setResources(prev => prev.filter(r => r.id !== id));
    } catch {
      alert('Failed to delete resource. Please try again.');
    }
  };

  const filtered = resources.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || r.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-slate-400">
        <RefreshCw size={24} className="animate-spin mr-3" />
        <span className="text-lg font-medium">Loading resources...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            type="text"
            placeholder="Search resources by name..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all duration-200"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap
                ${selectedCategory === cat
                  ? 'text-white shadow-md shadow-indigo-500/20'
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'}`}
              style={selectedCategory === cat ? { background: 'linear-gradient(135deg, #4f46e5, #6d28d9)' } : {}}
            >
              {cat}
            </button>
          ))}
        </div>
        <button
          onClick={fetchResources}
          title="Refresh"
          className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 border border-slate-200"
        >
          <RefreshCw size={17} />
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Resources', value: resources.length, color: 'text-slate-700' },
          { label: 'Available', value: resources.filter(r => r.status === 'AVAILABLE').length, color: 'text-emerald-600' },
          { label: 'In Maintenance', value: resources.filter(r => r.status === 'MAINTENANCE').length, color: 'text-amber-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(resource => (
          <div
            key={resource.id}
            className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/8 transition-all duration-300 hover:-translate-y-1"
          >
            {/* Image */}
            <div className="relative h-44 overflow-hidden bg-slate-100">
              {resource.imageUrl ? (
                <img
                  src={resource.imageUrl}
                  alt={resource.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <Package size={40} />
                </div>
              )}
              <div className="absolute top-3 left-3"
              >
                <StatusBadge status={resource.status} />
              </div>
              {/* Actions overlay on hover */}
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Link
                  to={`/admin/resources/edit/${resource.id}`}
                  className="p-2 bg-white/95 backdrop-blur-sm rounded-xl text-slate-500 hover:text-indigo-600 shadow-md transition-colors"
                >
                  <Edit2 size={15} />
                </Link>
                <button
                  onClick={() => handleDelete(resource.id)}
                  className="p-2 bg-white/95 backdrop-blur-sm rounded-xl text-slate-500 hover:text-rose-500 shadow-md transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="p-5">
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">{resource.category}</p>
              <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors truncate">{resource.name}</h3>
              {resource.description && (
                <p className="text-xs text-slate-400 mb-3 line-clamp-2">{resource.description}</p>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <Users size={13} className="text-slate-300" />
                  Cap: <span className="text-slate-600 font-bold">{resource.capacity}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CalendarIcon size={13} className="text-slate-300" />
                  {resource.availableDays?.length ?? 0} days
                </div>
                <Link
                  to={`/admin/resources/view/${resource.id}`}
                  className="flex items-center gap-1 text-indigo-500 hover:text-indigo-700 font-semibold"
                >
                  <Eye size={13} /> Details
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            <Package size={36} className="mb-3 text-slate-300" />
            <p className="text-lg font-semibold text-slate-600">No resources found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceList;
