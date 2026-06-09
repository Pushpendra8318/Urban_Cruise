import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../api/users';
import toast from 'react-hot-toast';

const inputClass = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white transition-colors';

export default function NotificationSettings() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState(
    user?.notificationPreferences || { emailOnNewLead: true, dailySummary: true, smsOnNewLead: false }
  );
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await usersApi.updateProfile({ notificationPreferences: prefs, phone });
      updateUser(res.data);
      toast.success('Notification preferences saved');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const Toggle = ({ label, desc, value, onChange }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-indigo-500' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="max-w-lg space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/notifications')} className="text-gray-400 hover:text-gray-600 text-sm">← Notifications</button>
        <h1 className="text-xl font-bold text-gray-800">Notification Settings</h1>
      </div>

      {/* Email */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-1">Email Notifications</h3>
        <p className="text-xs text-gray-400 mb-3">Sent to your account email: <span className="font-medium text-gray-600">{user?.email}</span></p>
        <Toggle
          label="New Lead Alert"
          desc="Receive an email whenever a new lead is created"
          value={prefs.emailOnNewLead}
          onChange={(v) => setPrefs({ ...prefs, emailOnNewLead: v })}
        />
        <Toggle
          label="Daily Summary"
          desc="Receive a daily email summary at 8 AM with lead stats"
          value={prefs.dailySummary}
          onChange={(v) => setPrefs({ ...prefs, dailySummary: v })}
        />
      </div>

      {/* SMS */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-1">SMS Notifications</h3>
        <p className="text-xs text-gray-400 mb-3">Instant SMS alerts sent via Twilio</p>
        <Toggle
          label="SMS on New Lead"
          desc="Receive an SMS the moment a new lead arrives"
          value={prefs.smsOnNewLead}
          onChange={(v) => setPrefs({ ...prefs, smsOnNewLead: v })}
        />
        {prefs.smsOnNewLead && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Your mobile number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s\-()]/g, ''))}
              className={inputClass}
              placeholder="+91 98765 43210"
            />
            <p className="text-xs text-gray-400">Include country code (e.g. +91 for India). SMS will be sent to this number.</p>
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 bg-indigo-500 text-white font-medium rounded-xl hover:bg-indigo-600 disabled:opacity-60 transition-colors"
      >
        {saving ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  );
}
