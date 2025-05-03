"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  IconHome,
  IconFolder,
  IconUsers,
  IconSettings,
  IconChevronRight,
  IconChevronLeft,
} from "@tabler/icons-react";

interface SidebarLink {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const sidebarLinks: SidebarLink[] = [
  {
    icon: <IconHome size={24} />,
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: <IconFolder size={24} />,
    label: "Documents",
    href: "/documents",
  },
  {
    icon: <IconUsers size={24} />,
    label: "Trusted Contacts",
    href: "/contacts",
  },
  {
    icon: <IconSettings size={24} />,
    label: "Settings",
    href: "/settings",
  },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300",
        isCollapsed ? "w-[70px]" : "w-[250px]"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="font-heading font-bold text-primary">DigiSafe</span>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <IconChevronRight size={20} />
          ) : (
            <IconChevronLeft size={20} />
          )}
        </button>
      </div>

      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {sidebarLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors",
                  "hover:bg-gray-100",
                  pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700",
                  isCollapsed && "justify-center"
                )}
              >
                {link.icon}
                {!isCollapsed && <span>{link.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <Link
          href="/profile"
          className={cn(
            "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors",
            "hover:bg-gray-100",
            isCollapsed && "justify-center"
          )}
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
            U
          </div>
          {!isCollapsed && (
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">User Profile</p>
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
} 