import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { analyticsApi } from '../../api/analytics';
import { leadsApi } from '../../api/leads';
import { CardSkeleton, ChartSkeleton } from '../../components/LoadingSkeleton';
import StatusBadge from '../../components/StatusBadge';
import { formatDate } from '../../utils/formatDate';

const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

const kpiConfig = [
  { key: 'total', label: 'Total Leads', sub: 'All time', color: 'indigo', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  )},
  { key: 'todayCount', label: 'Today', sub: 'New today', color: 'blue', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
  )},
  { key: 'monthCount', label: 'This Month', sub: 'Last 30 days', color: 'green', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
  )},
  { key: 'conversionRate', label: 'Conversion Rate', sub: null, color: 'yellow', isPercent: true, icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
  )},
];

const colorMap = {
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-500', val: 'text-indigo-600' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-500', val: 'text-blue-600' },
  green: { bg: 'bg-emerald-50', text: 'text-emerald-500', val: 'text-emerald-600' },
  yellow: { bg: 'bg-amber-50', text: 'text-amber-500', val: 'text-amber-600' },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [overTime, setOverTime] = useState([]);
  const [bySource, setBySource] = useState([]);
  const [funnel, setFunnel] = useState([]);
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsApi.getSummary(),
      analyticsApi.getOverTime('30d'),
      analyticsApi.getBySource(),
      analyticsApi.getFunnel(),
      leadsApi.getAll({ limit: 5 }),
    ]).then(([s, ot, bs, f, rl]) => {
      setSummary(s.data);
      setOverTime(ot.data);
      setBySource(bs.data);
      setFunnel(f.data);
      setRecentLeads(rl.data.leads);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <CardSkeleton count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <ChartSkeleton /><ChartSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5">Welcome back! Here's your lead overview.</p>
        </div>
        <button
          onClick={() => navigate('/leads/add')}
          className="px-3 md:px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-xl hover:bg-indigo-600 transition-colors flex-shrink-0 shadow-sm shadow-indigo-500/30"
        >
          <span className="hidden sm:inline">+ Add Lead</span>
          <span className="sm:hidden">+</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {kpiConfig.map(({ key, label, sub, color, isPercent, icon }) => {
          const c = colorMap[color];
          const val = isPercent ? `${summary?.[key] || 0}%` : (summary?.[key] || 0);
          const subText = key === 'conversionRate' ? `${summary?.converted || 0} converted` : sub;
          return (
            <div key={key} className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs md:text-sm font-medium text-gray-500 leading-tight">{label}</span>
                <div className={`w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center ${c.bg} ${c.text} flex-shrink-0`}>
                  {icon}
                </div>
              </div>
              <div className={`text-2xl md:text-3xl font-bold mb-1 ${c.val}`}>{val}</div>
              <div className="text-xs text-gray-400">{subText}</div>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Leads Over Time (30 days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={overTime} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip formatter={(v) => [v, 'Leads']} labelFormatter={(l) => `Date: ${l}`} />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Leads by Source</h3>
          {bySource.length === 0 ? (
            <div className="flex items-center justify-center h-[180px] text-gray-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={bySource}
                  dataKey="count"
                  nameKey="source"
                  cx="50%" cy="45%"
                  outerRadius={65}
                  label={false}
                >
                  {bySource.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Conversion Funnel</h3>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={funnel} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
              <YAxis dataKey="status" type="category" tick={{ fontSize: 10 }} width={65} />
              <Tooltip formatter={(v) => [v, 'Leads']} />
              <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Leads */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 md:px-5 py-3 md:py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Recent Leads</h3>
            <button onClick={() => navigate('/leads')} className="text-xs text-indigo-500 hover:text-indigo-600 font-medium">View all →</button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentLeads.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No leads yet</p>
            ) : recentLeads.map((lead) => (
              <div
                key={lead._id}
                onClick={() => navigate(`/leads/${lead._id}`)}
                className="flex items-center gap-3 px-4 md:px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors active:bg-gray-100"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm flex-shrink-0">
                  {lead.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{lead.name}</p>
                  <p className="text-xs text-gray-400 truncate">{lead.email || lead.phone || 'No contact'}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <StatusBadge value={lead.status} />
                  <p className="text-xs text-gray-400 mt-1">{formatDate(lead.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
