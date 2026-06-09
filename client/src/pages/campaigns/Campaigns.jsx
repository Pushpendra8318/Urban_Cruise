import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignsApi } from '../../api/campaigns';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';

const BLANK = { name: '', source: 'meta', budget: '', startDate: '', endDate: '' };
const inputClass = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white transition-colors';

export default function Campaigns() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, data: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetch = () => campaignsApi.getAll().then((r) => setCampaigns(r.data)).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setForm(BLANK); setModal({ open: true, data: null }); };
  const openEdit = (c) => {
    setForm({ name: c.name, source: c.source, budget: c.budget || '', startDate: c.startDate?.slice(0, 10) || '', endDate: c.endDate?.slice(0, 10) || '' });
    setModal({ open: true, data: c });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal.data) await campaignsApi.update(modal.data._id, form);
      else await campaignsApi.create(form);
      toast.success(modal.data ? 'Campaign updated' : 'Campaign created');
      setModal({ open: false, data: null });
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await campaignsApi.delete(deleteModal.id);
      toast.success('Campaign deleted');
      setDeleteModal({ open: false, id: null });
      fetch();
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(false); }
  };

  const canEdit = ['admin', 'manager'].includes(user?.role);

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Campaigns</h1>
          <p className="text-gray-500 text-sm">{campaigns.length} campaigns tracked</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => navigate('/campaigns/sources')} className="px-3 py-2 text-sm border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors hidden sm:block">
            Source Analysis
          </button>
          {canEdit && (
            <button onClick={openCreate} className="px-3 md:px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-xl hover:bg-indigo-600 transition-colors shadow-sm shadow-indigo-500/30">
              <span className="hidden sm:inline">+ New Campaign</span>
              <span className="sm:hidden">+</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-3" />
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 3 }).map((_, j) => <div key={j} className="h-10 bg-gray-100 rounded" />)}
              </div>
            </div>
          ))
        ) : campaigns.length === 0 ? (
          <EmptyState title="No campaigns" message="Add campaigns to track your lead sources and ROI." action={canEdit ? { label: '+ New Campaign', onClick: openCreate } : undefined} />
        ) : campaigns.map((c) => (
          <div key={c._id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-gray-800">{c.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge value={c.source} />
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              {canEdit && (
                <div className="flex gap-1">
                  <button onClick={() => openEdit(c)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button onClick={() => setDeleteModal({ open: true, id: c._id })} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 text-center">
              <div><div className="text-lg font-bold text-indigo-600">{c.leads}</div><div className="text-xs text-gray-400">Leads</div></div>
              <div><div className="text-lg font-bold text-emerald-600">{c.conversions}</div><div className="text-xs text-gray-400">Converted</div></div>
              <div>
                <div className="text-lg font-bold text-gray-700">{c.leads > 0 ? ((c.conversions / c.leads) * 100).toFixed(1) : 0}%</div>
                <div className="text-xs text-gray-400">Rate</div>
              </div>
            </div>
            {c.budget > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                Budget: <span className="font-medium text-gray-700">₹{c.budget.toLocaleString()}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Campaign', 'Source', 'Leads', 'Converted', 'Rate', 'Budget', 'Status', ''].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50 animate-pulse">
                    {Array.from({ length: 8 }).map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded" /></td>)}
                  </tr>
                ))
              ) : campaigns.length === 0 ? (
                <tr><td colSpan={8}><EmptyState title="No campaigns" message="Add campaigns to track your lead sources and ROI." action={canEdit ? { label: '+ New Campaign', onClick: openCreate } : undefined} /></td></tr>
              ) : campaigns.map((c) => (
                <tr key={c._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-800">{c.name}</td>
                  <td className="px-5 py-3.5"><StatusBadge value={c.source} /></td>
                  <td className="px-5 py-3.5 text-indigo-600 font-semibold">{c.leads}</td>
                  <td className="px-5 py-3.5 text-emerald-600 font-medium">{c.conversions}</td>
                  <td className="px-5 py-3.5 text-gray-600">{c.leads > 0 ? ((c.conversions / c.leads) * 100).toFixed(1) : 0}%</td>
                  <td className="px-5 py-3.5 text-gray-500">{c.budget > 0 ? `₹${c.budget.toLocaleString()}` : '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${c.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {canEdit && (
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        <button onClick={() => setDeleteModal({ open: true, id: c._id })} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, data: null })} title={modal.data ? 'Edit Campaign' : 'New Campaign'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Campaign Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} required placeholder="e.g. Summer Sale 2026" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Source *</label>
            <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className={inputClass}>
              {['meta', 'google', 'website', 'manual'].map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Budget (₹)</label>
            <input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className={inputClass} min="0" placeholder="0" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal({ open: false, data: null })} className="flex-1 py-2.5 text-sm border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 text-sm bg-indigo-500 text-white font-medium rounded-xl hover:bg-indigo-600 disabled:opacity-60 transition-colors">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, id: null })} onConfirm={handleDelete} title="Delete Campaign" message="Delete this campaign? This won't delete its leads." isLoading={deleting} />
    </div>
  );
}
