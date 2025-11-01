import React from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Icon from '../common/Icon';

const AdminDashboard = () => {
  const { admin, logout, hasRole, hasAnyRole, getRoleLevel } = useAdminAuth();

  const roleDisplayNames = {
    'super_admin': 'Super Administrator',
    'content_manager': 'Content Manager',
    'editor': 'Editor',
    'registered_user': 'Registered User',
    'agency': 'Agency',
    'other': 'Other'
  };

  const getRoleColor = (role) => {
    const colors = {
      'super_admin': 'bg-red-100 text-red-800',
      'content_manager': 'bg-purple-100 text-purple-800',
      'editor': 'bg-blue-100 text-blue-800',
      'registered_user': 'bg-green-100 text-green-800',
      'agency': 'bg-yellow-100 text-yellow-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    return colors[role] || colors.other;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Icon name="shield-check" size="lg" className="text-primary mr-3" />
              <div>
                <h1 className="heading-3 text-gray-900">Admin Dashboard</h1>
                <p className="body-small text-gray-500">Manage your News Marketplace platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="body-medium text-gray-900">{admin?.first_name} {admin?.last_name}</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(admin?.role)}`}>
                  {roleDisplayNames[admin?.role] || admin?.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="btn-secondary"
              >
                <Icon name="arrow-right-on-rectangle" size="sm" className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="heading-2 text-gray-900 mb-2">
                Welcome back, {admin?.first_name}!
              </h2>
              <p className="body-regular text-gray-600">
                You have access to the administrative panel. Your role level is {getRoleLevel()}.
              </p>
            </div>
            <div className="hidden md:block">
              <Icon name="user-circle" size="3xl" className="text-primary" />
            </div>
          </div>
        </div>

        {/* Role-based Access Demo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Super Admin Only */}
          {hasRole('super_admin') && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-red-200">
              <div className="flex items-center mb-4">
                <Icon name="key" size="lg" className="text-red-600 mr-3" />
                <h3 className="heading-4 text-gray-900">Super Admin Panel</h3>
              </div>
              <p className="body-small text-gray-600 mb-4">
                Full system access and configuration
              </p>
              <button className="btn-primary w-full">
                Access System Settings
              </button>
            </div>
          )}

          {/* Content Manager and Above */}
          {hasAnyRole(['super_admin', 'content_manager']) && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-purple-200">
              <div className="flex items-center mb-4">
                <Icon name="document-text" size="lg" className="text-purple-600 mr-3" />
                <h3 className="heading-4 text-gray-900">Content Management</h3>
              </div>
              <p className="body-small text-gray-600 mb-4">
                Manage articles, reviews, and publications
              </p>
              <button className="btn-secondary w-full">
                Manage Content
              </button>
            </div>
          )}

          {/* Editor and Above */}
          {hasAnyRole(['super_admin', 'content_manager', 'editor']) && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-blue-200">
              <div className="flex items-center mb-4">
                <Icon name="pencil-square" size="lg" className="text-blue-600 mr-3" />
                <h3 className="heading-4 text-gray-900">Editorial Tools</h3>
              </div>
              <p className="body-small text-gray-600 mb-4">
                Review and edit submitted content
              </p>
              <button className="btn-secondary w-full">
                Editorial Dashboard
              </button>
            </div>
          )}

          {/* All Admin Roles */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-green-200">
            <div className="flex items-center mb-4">
              <Icon name="chart-bar" size="lg" className="text-green-600 mr-3" />
              <h3 className="heading-4 text-gray-900">Analytics</h3>
            </div>
            <p className="body-small text-gray-600 mb-4">
              View platform statistics and reports
            </p>
            <button className="btn-secondary w-full">
              View Analytics
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-yellow-200">
            <div className="flex items-center mb-4">
              <Icon name="users" size="lg" className="text-yellow-600 mr-3" />
              <h3 className="heading-4 text-gray-900">User Management</h3>
            </div>
            <p className="body-small text-gray-600 mb-4">
              Manage user accounts and permissions
            </p>
            <button className="btn-secondary w-full">
              Manage Users
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-indigo-200">
            <div className="flex items-center mb-4">
              <Icon name="cog-6-tooth" size="lg" className="text-indigo-600 mr-3" />
              <h3 className="heading-4 text-gray-900">Settings</h3>
            </div>
            <p className="body-small text-gray-600 mb-4">
              Configure your profile and preferences
            </p>
            <button className="btn-secondary w-full">
              Profile Settings
            </button>
          </div>
        </div>

        {/* Role Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="heading-3 text-gray-900 mb-4">Your Permissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="heading-4 text-gray-900 mb-3">Current Role</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="body-regular text-gray-600">Role:</span>
                  <span className="body-medium text-gray-900">{roleDisplayNames[admin?.role]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="body-regular text-gray-600">Level:</span>
                  <span className="body-medium text-gray-900">{getRoleLevel()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="body-regular text-gray-600">Last Login:</span>
                  <span className="body-medium text-gray-900">
                    {admin?.last_login ? new Date(admin.last_login).toLocaleString() : 'Never'}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="heading-4 text-gray-900 mb-3">Access Rights</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Icon
                    name={hasRole('super_admin') ? "check-circle" : "x-circle"}
                    size="sm"
                    className={`mr-2 ${hasRole('super_admin') ? 'text-green-600' : 'text-red-600'}`}
                  />
                  <span className="body-regular text-gray-600">System Administration</span>
                </div>
                <div className="flex items-center">
                  <Icon
                    name={hasAnyRole(['super_admin', 'content_manager']) ? "check-circle" : "x-circle"}
                    size="sm"
                    className={`mr-2 ${hasAnyRole(['super_admin', 'content_manager']) ? 'text-green-600' : 'text-red-600'}`}
                  />
                  <span className="body-regular text-gray-600">Content Management</span>
                </div>
                <div className="flex items-center">
                  <Icon
                    name={hasAnyRole(['super_admin', 'content_manager', 'editor']) ? "check-circle" : "x-circle"}
                    size="sm"
                    className={`mr-2 ${hasAnyRole(['super_admin', 'content_manager', 'editor']) ? 'text-green-600' : 'text-red-600'}`}
                  />
                  <span className="body-regular text-gray-600">Editorial Access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;