'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/sidebar';
import {
  IconFile,
  IconChartBar,
  IconUpload,
  IconUsers,
  IconShield,
  IconClock,
  IconEye,
  IconDownload,
  IconLock,
  IconBell,
  IconLogin,
  IconUserPlus,
  IconActivity,
} from '@tabler/icons-react';
import { formatFileSize } from '@/lib/utils';

interface DashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
  };
  subscription: {
    id: string;
    planId: string;
    status: string;
    startDate: string;
    endDate: string;
    paymentMethod: string | null;
    autoRenew: boolean;
  } | null;
  files: {
    total: number;
    storageUsed: number;
    recent: Array<{
      id: string;
      name: string;
      size: number;
      contentType: string;
      createdAt: string;
    }>;
  };
  contacts: {
    total: number;
    recent: Array<{
      id: string;
      name: string;
      email: string;
      relation: string;
    }>;
  };
  activities: Array<{
    id: string;
    action: string;
    resourceId?: string;
    details?: any;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/dashboard');
      
      if (!response.ok) {
        throw new Error('데이터를 불러오는데 실패했습니다');
      }
      
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Dashboard data error:', error);
      setError('대시보드 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      
      <div className="ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section with Upload Button */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Welcome back, {dashboardData?.user?.name || session.user?.name}
              </h1>
              <p className="mt-2 text-gray-600">Here's what's happening with your account today.</p>
            </div>
            <button 
              onClick={() => router.push('/files')}
              className="mt-4 md:mt-0 flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1"
            >
              <IconUpload className="w-5 h-5 mr-2" />
              Upload Files
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Files Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600">
                  <IconFile className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Files</p>
                  <p className="text-2xl font-semibold text-gray-900">{dashboardData?.files.total || 0}</p>
                </div>
              </div>
            </div>

            {/* Storage Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-gradient-to-br from-green-100 to-green-200 text-green-600">
                  <IconChartBar className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Storage Used</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatFileSize(dashboardData?.files.storageUsed || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Contacts Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600">
                  <IconUsers className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Trusted Contacts</p>
                  <p className="text-2xl font-semibold text-gray-900">{dashboardData?.contacts.total || 0}</p>
                </div>
              </div>
            </div>

            {/* Subscription Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-600">
                  <IconShield className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Subscription</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardData?.subscription ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-red-600">Inactive</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Details */}
          {dashboardData?.subscription && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm mb-8 overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-600">
                    <IconShield className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 ml-3">Subscription Details</h2>
                </div>
                <button 
                  onClick={() => router.push('/subscription')}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
                >
                  Manage Subscription
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Plan</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {dashboardData.subscription.planId === 'basic' ? 'Basic' : 
                       dashboardData.subscription.planId === 'pro' ? 'Pro' : 'Enterprise'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {dashboardData.subscription.status === 'active' ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Next Billing Date</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {new Date(dashboardData.subscription.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Auto Renew</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {dashboardData.subscription.autoRenew ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm mb-8 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center">
              <div className="p-2 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600">
                <IconActivity className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 ml-3">Recent Activity</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {dashboardData?.activities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="p-6 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
                      {getActivityIcon(activity.action)}
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {getActionText(activity.action)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Files and Contacts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Files */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex items-center">
                <div className="p-2 rounded-full bg-gradient-to-br from-green-100 to-green-200 text-green-600">
                  <IconFile className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 ml-3">Recent Files</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {dashboardData?.files.recent.map((file) => (
                  <div 
                    key={file.id} 
                    className="p-6 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
                        {getFileIcon(file.contentType)}
                      </div>
                      <div className="ml-4 flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <div className="flex items-center mt-1">
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                          <span className="mx-2 text-gray-300">•</span>
                          <p className="text-xs text-gray-500">
                            {new Date(file.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                      </div>
                      <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                        <IconDownload className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Contacts */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex items-center">
                <div className="p-2 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600">
                  <IconUsers className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 ml-3">Recent Contacts</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {dashboardData?.contacts.recent.map((contact) => (
                  <div 
                    key={contact.id} 
                    className="p-6 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
                        <IconUserPlus className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="ml-4 flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                        <div className="flex items-center mt-1">
                          <p className="text-xs text-gray-500">{contact.email}</p>
                          <span className="mx-2 text-gray-300">•</span>
                          <p className="text-xs text-gray-500">{contact.relation}</p>
                        </div>
                      </div>
                      <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                        <IconEye className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getActivityIcon(action: string) {
  switch (action) {
    case 'file_upload':
      return <IconUpload className="w-5 h-5 text-green-600" />;
    case 'file_download':
      return <IconDownload className="w-5 h-5 text-blue-600" />;
    case 'contact_add':
      return <IconUserPlus className="w-5 h-5 text-purple-600" />;
    case 'login':
      return <IconLogin className="w-5 h-5 text-orange-600" />;
    default:
      return <IconActivity className="w-5 h-5 text-gray-600" />;
  }
}

function getFileIcon(contentType: string) {
  if (contentType.startsWith('image/')) {
    return <IconEye className="w-5 h-5 text-blue-600" />;
  } else if (contentType.startsWith('application/pdf')) {
    return <IconFile className="w-5 h-5 text-red-600" />;
  } else if (contentType.startsWith('text/')) {
    return <IconFile className="w-5 h-5 text-green-600" />;
  } else {
    return <IconFile className="w-5 h-5 text-gray-600" />;
  }
}

function getActionText(action: string) {
  switch (action) {
    case 'file_upload':
      return 'Uploaded a new file';
    case 'file_download':
      return 'Downloaded a file';
    case 'contact_add':
      return 'Added a new contact';
    case 'login':
      return 'Logged in';
    default:
      return action;
  }
}

