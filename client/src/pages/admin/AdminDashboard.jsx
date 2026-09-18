import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportService } from '../../services/reportService.js';
import { StatCard } from '../../components/common/StatCard.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import {
  DepartmentPlacementChart,
  ApplicationStatusChart,
} from '../../components/charts/PlacementCharts.jsx';
import {
  Users,
  Building2,
  Briefcase,
  FileCheck2,
  Award,
  TrendingUp,
  ArrowRight,
  PlusCircle,
  FileSpreadsheet,
  Megaphone,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, analyticsRes] = await Promise.all([
          reportService.getDashboardStats(),
          reportService.getAnalytics(),
        ]);
        if (statsRes.success) setStats(statsRes.data);
        if (analyticsRes.success) setAnalytics(analyticsRes.data);
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Aggregating placement analytics..." size="lg" />;
  }

  const m = stats?.metrics || {
    totalStudents: 0,
    totalCompanies: 0,
    activeDrives: 0,
    totalApplications: 0,
    placedStudents: 0,
    placementRate: 0,
    shortlisted: 0,
    tests: 0,
    interviews: 0,
    selected: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Hub */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Placement Command Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time university placement metrics, ATS candidate pipeline, and corporate oversight.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/drives"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Drive</span>
          </Link>
          <Link
            to="/admin/reports"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </Link>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total Students" value={m.totalStudents} icon={Users} color="blue" />
        <StatCard title="Partner Companies" value={m.totalCompanies} icon={Building2} color="purple" />
        <StatCard title="Active Drives" value={m.activeDrives} icon={Briefcase} color="amber" />
        <StatCard title="Total Applications" value={m.totalApplications} icon={FileCheck2} color="brand" />
        <StatCard title="Placed Students" value={m.placedStudents} icon={Award} color="emerald" />
        <StatCard
          title="Placement Rate"
          value={`${m.placementRate}%`}
          icon={TrendingUp}
          color="emerald"
          trend="+5.2% YoY"
        />
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Department-wise Placements
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Placed vs Seeking Students by Discipline</p>
            </div>
          </div>
          <DepartmentPlacementChart data={analytics?.departmentPlacements || []} />
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Application Pipeline Breakdown
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Distribution across Recruitment Stages</p>
            </div>
          </div>
          <ApplicationStatusChart data={analytics?.applicationsByStatus || []} />
        </div>
      </div>

      {/* Tables: Recent Applications & Active Drives */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recent Candidate Applications</h3>
            <Link
              to="/admin/applications"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              Master ATS <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {stats?.recentApplications?.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No applications recorded yet</div>
            ) : (
              stats?.recentApplications?.map((app) => (
                <div key={app._id} className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      {app.studentId?.userId?.name || 'Student'}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {app.driveId?.companyId?.name} • {app.driveId?.title}
                    </p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Drives */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recent Placement Drives</h3>
            <Link
              to="/admin/drives"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              All Drives <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {stats?.recentDrives?.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No placement drives found</div>
            ) : (
              stats?.recentDrives?.map((drive) => (
                <div key={drive._id} className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{drive.title}</h4>
                    <p className="text-[11px] text-slate-500">
                      {drive.companyId?.name} • {drive.package} LPA • {drive.location}
                    </p>
                  </div>
                  <StatusBadge status={drive.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
