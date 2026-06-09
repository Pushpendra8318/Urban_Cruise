import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersApi } from '../../api/users';
import toast from 'react-hot-toast';

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', role: 'sales_rep', isActive: true, password: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    usersApi.getAll().then((r) => {
      const u = r.data.find((x) => x._id === id);
      if (u) setForm({ name: u.name, email: u.email, role: u.role, isActive: u.isActive, password: '' });
    }).catch(() => toast.error('Failed to load user')).finally(() => setLoading(false));
  }, [id]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name: form.name, email: form.email, role: form.role, isActive: form.isActive };
      if (form.password) payload.password = form.password;
      await usersApi.update(id, payload);
      toast.success('User updated');
      navigate('/users');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="text-gray-400 text-sm">Loading...</div>;

  const inputClass = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const selectClass = `${inputClass} bg-white`;
  const Field = ({ label, children }) => <div><label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>{children}</div>;

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/users')} className="text-gray-400 hover:text-gray-600 text-sm">← Users</button>
        <h1 className="text-2xl font-bold text-gray-800">Edit User</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
        <Field label="Full Name *">
          <input value={form.name} onChange={(e) => update('name', e.target.value)} className={inputClass} required />
        </Field>
        <Field label="Email *">
          <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className={inputClass} required />
        </Field>
        <Field label="New Password">
          <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} className={inputClass} placeholder="Leave empty to keep current" minLength={6} />
        </Field>
        <Field label="Role">
          <select value={form.role} onChange={(e) => update('role', e.target.value)} className={selectClass}>
            <option value="sales_rep">Sales Rep</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </Field>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => update('isActive', !form.isActive)} className={`relative w-11 h-6 rounded-full transition-colors ${form.isActive ? 'bg-indigo-500' : 'bg-gray-200'}`}>
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? 'left-6' : 'left-1'}`} />
          </button>
          <span className="text-sm text-gray-700">Account {form.isActive ? 'Active' : 'Inactive'}</span>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate('/users')} className="flex-1 py-2.5 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 py-2.5 text-sm bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-600 disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
