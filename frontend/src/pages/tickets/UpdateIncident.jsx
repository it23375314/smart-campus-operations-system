import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const stripHtmlToText = (value) => {
  if (!value) return '';
  return String(value).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
};

const UpdateIncident = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [incident, setIncident] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  
  // Modal State for Image Popups
  const [selectedImage, setSelectedImage] = useState(null);
  
  // Form State
  const [status, setStatus] = useState('Pending');
  const [selectedTechId, setSelectedTechId] = useState('');
  const [newRemark, setNewRemark] = useState('');

  const proofUrls = Array.isArray(incident?.proofUrls) && incident.proofUrls.length > 0
    ? incident.proofUrls
    : incident?.proofImageUrl
      ? [incident.proofImageUrl]
      : [];

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true); setLoadError('');
        const incidentResponse = await fetch(`http://localhost:8087/api/incidents/${id}`);

        if (!incidentResponse.ok) throw new Error('Failed to load ticket details');

        const incidentData = await incidentResponse.json();
        if (!incidentData) throw new Error('Ticket not found');

        setIncident(incidentData);
        setStatus(incidentData.status || 'Pending');
        if (incidentData.assignedTechnicianId) setSelectedTechId(incidentData.assignedTechnicianId);

        const techniciansResponse = await fetch('http://localhost:8087/api/technicians');
        if (techniciansResponse.ok) {
          const technicianData = await techniciansResponse.json();
          setTechnicians(technicianData);
        }
      } catch (error) {
        setLoadError(error.message || 'Failed to load ticket details');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const assignedTech = technicians.find(t => t.id === selectedTechId);
    
    const updatePayload = {
      status: status,
      assignedTechnicianId: assignedTech ? assignedTech.id : null,
      assignedTechnicianName: assignedTech ? assignedTech.name : null,
      assignedTechnicianCategory: assignedTech ? assignedTech.category : null,
      remarksHistory: newRemark ? [`${new Date().toLocaleDateString()} - Admin: ${newRemark}`] : []
    };

    try {
      const response = await fetch(`http://localhost:8087/api/incidents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      if (response.ok) {
        alert("✅ Ticket Updated Successfully!");
        navigate('/admin');
      }
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  if (isLoading) return <div className="p-10 text-center text-gray-500">Loading ticket details...</div>;
  if (loadError) return <div className="p-10 text-center text-red-500">{loadError}</div>;
  if (!incident) return <div className="p-10 text-center text-gray-500">Ticket not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Manage Ticket</h1>
            <p className="mt-1 text-sm text-gray-500 font-mono">ID: {id}</p>
          </div>
          <Link to="/admin" className="text-gray-600 hover:text-gray-900 font-medium bg-white border border-gray-300 py-2 px-4 rounded-md shadow-sm transition">
            &larr; Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Original Issue Details */}
          <div className="md:col-span-1 bg-white shadow rounded-lg p-6 border border-gray-200 h-fit">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Original Report</h2>
            <div className="space-y-4">
              <div>
                <span className="block text-sm font-medium text-gray-500">Title</span>
                <span className="block text-gray-900 font-semibold">{incident.title}</span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-500">Description</span>
                <p className="mt-1 text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-100">{stripHtmlToText(incident.description)}</p>
              </div>

              {/* CLEAN PROOF GRID */}
              <div>
                <span className="block text-sm font-medium text-gray-500 mb-2">Attached Proof</span>
                {proofUrls.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {proofUrls.map((proofUrl, index) => (
                      <div key={index} className="aspect-square bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                        {proofUrl.startsWith('data:image') ? (
                          <img
                            src={proofUrl}
                            alt={`Proof ${index + 1}`}
                            onClick={() => setSelectedImage(proofUrl)} // OPENS MODAL
                            className="w-full h-full object-cover cursor-pointer hover:opacity-75 transition-opacity"
                            title="Click to enlarge"
                          />
                        ) : (
                          <a href={proofUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center w-full h-full text-xs font-bold text-blue-600 hover:bg-blue-50">
                            PDF
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 italic">No proof uploaded</span>
                )}
              </div>
              
              {/* Remarks History */}
              {incident.remarksHistory && incident.remarksHistory.length > 0 && (
                <div>
                  <span className="block text-sm font-medium text-gray-500 mt-4 mb-2">Remarks History</span>
                  <ul className="text-sm text-gray-600 space-y-2 bg-blue-50 p-3 rounded border border-blue-100">
                    {incident.remarksHistory.map((remark, idx) => (
                      <li key={idx} className="border-b border-blue-200 pb-1 last:border-0">{remark}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Update Form */}
          <div className="md:col-span-2 bg-white shadow rounded-lg p-6 border border-gray-200">
             <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Technician Actions & Assignment</h2>
             <form onSubmit={handleUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-md focus:ring-blue-500">
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assign Technician</label>
                    <select value={selectedTechId} onChange={(e) => setSelectedTechId(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-md focus:ring-blue-500">
                      <option value="">-- Select Technician --</option>
                      {technicians.map(tech => (
                        <option key={tech.id} value={tech.id}>{tech.name} ({tech.category})</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Add New Remark</label>
                  <textarea value={newRemark} onChange={(e) => setNewRemark(e.target.value)} rows="3" placeholder="Add notes about assignments, missing parts, etc..." className="w-full border border-gray-300 p-3 rounded-md focus:ring-blue-500"></textarea>
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-md shadow-sm transition">
                    Save Updates
                  </button>
                </div>
             </form>
          </div>
        </div>
      </div>

      {/* FULL SCREEN IMAGE MODAL */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm p-4 transition-opacity"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex justify-center">
            <button 
              className="absolute -top-10 right-0 text-white text-4xl font-bold hover:text-gray-300 transition"
              onClick={() => setSelectedImage(null)}
            >
              &times;
            </button>
            <img 
              src={selectedImage} 
              alt="Enlarged Proof" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" 
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateIncident;