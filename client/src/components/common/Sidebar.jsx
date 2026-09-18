import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  LayoutDashboard,
  Briefcase,
  FileCheck2,
  UserCheck,
  Building2,
  Users,
  Megaphone,
  BarChart3,
  Building,
  GraduationCap,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  if (!user) return null;

  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Placement Drives', path: '/student/drives', icon: Briefcase },
    { name: 'My Applications', path: '/student/applications', icon: FileCheck2 },
    { name: 'Academic Profile', path: '/student/profile', icon: GraduationCap },
    { name: 'Announcements', path: '/student/announcements', icon: Megaphone },
  ];

  const adminLinks = [
    { name: 'Overview Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Student Roster', path: '/admin/students', icon: Users },
    { name: 'Companies Directory', path: '/admin/companies', icon: Building2 },
    { name: 'Placement Drives', path: '/admin/drives', icon: Briefcase },
    { name: 'Applications ATS', path: '/admin/applications', icon: FileCheck2 },
    { name: 'Broadcast Notices', path: '/admin/announcements', icon: Megaphone },
    { name: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
  ];

  const recruiterLinks = [
    { name: 'Recruiter Dashboard', path: '/recruiter/dashboard', icon: LayoutDashboard },
    { name: 'Our Drives', path: '/recruiter/drives', icon: Briefcase },
    { name: 'Applicant Review', path: '/recruiter/applications', icon: FileCheck2 },
    { name: 'Company Profile', path: '/recruiter/profile', icon: Building },
  ];

  const navLinks =
    user.role === 'admin'
      ? adminLinks
      : user.role === 'recruiter'
      ? recruiterLinks
      : studentLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={`fixed md:sticky top-0 md:top-14 left-0 z-40 h-full md:h-[calc(100vh-3.5rem)] w-64 bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="py-5 px-4 overflow-y-auto">
          <div className="px-3 mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {user.role} workspace
            </span>
          </div>

          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => {
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs text-slate-500 font-medium">Placement Season 2026</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Version 1.0.0 • MERN Architecture</p>
        </div>
      </aside>
    </>
  );
};
