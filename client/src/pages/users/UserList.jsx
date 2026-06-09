import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersApi } from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';
import EmptyState from '../../components/EmptyState';
import { formatDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';

export default function UserList() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });
  const [deleting, setDeleting] = useState(false);

  const fetch = () => usersApi.getAll().then((r) => setUsers(r.data)).catch(() => toast.error('Failed to load users')).finally(() => setLoading(false));
  useEffect(() => { fetch(); }, []);

  const handleToggleActive = async (u) => {
    try {
      await usersApi.update(u._id, { isActive: !u.isActive });
      toast.success(`User ${u.isActive ? 'deactivated' : 'activated'}`);
      fetch();
    } catch { toast.error('Failed to update user'); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await usersApi.delete(deleteModal.id);
      toast.success('User deleted');
      setDeleteModal({ open: false, id: null, name: '' });
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
    finally { setDeleting(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Users</h1>
          <p className="text-gray-500 text-sm">{users.length} team members</p>
        </div>
        <button onClick={() => navigate('/users/add')} className="px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600">+ Add User</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['User', 'Role', 'Status', 'Joined', ''].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50 animate-pulse">
                  {Array.from({ length: 5 }).map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded" /></td>)}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr><td colSpan={5}><EmptyState title="No users" message="Add team members to your CRM." action={{ label: '+ Add User', onClick: () => navigate('/users/add') }} /></td></tr>
            ) : users.map((u) => (
              <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                      {u.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{u.name} {u._id === currentUser?._id && <span className="text-xs text-gray-400">(you)</span>}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3"><StatusBadge value={u.role} /></td>
                <td className="px-5 py-3">
                  <button onClick={() => handleToggleActive(u)} className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${u.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}>
                    {u.isActive ? '✓ Active' : '✗ Inactive'}
                  </button>
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs">{formatDate(u.createdAt)}</td>
                <td className="px-5 py-3">
                  {u._id !== currentUser?._id && (
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => navigate(`/users/${u._id}/edit`)} className="p-1.5 text-gray-400 hover:text-blue-500 rounded">✏️</button>
                      <button onClick={() => setDeleteModal({ open: true, id: u._id, name: u.name })} className="p-1.5 text-gray-400 hover:text-red-500 rounded">🗑️</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null, name: '' })}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteModal.name}"? This action cannot be undone.`}
        isLoading={deleting}
      />
    </div>
  );
}
