import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  // Start with an empty array. No more fake data!
  const [allIncidents, setAllIncidents] = useState([]);

  // useEffect fetches the real data from your Spring Boot backend when the page loads
  useEffect(() => {
    fetch('http://localhost:8081/api/incidents')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setAllIncidents(data); // Put the real database data into our state
      })
      .catch(error => {
        console.error("Error fetching incidents:", error);
      });
  }, []);

  // Helper function for Tailwind status colors
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate quick stats based on the real data
  const pendingCount = allIncidents.filter(inc => inc.status === 'Pending').length;
  const inProgressCount = allIncidents.filter(inc => inc.status === 'In Progress').length;
  const resolvedCount = allIncidents.filter(inc => inc.status === 'Resolved').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Issue Management Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">Overview of all reported campus resource incidents.</p>
        </div>

        {/* Dynamic Quick Stats */}
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allIncidents.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No incidents found in the database.
                    </td>
                  </tr>
                ) : (
                  allIncidents.map((incident) => (
                    <tr key={incident.id} className="hover:bg-gray-50 transition duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{incident.id.substring(0, 8)}...</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{incident.title}</td>
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
    </div>
  );
};

export default AdminDashboard;