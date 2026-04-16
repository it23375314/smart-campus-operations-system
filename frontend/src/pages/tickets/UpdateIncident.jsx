import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const UpdateIncident = () => {
  // useParams grabs the ID from the URL (e.g., /update/INC-001)
  const { id } = useParams();

  // State to hold our form inputs
  const [status, setStatus] = useState('Pending');
  const [technician, setTechnician] = useState('');
  const [remarks, setRemarks] = useState('');

  // Fake ticket data (Normally, you would fetch this from Spring Boot using the 'id')
  const ticketDetails = {
    title: "Broken Projector in Room 402",
    reportedBy: "Saman Perera",
    date: "2026-04-05",
    description: "The projector won't turn on, and the power cable seems frayed. We need this for the morning lecture.",
    currentStatus: "Pending",
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    // Later, this will be an API call (PATCH/PUT request to Spring Boot)
    alert(`Ticket ${id} Updated!\nStatus: ${status}\nTech: ${technician}\nRemarks: ${remarks}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header with Back Button */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Update Ticket: {id}</h1>
            <p className="mt-2 text-sm text-gray-600">Manage issue details and assign technicians.</p>
          </div>
          <Link to="/admin" className="text-gray-600 hover:text-gray-900 font-medium bg-white border border-gray-300 py-2 px-4 rounded-md shadow-sm transition">
            &larr; Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Original Issue Details */}
          <div className="md:col-span-1 bg-white shadow rounded-lg p-6 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Original Report</h2>
            <div className="space-y-4">
              <div>
                <span className="block text-sm font-medium text-gray-500">Title</span>
                <span className="block text-gray-900 font-semibold">{ticketDetails.title}</span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-500">Reported By</span>
                <span className="block text-gray-900">{ticketDetails.reportedBy}</span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-500">Date Reported</span>
                <span className="block text-gray-900">{ticketDetails.date}</span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-500">Description</span>
                <p className="mt-1 text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-100">
                  {ticketDetails.description}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Update Form */}
          <div className="md:col-span-2 bg-white shadow rounded-lg p-6 border border-gray-200">
             <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Technician Actions</h2>
             
             <form onSubmit={handleUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  
                  {/* Status Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                    <select 
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full border border-gray-300 p-2.5 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  {/* Assign Technician Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assign Technician</label>
                    <input 
                      type="text" 
                      value={technician}
                      onChange={(e) => setTechnician(e.target.value)}
                      placeholder="e.g., Kamal (Tech Team)"
                      className="w-full border border-gray-300 p-2.5 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Remarks Textarea */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Technician Remarks (Internal)</label>
                  <textarea 
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows="4"
                    placeholder="Add notes about repairs, parts ordered, etc..."
                    className="w-full border border-gray-300 p-3 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>

                <div className="flex justify-end">
                  <button 
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-md shadow-sm transition duration-200"
                  >
                    Save Updates
                  </button>
                </div>
             </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UpdateIncident;