import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const getIncidentCreatedAtMillis = (incident) => {
  const raw = incident?.createdAt || incident?.dateReported;
  if (!raw) return 0;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

const formatIncidentCreatedAt = (incident) => {
  const raw = incident?.createdAt || incident?.dateReported;
  if (!raw) return '—';
  const hasTime = Boolean(incident?.createdAt);

  if (!hasTime && typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return String(raw);

  return hasTime
    ? date.toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
};

const AdminDashboard = () => {
  const [allIncidents, setAllIncidents] = useState([]);

  useEffect(() => {
    fetch('/api/incidents')
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        // Sort by createdAt newest first (fallback to dateReported)
        const sorted = [...data].sort((a, b) => getIncidentCreatedAtMillis(b) - getIncidentCreatedAtMillis(a));
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allIncidents.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">No incidents found.</td></tr>
                ) : (
                  allIncidents.map((incident) => (
                    <tr key={incident.id} className={`hover:bg-gray-50 transition duration-150 ${incident.urgent ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getIncidentReference(incident)}</td>
                      <td
                        className="px-6 py-4 text-sm text-gray-900 max-w-[420px] truncate"
                        title={incident.title}
                      >
                        {incident.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-block font-bold text-xs px-2 py-1 rounded ${incident.urgent ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'}`}>
                          {incident.urgent ? '🚨 URGENT' : 'Normal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatIncidentCreatedAt(incident)}</td>
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
    </div>
  );
};

export default AdminDashboard;