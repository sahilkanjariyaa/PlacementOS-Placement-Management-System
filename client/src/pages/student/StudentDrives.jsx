import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { driveService } from '../../services/driveService.js';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import {
  Search,
  Filter,
  Building,
  MapPin,
  Calendar,
  Sparkles,
  CheckCircle,
  XCircle,
  ArrowRight,
  Briefcase,
} from 'lucide-react';

export const StudentDrives = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'eligible'
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [minPackage, setMinPackage] = useState('');
  const [jobType, setJobType] = useState('');

  const fetchDrives = async () => {
    setLoading(true);
    try {
      if (activeTab === 'eligible') {
        const res = await driveService.getEligibleDrives();
        if (res.success) setDrives(res.data);
      } else {
        const params = {};
        if (search) params.search = search;
        if (department) params.department = department;
        if (minPackage) params.minPackage = minPackage;
        if (jobType) params.jobType = jobType;

        const res = await driveService.getDrives(params);
        if (res.success) setDrives(res.data);
      }
    } catch (err) {
      console.error('Failed to load drives:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, [activeTab, department, minPackage, jobType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDrives();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Placement Drives</h1>
          <p className="text-sm text-slate-500 mt-1">
            Discover campus recruitment opportunities with live backend eligibility scoring.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Active Drives
          </button>
          <button
            onClick={() => setActiveTab('eligible')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'eligible'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Eligible for Me
          </button>
        </div>
      </div>

      {/* Filter Bar (for All Drives tab) */}
      {activeTab === 'all' && (
        <form
          onSubmit={handleSearchSubmit}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search title, company, role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white text-slate-700"
            >
              <option value="">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Communication">Electronics & Communication</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
            </select>
          </div>

          {/* Minimum CTC */}
          <div>
            <select
              value={minPackage}
              onChange={(e) => setMinPackage(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white text-slate-700"
            >
              <option value="">Any CTC Package</option>
              <option value="6">6+ LPA</option>
              <option value="10">10+ LPA</option>
              <option value="15">15+ LPA</option>
              <option value="20">20+ LPA</option>
            </select>
          </div>

          {/* Job Type */}
          <div className="flex gap-2">
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white text-slate-700"
            >
              <option value="">All Job Types</option>
              <option value="full_time">Full Time</option>
              <option value="internship">Internship</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              Filter
            </button>
          </div>
        </form>
      )}

      {/* Drives Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching opportunities..." />
      ) : drives.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No placement drives found"
          description={
            activeTab === 'eligible'
              ? 'You do not currently match the criteria of any open drives. Check your profile CGPA and backlogs.'
              : 'No placement drives match your filter criteria.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {drives.map((drive) => (
            <div
              key={drive._id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5">
                {/* Header: Company & CTC */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-xs font-bold text-brand-700 tracking-wide uppercase">
                      {drive.companyId?.name}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5 leading-snug">
                      {drive.title}
                    </h3>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-100 text-teal-800 font-extrabold text-sm">
                      {drive.package} LPA
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                  {drive.description}
                </p>

                {/* Metadata tags */}
                <div className="space-y-1.5 text-xs text-slate-500 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{drive.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Deadline: <strong>{new Date(drive.deadline).toLocaleDateString()}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Min CGPA: <strong>{drive.minCgpa}</strong> • Max Backlogs:{' '}
                      <strong>{drive.maxBacklogs}</strong>
                    </span>
                  </div>
                </div>

                {/* Eligibility Tag */}
                <div className="pt-2">
                  {drive.hasApplied ? (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-200">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span>Application Submitted</span>
                    </div>
                  ) : drive.isEligible ? (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>You are Eligible to Apply</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Not Eligible (Criteria Mismatch)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Footer */}
              <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium capitalize">
                  {drive.jobType.replace('_', ' ')}
                </span>
                <Link
                  to={`/student/drives/${drive._id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700"
                >
                  View Details & Apply <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
