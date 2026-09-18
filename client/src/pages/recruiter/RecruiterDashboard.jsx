import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { reportService } from '../../services/reportService.js';
import { StatCard } from '../../components/common/StatCard.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import {
  Briefcase,
  Users,
  UserCheck,
  Award,
  Clock,
  ArrowRight,
  PlusCircle,
  Building,
} from 'lucide-react';

export const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await reportService.getDashboardStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load recruiter dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading recruiter dashboard..." size="lg" />;
  }

  const m = stats?.metrics || {
    activeDrives: 0,
    totalDrives: 0,
    totalApplicants: 0,
    shortlisted: 0,
    interviews: 0,
    selected: 0,
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-purple-200 text-xs font-semibold mb-2">
            <Building className="w-3.5 h-3.5" />
            <span>Corporate Recruitment Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {user?.name}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-purple-200 mt-1 max-w-xl">
            Manage your company's campus hiring drives, screen candidate dossiers, and roll out selection offers.
          </p>
        </div>

        <Link
          to="/recruiter/drives"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-purple-50 text-purple-950 text-xs font-bold rounded-xl shadow-md transition self-start"
        >
          <PlusCircle className="w-4 h-4 text-purple-700" />
          <span>Publish New Drive</span>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Active Drives" value={m.activeDrives} icon={Briefcase} color="purple" />
        <StatCard title="Total Applicants" value={m.totalApplicants} icon={Users} color="blue" />
        <StatCard title="Shortlisted" value={m.shortlisted} icon={UserCheck} color="amber" />
        <StatCard title="Interviews Scheduled" value={m.interviews} icon={Clock} color="brand" />
        <StatCard title="Final Offers" value={m.selected} icon={Award} color="emerald" />
      </div>

      {/* Recent Candidate Pipeline */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Recent Candidate Applications</h3>
          <Link
            to="/recruiter/applications"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            Review all applicants <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {stats?.recentApplications?.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No applications submitted yet for your active drives.
            </div>
          ) : (
            stats?.recentApplications?.map((app) => (
              <div key={app._id} className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {app.studentId?.userId?.name || 'Candidate'}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {app.driveId?.title} • Applied on{' '}
                    {new Date(app.appliedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={app.status} />
                  <Link
                    to={`/recruiter/applications?driveId=${app.driveId?._id || ''}`}
                    className="text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg transition"
                  >
                    Review Dossier
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
