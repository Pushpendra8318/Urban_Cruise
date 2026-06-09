import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { leadsApi } from '../../api/leads';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';
import { DetailSkeleton } from '../../components/LoadingSkeleton';
import { formatDateTime, formatRelative } from '../../utils/formatDate';
import toast from 'react-hot-toast';

const STATUSES = ['new', 'contacted', 'qualified', 'converted', 'lost'];

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    leadsApi.getOne(id).then((r) => setLead(r.data)).catch(() => toast.error('Lead not found')).finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setStatusChanging(true);
    try {
      const res = await leadsApi.update(id, { status: newStatus });
      setLead(res.data);
      toast.success(`Status updated to ${newStatus}`);
    } catch { toast.error('Failed to update status'); }
    finally { setStatusChanging(false); }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setAddingNote(true);
    try {
      await leadsApi.addNote(id, noteText);
      const res = await leadsApi.getOne(id);
      setLead(res.data);
      setNoteText('');
      toast.success('Note added');
    } catch { toast.error('Failed to add note'); }
    finally { setAddingNote(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await leadsApi.delete(id);
      toast.success('Lead deleted');
      navigate('/leads');
    } catch { toast.error('Delete failed'); setDeleting(false); }
  };

  if (loading) return <DetailSkeleton />;
  if (!lead) return null;

  const Info = ({ label, value }) => (
    <div>
      <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</dt>
      <dd className="text-sm text-gray-800 font-medium">{value || <span className="text-gray-400 font-normal">—</span>}</dd>
    </div>
  );

  return (
    <div className="max-w-5xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => navigate('/leads')} className="text-gray-400 hover:text-gray-600 text-sm">← Leads</button>
        <div className="flex-1" />
        <button onClick={() => navigate(`/leads/${id}/edit`)} className="px-4 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50">Edit</button>
        {['admin', 'manager'].includes(user?.role) && (
          <button onClick={() => setDeleteModal(true)} className="px-4 py-2 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100">Delete</button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                  {lead.name[0].toUpperCase()}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">{lead.name}</h1>
                  <p className="text-gray-400 text-sm">{lead.email || lead.phone || 'No contact info'}</p>
                </div>
              </div>
              <StatusBadge value={lead.status} />
            </div>

            <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Info label="Phone" value={lead.phone} />
              <Info label="Email" value={lead.email} />
              <Info label="Source" value={<StatusBadge value={lead.source} />} />
              <Info label="Campaign" value={lead.campaign} />
              <Info label="Service" value={lead.service} />
              <Info label="Assigned To" value={lead.assignedTo?.name} />
              <Info label="Keyword" value={lead.keyword} />
              <Info label="Created" value={formatDateTime(lead.createdAt)} />
              <Info label="Updated" value={formatRelative(lead.updatedAt)} />
            </dl>
          </div>

          {/* Status History */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Status History</h3>
            {lead.statusHistory?.length === 0 ? (
              <p className="text-gray-400 text-sm">No history yet.</p>
            ) : (
              <div className="space-y-3">
                {[...lead.statusHistory].reverse().map((h, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
                    <StatusBadge value={h.status} />
                    <span className="text-xs text-gray-400">by {h.changedBy?.name || 'System'} · {formatRelative(h.changedAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Notes ({lead.notes?.length || 0})</h3>
            <form onSubmit={handleAddNote} className="flex gap-2 mb-4">
              <input
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note..."
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button type="submit" disabled={addingNote || !noteText.trim()} className="px-4 py-2 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 disabled:opacity-50">
                {addingNote ? '...' : 'Add'}
              </button>
            </form>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {lead.notes?.length === 0 ? (
                <p className="text-gray-400 text-sm">No notes yet.</p>
              ) : [...lead.notes].reverse().map((note, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700">{note.text}</p>
                  <p className="text-xs text-gray-400 mt-1">{note.createdBy?.name || 'Unknown'} · {formatRelative(note.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Update Status</h3>
            <div className="space-y-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={statusChanging || s === lead.status}
                  className={`w-full py-2 text-sm rounded-lg font-medium transition-colors ${
                    s === lead.status
                      ? 'bg-indigo-500 text-white cursor-default'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {(lead.metaLeadId || lead.googleLeadId || lead.utmSource) && (
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">Tracking Info</h3>
              <dl className="space-y-2">
                {lead.metaLeadId && <><dt className="text-xs text-gray-400">Meta Lead ID</dt><dd className="text-xs font-mono text-gray-600 break-all">{lead.metaLeadId}</dd></>}
                {lead.googleLeadId && <><dt className="text-xs text-gray-400">Google Lead ID</dt><dd className="text-xs font-mono text-gray-600 break-all">{lead.googleLeadId}</dd></>}
                {lead.utmSource && <><dt className="text-xs text-gray-400">UTM Source</dt><dd className="text-xs text-gray-600">{lead.utmSource}</dd></>}
                {lead.utmMedium && <><dt className="text-xs text-gray-400">UTM Medium</dt><dd className="text-xs text-gray-600">{lead.utmMedium}</dd></>}
                {lead.utmCampaign && <><dt className="text-xs text-gray-400">UTM Campaign</dt><dd className="text-xs text-gray-600">{lead.utmCampaign}</dd></>}
              </dl>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Lead"
        message={`Are you sure you want to permanently delete "${lead.name}"?`}
        isLoading={deleting}
      />
    </div>
  );
}
