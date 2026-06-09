export default function General() {
  return (
    <div className="max-w-lg space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">General Settings</h1>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">Application</h3>
          <p className="text-gray-500 text-sm">LeadFlow CRM for Urban Cruise</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            ['Version', '1.0.0'],
            ['Environment', import.meta.env.MODE === 'production' ? 'Production' : 'Development'],
            ['API Base', '/api'],
            ['Timezone', Intl.DateTimeFormat().resolvedOptions().timeZone],
          ].map(([k, v]) => (
            <div key={k} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">{k}</p>
              <p className="font-medium text-gray-700">{v}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Quick Links</h3>
        <div className="space-y-2 text-sm">
          {[
            { label: 'View API Documentation', href: '#' },
            { label: 'Integration Guide', href: '#' },
            { label: 'Report a Bug', href: '#' },
          ].map((link) => (
            <a key={link.label} href={link.href} className="flex items-center gap-2 text-indigo-500 hover:text-indigo-600 py-1">
              <span>→</span> {link.label}
            </a>
          ))}
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-700">
        <strong>LeadFlow CRM</strong> — Built for Urban Cruise. Centralized lead management from Meta Ads, Google Ads, and website forms.
      </div>
    </div>
  );
}
