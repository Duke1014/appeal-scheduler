import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/authContext';
import { Avatar } from '@/components/ui';
import {
  LayoutDashboard, CalendarDays, ClipboardList,
  Users, FileText, LogOut, Briefcase
} from 'lucide-react';
import { cn } from '@/components/ui';

interface NavItem { to: string; label: string; icon: React.ReactNode }

const volunteerNav: NavItem[] = [
  { to: '/dashboard',      label: 'Dashboard',       icon: <LayoutDashboard size={18} /> },
  { to: '/my-assignments', label: 'My Assignments',  icon: <ClipboardList   size={18} /> },
  { to: '/survey',         label: 'Weekly Survey',   icon: <CalendarDays    size={18} /> },
];

const adminNav: NavItem[] = [
  { to: '/admin',             label: 'Admin Home',    icon: <LayoutDashboard size={18} /> },
  { to: '/admin/users',       label: 'Users',         icon: <Users           size={18} /> },
  { to: '/admin/events',      label: 'Events',        icon: <Briefcase       size={18} /> },
  { to: '/admin/assignments', label: 'Assignments',   icon: <ClipboardList   size={18} /> },
  { to: '/admin/surveys',     label: 'Surveys',       icon: <FileText        size={18} /> },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const navItems = user.role === 'admin' ? adminNav : volunteerNav;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col border-r border-white/8 bg-slate-950/80 backdrop-blur">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-white/8">
          <h1 className="font-display text-xl text-white leading-tight">Appeal<br/><span className="text-brand-400">Scheduler</span></h1>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin' || item.to === '/dashboard'}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'bg-brand-600/20 text-brand-300 border border-brand-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/6'
              )}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-white/8">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            <Avatar src={user.photo_path} name={user.full_name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.full_name}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>
            <button onClick={handleLogout} title="Logout" className="text-slate-500 hover:text-red-400 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}