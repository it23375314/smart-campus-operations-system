import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Import Medium Editor and its default themes
import MediumEditor from 'medium-editor';
import 'medium-editor/dist/css/medium-editor.css';
import 'medium-editor/dist/css/themes/default.css';

export default function CreateIncident() {
  const navigate = useNavigate();

  const editorElementRef = useRef(null);
  const mediumEditorRef = useRef(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [faculty, setFaculty] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [subject, setSubject] = useState('');
  const [campus, setCampus] = useState('Malabe Campus');
  const [message, setMessage] = useState('');
  
  // File Upload State
  const [proofFiles, setProofFiles] = useState([]);
  const [fileError, setFileError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!editorElementRef.current) return;

    mediumEditorRef.current = new MediumEditor(editorElementRef.current, {
      toolbar: false,
      placeholder: {
        text: 'Type your message...',
        hideOnClick: false,
      },
    });

    const handleEditableInput = () => {
      const html = editorElementRef.current?.innerHTML ?? '';
      setMessage(html);
    };

    mediumEditorRef.current.subscribe('editableInput', handleEditableInput);

    // Initialize editor with current state
    editorElementRef.current.innerHTML = message || '';

    return () => {
      try {
        mediumEditorRef.current?.destroy();
      } finally {
        mediumEditorRef.current = null;
      }
    };
    // Intentionally initialize once; we sync content via the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = editorElementRef.current;
    if (!el) return;
    const desired = message || '';
    if ((el.innerHTML ?? '') !== desired) {
      el.innerHTML = desired;
    }
  }, [message]);

  const readFileAsDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e) => {
    setFileError('');
    const newFiles = Array.from(e.target.files);
    
    const oversizedFile = newFiles.find(file => file.size > 5242880);
    if (oversizedFile) {
      setFileError(`File "${oversizedFile.name}" is too large. Maximum size is 5MB.`);
      e.target.value = '';
      return;
    }
    setProofFiles(prevFiles => [...prevFiles, ...newFiles]);
    e.target.value = ''; 
  };

  const removeFile = (indexToRemove) => {
    setProofFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleReset = () => {
    setName(''); setEmail(''); setRegistrationNumber(''); setFaculty('');
    setContactNumber(''); setSubject(''); setCampus('Malabe Campus'); setMessage('');
    setProofFiles([]); setFileError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (fileError) return;
    
    if (faculty === '' || faculty === 'Select') {
        alert("Please select your Faculty.");
        return;
    }

    setIsSubmitting(true);

    try {
      const base64Files = await Promise.all(proofFiles.map(readFileAsDataUrl));

      // Track the "current user" for MyIncidents (no auth in this app)
      try {
        localStorage.setItem('scos.registrationNumber', registrationNumber);
        if (email) localStorage.setItem('scos.email', email);
        if (name) localStorage.setItem('scos.reportedBy', name);
      } catch {
        // ignore storage failures
      }

      const newIncident = {
        reportedBy: name,
        email: email,
        registrationNumber: registrationNumber,
        faculty: faculty,
        contactNumber: contactNumber,
        title: subject,
        campus: campus,
        description: message, // This will now save the formatted HTML from Medium Editor
        proofUrls: base64Files,
      };

      const response = await fetch('http://localhost:8087/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIncident),
      });

      if (!response.ok) throw new Error('Failed to create ticket');

      const createdIncident = await response.json();
      if (createdIncident?.id) {
        try {
          const raw = localStorage.getItem('scos.myIncidentIds');
          const existing = raw ? JSON.parse(raw) : [];
          const next = Array.isArray(existing) ? existing : [];
          if (!next.includes(createdIncident.id)) next.unshift(createdIncident.id);
          localStorage.setItem('scos.myIncidentIds', JSON.stringify(next.slice(0, 200)));
        } catch {
          // ignore storage failures
        }
      }

      alert("✅ Ticket submitted successfully!");
      handleReset();
      navigate('/'); 

    } catch (error) {
      console.error("Error:", error);
      alert("❌ There was an error submitting the ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-10 rounded shadow-md border border-gray-200">
        
        <div className="mb-6 border-b border-gray-200 pb-4">
          <h2 className="text-xl text-gray-700 mb-2">
            Please complete this form and one of our agents will reply to you by email as soon as possible.
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Name & Email Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Name *</label>
              <input
                className="w-full border border-gray-300 p-2.5 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700 bg-gray-50"
                type="text" value={name} onChange={(e) => setName(e.target.value)} required
              />
            </div>
            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="block text-sm font-semibold text-gray-800">Email</label>
                <span className="text-xs text-blue-600 hover:underline cursor-pointer">Manage my email addresses</span>
              </div>
              <input
                className="w-full border border-gray-300 p-2.5 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700 bg-gray-50"
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Registration Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Registration number *</label>
            <input
              className="w-full border border-gray-300 p-2.5 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700"
              type="text" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} required
            />
          </div>

          {/* Faculty / School */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Faculty / School *</label>
            <p className="text-xs text-gray-500 mb-1">Please select your faculty</p>
            <select
              className="w-full border border-gray-300 p-2.5 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700 bg-white"
              value={faculty} onChange={(e) => setFaculty(e.target.value)} required
            >
              <option value="Select">Select</option>
              <option value="Faculty of Computing">Faculty of Computing</option>
              <option value="School of Business">School of Business</option>
              <option value="Faculty of Engineering">Faculty of Engineering</option>
              <option value="Faculty of Humanities & Sciences">Faculty of Humanities & Sciences</option>
              <option value="School of Architecture">School of Architecture</option>
              <option value="Faculty of Graduate Studies & Research">Faculty of Graduate Studies & Research</option>
            </select>
          </div>

          {/* Contact Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Contact number *</label>
            <p className="text-xs text-gray-500 mb-1">Enter your mobile telephone number</p>
            <input
              className="w-full border border-gray-300 p-2.5 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700"
              type="tel" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Subject *</label>
            <input
              className="w-full border border-gray-300 p-2.5 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700"
              type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required
            />
          </div>

          {/* Campus/Center */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Campus/Center *</label>
            <p className="text-xs text-gray-500 mb-1">Please select the Campus or the Center that you are currently registered to, so that the ticket will be assigned to the correct campus/center agent.</p>
            <select
              className="w-full border border-gray-300 p-2.5 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700 bg-white"
              value={campus} onChange={(e) => setCampus(e.target.value)} required
            >
              <option value="Malabe Campus">Malabe Campus</option>
              <option value="Kandy Uni / Kandy Center">Kandy Uni / Kandy Center</option>
              <option value="Nothern Uni">Nothern Uni</option>
              <option value="Matara Center">Matara Center</option>
              <option value="Kurunegala Center">Kurunegala Center</option>
            </select>
          </div>

          {/* Medium Editor Component replacing the raw textarea */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Message *</label>
            <div className="border border-gray-300 rounded focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white">
              <div
                ref={editorElementRef}
                contentEditable
                suppressContentEditableWarning
                className="w-full p-3 outline-none text-gray-700 min-h-[150px] cursor-text"
              />
            </div>
          </div>

          {/* Add Attachment */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Add attachment</label>
            <div className="w-full border border-dashed border-gray-300 p-4 rounded bg-gray-50 flex items-center gap-3">
              <label className="cursor-pointer bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm">
                <input type="file" multiple accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} className="hidden" />
                📄 Choose files
              </label>
              <span className="text-gray-500 text-sm">or drag and drop</span>
            </div>
            
            {fileError && <p className="text-red-500 text-sm mt-2">{fileError}</p>}
            
            {proofFiles.length > 0 && (
              <ul className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                {proofFiles.map((file, index) => (
                  <li key={index} className="flex items-center justify-between bg-white border border-gray-200 p-2 rounded text-sm text-gray-700 shadow-sm">
                    <span className="truncate max-w-[80%] font-medium">{file.name}</span>
                    <button type="button" onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700 text-xs font-bold px-2">Remove</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              className={`bg-[#2c75d3] hover:bg-[#1a5baf] text-white font-medium py-2 px-6 rounded transition ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              type="submit" disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
            <button
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-6 rounded transition"
              type="button" onClick={handleReset} disabled={isSubmitting}
            >
              Reset
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}