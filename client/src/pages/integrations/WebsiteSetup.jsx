import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { integrationsApi } from '../../api/integrations';
import ConfirmModal from '../../components/ConfirmModal';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/formatDate';

export default function WebsiteSetup() {
  const navigate = useNavigate();
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [revokeModal, setRevokeModal] = useState({ open: false, id: null });
  const [revoking, setRevoking] = useState(false);

  const fetchKeys = () => {
    integrationsApi.getApiKeys().then((r) => setApiKeys(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchKeys(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setCreating(true);
    try {
      await integrationsApi.createApiKey(newKeyName);
      toast.success('API key created');
      setNewKeyName('');
      setShowForm(false);
      fetchKeys();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setCreating(false); }
  };

  const handleRevoke = async () => {
    setRevoking(true);
    try {
      await integrationsApi.revokeApiKey(revokeModal.id);
      toast.success('API key revoked');
      setRevokeModal({ open: false, id: null });
      fetchKeys();
    } catch { toast.error('Failed to revoke'); }
    finally { setRevoking(false); }
  };

  const copy = (text) => navigator.clipboard.writeText(text).then(() => toast.success('Copied!'));

  const submitUrl = `${window.location.origin.replace('5173', '5000')}/api/integrations/website/submit`;

  const sampleCode = `fetch('${submitUrl}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_API_KEY_HERE'
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+91 9876543210',
    service: 'Web Design',
    utmSource: 'google',
    utmMedium: 'cpc',
    utmCampaign: 'brand'
  })
})`;

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/integrations')} className="text-gray-400 hover:text-gray-600 text-sm">← Integrations</button>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-3xl">🌐</span>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Website Integration</h1>
          <p className="text-gray-500 text-sm">Capture leads from your website using a secure API key</p>
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">API Keys</h3>
          <button onClick={() => setShowForm(true)} className="px-3 py-1.5 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">+ New Key</button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="flex gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
            <input
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Key name (e.g. Main Website)"
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
            <button type="submit" disabled={creating} className="px-4 py-2 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 disabled:opacity-60">
              {creating ? '...' : 'Create'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
          </form>
        )}

        {loading ? <p className="text-sm text-gray-400">Loading...</p> : apiKeys.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No API keys yet. Create one to get started.</p>
        ) : (
          <div className="space-y-2">
            {apiKeys.map((key) => (
              <div key={key._id} className={`flex items-center gap-3 p-3 rounded-lg border ${key.isActive ? 'border-gray-200' : 'border-red-100 bg-red-50'}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">{key.name}</span>
                    {!key.isActive && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Revoked</span>}
                  </div>
                  <code className="text-xs text-gray-500 font-mono">{key.key}</code>
                  <p className="text-xs text-gray-400">Created {formatDate(key.createdAt)}{key.lastUsed ? ` · Last used ${formatDate(key.lastUsed)}` : ''}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => copy(key.key)} className="px-2.5 py-1.5 text-xs border border-gray-200 rounded hover:bg-gray-50">Copy</button>
                  {key.isActive && (
                    <button onClick={() => setRevokeModal({ open: true, id: key._id })} className="px-2.5 py-1.5 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50">Revoke</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Integration Code */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-3">Integration Code</h3>
        <p className="text-sm text-gray-500 mb-3">Use this snippet in your website form submission handler:</p>
        <div className="relative">
          <pre className="text-xs bg-slate-900 text-green-400 rounded-lg p-4 overflow-x-auto font-mono">{sampleCode}</pre>
          <button onClick={() => copy(sampleCode)} className="absolute top-2 right-2 px-2 py-1 bg-slate-700 text-white text-xs rounded hover:bg-slate-600">Copy</button>
        </div>
        <div className="mt-3 text-xs text-gray-400">
          <strong>Submit URL:</strong> <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">{submitUrl}</code>
        </div>
      </div>

      <ConfirmModal
        isOpen={revokeModal.open}
        onClose={() => setRevokeModal({ open: false, id: null })}
        onConfirm={handleRevoke}
        title="Revoke API Key"
        message="This will disable the API key immediately. Any website forms using it will stop working."
        confirmLabel="Revoke"
        isLoading={revoking}
      />
    </div>
  );
}
