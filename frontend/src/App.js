import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar'; // Keeping for reference if needed, but unused
import Layout from './components/layout/Layout';
import Login from './components/common/Login';
import LandingPage from './components/common/LandingPage';
import ProjectsList from './components/projects/ProjectsList';
import ProjectDetails from './components/projects/ProjectDetails';
import ResourcePlannerWrapper from './components/projects/ResourcePlannerWrapper';
import CreateProject from './components/projects/CreateProject';
import EditProject from './components/projects/EditProject';
import CreatePhase from './components/phases/CreatePhase';
import EditPhase from './components/phases/EditPhase';
import UserProfile from './components/users/UserProfile';
import TaskDetails from './components/tasks/TaskDetails';
import TaskForm from './components/tasks/TaskForm';
import TaskEditForm from './components/tasks/TaskEditForm';
import TimeLogForm from './components/tasks/TimeLogForm';
import MyTasks from './components/tasks/MyTasks';
import MyApprovals from './components/tasks/MyApprovals';
import RegisterUser from './components/admin/RegisterUser';
import UsersList from './components/admin/UsersList';
import AdminDashboard from './components/admin/AdminDashboard';
import CreateUser from './components/admin/CreateUser';
import EditUser from './components/admin/EditUser';
import UserDetails from './components/admin/UserDetails';
import OrganizationRegister from './components/organization/OrganizationRegister';
import InvoicesList from './components/invoices/InvoicesList';
import CreateInvoice from './components/invoices/CreateInvoice';
import InvoiceDetails from './components/invoices/InvoiceDetails';
import EditInvoice from './components/invoices/EditInvoice';
import RecordPayment from './components/invoices/RecordPayment';
import AdminPayslipManagement from './components/payslips/AdminPayslipManagement';
import RolesList from './components/admin/RolesList';
import RoleDetails from './components/admin/RoleDetails';
import UserRoleManagement from './components/admin/UserRoleManagement';
import OrganizationSettings from './components/admin/OrganizationSettings';
import ClientsList from './components/admin/ClientsList';
import FinancialHealthDashboard from './components/finance/FinancialHealthDashboard';
import PricingPage from './components/pricing/PricingPage';

// Auth components
import VerifyEmail from './components/auth/VerifyEmail';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import JoinOrganization from './components/auth/JoinOrganization';
import InviteEmployees from './components/admin/InviteEmployees';

import FaviconManager from './components/common/FaviconManager';

// Get API base URL from environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Helper to build full API URL
const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (API_BASE_URL) {
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    return `${baseUrl}${cleanEndpoint}`;
  }
  return cleanEndpoint;
};

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on app load
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const statusUrl = getApiUrl('/api/auth/status');
      const response = await fetch(statusUrl, {
        credentials: 'include'
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.log('Not authenticated');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      const logoutUrl = getApiUrl('/api/auth/logout');
      await fetch(logoutUrl, {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        zIndex: 10000
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid #e5e7eb',
            borderTopColor: '#667eea',
            borderRightColor: '#764ba2',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }}></div>
          <p style={{ color: '#64748b', fontSize: '0.9375rem', margin: 0 }}>Loading...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <Router>
      <FaviconManager user={user} />
      <div className="App">
        <Routes>
          <Route
            path="/login"
            element={
              user ? <Navigate to="/profile" replace /> : <Login onLogin={handleLogin} />
            }
          />

          <Route
            path="/register"
            element={
              user ? <Navigate to="/profile" replace /> : <OrganizationRegister />
            }
          />

          {/* Email verification - public route */}
          <Route
            path="/verify-email"
            element={<VerifyEmail />}
          />

          {/* Forgot password - public route */}
          <Route
            path="/forgot-password"
            element={
              user ? <Navigate to="/profile" replace /> : <ForgotPassword />
            }
          />

          {/* Reset password - public route */}
          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />

          {/* Join organization (accept invitation) - public route */}
          <Route
            path="/join"
            element={
              user ? <Navigate to="/profile" replace /> : <JoinOrganization />
            }
          />

          <Route
            path="/"
            element={<LandingPage />}
          />

          <Route
            path="/pricing"
            element={<PricingPage />}
          />

          {/* Protected routes wrapped in Layout */}
          {user ? (
            <Route element={<Layout user={user} onLogout={handleLogout} />}>
              <Route path="/profile" element={<UserProfile user={user} onUserUpdate={checkAuthStatus} />} />
              <Route path="/my-tasks" element={<MyTasks user={user} />} />
              <Route path="/tasks" element={<MyTasks user={user} />} />
              <Route path="/my-approvals" element={<MyApprovals user={user} />} />
              <Route path="/projects" element={<ProjectsList user={user} />} />
              <Route path="/projects/new" element={<CreateProject user={user} />} />
              <Route path="/projects/:id/details" element={<ProjectDetails user={user} />} />
              <Route path="/projects/:id/edit" element={<EditProject user={user} />} />
              <Route path="/projects/:projectId/phases/new" element={<CreatePhase />} />
              <Route path="/projects/:projectId/phases/:phaseId/edit" element={<EditPhase />} />
              <Route path="/projects/:projectId/resource-planner" element={<ResourcePlannerWrapper />} />
              <Route path="/tasks/:id/details" element={<TaskDetails user={user} />} />
              <Route path="/projects/:projectId/tasks/new" element={<TaskForm />} />
              <Route path="/tasks/:id/edit" element={<TaskEditForm />} />
              <Route path="/timelogs/task/:id/new" element={<TimeLogForm />} />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<AdminDashboard user={user} />} />
              <Route path="/admin/register" element={<RegisterUser />} />
              <Route path="/admin/users" element={<UsersList />} />
              <Route path="/admin/users/create" element={<Navigate to="/admin/invitations" replace />} />
              <Route path="/admin/users/:userId/edit" element={<EditUser />} />
              <Route path="/admin/users/:userId/details" element={<UserDetails />} />
              <Route path="/admin/users/:userId" element={<UserDetails />} />
              <Route path="/admin/payslips" element={<AdminPayslipManagement user={user} />} />
              <Route path="/admin/roles" element={<RolesList user={user} />} />
              <Route path="/admin/roles/:id" element={<RoleDetails user={user} />} />
              <Route path="/admin/roles/:id" element={<RoleDetails user={user} />} />
              <Route path="/admin/users/:userId/roles" element={<UserRoleManagement user={user} />} />
              <Route path="/admin/organization" element={<OrganizationSettings />} />
              <Route path="/admin/invitations" element={<InviteEmployees user={user} />} />
              <Route path="/admin/clients" element={<ClientsList user={user} />} />

              {/* People Management Routes */}
              <Route path="/people" element={<Navigate to="/people/directory" replace />} />
              <Route path="/people/directory" element={<UsersList isPeopleContext={true} />} />
              <Route path="/people/directory/new" element={<Navigate to="/people/invitations" replace />} />
              <Route path="/people/directory/:userId" element={<UserDetails isPeopleContext={true} />} />
              <Route path="/people/directory/:userId/edit" element={<EditUser isPeopleContext={true} />} />
              <Route path="/people/roles" element={<RolesList user={user} isPeopleContext={true} />} />
              <Route path="/people/roles/:id" element={<RoleDetails user={user} isPeopleContext={true} />} />
              <Route path="/people/payroll" element={<AdminPayslipManagement user={user} isPeopleContext={true} />} />
              <Route path="/people/invitations" element={<InviteEmployees user={user} />} />

              {/* Invoice Routes */}
              <Route path="/invoices" element={<InvoicesList user={user} />} />
              <Route path="/invoices/new" element={<CreateInvoice user={user} />} />
              <Route path="/invoices/:id/details" element={<InvoiceDetails user={user} />} />
              <Route path="/invoices/:id/edit" element={<EditInvoice user={user} />} />
              <Route path="/invoices/:id/payment" element={<RecordPayment user={user} />} />

              {/* Financial Health Dashboard */}
              <Route path="/finance/health" element={<FinancialHealthDashboard user={user} />} />
            </Route>
          ) : (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
