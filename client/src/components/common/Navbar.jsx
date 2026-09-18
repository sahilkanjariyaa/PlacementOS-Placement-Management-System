import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { Bell, LogOut, User, Menu, X, CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  const roleColors = {
    admin: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    recruiter: 'bg-purple-100 text-purple-700 border-purple-200',
    student: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition">
              <span className="font-extrabold text-base tracking-tight">P</span>
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg leading-tight block">
                Placement<span className="text-brand-600">OS</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase block -mt-1">
                College Placement System
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Notifications & User Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Notification Popover */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-slate-800">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="text-xs bg-brand-100 text-brand-700 font-semibold px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => markAsRead(n._id)}
                        className={`p-3.5 text-left text-xs cursor-pointer transition hover:bg-slate-50 ${
                          !n.isRead ? 'bg-teal-50/40 border-l-2 border-brand-500' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-900">{n.title}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-600 text-xs leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User badge & details */}
          {user && (
            <div className="flex items-center gap-3 pl-2 sm:border-l sm:border-slate-200">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-semibold text-slate-800 leading-none">{user.name}</div>
                <div className="text-xs text-slate-400 mt-1">{user.email}</div>
              </div>

              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                  roleColors[user.role] || 'bg-slate-100 text-slate-600'
                }`}
              >
                {user.role}
              </span>

              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                title="Log Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
