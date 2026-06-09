import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationsApi } from '../../api/notifications';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { formatRelative } from '../../utils/formatDate';
import toast from 'react-hot-toast';

export default function NotificationCenter() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1 });

  const fetch = async (p = 1) => {
    try {
      const res = await notificationsApi.getAll({ page: p, limit: 20 });
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
      setPagination(res.data.pagination);
      setPage(p);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(1); }, []);

  const handleMarkRead = async (id) => {
    await notificationsApi.markRead(id).catch(() => {});
    setNotifications((n) => n.map((x) => x._id === id ? { ...x, isRead: true } : x));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllRead();
    setNotifications((n) => n.map((x) => ({ ...x, isRead: true })));
    setUnreadCount(0);
    toast.success('All marked as read');
  };

  const handleDelete = async (id) => {
    await notificationsApi.delete(id).catch(() => {});
    setNotifications((n) => n.filter((x) => x._id !== id));
  };

  const typeIcon = { new_lead: '👤', status_change: '🔄', assignment: '📋', system: '🔧', daily_summary: '📊' };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          {unreadCount > 0 && <p className="text-sm text-indigo-500 font-medium">{unreadCount} unread</p>}
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="px-3 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50">Mark all read</button>
          )}
          <button onClick={() => navigate('/notifications/settings')} className="px-3 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50">⚙️ Settings</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : notifications.length === 0 ? (
          <EmptyState title="No notifications" message="You're all caught up!" icon="🔔" />
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((n) => (
              <div key={n._id} className={`flex items-start gap-3 px-5 py-4 hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-indigo-50/30' : ''}`}>
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-lg flex-shrink-0 mt-0.5">
                  {typeIcon[n.type] || '🔔'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.isRead ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>{n.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge value={n.type} />
                    <span className="text-xs text-gray-400">{formatRelative(n.createdAt)}</span>
                  </div>
                  {n.leadId && (
                    <button
                      onClick={() => navigate(`/leads/${n.leadId._id}`)}
                      className="text-xs text-indigo-500 hover:text-indigo-600 mt-1"
                    >
                      View lead: {n.leadId.name} →
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!n.isRead && (
                    <button onClick={() => handleMarkRead(n._id)} className="w-2 h-2 rounded-full bg-indigo-500 hover:bg-indigo-600 flex-shrink-0" title="Mark as read" />
                  )}
                  <button onClick={() => handleDelete(n._id)} className="p-1 text-gray-300 hover:text-red-400 text-sm">×</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => fetch(p)} className={`w-8 h-8 text-xs rounded-lg ${p === page ? 'bg-indigo-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
