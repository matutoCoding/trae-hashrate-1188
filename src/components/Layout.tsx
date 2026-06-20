import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  GitBranch,
  PackageOpen,
  ClipboardList,
  Bike,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/utils';
import NotificationBell from './NotificationBell';

const navItems = [
  { path: '/', label: '仪表盘', icon: LayoutDashboard },
  { path: '/queue', label: '叫号大厅', icon: Ticket },
  { path: '/dispatch', label: '工位调度', icon: GitBranch },
  { path: '/parts', label: '配件管理', icon: PackageOpen },
  { path: '/outbound', label: '出库记录', icon: ClipboardList },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-all duration-300 flex flex-col',
          sidebarOpen ? 'w-64' : 'w-20 lg:w-20'
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
              <Bike className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="font-bold text-slate-800 text-sm">
                  骑行驿站
                </span>
                <span className="text-xs text-slate-400">维修管理系统</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 flex-shrink-0 transition-colors',
                    isActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'
                  )}
                />
                {sidebarOpen && <span>{item.label}</span>}
                {isActive && sidebarOpen && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-500" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {sidebarOpen && (
          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                管
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  管理员
                </p>
                <p className="text-xs text-slate-400">admin@bike.com</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:block p-2 rounded-lg hover:bg-slate-100 text-slate-500"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-slate-800">
              {navItems.find((item) => item.path === location.pathname)?.label ||
                '仪表盘'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>

      {!sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
