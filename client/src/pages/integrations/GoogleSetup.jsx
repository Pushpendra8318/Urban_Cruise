import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { integrationsApi } from '../../api/integrations';
import toast from 'react-hot-toast';

export default function GoogleSetup() {
  const navigate = useNavigate();
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    integrationsApi.getStatus().then((r) => setStatus(r.data.google)).catch(() => {});
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await integrationsApi.syncGoogle();
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/integrations')} className="text-gray-400 hover:text-gray-600 text-sm">← Integrations</button>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
          <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Google Ads Integration</h1>
          <p className="text-gray-500 text-sm">Sync leads from Google Ads Lead Form Extensions</p>
        </div>
      </div>

      {/* Connection status */}
      {status !== null && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${status.connected ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${status.connected ? 'bg-emerald-500' : 'bg-amber-400'}`} />
          {status.connected
            ? `Connected — Customer ID ${status.customerId}`
            : 'Not configured — add the 5 environment variables below to activate'}
        </div>
      )}

      {/* Setup steps */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
        <h3 className="font-semibold text-gray-800">Setup Instructions</h3>
        <ol className="space-y-4 text-sm text-gray-600">
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
            <div>
              <strong className="text-gray-700">Create a Google Cloud Project</strong>
              <p className="mt-1">Go to Google Cloud Console → Create Project → Enable the <strong>Google Ads API</strong>.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
            <div>
              <strong className="text-gray-700">Get OAuth2 Credentials</strong>
              <p className="mt-1">Create an OAuth 2.0 Client ID → use the <a href="https://developers.google.com/oauthplayground" target="_blank" rel="noreferrer" className="text-indigo-600 underline">OAuth Playground</a> to get a refresh token with the <code className="bg-gray-100 px-1 rounded text-xs">https://www.googleapis.com/auth/adwords</code> scope.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
            <div>
              <strong className="text-gray-700">Apply for a Developer Token</strong>
              <p className="mt-1">In Google Ads → Tools → API Centre → apply for a developer token (test token works for development).</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
            <div>
              <strong className="text-gray-700">Add environment variables on Render</strong>
              <pre className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 mt-2 font-mono overflow-x-auto whitespace-pre-wrap">
{`GOOGLE_ADS_CLIENT_ID=your_oauth2_client_id
GOOGLE_ADS_CLIENT_SECRET=your_oauth2_client_secret
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token
GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token
GOOGLE_ADS_CUSTOMER_ID=123-456-7890`}
              </pre>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">5</span>
            <div>
              <strong className="text-gray-700">Sync leads manually or set auto-schedule</strong>
              <p className="mt-1">Click the button below to pull all lead form submissions. For automatic sync, a daily cron job runs at midnight.</p>
            </div>
          </li>
        </ol>

        <div className="pt-2 border-t border-gray-100 flex items-center gap-3 flex-wrap">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-5 py-2.5 bg-red-500 text-white font-medium text-sm rounded-xl hover:bg-red-600 disabled:opacity-60 transition-colors flex items-center gap-2"
          >
            <svg className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {syncing ? 'Syncing...' : 'Sync Google Leads Now'}
          </button>
          <p className="text-xs text-gray-400">Only new leads not already in the system will be imported.</p>
        </div>
      </div>
    </div>
  );
}
