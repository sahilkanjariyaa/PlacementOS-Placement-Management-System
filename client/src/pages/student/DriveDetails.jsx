import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { driveService } from '../../services/driveService.js';
import { applicationService } from '../../services/applicationService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import {
  ArrowLeft,
  Building,
  MapPin,
  Calendar,
  Globe,
  Mail,
  User,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Sparkles,
  Briefcase,
} from 'lucide-react';

export const DriveDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [drive, setDrive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchDrive = async () => {
    try {
      const res = await driveService.getDriveById(id);
      if (res.success) {
        setDrive(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load drive details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrive();
  }, [id]);

  const handleApply = async () => {
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const res = await applicationService.applyToDrive(id);
      if (res.success) {
        setSuccess('Your application has been submitted successfully!');
        await fetchDrive(); // refresh application state
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading placement drive details..." size="lg" />;
  }

  if (!drive) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-bold text-slate-800">Drive Not Found</h2>
        <Link to="/student/drives" className="mt-4 text-xs font-bold text-brand-600 underline">
          ← Return to Placement Drives
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Button */}
      <Link
        to="/student/drives"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Placement Drives
      </Link>

      {/* Main Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200">
              {drive.companyId?.name}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              • {drive.jobType?.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {drive.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-3">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-slate-400" />
              {drive.location}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-slate-400" />
              Deadline: <strong>{new Date(drive.deadline).toLocaleDateString()}</strong>
            </span>
          </div>
        </div>

        {/* CTC Package Box */}
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200/80 p-5 rounded-2xl text-center md:min-w-[200px]">
          <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block">
            Annual Package (CTC)
          </span>
          <span className="text-3xl font-extrabold text-teal-900 tracking-tight block mt-1">
            {drive.package} <span className="text-lg font-bold text-teal-700">LPA</span>
          </span>
          <span className="text-[11px] text-teal-600 mt-1 block">Full-time compensation</span>
        </div>
      </div>

      {/* Error & Success Toasts */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Description & Company Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Overview */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              Role Description & Expectations
            </h3>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {drive.description}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Eligible Departments
              </h4>
              <div className="flex flex-wrap gap-2">
                {drive.eligibleDepartments?.map((dept, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200"
                  >
                    {dept}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Corporate Partner Profile */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Building className="w-4 h-4 text-brand-600" />
              About {drive.companyId?.name}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Industry Sector</span>
                <span className="font-semibold text-slate-800">{drive.companyId?.industry}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Corporate Website</span>
                <a
                  href={drive.companyId?.website}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <Globe className="w-3.5 h-3.5" />
                  {drive.companyId?.website}
                </a>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Headquarters / Office</span>
                <span className="font-semibold text-slate-800">{drive.companyId?.location}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Campus Hiring HR</span>
                <span className="font-semibold text-slate-800">
                  {drive.companyId?.hrName} ({drive.companyId?.hrEmail})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Backend Eligibility Checklist & 1-Click Apply */}
        <div className="space-y-6">
          {/* Eligibility Engine Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Eligibility Assessment
              </h3>
            </div>

            <div className="space-y-3 text-xs mb-6">
              {/* CGPA */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="font-semibold text-slate-800 block">Minimum CGPA: {drive.minCgpa}</span>
                  <span className="text-[11px] text-slate-500">Your CGPA: {profile?.cgpa || 'N/A'}</span>
                </div>
                {profile?.cgpa >= drive.minCgpa ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600" />
                )}
              </div>

              {/* Backlogs */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="font-semibold text-slate-800 block">Max Backlogs: {drive.maxBacklogs}</span>
                  <span className="text-[11px] text-slate-500">Your Backlogs: {profile?.backlogs ?? 'N/A'}</span>
                </div>
                {(profile?.backlogs ?? 0) <= drive.maxBacklogs ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600" />
                )}
              </div>

              {/* Department */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="font-semibold text-slate-800 block">Department</span>
                  <span className="text-[11px] text-slate-500">{profile?.department || 'N/A'}</span>
                </div>
                {drive.eligibleDepartments?.includes(profile?.department) ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600" />
                )}
              </div>
            </div>

            {/* Application Action Button */}
            {new Date() > new Date(drive.deadline) || drive.status !== 'open' ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
                <span className="text-xs font-bold text-amber-900 block mb-1">
                  Registration Closed
                </span>
                <p className="text-[11px] text-amber-800">
                  The application deadline for this placement drive has ended.
                </p>
              </div>
            ) : drive.hasApplied ? (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
                <StatusBadge status={drive.application?.status || 'applied'} className="mb-2" />
                <p className="text-xs font-semibold text-blue-900">Application Submitted</p>
                <p className="text-[11px] text-blue-700 mt-1">
                  Submitted on {new Date(drive.application?.appliedAt || Date.now()).toLocaleDateString()}
                </p>
              </div>
            ) : drive.isEligible ? (
              <button
                type="button"
                onClick={handleApply}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md transition disabled:opacity-50"
              >
                {submitting ? (
                  'Submitting Application...'
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>1-Click Apply to Drive</span>
                  </>
                )}
              </button>
            ) : (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                <span className="text-xs font-bold text-rose-800 block mb-1">
                  Ineligible for this Drive
                </span>
                <ul className="text-[11px] text-rose-700 list-disc pl-4 space-y-1">
                  {drive.eligibilityReasons?.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
