import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Bell, LogOut, User as UserIcon, Menu, ShieldAlert } from 'lucide-react';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'EMPLOYEE':
        return 'bg-sky-100 text-sky-700 border-sky-200';
      default:
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 md:hidden transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-primary-500 flex items-center justify-center text-white shadow-sm shadow-sky-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 tracking-tight block leading-tight">
              CMS Portal
            </span>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Grievance Management
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notification Bell */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full border-2 border-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>

        {/* User Role Badge & Info */}
        <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.name}</p>
            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getRoleBadge(user?.role)}`}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* Profile Link */}
        <Link
          to="/profile"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="My Profile"
        >
          <UserIcon className="w-5 h-5" />
        </Link>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
