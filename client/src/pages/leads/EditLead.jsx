import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { leadsApi } from '../../api/leads';
import { usersApi } from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import { DetailSkeleton } from '../../components/LoadingSkeleton';
import toast from 'react-hot-toast';

const inputClass = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500';
const selectClass = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white';

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export default function EditLead() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', source: 'manual', campaign: '',
    keyword: '', status: 'new', assignedTo: '', service: '',
  });

  useEffect(() => {
    Promise.all([
      leadsApi.getOne(id),
      ['admin', 'manager'].includes(user?.role) ? usersApi.getAll() : Promise.resolve({ data: [] }),
    ]).then(([lr, ur]) => {
      const l = lr.data;
      setForm({
        name: l.name || '',
        email: l.email || '',
        phone: l.phone || '',
        source: l.source || 'manual',
        campaign: l.campaign || '',
        keyword: l.keyword || '',
        status: l.status || 'new',
        assignedTo: l.assignedTo?._id || '',
        service: l.service || '',
      });
      setUsers(ur.data);
    }).catch(() => toast.error('Failed to load lead')).finally(() => setLoading(false));
  }, [id, user]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.assignedTo) payload.assignedTo = null;
      await leadsApi.update(id, payload);
      toast.success('Lead updated!');
      navigate(`/leads/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DetailSkeleton />;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(`/leads/${id}`)} className="text-gray-400 hover:text-gray-600 text-sm">← Lead</button>
        <h1 className="text-2xl font-bold text-gray-800">Edit Lead</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Full Name *">
            <input
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className={inputClass}
              required
            />
          </Field>

          <Field label="Phone">
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value.replace(/[^\d+\s\-()]/g, ''))}
              className={inputClass}
              inputMode="tel"
            />
          </Field>

          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Service">
            <input
              value={form.service}
              onChange={(e) => update('service', e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Source">
            <select
              value={form.source}
              onChange={(e) => update('source', e.target.value)}
              className={selectClass}
            >
              {['manual', 'website', 'meta', 'google'].map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </Field>

          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) => update('status', e.target.value)}
              className={selectClass}
            >
              {['new', 'contacted', 'qualified', 'converted', 'lost'].map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </Field>

          <Field label="Campaign">
            <input
              value={form.campaign}
              onChange={(e) => update('campaign', e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Keyword">
            <input
              value={form.keyword}
              onChange={(e) => update('keyword', e.target.value)}
              className={inputClass}
            />
          </Field>

          {['admin', 'manager'].includes(user?.role) && (
            <Field label="Assigned To">
              <select
                value={form.assignedTo}
                onChange={(e) => update('assignedTo', e.target.value)}
                className={selectClass}
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>{u.name}</option>
                ))}
              </select>
            </Field>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(`/leads/${id}`)}
            className="px-5 py-2.5 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 text-sm bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-600 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
