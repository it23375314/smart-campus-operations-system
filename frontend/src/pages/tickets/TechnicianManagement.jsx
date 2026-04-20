import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const TechnicianManagement = () => {
  const [technicians, setTechnicians] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('IT Support');

  const fetchTechnicians = () => {
    fetch('http://localhost:8087/api/technicians')
      .then(res => res.json())
      .then(data => setTechnicians(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const handleAddTechnician = async (e) => {
    e.preventDefault();
    const newTech = { name, email, category };

    try {
      const response = await fetch('http://localhost:8087/api/technicians', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTech),
      });
      if (response.ok) {
        setName(''); setEmail(''); setCategory('IT Support');
        fetchTechnicians(); // Refresh list
      }
    } catch (error) {
      console.error("Error adding technician:", error);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to remove this technician?")) return;
    try {
      await fetch(`http://localhost:8087/api/technicians/${id}`, { method: 'DELETE' });
      fetchTechnicians();
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Technician Management</h1>
            <p className="mt-2 text-sm text-gray-600">Add or remove support staff members.</p>
          </div>
          <Link to="/admin" className="text-gray-600 hover:text-gray-900 font-medium bg-white border border-gray-300 py-2 px-4 rounded-md shadow-sm transition">
            &larr; Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Add Technician Form */}
          <div className="md:col-span-1 bg-white shadow rounded-lg p-6 border border-gray-200 h-fit">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Add New Technician</h2>
            <form onSubmit={handleAddTechnician}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full border border-gray-300 p-2 rounded-md focus:ring-blue-500" placeholder="e.g., Kamal Perera" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-gray-300 p-2 rounded-md focus:ring-blue-500" placeholder="tech@campus.edu" />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-gray-300 p-2 rounded-md focus:ring-blue-500">
                  <option value="IT Support">IT Support</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Network">Network</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition">Add Technician</button>
            </form>
          </div>

          {/* Technicians List */}
          <div className="md:col-span-2 bg-white shadow rounded-lg overflow-hidden border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {technicians.map(tech => (
                  <tr key={tech.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{tech.name}</div>
                      <div className="text-sm text-gray-500">{tech.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">{tech.category}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleDelete(tech.id)} className="text-red-600 hover:text-red-900 font-semibold">Remove</button>
                    </td>
                  </tr>
                ))}
                {technicians.length === 0 && (
                  <tr><td colSpan="3" className="px-6 py-4 text-center text-gray-500">No technicians added yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianManagement;