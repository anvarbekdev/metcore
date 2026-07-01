'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, Calendar, Microscope,
  FileText, Bot, Settings, LogOut, Activity, X, HeartPulse,
} from 'lucide-react';

const ROLE_NAV: Record<string, { href: string; label: string; icon: any }[]> = {
  SUPER_ADMIN: [
    { href: '/dashboard',                  label: 'Asosiy',      icon: LayoutDashboard },
    { href: '/dashboard/onko-ai',          label: 'Onko-AI',     icon: Microscope },
    { href: '/dashboard/dimed-assistant',  label: 'AI chat',     icon: Bot },
    { href: '/dashboard/doc-digitizer',    label: 'Hujjatlar',   icon: FileText },
    { href: '/dashboard/patients',         label: 'Bemorlar',    icon: Users },
    { href: '/dashboard/doctors',          label: 'Shifokorlar', icon: Activity },
    { href: '/dashboard/appointments',     label: 'Navbatlar',   icon: Calendar },
    { href: '/dashboard/settings',         label: 'Sozlamalar',  icon: Settings },
  ],
  CLINIC_ADMIN: [
    { href: '/dashboard',                  label: 'Asosiy',    icon: LayoutDashboard },
    { href: '/dashboard/onko-ai',          label: 'Onko-AI',   icon: Microscope },
    { href: '/dashboard/dimed-assistant',  label: 'AI chat',   icon: Bot },
    { href: '/dashboard/doc-digitizer',    label: 'Hujjatlar', icon: FileText },
    { href: '/dashboard/patients',         label: 'Bemorlar',  icon: Users },
    { href: '/dashboard/appointments',     label: 'Navbatlar', icon: Calendar },
  ],
  DOCTOR: [
    { href: '/dashboard',              label: 'Asosiy',     icon: LayoutDashboard },
    { href: '/dashboard/onko-ai',      label: 'Onko-AI',    icon: Microscope },
    { href: '/dashboard/patients',     label: 'Bemorlarim', icon: Users },
    { href: '/dashboard/appointments', label: 'Navbatlar',  icon: Calendar },
  ],
  RECEPTIONIST: [
    { href: '/dashboard',              label: 'Asosiy',    icon: LayoutDashboard },
    { href: '/dashboard/doc-digitizer', label: 'Hujjatlar', icon: FileText },
    { href: '/dashboard/patients',     label: 'Bemorlar',  icon: Users },
    { href: '/dashboard/appointments', label: 'Navbatlar', icon: Calendar },
  ],
  DEPARTMENT_STAFF: [
    { href: '/dashboard',         label: 'Asosiy',  icon: LayoutDashboard },
    { href: '/dashboard/onko-ai', label: 'Onko-AI', icon: Microscope },
  ],
  DATA_ANALYST: [
    { href: '/dashboard',                 label: 'Asosiy',  icon: LayoutDashboard },
    { href: '/dashboard/dimed-assistant', label: 'AI chat', icon: Bot },
  ],
  PATIENT: [
    { href: '/patient',            label: 'Bosh sahifa', icon: LayoutDashboard },
    { href: '/patient/assistant',  label: 'AI Yordamchi', icon: Bot },
    { href: '/patient/appointments', label: 'Navbatlarim', icon: Calendar },
  ],
};

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const navItems = ROLE_NAV[user?.role || 'PATIENT'] || [];

  return (
    <aside
      className={cn(
        'w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-40 transition-transform duration-300 ease-in-out',
        // Mobile: slide in/out; Desktop: always visible
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0',
      )}
    >
      {/* Logo */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center">
            <HeartPulse className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
          </div>
          <span className="font-bold text-slate-800 text-sm">MedCore</span>
        </div>
        {/* Close button — mobile only */}
        <button
          className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-400 hover:text-slate-600"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={cn('sidebar-item', pathname === href && 'active')}
          >
            <Icon style={{ width: 18, height: 18 }} className="shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-semibold text-sm flex-shrink-0">
            {user?.fullName?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{user?.fullName}</p>
            <p className="text-xs text-slate-400 truncate">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="sidebar-item w-full text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="w-4 h-4" />
          Chiqish
        </button>
      </div>
    </aside>
  );
}
