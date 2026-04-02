import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Image as ImageIcon, 
  X, 
  Plus, 
  Users, 
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';

const ResourceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    capacity: 0,
    description: '',
    status: 'AVAILABLE',
    imageUrl: '',
    availableDays: [],
    availableTimes: { start: '09:00', end: '17:00' }
  });

  const [imagePreview, setImagePreview] = useState(null);

  const categories = ['Auditorium', 'Laboratory', 'Equipment', 'Classroom', 'Meeting Room', 'Other'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting:', formData);
    // In a real app, logic to call API would go here
    alert(`Resource ${isEdit ? 'updated' : 'created'} successfully!`);
    navigate('/admin/resources');
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-8 flex items-center justify-between">
        <Link to="/admin/resources" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium">
          <ArrowLeft size={20} />
          Back to Resources
        </Link>
        <h2 className="text-2xl font-bold text-slate-900">{isEdit ? 'Edit Resource' : 'Add New Resource'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
           <div className="flex items-center gap-2 mb-6">
             <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
               <Plus size={20} />
             </div>
             <h3 className="text-lg font-bold text-slate-900">Basic Information</h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
               <label className="text-sm font-semibold text-slate-700">Resource Name</label>
               <input 
                 type="text" 
                 name="name"
                 value={formData.name}
                 onChange={handleChange}
                 required
                 placeholder="e.g. Science Lab 101"
                 className="input-field" 
               />
             </div>

             <div className="space-y-2">
               <label className="text-sm font-semibold text-slate-700">Category</label>
               <select 
                 name="category"
                 value={formData.category}
                 onChange={handleChange}
                 required
                 className="input-field appearance-none bg-no-repeat bg-right pr-10"
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: '1.25rem' }}
               >
                 <option value="" disabled>Select category</option>
                 {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
               </select>
             </div>

             <div className="space-y-2">
               <label className="text-sm font-semibold text-slate-700">Capacity</label>
               <div className="relative">
                 <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                   type="number" 
                   name="capacity"
                   value={formData.capacity}
                   onChange={handleChange}
                   min="0"
                   className="input-field pl-11" 
                 />
               </div>
             </div>

             <div className="space-y-2">
               <label className="text-sm font-semibold text-slate-700">Initial Status</label>
               <div className="grid grid-cols-3 gap-3">
                 {['AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE'].map(status => (
                   <button
                     key={status}
                     type="button"
                     onClick={() => setFormData(prev => ({ ...prev, status }))}
                     className={`
                       py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border
                       ${formData.status === status 
                         ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20' 
                         : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}
                     `}
                   >
                     {status}
                   </button>
                 ))}
               </div>
             </div>

             <div className="md:col-span-2 space-y-2">
               <label className="text-sm font-semibold text-slate-700">Description</label>
               <textarea 
                 name="description"
                 value={formData.description}
                 onChange={handleChange}
                 rows="3"
                 placeholder="Provide details about the resource usage, rules, etc."
                 className="input-field resize-none"
               ></textarea>
             </div>
           </div>
        </section>

        {/* Availability & Scheduling */}
        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
           <div className="flex items-center gap-2 mb-6">
             <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
               <CalendarIcon size={20} />
             </div>
             <h3 className="text-lg font-bold text-slate-900">Availability & Scheduling</h3>
           </div>

           <div className="space-y-6">
             <div className="space-y-2">
               <label className="text-sm font-semibold text-slate-700">Operating Days</label>
               <div className="flex flex-wrap gap-2">
                 {days.map(day => (
                   <button
                     key={day}
                     type="button"
                     onClick={() => handleDayToggle(day)}
                     className={`
                       px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                       ${formData.availableDays.includes(day)
                         ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                         : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'}
                     `}
                   >
                     {day.substring(0, 3)}
                   </button>
                 ))}
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
               <div className="space-y-2">
                 <label className="text-sm font-semibold text-slate-700">Start Time</label>
                 <div className="relative">
                   <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input 
                     type="time" 
                     className="input-field pl-11"
                     value={formData.availableTimes.start}
                     onChange={(e) => setFormData(prev => ({ 
                       ...prev, 
                       availableTimes: { ...prev.availableTimes, start: e.target.value } 
                     }))}
                   />
                 </div>
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-semibold text-slate-700">End Time</label>
                 <div className="relative">
                   <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input 
                     type="time" 
                     className="input-field pl-11"
                     value={formData.availableTimes.end}
                     onChange={(e) => setFormData(prev => ({ 
                       ...prev, 
                       availableTimes: { ...prev.availableTimes, end: e.target.value } 
                     }))}
                   />
                 </div>
               </div>
             </div>
           </div>
        </section>

        {/* Media */}
        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
           <div className="flex items-center gap-2 mb-6">
             <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
               <ImageIcon size={20} />
             </div>
             <h3 className="text-lg font-bold text-slate-900">Resource Media</h3>
           </div>

           <div className="space-y-4">
             <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center gap-4 transition-colors hover:border-blue-400 group">
               {formData.imageUrl ? (
                 <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-xl">
                   <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                   <button 
                     type="button"
                     onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                     className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-md rounded-full text-slate-600 hover:text-rose-600 shadow-lg"
                   >
                     <X size={20} />
                   </button>
                 </div>
               ) : (
                 <>
                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 transition-all duration-300">
                     <ImageIcon size={32} />
                   </div>
                   <div className="text-center">
                     <p className="text-sm font-bold text-slate-700">Enter image URL or Upload</p>
                     <p className="text-xs text-slate-500 mt-1">Recommended: 16:9 aspect ratio, max 5MB</p>
                   </div>
                   <input 
                     type="text" 
                     placeholder="https://example.com/image.jpg"
                     className="input-field max-w-sm mt-2 text-center"
                     value={formData.imageUrl}
                     onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                   />
                   <p className="text-[10px] text-slate-400 font-medium">Or Drag and Drop (Mock enabled)</p>
                 </>
               )}
             </div>
           </div>
        </section>

        <div className="flex items-center justify-end gap-4 pt-4">
          <Link to="/admin/resources" className="btn-secondary">Cancel</Link>
          <button type="submit" className="btn-primary min-w-[160px]">
             <Save size={20} />
             {isEdit ? 'Update Resource' : 'Save Resource'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResourceForm;
