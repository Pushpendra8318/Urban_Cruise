import { useNavigate } from 'react-router-dom';

export default function ApiKeys() {
  const navigate = useNavigate();

  return (
    <div className="max-w-lg space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">API Keys</h1>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
        <p className="text-gray-500 text-sm">
          Manage API keys for website form integration. API keys allow your website to submit leads directly to LeadFlow CRM.
        </p>

        <button
          onClick={() => navigate('/integrations/website')}
          className="w-full py-3 bg-indigo-500 text-white font-medium text-sm rounded-lg hover:bg-indigo-600 transition-colors"
        >
          Manage API Keys →
        </button>

        <div className="pt-4 border-t border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">Using API Keys</h3>
          <div className="space-y-3 text-sm text-gray-500">
            <div className="flex gap-3">
              <span className="flex-shrink-0 font-semibold text-indigo-500">1.</span>
              <span>Go to <strong>Integrations → Website</strong> to create an API key</span>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 font-semibold text-indigo-500">2.</span>
              <span>Include the key as <code className="bg-gray-100 px-1 rounded">X-API-Key</code> header in your form POST request</span>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 font-semibold text-indigo-500">3.</span>
              <span>Submit to <code className="bg-gray-100 px-1 rounded">/api/integrations/website/submit</code></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
