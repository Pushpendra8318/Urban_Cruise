import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { AdminRoute } from './AdminRoute';
import Layout from '../components/Layout';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

import Dashboard from '../pages/dashboard/Dashboard';

import LeadList from '../pages/leads/LeadList';
import LeadDetail from '../pages/leads/LeadDetail';
import AddLead from '../pages/leads/AddLead';
import EditLead from '../pages/leads/EditLead';

import Integrations from '../pages/integrations/Integrations';
import MetaSetup from '../pages/integrations/MetaSetup';
import GoogleSetup from '../pages/integrations/GoogleSetup';
import WebsiteSetup from '../pages/integrations/WebsiteSetup';

import Campaigns from '../pages/campaigns/Campaigns';
import Sources from '../pages/campaigns/Sources';

import Analytics from '../pages/analytics/Analytics';
import Reports from '../pages/analytics/Reports';

import NotificationCenter from '../pages/notifications/NotificationCenter';
import NotificationSettings from '../pages/notifications/NotificationSettings';

import UserList from '../pages/users/UserList';
import AddUser from '../pages/users/AddUser';
import EditUser from '../pages/users/EditUser';

import Profile from '../pages/settings/Profile';
import General from '../pages/settings/General';
import ApiKeys from '../pages/settings/ApiKeys';

import NotFound from '../pages/utility/NotFound';
import Unauthorized from '../pages/utility/Unauthorized';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        <Route path="leads" element={<LeadList />} />
        <Route path="leads/add" element={<AddLead />} />
        <Route path="leads/:id" element={<LeadDetail />} />
        <Route path="leads/:id/edit" element={<EditLead />} />

        <Route path="integrations" element={<Integrations />} />
        <Route path="integrations/meta" element={<MetaSetup />} />
        <Route path="integrations/google" element={<GoogleSetup />} />
        <Route path="integrations/website" element={<WebsiteSetup />} />

        <Route path="campaigns" element={<Campaigns />} />
        <Route path="campaigns/sources" element={<Sources />} />

        <Route path="analytics" element={<Analytics />} />
        <Route path="reports" element={<Reports />} />

        <Route path="notifications" element={<NotificationCenter />} />
        <Route path="notifications/settings" element={<NotificationSettings />} />

        <Route path="users" element={<AdminRoute roles={['admin']}><UserList /></AdminRoute>} />
        <Route path="users/add" element={<AdminRoute roles={['admin']}><AddUser /></AdminRoute>} />
        <Route path="users/:id/edit" element={<AdminRoute roles={['admin']}><EditUser /></AdminRoute>} />

        <Route path="settings/profile" element={<Profile />} />
        <Route path="settings/general" element={<General />} />
        <Route path="settings/api-keys" element={<ApiKeys />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
