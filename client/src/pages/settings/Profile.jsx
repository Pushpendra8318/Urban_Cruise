import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../api/users';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', password: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSaving(true);
    try {
      const payload = { name: form.name, phone: form.phone };
      if (form.password) payload.password = form.password;
      const res = await usersApi.updateProfile(payload);
      updateUser(res.data);
      setForm((f) => ({ ...f, password: '', confirmPassword: '' }));
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const Field = ({ label, children }) => <div><label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>{children}</div>;

  return (
    <div className="max-w-lg space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-2xl">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-lg">{user?.name}</p>
            <p className="text-gray-400 text-sm">{user?.email}</p>
            <span className="inline-block text-xs bg-indigo-100 text-indigo-600 px-2.5 py-0.5 rounded-full mt-1 capitalize">{user?.role?.replace('_', ' ')}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Full Name">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} required />
          </Field>
          <Field label="Email">
            <input value={user?.email} className={`${inputClass} bg-gray-50 text-gray-400`} disabled />
          </Field>
          <Field label="Phone">
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} placeholder="+91 9876543210" />
          </Field>

          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Change Password</h3>
            <div className="space-y-4">
              <Field label="New Password">
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} placeholder="Leave empty to keep current" minLength={6} />
              </Field>
              {form.password && (
                <Field label="Confirm Password">
                  <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className={inputClass} placeholder="Repeat new password" />
                </Field>
              )}
            </div>
          </div>

          <button type="submit" disabled={saving} className="w-full py-3 bg-indigo-500 text-white font-medium text-sm rounded-lg hover:bg-indigo-600 disabled:opacity-60 transition-colors">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
