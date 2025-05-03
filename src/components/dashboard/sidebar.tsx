'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  IconHome,
  IconFile,
  IconUsers,
  IconSettings,
  IconLogout
} from '@tabler/icons-react';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: IconHome },
    { name: 'Files', href: '/files', icon: IconFile },
    { name: 'Trusted Contacts', href: '/contacts', icon: IconUsers },
    { name: 'Settings', href: '/settings', icon: IconSettings },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6">
          <h1 className="text-xl font-bold text-primary">DigiSafe</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button className="flex items-center w-full px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-100">
            <IconLogout className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
} 