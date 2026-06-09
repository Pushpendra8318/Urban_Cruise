import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersApi } from '../../api/users';
import toast from 'react-hot-toast';

export default function AddUser() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'sales_rep' });
  const [loading, setLoading] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await usersApi.create(form);
      toast.success('User created successfully');
      navigate('/users');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const selectClass = `${inputClass} bg-white`;
  const Field = ({ label, children }) => <div><label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>{children}</div>;

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/users')} className="text-gray-400 hover:text-gray-600 text-sm">← Users</button>
        <h1 className="text-2xl font-bold text-gray-800">Add User</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
        <Field label="Full Name *">
          <input value={form.name} onChange={(e) => update('name', e.target.value)} className={inputClass} placeholder="John Doe" required />
        </Field>
        <Field label="Email *">
          <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className={inputClass} placeholder="john@company.com" required />
        </Field>
        <Field label="Password *">
          <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} className={inputClass} placeholder="Min. 6 characters" minLength={6} required />
        </Field>
        <Field label="Role">
          <select value={form.role} onChange={(e) => update('role', e.target.value)} className={selectClass}>
            <option value="sales_rep">Sales Rep</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </Field>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate('/users')} className="flex-1 py-2.5 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 py-2.5 text-sm bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-600 disabled:opacity-60">
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
}
