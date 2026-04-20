import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const stripHtmlToText = (value) => {
  if (!value) return '';
  return String(value).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
};

const IncidentDetails = () => {
  const { id } = useParams();
  const [incident, setIncident] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal State for Image Popups
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchIncident();
  }, [id]);

  const fetchIncident = async () => {
    try {
      const response = await fetch(`http://localhost:8087/api/incidents/${id}`);
      if (response.ok) {
        const data = await response.json();
        setIncident(data);
      }
    } catch (error) {
      console.error("Failed to fetch incident details:", error);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setIsSubmitting(true);

    // Format the new note with the date and role
    const formattedNote = `${new Date().toLocaleDateString()} - Student: ${newNote}`;
    
    // Copy existing remarks and add the new one
    const updatedRemarks = incident.remarksHistory ? [...incident.remarksHistory, formattedNote] : [formattedNote];

    try {
      const response = await fetch(`http://localhost:8087/api/incidents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarksHistory: updatedRemarks }),
      });

      if (response.ok) {
        setNewNote(''); // Clear the input box
        fetchIncident(); // Refresh the data to show the new note instantly
      }
    } catch (error) {
      console.error("Failed to add note:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Resolved': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const proofUrls = Array.isArray(incident?.proofUrls) && incident.proofUrls.length > 0
    ? incident.proofUrls : incident?.proofImageUrl ? [incident.proofImageUrl] : [];

  if (!incident) return <div className="p-10 text-center text-gray-500">Loading ticket details...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium transition flex items-center">
            &larr; Back to My Incidents
          </Link>
          <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getStatusBadge(incident.status)}`}>
            Status: {incident.status}
          </span>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h1 className="text-2xl font-extrabold text-gray-900">{incident.title}</h1>
            <p className="text-sm text-gray-500 mt-1 font-mono">Ticket ID: {incident.id}</p>
          </div>
          
          <div className="p-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Description</h3>
            <p className="text-gray-800 bg-gray-50 p-4 rounded-md border border-gray-100 whitespace-pre-wrap">{stripHtmlToText(incident.description)}</p>

            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mt-6 mb-2">Attached Proof</h3>
            {proofUrls.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {proofUrls.map((proofUrl, index) => (
                  <div key={index} className="flex-shrink-0 w-32 h-32 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                    {proofUrl.startsWith('data:image') ? (
                      <img 
                        src={proofUrl} alt={`Proof ${index + 1}`} 
                        onClick={() => setSelectedImage(proofUrl)}
                        className="w-full h-full object-cover cursor-pointer hover:opacity-75 transition"
                      />
                    ) : (
                      <a href={proofUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center w-full h-full text-xs font-bold text-blue-600 hover:bg-blue-50">PDF Document</a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No proof attached.</p>
            )}
          </div>
        </div>

        {/* Notes & Remarks Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-800">Communication History</h2>
          </div>
          
          <div className="p-6">
            {incident.remarksHistory && incident.remarksHistory.length > 0 ? (
              <ul className="space-y-4 mb-8">
                {incident.remarksHistory.map((remark, idx) => {
                  const isStudent = remark.includes('- Student:');
                  return (
                    <li key={idx} className={`p-4 rounded-lg border ${isStudent ? 'bg-blue-50 border-blue-100 ml-8' : 'bg-gray-50 border-gray-200 mr-8'}`}>
                      <p className="text-sm text-gray-800">{remark}</p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 text-center italic mb-8">No notes have been added to this ticket yet.</p>
            )}

            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="mt-4 border-t border-gray-200 pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Add an update or ask a question</label>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows="3"
                className="w-full border border-gray-300 p-3 rounded-md focus:ring-blue-500 focus:border-blue-500 mb-3"
                placeholder="Type your note here..."
              ></textarea>
              <div className="flex justify-end">
                <button type="submit" disabled={isSubmitting || !newNote.trim()} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-2 px-6 rounded-md transition">
                  {isSubmitting ? 'Sending...' : 'Send Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* FULL SCREEN IMAGE MODAL */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm p-4 transition-opacity" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh] flex justify-center">
            <button className="absolute -top-10 right-0 text-white text-4xl font-bold hover:text-gray-300 transition" onClick={() => setSelectedImage(null)}>&times;</button>
            <img src={selectedImage} alt="Enlarged Proof" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentDetails;