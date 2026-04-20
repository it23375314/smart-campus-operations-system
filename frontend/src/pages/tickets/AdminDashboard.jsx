import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [allIncidents, setAllIncidents] = useState([]);
  
  // NEW STATE: Tracks which image is currently being viewed in full screen
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetch('/api/incidents')
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        // Sort by dateReported newest first
        const sorted = [...data].sort((a, b) => {
          const dateA = new Date(a.dateReported);
          const dateB = new Date(b.dateReported);
          return dateB - dateA; // Newest first
        });
        setAllIncidents(sorted);
      })
      .catch(error => console.error("Error fetching incidents:", error));
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingCount = allIncidents.filter(inc => inc.status === 'Pending').length;
  const inProgressCount = allIncidents.filter(inc => inc.status === 'In Progress').length;
  const resolvedCount = allIncidents.filter(inc => inc.status === 'Resolved').length;

  const getProofUrls = (incident) => {
    if (Array.isArray(incident.proofUrls) && incident.proofUrls.length > 0) return incident.proofUrls;
    if (incident.proofImageUrl) return [incident.proofImageUrl];
    return [];
  };

  const getIncidentReference = (incident) => incident?.referenceId || incident?.id || '—';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Issue Management Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">Overview of all reported campus resource incidents.</p>
          <div className="mt-4">
            <Link to="/technicians" className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50">
              Go to Technician Management
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg border-t-4 border-yellow-400">
            <div className="px-4 py-5 sm:p-6 text-center">
              <dt className="text-sm font-medium text-gray-500 truncate">Pending Issues</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{pendingCount}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg border-t-4 border-blue-400">
            <div className="px-4 py-5 sm:p-6 text-center">
              <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{inProgressCount}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg border-t-4 border-green-400">
            <div className="px-4 py-5 sm:p-6 text-center">
              <dt className="text-sm font-medium text-gray-500 truncate">Resolved</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{resolvedCount}</dd>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proof</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allIncidents.length === 0 ? (
                  <tr><td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">No incidents found.</td></tr>
                ) : (
                  allIncidents.map((incident) => (
                    <tr key={incident.id} className={`hover:bg-gray-50 transition duration-150 ${incident.urgent ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getIncidentReference(incident)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{incident.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-block font-bold text-xs px-2 py-1 rounded ${incident.urgent ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'}`}>
                          {incident.urgent ? '🚨 URGENT' : 'Normal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px]">
                        {getProofUrls(incident).length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {getProofUrls(incident).map((proofUrl, index) => (
                              proofUrl.startsWith('data:image') ? (
                                <img
                                  key={`${incident.id}-proof-${index}`}
                                  src={proofUrl}
                                  alt={`proof-${index}`}
                                  onClick={() => setSelectedImage(proofUrl)} // OPENS MODAL
                                  className="h-10 w-10 rounded border border-gray-300 object-cover cursor-pointer hover:opacity-75 transition-opacity"
                                  title="Click to enlarge"
                                />
                              ) : (
                                <a
                                  key={`${incident.id}-proof-${index}`}
                                  href={proofUrl} target="_blank" rel="noreferrer"
                                  className="inline-block bg-gray-100 border border-gray-300 rounded px-2 py-1 text-xs text-blue-600 hover:bg-gray-200"
                                >
                                  PDF
                                </a>
                              )
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-xs">No proof</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{incident.dateReported}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(incident.status)}`}>
                          {incident.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/update/${incident.id}`} className="text-blue-600 hover:text-blue-900 font-semibold border border-blue-600 py-1 px-3 rounded hover:bg-blue-50 transition">
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* FULL SCREEN IMAGE MODAL */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm p-4 transition-opacity"
          onClick={() => setSelectedImage(null)} // Close when clicking the background
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
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;