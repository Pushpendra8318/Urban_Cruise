import { useState, useEffect } from 'react';
import {
  LineChart, Line, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { analyticsApi } from '../../api/analytics';
import { CardSkeleton, ChartSkeleton } from '../../components/LoadingSkeleton';

const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];
const PERIODS = [{ label: '7d', value: '7d' }, { label: '30d', value: '30d' }, { label: '90d', value: '90d' }];

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [overTime, setOverTime] = useState([]);
  const [bySource, setBySource] = useState([]);
  const [funnel, setFunnel] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [timeLoading, setTimeLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      analyticsApi.getSummary(),
      analyticsApi.getBySource(),
      analyticsApi.getFunnel(),
      analyticsApi.getCampaigns(),
    ]).then(([s, bs, f, c]) => {
      setSummary(s.data);
      setBySource(bs.data);
      setFunnel(f.data);
      setCampaigns(c.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setTimeLoading(true);
    analyticsApi.getOverTime(period).then((r) => setOverTime(r.data)).catch(() => {}).finally(() => setTimeLoading(false));
  }, [period]);

  if (loading) return (
    <div className="space-y-4 md:space-y-6">
      <CardSkeleton count={4} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <ChartSkeleton /><ChartSkeleton /><ChartSkeleton /><ChartSkeleton />
      </div>
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800">Analytics</h1>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Total Leads', value: summary?.total || 0, color: 'bg-indigo-50 text-indigo-600' },
          { label: 'This Month', value: summary?.monthCount || 0, color: 'bg-blue-50 text-blue-600' },
          { label: 'Converted', value: summary?.converted || 0, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Conversion Rate', value: `${summary?.conversionRate || 0}%`, color: 'bg-amber-50 text-amber-600' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100">
            <div className={`inline-flex text-2xl md:text-3xl font-bold mb-1 ${kpi.color.split(' ')[1]}`}>{kpi.value}</div>
            <div className="text-xs md:text-sm text-gray-500 font-medium">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Leads Over Time */}
      <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4 gap-3">
          <h3 className="font-semibold text-gray-700 text-sm md:text-base">Leads Over Time</h3>
          <div className="flex gap-1 flex-shrink-0">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-2.5 md:px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${period === p.value ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className={timeLoading ? 'opacity-50' : ''}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={overTime} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip formatter={(v) => [v, 'Leads']} />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Source + Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4 text-sm md:text-base">Leads by Source</h3>
          {bySource.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie
                  data={bySource} dataKey="count" nameKey="source"
                  cx="50%" cy="45%" outerRadius={70} label={false}
                >
                  {bySource.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4 text-sm md:text-base">Conversion Funnel</h3>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={funnel} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
              <YAxis dataKey="status" type="category" tick={{ fontSize: 10 }} width={70} />
              <Tooltip formatter={(v) => [v, 'Leads']} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {funnel.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Campaign Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 md:px-5 py-3 md:py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700 text-sm md:text-base">Campaign Performance</h3>
        </div>

        {/* Mobile card view */}
        <div className="md:hidden divide-y divide-gray-50">
          {campaigns.length === 0 ? (
            <p className="px-4 py-8 text-center text-gray-400 text-sm">No campaign data yet</p>
          ) : campaigns.map((c) => (
            <div key={c._id} className="px-4 py-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-medium text-gray-800 text-sm">{c.name}</span>
                <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-0.5 rounded-full">{c.source}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div><div className="text-base font-semibold text-indigo-600">{c.leads}</div><div className="text-xs text-gray-400">Leads</div></div>
                <div><div className="text-base font-semibold text-emerald-600">{c.conversions}</div><div className="text-xs text-gray-400">Converted</div></div>
                <div><div className="text-base font-semibold text-gray-700">{c.leads > 0 ? ((c.conversions / c.leads) * 100).toFixed(1) : 0}%</div><div className="text-xs text-gray-400">Rate</div></div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Campaign', 'Source', 'Leads', 'Conversions', 'Rate', 'Budget'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400 text-sm">No campaign data yet</td></tr>
              ) : campaigns.map((c) => (
                <tr key={c._id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-800">{c.name}</td>
                  <td className="px-5 py-3 text-gray-500 capitalize">{c.source}</td>
                  <td className="px-5 py-3 font-semibold text-indigo-600">{c.leads}</td>
                  <td className="px-5 py-3 text-emerald-600 font-medium">{c.conversions}</td>
                  <td className="px-5 py-3 text-gray-600">{c.leads > 0 ? ((c.conversions / c.leads) * 100).toFixed(1) : 0}%</td>
                  <td className="px-5 py-3 text-gray-500">{c.budget > 0 ? `₹${c.budget.toLocaleString()}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
