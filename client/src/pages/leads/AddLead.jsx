import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { leadsApi } from '../../api/leads';
import { usersApi } from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const inputClass = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500';
const selectClass = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white';

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function AddLead() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', source: 'manual', campaign: '',
    keyword: '', status: 'new', assignedTo: '', service: '', notes: '',
  });

  useEffect(() => {
    if (['admin', 'manager'].includes(user?.role)) {
      usersApi.getAll().then((r) => setUsers(r.data)).catch(() => {});
    }
  }, [user]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { notes, assignedTo, ...rest } = form;
      const payload = { ...rest };
      if (assignedTo) payload.assignedTo = assignedTo;

      const res = await leadsApi.create(payload);

      // Add initial note separately if provided
      if (notes.trim()) {
        await leadsApi.addNote(res.data._id, notes.trim()).catch(() => {});
      }

      toast.success('Lead created!');
      navigate(`/leads/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/leads')} className="text-gray-400 hover:text-gray-600 text-sm">← Leads</button>
        <h1 className="text-2xl font-bold text-gray-800">Add Lead</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Full Name" required>
            <input
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className={inputClass}
              placeholder="John Doe"
              required
            />
          </Field>

          <Field label="Phone">
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value.replace(/[^\d+\s\-()]/g, ''))}
              className={inputClass}
              placeholder="+91 9876543210"
              inputMode="tel"
            />
          </Field>

          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className={inputClass}
              placeholder="john@example.com"
            />
          </Field>

          <Field label="Service">
            <input
              value={form.service}
              onChange={(e) => update('service', e.target.value)}
              className={inputClass}
              placeholder="Service interested in"
            />
          </Field>

          <Field label="Source" required>
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
              placeholder="Campaign name"
            />
          </Field>

          <Field label="Keyword">
            <input
              value={form.keyword}
              onChange={(e) => update('keyword', e.target.value)}
              className={inputClass}
              placeholder="Search keyword"
            />
          </Field>

          {['admin', 'manager'].includes(user?.role) && (
            <Field label="Assign To">
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

        <Field label="Initial Note">
          <textarea
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            className={`${inputClass} h-20 resize-none`}
            placeholder="Any initial notes..."
          />
        </Field>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/leads')}
            className="px-5 py-2.5 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 text-sm bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-600 disabled:opacity-60"
          >
            {loading ? 'Creating...' : 'Create Lead'}
          </button>
        </div>
      </form>
    </div>
  );
}
