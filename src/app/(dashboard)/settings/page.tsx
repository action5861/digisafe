'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/sidebar';
import {
  IconLock,
  IconBell,
  IconCreditCard,
  IconLogout,
  IconCheck,
  IconX,
} from '@tabler/icons-react';
import ProfileImageUpload from '@/components/settings/profile-image-upload';
import ChangePasswordModal from '@/components/settings/change-password-modal';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [settings, setSettings] = useState({
    twoFactorAuth: false,
    loginNotifications: true,
    emailNotifications: true,
    importantEventNotifications: true,
  });

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    router.push('/auth/signin');
    return null;
  }

  const handleProfileImageChange = (file: File) => {
    // TODO: Implement profile image upload
    console.log('Uploading profile image:', file);
  };

  const handlePasswordChange = (currentPassword: string, newPassword: string) => {
    // TODO: Implement password change
    console.log('Changing password:', { currentPassword, newPassword });
  };

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings({ ...settings, [key]: value });
    // TODO: Implement setting save
    console.log('Saving setting:', { key, value });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

          {/* Profile Information */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
            <div className="space-y-6">
              <ProfileImageUpload
                currentImage={session.user?.image}
                onImageChange={handleProfileImageChange}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    value={session.user?.name || ''}
                    onChange={(e) => {
                      // TODO: Implement name update
                      console.log('Updating name:', e.target.value);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    value={session.user?.email || ''}
                    onChange={(e) => {
                      // TODO: Implement email update
                      console.log('Updating email:', e.target.value);
                    }}
                  />
                </div>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <IconLock className="w-4 h-4 mr-2" />
                Change Password
              </button>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                </div>
                <button
                  onClick={() => handleSettingChange('twoFactorAuth', !settings.twoFactorAuth)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    settings.twoFactorAuth ? 'bg-primary' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Login Notifications</h3>
                  <p className="text-sm text-gray-500">Get notified when someone logs in to your account</p>
                </div>
                <button
                  onClick={() => handleSettingChange('loginNotifications', !settings.loginNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    settings.loginNotifications ? 'bg-primary' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.loginNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <button
                  onClick={() => handleSettingChange('emailNotifications', !settings.emailNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    settings.emailNotifications ? 'bg-primary' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Important Event Notifications</h3>
                  <p className="text-sm text-gray-500">Get notified about important events like access attempts</p>
                </div>
                <button
                  onClick={() => handleSettingChange('importantEventNotifications', !settings.importantEventNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    settings.importantEventNotifications ? 'bg-primary' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.importantEventNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Subscription Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Subscription Information</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Current Plan</h3>
                  <p className="text-sm text-gray-500">Premium Plan</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                  Active
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Storage Usage</h3>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">4.5 GB of 10 GB used</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Next Billing Date</h3>
                  <p className="text-sm text-gray-500">March 1, 2024</p>
                </div>
                <button className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                  <IconCreditCard className="w-4 h-4 mr-2" />
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSave={handlePasswordChange}
      />
    </div>
  );
} 