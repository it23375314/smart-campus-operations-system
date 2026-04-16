import { useState } from 'react';
import { Link } from 'react-router-dom';

const MyIncidents = () => {
  // Mock data to test the UI. Later, you will fetch this from Spring Boot / MongoDB.
  const [incidents, setIncidents] = useState([
    {
      id: "INC-001",
      title: "Broken Projector in Room 402",
      date: "2026-04-05",
      status: "Pending",
      description: "The projector won't turn on, and the power cable seems frayed.",
    },
    {
      id: "INC-002",
      title: "AC leaking in Library",
      date: "2026-04-01",
      status: "In Progress",
      description: "Water is dripping heavily near the Computer Science book section.",
    },
    {
      id: "INC-003",
      title: "Wi-Fi down in Cafe",
      date: "2026-03-28",
      status: "Resolved",
      description: "Cannot connect to the student network in the left wing of the cafe.",
    }
  ]);

  // A helper function to change Tailwind colors based on the ticket status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            My Reported Incidents
          </h1>
          {/* This Link automatically routes to the Create Incident page */}
          <Link 
            to="/create" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 shadow-sm"
          >
            + Report New Issue
          </Link>
        </div>

        {/* Incidents List Container */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
          <ul className="divide-y divide-gray-200">
            
            {incidents.map((incident) => (
              <li key={incident.id} className="p-6 hover:bg-gray-50 transition duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-semibold text-blue-600 truncate">
                        {incident.title}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        {/* Dynamic Status Badge using Tailwind */}
                        <p className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadge(incident.status)}`}>
                          {incident.status}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-600">
                          {incident.description}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          Reported on <time dateTime={incident.date} className="font-medium">{incident.date}</time>
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-400 font-mono">
                      Ticket ID: {incident.id}
                    </div>
                  </div>
                </div>
              </li>
            ))}

            {/* Empty State (If there are no incidents) */}
            {incidents.length === 0 && (
              <li className="p-8 text-center text-gray-500">
                You haven't reported any issues yet.
              </li>
            )}
            
          </ul>
        </div>
        
      </div>
    </div>
  );
};

export default MyIncidents;