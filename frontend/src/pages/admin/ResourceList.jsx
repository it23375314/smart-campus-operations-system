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
  RefreshCw,
  MapPin,
  Tag,
  Plus
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const TYPES = ['All', 'room', 'lab', 'equipment'];

const StatusBadge = ({ status }) => {
  const config = {
    ACTIVE: {
      icon: <CheckCircle2 size={13} />,
      label: 'Active',
      cls: 'bg-emerald-50 text-emerald-600 ring-emerald-500/20',
    },
    OUT_OF_SERVICE: {
      icon: <XCircle size={13} />,
      label: 'Decommissioned',
      cls: 'bg-rose-50 text-rose-500 ring-rose-500/20',
    },
    MAINTENANCE: {
      icon: <AlertCircle size={13} />,
      label: 'Maintenance',
      cls: 'bg-amber-50 text-amber-600 ring-amber-500/20',
    },
    AVAILABLE: {
      icon: <CheckCircle2 size={13} />,
      label: 'Available',
      cls: 'bg-emerald-50 text-emerald-600 ring-emerald-500/20',
    }
  };
  const c = config[status] || { icon: <AlertCircle size={13} />, label: status, cls: 'bg-slate-50 text-slate-500 ring-slate-500/20' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ring-inset ${c.cls}`}>
      {c.icon} {c.label}
    </span>
  );
};

const ResourceList = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await API.get('/resources');
      setResources(res.data);
    } catch (err) {
      console.error("Failed to fetch resources:", err);
      toast.error("Failed to synchronize with institutional registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Institutional Confirmation: Irreversibly decommission this asset?')) return;
    try {
      await API.delete(`/resources/${id}`);
      setResources(prev => prev.filter(r => r.id !== id));
      toast.success("Asset decommissioned successfully.");
    } catch (err) {
      toast.error("Decommission protocol failure.");
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Asset Name", "Category", "Type", "Location", "Capacity", "Status"];
    const tableRows = [];

    resources.forEach(resource => {
      const resourceData = [
        resource.name,
        resource.category,
        resource.type,
        resource.location || 'N/A',
        resource.capacity.toString(),
        resource.status
      ];
      tableRows.push(resourceData);
    });

    // Add Institutional Header
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("SmartCampus Operations Center", 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-400
    doc.text("GLOBAL ASSET REGISTRY REPORT", 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 35);
    
    // Line separator
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(14, 40, 196, 40);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      styles: { fontSize: 9, font: 'helvetica' },
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { top: 45 },
    });

    doc.save(`Asset_Registry_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("Registry report generated successfully.");
  };

  const filtered = resources.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (r.location && r.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'All' || r.type === selectedType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-slate-400">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6" />
        <span className="text-xs font-black uppercase tracking-[0.3em]">Interrogating Registry...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-3xl font-prestige text-slate-900 mb-1">Asset Control Matrix.</h2>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Global Resource Lifecycle Management</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={downloadPDF}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all border border-slate-200 shadow-sm active:scale-95"
          >
            <Package size={16} className="text-indigo-600" /> Download Registry Report
          </button>
          <Link
            to="/admin/resources/add"
            className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
          >
            <Plus size={16} /> Register New Asset
          </Link>
        </div>

      </div>

      {/* Filters Hub */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-indigo-400 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Interrogate Name or Spatial Location..."
            className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 bg-slate-100/50 p-2 rounded-2xl border border-slate-200/50">
          {TYPES.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                ${selectedType === type
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white'}`}
            >
              {type}
            </button>
          ))}
          <button
            onClick={fetchResources}
            className="p-3 text-slate-400 hover:text-indigo-600 bg-white border border-slate-200 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Resource Inventory */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filtered.map(resource => (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            key={resource.id}
            className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-200 hover:border-indigo-100 hover:shadow-2xl transition-all duration-500"
          >
            {/* Visual Header */}
            <div className="relative h-56 overflow-hidden bg-slate-100">
              {resource.imageUrl ? (
                <img
                  src={resource.imageUrl}
                  alt={resource.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-200">
                  <Package size={64} strokeWidth={1} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="absolute top-6 left-6">
                <StatusBadge status={resource.status} />
              </div>

              {/* Action Ribbon */}
              <div className="absolute bottom-6 right-6 flex gap-3 translate-y-12 group-hover:translate-y-0 transition-transform duration-500">
                <Link
                  to={`/admin/resources/edit/${resource.id}`}
                  className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:bg-white shadow-xl transition-all"
                >
                  <Edit2 size={16} />
                </Link>
                <button
                  onClick={() => handleDelete(resource.id)}
                  className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl flex items-center justify-center text-slate-600 hover:text-rose-500 hover:bg-white shadow-xl transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Core Specs */}
            <div className="p-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-md">{resource.type}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{resource.category}</span>
              </div>
              <h3 className="text-xl font-prestige text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors truncate">{resource.name}</h3>
              
              <div className="space-y-4 pt-6 border-t border-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-400">
                    <MapPin size={14} className="text-indigo-300" />
                    <span className="text-xs font-bold truncate max-w-[150px]">{resource.location || 'Undisclosed'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <Users size={14} className="text-indigo-300" />
                    <span className="text-xs font-black text-slate-700">{resource.capacity}</span>
                  </div>
                </div>

                <Link
                  to={`/admin/resources/view/${resource.id}`}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100"
                >
                  <Eye size={14} /> Full Analytics
                </Link>
              </div>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-dashed border-slate-200">
            <Package size={48} className="mb-6 text-slate-200" />
            <h3 className="text-xl font-prestige text-slate-900 mb-2">Registry Void Detected.</h3>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No assets match your search parameters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceList;
