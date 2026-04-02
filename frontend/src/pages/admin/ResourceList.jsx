import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye, 
  Users, 
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ResourceList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Mock data for initial development
  const [resources, setResources] = useState([
    {
      id: '1',
      name: 'Main Auditorium',
      category: 'Auditorium',
      capacity: 500,
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd20df0f1?w=500&q=80',
    },
    {
      id: '2',
      name: 'Computer Lab 302',
      category: 'Laboratory',
      capacity: 40,
      status: 'UNAVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08759dfc3f0?w=500&q=80',
    },
    {
      id: '3',
      name: 'Projector Pro X-90',
      category: 'Equipment',
      capacity: 1,
      status: 'MAINTENANCE',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&q=80',
    },
    {
      id: '4',
      name: 'Seminar Room A',
      category: 'Classroom',
      capacity: 80,
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08759dfc3f0?w=500&q=80',
    }
  ]);

  const categories = ['All', 'Auditorium', 'Laboratory', 'Equipment', 'Classroom'];

  const filteredResources = resources.filter(res => {
    const matchesSearch = res.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || res.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold ring-1 ring-inset ring-emerald-600/10">
            <CheckCircle2 size={14} />
            Available
          </span>
        );
      case 'UNAVAILABLE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-semibold ring-1 ring-inset ring-rose-600/10">
            <XCircle size={14} />
            Unavailable
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-semibold ring-1 ring-inset ring-amber-600/10">
            <AlertCircle size={14} />
            Maintenance
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search resources by name..." 
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200
                ${selectedCategory === category 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 active:scale-95' 
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'}
              `}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <div 
            key={resource.id} 
            className="group glass-card rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-1"
          >
            <div className="relative h-48 overflow-hidden">
              <img 
                src={resource.imageUrl} 
                alt={resource.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-4 left-4">
                {getStatusBadge(resource.status)}
              </div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex gap-2">
                  <Link to={`/admin/resources/edit/${resource.id}`} className="p-2 bg-white/90 backdrop-blur-md rounded-xl text-slate-600 hover:text-blue-600 transition-colors shadow-lg">
                    <Edit2 size={16} />
                  </Link>
                  <button className="p-2 bg-white/90 backdrop-blur-md rounded-xl text-slate-600 hover:text-rose-600 transition-colors shadow-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">{resource.category}</p>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{resource.name}</h3>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg text-slate-500">
                   <Users size={14} />
                   <span className="text-xs font-bold">{resource.capacity}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-slate-500 font-medium pt-4 border-t border-slate-100">
                 <div className="flex items-center gap-1.5">
                   <CalendarIcon size={14} className="text-slate-400" />
                   Mon - Fri
                 </div>
                 <div className="flex items-center gap-1.5 ml-auto">
                   <Link to={`/admin/resources/view/${resource.id}`} className="text-blue-600 hover:underline font-bold flex items-center gap-1">
                     View Details
                     <Eye size={12} />
                   </Link>
                 </div>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {filteredResources.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Search size={32} />
            </div>
            <p className="text-lg font-semibold text-slate-600">No resources found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceList;
