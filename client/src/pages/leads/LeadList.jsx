import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { leadsApi } from '../../api/leads';
import { usersApi } from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import ConfirmModal from '../../components/ConfirmModal';
import { formatDate } from '../../utils/formatDate';
import { exportToCSV } from '../../utils/exportCSV';
import toast from 'react-hot-toast';

const STATUSES = ['', 'new', 'contacted', 'qualified', 'converted', 'lost'];
const SOURCES = ['', 'website', 'meta', 'google', 'manual'];

const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white';

export default function LeadList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ status: '', source: '', assignedTo: '', from: '', to: '', search: '' });
  const [selected, setSelected] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [deleting, setDeleting] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchLeads = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: pagination.limit, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
      const res = await leadsApi.getAll(params);
      setLeads(res.data.leads);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit]);

  useEffect(() => { fetchLeads(1); }, [filters]);
  useEffect(() => {
    if (['admin', 'manager'].includes(user?.role)) {
      usersApi.getAll().then((r) => setUsers(r.data)).catch(() => {});
    }
  }, [user]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await leadsApi.delete(deleteModal.id);
      toast.success('Lead deleted');
      setDeleteModal({ open: false, id: null });
      fetchLeads(pagination.page);
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(false); }
  };

  const handleBulkUpdate = async () => {
    if (!bulkStatus || !selected.length) return;
    try {
      await leadsApi.bulkUpdate({ ids: selected, update: { status: bulkStatus } });
      toast.success(`${selected.length} leads updated`);
      setSelected([]); setBulkStatus('');
      fetchLeads(pagination.page);
    } catch { toast.error('Bulk update failed'); }
  };

  const toggleSelect = (id) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const toggleAll = () => setSelected(selected.length === leads.length ? [] : leads.map((l) => l._id));

  const activeFilters = Object.values(filters).filter(Boolean).length;

  const handleExportCSV = () => {
    exportToCSV(leads.map((l) => ({
      Name: l.name, Email: l.email, Phone: l.phone, Source: l.source,
      Campaign: l.campaign, Status: l.status,
      'Assigned To': l.assignedTo?.name || '',
      Created: formatDate(l.createdAt),
    })), 'leads.csv');
  };

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Leads</h1>
          <p className="text-gray-500 text-sm">{pagination.total} total leads</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`sm:hidden flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg transition-colors ${showFilters || activeFilters ? 'border-indigo-300 bg-indigo-50 text-indigo-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            Filters {activeFilters > 0 && <span className="bg-indigo-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{activeFilters}</span>}
          </button>
          <button onClick={handleExportCSV} className="px-3 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="hidden sm:inline">Export CSV</span>
            <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          </button>
          <button onClick={() => navigate('/leads/add')} className="px-3 md:px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition-colors shadow-sm shadow-indigo-500/30">
            <span className="hidden sm:inline">+ Add Lead</span>
            <span className="sm:hidden">+</span>
          </button>
        </div>
      </div>

      {/* Filters - always visible on md+, toggle on mobile */}
      <div className={`bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-100 ${showFilters ? 'block' : 'hidden sm:block'}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 md:gap-3">
          <div className="sm:col-span-2 xl:col-span-2">
            <input
              placeholder="Search name, email or phone..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className={inputCls}
            />
          </div>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className={inputCls}>
            {STATUSES.map((s) => <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Statuses'}</option>)}
          </select>
          <select value={filters.source} onChange={(e) => setFilters({ ...filters, source: e.target.value })} className={inputCls}>
            {SOURCES.map((s) => <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Sources'}</option>)}
          </select>
          <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} className={inputCls} />
          <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} className={inputCls} />
        </div>
        {activeFilters > 0 && (
          <button onClick={() => setFilters({ status: '', source: '', assignedTo: '', from: '', to: '', search: '' })} className="mt-2 text-xs text-indigo-500 hover:text-indigo-700 font-medium">
            Clear all filters
          </button>
        )}
      </div>

      {/* Bulk actions */}
      {selected.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-3 md:px-4 py-3 flex flex-wrap items-center gap-2 md:gap-3">
          <span className="text-sm font-medium text-indigo-700">{selected.length} selected</span>
          <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className="px-3 py-1.5 text-sm border border-indigo-300 rounded-lg bg-white focus:outline-none">
            <option value="">Change status...</option>
            {['contacted', 'qualified', 'converted', 'lost'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={handleBulkUpdate} disabled={!bulkStatus} className="px-3 py-1.5 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors">Apply</button>
          <button onClick={() => setSelected([])} className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800">Clear</button>
        </div>
      )}

      {/* Mobile card view */}
      <div className="sm:hidden space-y-2">
        {loading ? (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-pulse space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-lg" />)}
          </div>
        ) : leads.length === 0 ? (
          <EmptyState title="No leads found" message="Try adjusting filters or add a new lead." action={{ label: '+ Add Lead', onClick: () => navigate('/leads/add') }} />
        ) : leads.map((lead) => (
          <div key={lead._id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 active:bg-gray-50">
            <div className="flex items-start gap-3">
              <input type="checkbox" checked={selected.includes(lead._id)} onChange={() => toggleSelect(lead._id)} className="mt-1 rounded flex-shrink-0" />
              <div className="flex-1 min-w-0" onClick={() => navigate(`/leads/${lead._id}`)}>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="font-semibold text-gray-800 truncate">{lead.name}</p>
                  <StatusBadge value={lead.status} />
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mb-2">
                  {lead.email && <span className="truncate">{lead.email}</span>}
                  {lead.phone && <span>{lead.phone}</span>}
                </div>
                <div className="flex items-center justify-between">
                  <StatusBadge value={lead.source} />
                  <span className="text-xs text-gray-400">{formatDate(lead.createdAt)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100 justify-end">
              <button onClick={() => navigate(`/leads/${lead._id}`)} className="flex-1 py-1.5 text-xs text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors">View</button>
              <button onClick={() => navigate(`/leads/${lead._id}/edit`)} className="flex-1 py-1.5 text-xs text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">Edit</button>
              {['admin', 'manager'].includes(user?.role) && (
                <button onClick={() => setDeleteModal({ open: true, id: lead._id })} className="flex-1 py-1.5 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">Delete</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop/tablet table view */}
      <div className="hidden sm:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left w-10">
                  <input type="checkbox" checked={selected.length === leads.length && leads.length > 0} onChange={toggleAll} className="rounded" />
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide hidden md:table-cell">Contact</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Source</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide hidden lg:table-cell">Assigned</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide hidden lg:table-cell">Date</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600 text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8}><TableSkeleton rows={8} cols={6} /></td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={8}>
                  <EmptyState title="No leads found" message="Try adjusting filters or add a new lead." action={{ label: '+ Add Lead', onClick: () => navigate('/leads/add') }} />
                </td></tr>
              ) : leads.map((lead) => (
                <tr key={lead._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.includes(lead._id)} onChange={() => toggleSelect(lead._id)} className="rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => navigate(`/leads/${lead._id}`)} className="font-medium text-gray-800 hover:text-indigo-600 text-left">{lead.name}</button>
                    {lead.campaign && <p className="text-xs text-gray-400 truncate max-w-[150px]">{lead.campaign}</p>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500">
                    <div className="text-xs">{lead.email}</div>
                    <div className="text-xs">{lead.phone}</div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge value={lead.source} /></td>
                  <td className="px-4 py-3"><StatusBadge value={lead.status} /></td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">{lead.assignedTo?.name || '—'}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-400 text-xs">{formatDate(lead.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => navigate(`/leads/${lead._id}`)} className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors" title="View">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z"/></svg>
                      </button>
                      <button onClick={() => navigate(`/leads/${lead._id}/edit`)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      {['admin', 'manager'].includes(user?.role) && (
                        <button onClick={() => setDeleteModal({ open: true, id: lead._id })} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-100 gap-2">
            <span className="text-xs md:text-sm text-gray-500 order-2 sm:order-1">
              Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </span>
            <div className="flex gap-1 order-1 sm:order-2">
              <button onClick={() => fetchLeads(pagination.page - 1)} disabled={pagination.page === 1} className="px-2 py-1.5 text-xs rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">←</button>
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => fetchLeads(p)}
                  className={`w-8 h-8 text-xs rounded-lg font-medium transition-colors ${p === pagination.page ? 'bg-indigo-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {p}
                </button>
              ))}
              <button onClick={() => fetchLeads(pagination.page + 1)} disabled={pagination.page === pagination.pages} className="px-2 py-1.5 text-xs rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">→</button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile pagination */}
      {pagination.pages > 1 && (
        <div className="flex sm:hidden items-center justify-between">
          <button onClick={() => fetchLeads(pagination.page - 1)} disabled={pagination.page === 1} className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40">← Prev</button>
          <span className="text-xs text-gray-500">Page {pagination.page} of {pagination.pages}</span>
          <button onClick={() => fetchLeads(pagination.page + 1)} disabled={pagination.page === pagination.pages} className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40">Next →</button>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Lead"
        message="Are you sure you want to delete this lead? This action cannot be undone."
        isLoading={deleting}
      />
    </div>
  );
}
