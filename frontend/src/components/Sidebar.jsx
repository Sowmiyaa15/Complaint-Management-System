import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  FilePlus,
  ClipboardList,
  Users,
  BarChart3,
  Bell,
  User,
  X,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, isEmployee, isCitizen } = useAuth();

  const getNavLinks = () => {
    if (isAdmin) {
      return [
        { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/admin/complaints', label: 'Complaints', icon: ClipboardList },
        { to: '/admin/users', label: 'User Management', icon: Users },
        { to: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
        { to: '/notifications', label: 'Notifications', icon: Bell },
        { to: '/profile', label: 'My Profile', icon: User },
      ];
    }

    if (isEmployee) {
      return [
        { to: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/employee/complaints', label: 'Assigned Complaints', icon: Briefcase },
        { to: '/submit-complaint', label: 'Submit Complaint', icon: FilePlus },
        { to: '/my-complaints', label: 'My Submissions', icon: ClipboardList },
        { to: '/notifications', label: 'Notifications', icon: Bell },
        { to: '/profile', label: 'My Profile', icon: User },
      ];
    }

    // Citizen
    return [
      { to: '/citizen/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/submit-complaint', label: 'Submit Complaint', icon: FilePlus },
      { to: '/citizen/complaints', label: 'My Complaints', icon: ClipboardList },
      { to: '/notifications', label: 'Notifications', icon: Bell },
      { to: '/profile', label: 'My Profile', icon: User },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-sky-600" />
            <span className="font-bold text-slate-800 text-sm uppercase tracking-wider">
              {user?.role} Workspace
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User Card in Sidebar footer */}
        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60">
            <p className="text-xs font-medium text-slate-400">Signed in as</p>
            <p className="text-xs font-semibold text-slate-800 truncate">{user?.email}</p>
          </div>
        </div>
      </aside>
    </>
  );
};
