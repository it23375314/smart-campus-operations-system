import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const stripHtmlToText = (value) => {
  if (!value) return '';
  return String(value).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
};

const safeLower = (value) => String(value ?? '').toLowerCase();

const MyIncidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetch('http://localhost:8087/api/incidents')
      .then(res => res.json())
      .then(data => {
        const incidentsArray = Array.isArray(data) ? data : [];

        let myIncidentIds = [];
        let registrationNumber = '';
        let email = '';
        let reportedBy = '';

        try {
          const rawIds = localStorage.getItem('scos.myIncidentIds');
          const parsedIds = rawIds ? JSON.parse(rawIds) : [];
          myIncidentIds = Array.isArray(parsedIds) ? parsedIds : [];
          registrationNumber = localStorage.getItem('scos.registrationNumber') || '';
          email = localStorage.getItem('scos.email') || '';
          reportedBy = localStorage.getItem('scos.reportedBy') || '';
        } catch {
          // ignore storage failures
        }

        let myTickets = incidentsArray;

        if (myIncidentIds.length > 0) {
          const idSet = new Set(myIncidentIds);
          myTickets = incidentsArray.filter((ticket) => idSet.has(ticket?.id));
        } else if (registrationNumber) {
          myTickets = incidentsArray.filter(
            (ticket) => String(ticket?.registrationNumber ?? '') === registrationNumber
          );
        } else if (email) {
          const wanted = safeLower(email);
          myTickets = incidentsArray.filter((ticket) => safeLower(ticket?.email) === wanted);
        } else if (reportedBy) {
          myTickets = incidentsArray.filter((ticket) => String(ticket?.reportedBy ?? '') === reportedBy);
        }

        // Sort by newest first (falls back to reverse insertion order)
        setIncidents(myTickets.slice().reverse());
      })
      .catch(err => console.error("Error:", err));
  }, []);

  // Filter and Search Logic
  const filteredIncidents = incidents.filter(incident => {
    const search = safeLower(searchTerm);
    const matchesSearch = safeLower(incident?.title).includes(search) || 
                          safeLower(incident?.id).includes(search);
    const matchesStatus = filterStatus === 'All' || incident.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Resolved': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">My Reported Incidents</h1>
          <Link to="/create" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg transition shadow-md">
            + Report New Issue
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row gap-4">
          <input 
            type="text" 
            placeholder="Search by Title or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md p-2 focus:ring-blue-500 bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        {/* Incidents List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {filteredIncidents.length > 0 ? (
              filteredIncidents.map((incident) => (
                <li key={incident.id} className="p-6 hover:bg-gray-50 transition duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-semibold text-gray-900 truncate">{incident.title}</p>
                        <p className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getStatusBadge(incident.status)}`}>
                          {incident.status}
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{stripHtmlToText(incident.description)}</p>
                      <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">ID: {String(incident?.id ?? '').substring(0, 8) || '—'}</span>
                        <span>Reported on: <span className="font-medium">{incident.dateReported}</span></span>
                      </div>
                      
                      {/* VIEW DETAILS BUTTON FOR THE USER */}
                      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                        <Link 
                          to={`/incident/${incident.id}`} 
                          className="text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-md transition"
                        >
                          View Details &rarr;
                        </Link>
                      </div>

                    </div>
                  </div>
                </li>
              ))
            ) : (
              <div className="p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No incidents found</h3>
                <p className="mt-1 text-sm text-gray-500">You haven't reported any issues matching this search.</p>
              </div>
            )}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default MyIncidents;