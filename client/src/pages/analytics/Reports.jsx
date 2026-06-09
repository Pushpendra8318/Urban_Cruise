import { useState } from 'react';
import { downloadReport } from '../../utils/exportPDF';
import { exportToCSV } from '../../utils/exportCSV';
import { leadsApi } from '../../api/leads';
import toast from 'react-hot-toast';

export default function Reports() {
  const [form, setForm] = useState({ from: '', to: '', source: '', status: '', format: 'excel' });
  const [loading, setLoading] = useState(false);

  const handleExport = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(form).filter(([k, v]) => v && k !== 'format'));
      await downloadReport(form.format, params);
      toast.success(`Report exported as ${form.format.toUpperCase()}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCSVExport = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(form).filter(([k, v]) => v && k !== 'format'));
      const res = await leadsApi.getAll({ ...params, limit: 1000 });
      exportToCSV(res.data.leads.map((l) => ({
        Name: l.name, Email: l.email || '', Phone: l.phone || '',
        Source: l.source, Campaign: l.campaign || '', Status: l.status,
        'Assigned To': l.assignedTo?.name || 'Unassigned',
        'Created At': new Date(l.createdAt).toLocaleDateString(),
      })), 'leads-report.csv');
      toast.success('CSV exported');
    } catch { toast.error('Export failed'); }
    finally { setLoading(false); }
  };

  const selectClass = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white";
  const inputClass = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        <p className="text-gray-500 text-sm mt-0.5">Export lead data to Excel, PDF, or CSV</p>
      </div>

      <form onSubmit={handleExport} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
        <h2 className="font-semibold text-gray-700">Export Filters</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">From Date</label>
            <input type="date" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">To Date</label>
            <input type="date" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Source</label>
            <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className={selectClass}>
              <option value="">All Sources</option>
              {['website', 'meta', 'google', 'manual'].map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={selectClass}>
              <option value="">All Statuses</option>
              {['new', 'contacted', 'qualified', 'converted', 'lost'].map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Export Format</label>
          <div className="grid grid-cols-2 gap-3">
            {[{ value: 'excel', label: 'Excel (.xlsx)', icon: '📊', desc: 'Spreadsheet with auto-sized columns' },
              { value: 'pdf', label: 'PDF (.pdf)', icon: '📄', desc: 'Printable landscape report' }].map((opt) => (
              <label key={opt.value} className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${form.format === opt.value ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name="format" value={opt.value} checked={form.format === opt.value} onChange={(e) => setForm({ ...form, format: e.target.value })} className="mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{opt.icon}</span>
                    <span className="font-medium text-sm text-gray-700">{opt.label}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 bg-indigo-500 text-white font-medium text-sm rounded-lg hover:bg-indigo-600 disabled:opacity-60 transition-colors"
          >
            {loading ? 'Exporting...' : `Export as ${form.format === 'excel' ? 'Excel' : 'PDF'}`}
          </button>
          <button
            type="button"
            onClick={handleCSVExport}
            disabled={loading}
            className="flex-1 py-2.5 border border-gray-300 text-gray-600 font-medium text-sm rounded-lg hover:bg-gray-50 disabled:opacity-60"
          >
            Export as CSV
          </button>
        </div>
      </form>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-blue-700 mb-2">Export Tips</h3>
        <ul className="text-xs text-blue-600 space-y-1">
          <li>• Leave dates empty to export all leads</li>
          <li>• Excel format works best for data analysis</li>
          <li>• PDF format is ideal for printing and sharing</li>
          <li>• CSV is compatible with most CRM systems</li>
        </ul>
      </div>
    </div>
  );
}
