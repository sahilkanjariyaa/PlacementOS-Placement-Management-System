import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { reportService } from '../../services/reportService.js';
import { StatCard } from '../../components/common/StatCard.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import {
  Briefcase,
  Send,
  UserCheck,
  Award,
  ArrowRight,
  Sparkles,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  Megaphone,
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await reportService.getDashboardStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading your placement dashboard..." size="lg" />;
  }

  const metrics = stats?.metrics || {
    eligibleDrives: 0,
    totalApplied: 0,
    shortlisted: 0,
    interviews: 0,
    selected: 0,
    placementStatus: 'unplaced',
    profileCompletion: 70,
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-brand-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-teal-200 text-xs font-semibold mb-3 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Recruitment Season 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-sm text-teal-100 mt-1 max-w-xl">
              Track eligible company drives, monitor your application rounds, and keep your academic dossier up to date.
            </p>
          </div>

          {/* Profile Completeness Pill */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15 min-w-[240px]">
            <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
              <span>Profile Completion</span>
              <span className="text-teal-300">{metrics.profileCompletion}%</span>
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div
                className="bg-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${metrics.profileCompletion}%` }}
              ></div>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <span className="text-[11px] text-teal-200">
                Status: <strong className="capitalize">{metrics.placementStatus}</strong>
              </span>
              <Link
                to="/student/profile"
                className="text-[11px] font-bold text-white hover:text-teal-200 underline decoration-dotted"
              >
                Edit Dossier →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Eligible Drives"
          value={metrics.eligibleDrives}
          subtitle="Matching your CGPA & Dept"
          icon={Briefcase}
          color="brand"
        />
        <StatCard
          title="Applications"
          value={metrics.totalApplied}
          subtitle="Drives submitted"
          icon={Send}
          color="blue"
        />
        <StatCard
          title="Shortlisted"
          value={metrics.shortlisted}
          subtitle="Passed initial screening"
          icon={UserCheck}
          color="purple"
        />
        <StatCard
          title="Interviews"
          value={metrics.interviews}
          subtitle="Rounds scheduled"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Selected"
          value={metrics.selected}
          subtitle="Placement offers"
          icon={Award}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upcoming Eligible Drives & Recent Applications */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Drives Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-brand-600" />
                <h3 className="text-sm font-bold text-slate-900">Featured Placement Opportunities</h3>
              </div>
              <Link
                to="/student/drives"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                View all drives <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {stats?.upcomingDrives?.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No active placement drives found.
                </div>
              ) : (
                stats?.upcomingDrives?.map((drive) => (
                  <div
                    key={drive._id}
                    className="p-4 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          {drive.companyId?.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold">
                          {drive.package} LPA
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 mt-0.5">{drive.title}</h4>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          {drive.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Deadline: {new Date(drive.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/student/drives/${drive._id}`}
                      className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-xs transition"
                    >
                      View & Apply
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Applications Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-brand-600" />
                <h3 className="text-sm font-bold text-slate-900">Your Recent Applications</h3>
              </div>
              <Link
                to="/student/applications"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                Track pipeline <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {stats?.recentApplications?.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  You haven't submitted any applications yet. Explore active drives to get started!
                </div>
              ) : (
                stats?.recentApplications?.map((app) => (
                  <div key={app._id} className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{app.driveId?.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {app.driveId?.companyId?.name} • Applied on{' '}
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                      {app.remarks && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg mt-2 border border-slate-100">
                          <strong>Remarks:</strong> {app.remarks}
                        </p>
                      )}
                    </div>
                    <div>
                      <StatusBadge status={app.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Circular Notices & Announcements */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-brand-600" />
              <h3 className="text-sm font-bold text-slate-900">Official Placement Notices</h3>
            </div>

            <div className="divide-y divide-slate-100">
              {stats?.announcements?.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">No active circulars</div>
              ) : (
                stats?.announcements?.map((notice) => (
                  <div key={notice._id} className="p-4 hover:bg-slate-50/80 transition">
                    <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-2">{notice.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                      {notice.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
