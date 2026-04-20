import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const getIncidentReference = (incident) => incident?.referenceId || incident?.id || '—';

// Helper to get initials for the avatar (e.g., "Student User" -> "SU")
const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const IncidentDetails = () => {
  const { id } = useParams();
  const [incident, setIncident] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchIncident();
  }, [id]);

  const fetchIncident = async () => {
    try {
      const response = await fetch(`/api/incidents/${id}`);
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

    const formattedNote = `${new Date().toLocaleDateString()} - Student: ${newNote}`;
    const updatedRemarks = incident.remarksHistory ? [...incident.remarksHistory, formattedNote] : [formattedNote];

    try {
      const response = await fetch(`/api/incidents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarksHistory: updatedRemarks }),
      });

      if (response.ok) {
        setNewNote('');
        fetchIncident();
      }
    } catch (error) {
      console.error("Failed to add note:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!window.confirm('Are you sure you want to close this ticket? It can only be reopened by an admin.')) {
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/incidents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Closed' }),
      });

      if (response.ok) {
        fetchIncident();
        alert('Ticket closed successfully.');
      }
    } catch (error) {
      console.error("Failed to close ticket:", error);
      alert('Error closing ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const proofUrls = Array.isArray(incident?.proofUrls) && incident.proofUrls.length > 0
    ? incident.proofUrls : incident?.proofImageUrl ? [incident.proofImageUrl] : [];

  if (!incident) return <div className="p-10 text-center text-gray-500 mt-20">Loading ticket details...</div>;

  return (
    <div className="min-h-screen bg-gray-100/50 py-8 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* TOP HEADER */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-gray-500 hover:text-blue-600 transition p-2 bg-white rounded-full shadow-sm">
              &larr;
            </Link>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 flex items-center gap-3">
              <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path></svg>
              {incident.title}
            </h1>
          </div>
          <div className="flex gap-2">
            <button className="p-2 bg-white text-gray-500 hover:text-gray-700 rounded shadow-sm border border-gray-200" title="Print">🖨️</button>
            <button className="p-2 bg-white text-gray-500 hover:text-gray-700 rounded shadow-sm border border-gray-200" title="Download PDF">📄</button>
          </div>
        </div>

        {/* TWO COLUMN LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* LEFT COLUMN: CONVERSATION THREAD */}
          <div className="flex-1 space-y-6">
            
            {/* 1. Original Ticket Block */}
            <div className="bg-white shadow-sm border border-gray-200">
              {/* Header */}
              <div className="flex justify-between items-start p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                    {getInitials(incident.reportedBy)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      You <span className="font-normal text-gray-500">({incident.email || 'student@my.sliit.lk'})</span>
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500 font-medium flex items-center gap-1">
                  ⏱️ {incident.dateReported}
                </div>
              </div>
              
              {/* Message Content (Renders HTML from Medium Editor) */}
              <div className="p-6 text-gray-800 text-sm leading-relaxed">
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: incident.description }} 
                />
              </div>

              {/* Attachments Section in Message */}
              {proofUrls.length > 0 && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wider">Attachments</p>
                  <div className="flex flex-col gap-2">
                    {proofUrls.map((proofUrl, index) => (
                      <div key={index} className="flex items-center text-sm">
                         {proofUrl.startsWith('data:image') ? (
                          <button onClick={() => setSelectedImage(proofUrl)} className="text-blue-600 hover:underline flex items-center gap-2">
                            🖼️ Attached_Image_{index + 1}.png
                          </button>
                        ) : (
                          <a href={proofUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-2">
                            📄 Attached_Document_{index + 1}.pdf
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Communication History (Replies) */}
            {incident.remarksHistory && incident.remarksHistory.map((remark, idx) => {
              const isStudent = remark.includes('- Student:');
              const splitRemark = remark.split(': ');
              const dateAndRole = splitRemark[0];
              const message = splitRemark.slice(1).join(': ');
              
              return (
                <div key={idx} className={`bg-white shadow-sm border ${isStudent ? 'border-blue-200 ml-8' : 'border-gray-200 mr-8'} relative`}>
                   {/* Visual indicator for Agent replies */}
                   {!isStudent && <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>}
                   
                   <div className="flex justify-between items-start p-5 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isStudent ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                        {isStudent ? getInitials(incident.reportedBy) : 'A'}
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {isStudent ? incident.reportedBy : incident.assignedTechnicianName || 'Support Agent'}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                      {dateAndRole.split(' - ')[0]}
                    </div>
                  </div>
                  <div className="p-5 text-gray-800 text-sm">
                    {message}
                  </div>
                </div>
              );
            })}

            {/* 3. Add Reply Box */}
            <div className="bg-white shadow-sm border border-gray-200 p-6">
              <form onSubmit={handleAddNote}>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows="4"
                  className="w-full border border-gray-300 p-3 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-700 mb-3"
                  placeholder="Click here to reply..."
                ></textarea>
                <div className="flex justify-end">
                  <button type="submit" disabled={isSubmitting || !newNote.trim()} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2 px-6 rounded transition text-sm">
                    {isSubmitting ? 'Sending...' : 'Send Reply'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: SIDEBAR */}
          <div className="w-full lg:w-80 flex flex-col gap-5">
            
            {/* Ticket Status */}
            <div className="bg-white shadow-sm border border-gray-200 p-5 space-y-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Ticket Status</h3>
              {incident.status === 'Resolved' ? (
                <span className="inline-block bg-green-500 text-white font-bold px-4 py-1.5 rounded text-sm w-full text-center">✔ Resolved</span>
              ) : incident.status === 'Closed' ? (
                <span className="inline-block bg-gray-500 text-white font-bold px-4 py-1.5 rounded text-sm w-full text-center">✖ Closed</span>
              ) : incident.status === 'In Progress' ? (
                <span className="inline-block bg-blue-500 text-white font-bold px-4 py-1.5 rounded text-sm w-full text-center">⚙ In Progress</span>
              ) : (
                <span className="inline-block bg-yellow-500 text-white font-bold px-4 py-1.5 rounded text-sm w-full text-center">Pending</span>
              )}
              
              {/* Urgent Status */}
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Priority</p>
                <span className={`inline-block font-bold px-3 py-1 rounded text-xs w-full text-center ${incident.urgent ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                  {incident.urgent ? '🚨 URGENT' : 'Normal'}
                </span>
              </div>

              {/* Close Ticket Button - Only for Pending status */}
              {incident.status === 'Pending' && (
                <div className="pt-2 border-t border-gray-100">
                  <button
                    onClick={handleCloseTicket}
                    disabled={isSubmitting}
                    className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold py-2 px-3 rounded transition text-sm"
                  >
                    {isSubmitting ? 'Closing...' : '✕ Close Ticket'}
                  </button>
                </div>
              )}
            </div>

            {/* Ticket Meta Info */}
            <div className="bg-white shadow-sm border border-gray-200 p-5 space-y-4 text-sm">
              <div>
                <span className="block text-xs text-gray-500 mb-1">Created</span>
                <span className="text-gray-800">{incident.dateReported}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">Reference</span>
                <span className="text-gray-800 font-mono">{getIncidentReference(incident)}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">Assigned agent</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold">
                    {incident.assignedTechnicianName ? incident.assignedTechnicianName.charAt(0) : '—'}
                  </div>
                  <span className="text-gray-800">{incident.assignedTechnicianName || 'Unassigned'}</span>
                </div>
              </div>
            </div>

            {/* Attachments Sidebar */}
            <div className="bg-white shadow-sm border border-gray-200 p-5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Attachments</h3>
              {proofUrls.length > 0 ? (
                <div className="space-y-2">
                  {proofUrls.map((proofUrl, index) => (
                    <div key={index} className="text-sm truncate">
                       {proofUrl.startsWith('data:image') ? (
                          <button onClick={() => setSelectedImage(proofUrl)} className="text-blue-600 hover:underline text-left">
                            Screenshot_{index + 1}.png
                          </button>
                        ) : (
                          <a href={proofUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                            Document_{index + 1}.pdf
                          </a>
                        )}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-gray-400">No attachments</span>
              )}
            </div>

            {/* Ticket Properties */}
            <div className="bg-white shadow-sm border border-gray-200 p-5 space-y-4 text-sm">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 border-b border-gray-100 pb-2">Ticket Properties</h3>
              <div>
                <span className="block text-xs text-gray-500 mb-1">Registration number</span>
                <span className="text-gray-800">{incident.registrationNumber || '—'}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">Faculty / School</span>
                <span className="text-gray-800">{incident.faculty || '—'}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">Contact number</span>
                <span className="text-gray-800">{incident.contactNumber || '—'}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">Campus/Center</span>
                <span className="text-gray-800">{incident.campus || '—'}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* FULL SCREEN IMAGE MODAL */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl w-full flex justify-center">
            <button className="absolute -top-12 right-0 text-white text-4xl hover:text-gray-300" onClick={() => setSelectedImage(null)}>&times;</button>
            <img src={selectedImage} alt="Enlarged Proof" className="max-w-full max-h-[85vh] object-contain rounded shadow-2xl" onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentDetails;