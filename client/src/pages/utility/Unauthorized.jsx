import { useNavigate } from 'react-router-dom';

export default function Unauthorized() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <div className="text-8xl mb-6">🚫</div>
        <h1 className="text-6xl font-bold text-gray-200 mb-4">403</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Access denied</h2>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">You don't have permission to access this page. Contact your admin if you believe this is an error.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate(-1)} className="px-5 py-2.5 border border-gray-300 text-gray-600 font-medium rounded-lg hover:bg-gray-50">Go back</button>
          <button onClick={() => navigate('/dashboard')} className="px-5 py-2.5 bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-600">Dashboard</button>
        </div>
      </div>
    </div>
  );
}
