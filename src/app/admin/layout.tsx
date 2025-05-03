'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  IconDashboard,
  IconUsers,
  IconCreditCard,
  IconSettings,
  IconActivity,
  IconSubscript,
  IconMenu2,
  IconX,
} from '@tabler/icons-react';

const menuItems = [
  { path: '/admin', icon: IconDashboard, label: '대시보드' },
  { path: '/admin/users', icon: IconUsers, label: '사용자 관리' },
  { path: '/admin/subscriptions', icon: IconSubscript, label: '구독 관리' },
  { path: '/admin/payments', icon: IconCreditCard, label: '결제 관리' },
  { path: '/admin/settings', icon: IconSettings, label: '시스템 설정' },
  { path: '/admin/logs', icon: IconActivity, label: '활동 로그' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session?.user) {
    router.push('/auth/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 모바일 사이드바 토글 버튼 */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? (
          <IconX className="w-6 h-6" />
        ) : (
          <IconMenu2 className="w-6 h-6" />
        )}
      </button>

      {/* 사이드바 */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-white border-r">
          <div className="mb-8 px-2">
            <h1 className="text-2xl font-bold text-blue-600">DigiSafe Admin</h1>
          </div>
          
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className={`p-4 lg:ml-64 ${sidebarOpen ? 'ml-64' : ''}`}>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
} 