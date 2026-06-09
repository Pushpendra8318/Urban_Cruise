import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignsApi } from '../../api/campaigns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b'];

export default function Sources() {
  const navigate = useNavigate();
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    campaignsApi.getSources().then((r) => setSources(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/campaigns')} className="text-gray-400 hover:text-gray-600 text-sm">← Campaigns</button>
        <h1 className="text-2xl font-bold text-gray-800">Source Analysis</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4">Lead Distribution by Source</h3>
          {loading ? <div className="h-48 bg-gray-100 animate-pulse rounded" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={sources} dataKey="total" nameKey="source" cx="50%" cy="50%" outerRadius={85}
                  label={({ source, percent }) => `${source} ${(percent * 100).toFixed(0)}%`}>
                  {sources.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4">Conversion Rates by Source</h3>
          {loading ? <div className="h-48 bg-gray-100 animate-pulse rounded" /> : (
            <div className="space-y-4">
              {sources.map((s, i) => (
                <div key={s.source}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">{s.source}</span>
                    <span className="text-sm font-semibold text-gray-800">{s.conversionRate}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-2 rounded-full" style={{ width: `${s.conversionRate}%`, background: COLORS[i % COLORS.length] }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{s.total} total</span>
                    <span>{s.converted} converted</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Source', 'Total Leads', 'Converted', 'Conversion Rate'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? null : sources.map((s) => (
              <tr key={s.source} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-700 capitalize">{s.source}</td>
                <td className="px-5 py-3 text-indigo-600 font-semibold">{s.total}</td>
                <td className="px-5 py-3 text-green-600 font-medium">{s.converted}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full max-w-[80px]">
                      <div className="h-1.5 bg-indigo-500 rounded-full" style={{ width: `${Math.min(s.conversionRate, 100)}%` }} />
                    </div>
                    <span className="text-gray-700 font-medium text-xs">{s.conversionRate}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
