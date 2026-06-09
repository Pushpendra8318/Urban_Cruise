import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { integrationsApi } from '../../api/integrations';
import toast from 'react-hot-toast';

export default function MetaSetup() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    integrationsApi.getStatus().then((r) => setStatus(r.data.meta)).catch(() => {});
  }, []);

  const webhookUrl = status?.webhookUrl || `${window.location.origin.replace('5173', '5000')}/api/integrations/meta/webhook`;
  const verifyToken = status?.verifyToken || 'Configured in server .env';

  const copy = (text) => {
    navigator.clipboard.writeText(text).then(() => toast.success('Copied!'));
  };

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/integrations')} className="text-gray-400 hover:text-gray-600 text-sm">← Integrations</button>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-3xl">📘</span>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Meta Ads Setup</h1>
          <p className="text-gray-500 text-sm">Connect Facebook & Instagram lead forms via webhook</p>
        </div>
        {status?.connected && <span className="ml-auto text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">✓ Connected</span>}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
        <h3 className="font-semibold text-gray-800">Setup Instructions</h3>
        <ol className="space-y-4 text-sm text-gray-600">
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
            <div>
              <strong className="text-gray-700">Create a Meta App</strong>
              <p>Go to Meta for Developers → Create App → Business type → Add Lead Generation product.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
            <div>
              <strong className="text-gray-700">Configure Webhook</strong>
              <p className="mb-2">In your Meta App settings, go to Webhooks → Add Callback URL and Verify Token:</p>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-400">Callback URL</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded px-3 py-2 font-mono break-all">{webhookUrl}</code>
                    <button onClick={() => copy(webhookUrl)} className="px-3 py-2 bg-indigo-500 text-white text-xs rounded-lg hover:bg-indigo-600">Copy</button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400">Verify Token (from .env META_VERIFY_TOKEN)</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded px-3 py-2 font-mono">{verifyToken}</code>
                    <button onClick={() => copy(verifyToken)} className="px-3 py-2 bg-indigo-500 text-white text-xs rounded-lg hover:bg-indigo-600">Copy</button>
                  </div>
                </div>
              </div>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
            <div>
              <strong className="text-gray-700">Subscribe to leadgen events</strong>
              <p>In Webhooks, subscribe to the <code className="bg-gray-100 px-1 rounded">leadgen</code> field for your Page.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
            <div>
              <strong className="text-gray-700">Set environment variables</strong>
              <p>Add to your server .env file:</p>
              <pre className="text-xs bg-gray-50 border border-gray-200 rounded p-3 mt-2 font-mono overflow-x-auto">
{`META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret
META_VERIFY_TOKEN=your_custom_token
META_ACCESS_TOKEN=your_page_access_token`}
              </pre>
            </div>
          </li>
        </ol>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        <strong>Note:</strong> When a user submits a lead form on your Facebook or Instagram ad, Meta will POST the lead data to the webhook URL above. LeadFlow will automatically create the lead and notify your team.
      </div>
    </div>
  );
}
