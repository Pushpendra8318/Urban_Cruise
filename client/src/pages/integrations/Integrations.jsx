import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { integrationsApi } from '../../api/integrations';

export default function Integrations() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    integrationsApi.getStatus().then((r) => setStatus(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const integrations = [
    {
      key: 'meta',
      name: 'Meta Ads',
      desc: 'Receive leads from Facebook & Instagram ad campaigns via webhook.',
      icon: '📘',
      color: 'blue',
      path: '/integrations/meta',
      connected: status?.meta?.connected,
    },
    {
      key: 'google',
      name: 'Google Ads',
      desc: 'Sync leads from Google Ads Lead Form Extensions.',
      icon: '🔍',
      color: 'red',
      path: '/integrations/google',
      connected: status?.google?.connected,
    },
    {
      key: 'website',
      name: 'Website Forms',
      desc: 'Embed a lead form on your website using a secure API key.',
      icon: '🌐',
      color: 'cyan',
      path: '/integrations/website',
      connected: status?.website?.connected,
    },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Integrations</h1>
        <p className="text-gray-500 text-sm mt-0.5">Connect your lead sources to automatically capture leads.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {integrations.map((int) => (
          <div key={int.key} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{int.icon}</span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${int.connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {loading ? '...' : int.connected ? '✓ Connected' : 'Not connected'}
              </span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">{int.name}</h3>
            <p className="text-gray-500 text-sm flex-1 mb-4">{int.desc}</p>
            <button
              onClick={() => navigate(int.path)}
              className="w-full py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Configure →
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-700 mb-3">How Integrations Work</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
          <div className="flex gap-3">
            <span className="text-xl flex-shrink-0">1️⃣</span>
            <div><strong className="text-gray-700">Configure</strong><br />Enter your API credentials and webhook settings for each platform.</div>
          </div>
          <div className="flex gap-3">
            <span className="text-xl flex-shrink-0">2️⃣</span>
            <div><strong className="text-gray-700">Connect</strong><br />Leads flow in automatically when someone fills out your ads or website form.</div>
          </div>
          <div className="flex gap-3">
            <span className="text-xl flex-shrink-0">3️⃣</span>
            <div><strong className="text-gray-700">Manage</strong><br />View all leads in one place and assign them to your team instantly.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
