import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
          Vite + React
        </h1>
        <p className="text-gray-600 mb-8">
          Tailwind CSS is configured and working!
        </p>
        
        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>Ready to start building your application!</p>
        </div>
      </div>
    </div>
  )
}

export default App
