import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateIncident() {
  const navigate = useNavigate();

  // State to hold the form data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This function runs when the user clicks "Submit Ticket"
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevents the page from refreshing
    setIsSubmitting(true);

    // This matches the Incident.java blueprint in your Spring Boot backend!
    const newIncident = {
      title: title,
      description: description,
      reportedBy: "Student User", // Hardcoded for now until you add login features
    };

    // Send the data to your Java backend
    fetch('http://localhost:8081/api/incidents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newIncident),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to create ticket');
        }
        return response.json();
      })
      .then((data) => {
        console.log("Success:", data);
        alert("Ticket submitted successfully!");
        navigate('/'); // Automatically redirect back to the "My Incidents" page
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("There was an error submitting the ticket.");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Report an Issue</h2>

        {/* Note the onSubmit handler added to the form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-gray-700 font-semibold mb-2" htmlFor="title">
              Issue Title
            </label>
            <input
              className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)} // Grabs the text as they type
              placeholder="E.g., Broken Projector in Room 402"
              required
            />
          </div>

          <div className="mb-5">
            <label className="block text-gray-700 font-semibold mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="description"
              rows="5"
              value={description}
              onChange={(e) => setDescription(e.target.value)} // Grabs the text as they type
              placeholder="Describe the problem in detail... What happened? Where is it?"
              required
            />
          </div>

          {/* Note: File upload is visually here, but handling files to the database requires a bit more advanced Spring Boot code later! */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2" htmlFor="proofFile">
              Upload Proof (Image/Document)
            </label>
            <input
              className="w-full text-gray-600 bg-gray-50 border border-gray-300 p-2 rounded-md cursor-pointer file:cursor-pointer file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold file:px-4 file:py-2 file:rounded-md hover:file:bg-blue-100"
              type="file"
              id="proofFile"
              accept=".jpg,.jpeg,.png,.pdf"
            />
            <p className="text-sm text-gray-500 mt-2">Accepted formats: JPG, PNG, PDF. Max size: 5MB.</p>
          </div>

          <div className="flex items-center justify-between gap-4 mt-8">
            <button
              className="w-full bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-md hover:bg-gray-300 transition duration-300"
              type="button"
              onClick={() => navigate('/')}
            >
              Cancel
            </button>
            <button
              className={`w-full text-white font-bold py-3 px-4 rounded-md transition duration-300 ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}