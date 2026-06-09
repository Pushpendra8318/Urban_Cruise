const config = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  qualified: 'bg-purple-100 text-purple-700',
  converted: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
  website: 'bg-cyan-100 text-cyan-700',
  meta: 'bg-blue-100 text-blue-800',
  google: 'bg-red-100 text-red-700',
  manual: 'bg-gray-100 text-gray-700',
  admin: 'bg-purple-100 text-purple-700',
  manager: 'bg-indigo-100 text-indigo-700',
  sales_rep: 'bg-gray-100 text-gray-700',
};

const labels = {
  sales_rep: 'Sales Rep',
  new_lead: 'New Lead',
  status_change: 'Status Change',
  daily_summary: 'Summary',
};

export default function StatusBadge({ value }) {
  const cls = config[value] || 'bg-gray-100 text-gray-600';
  const label = labels[value] || (value ? value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' ') : '—');
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}
