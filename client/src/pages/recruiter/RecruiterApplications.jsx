import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { applicationService } from '../../services/applicationService.js';
import { driveService } from '../../services/driveService.js';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { Pagination } from '../../components/common/Pagination.jsx';
import {
  FileText,
  Search,
  Edit,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Eye,
  User,
  Mail,
  Phone,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

const STAGES = [
  { value: 'applied', label: '1. Applied (Under Review)', desc: 'Initial candidate registration' },
  { value: 'shortlisted', label: '2. Shortlisted for Assessment', desc: 'Screened & approved for technical test' },
  { value: 'test', label: '3. Assessment / Technical Test', desc: 'Aptitude/coding evaluation scheduled' },
  { value: 'interview', label: '4. Interview Round', desc: 'Technical & HR interview in progress' },
  { value: 'selected', label: '5. Selected (Offer Extended)', desc: 'Official campus placement offer released' },
  { value: 'rejected', label: 'X. Rejected', desc: 'Application not moving forward' },
];

export const RecruiterApplications = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDriveId = searchParams.get('driveId') || '';

  const [applications, setApplications] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [driveId, setDriveId] = useState(initialDriveId);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Student Profile Dossier Modal State
  const [viewingApp, setViewingApp] = useState(null);

  // Status Change Modal State (Inline or from Profile)
  const [selectedApp, setSelectedApp] = useState(null);
  const [newStatus, setNewStatus] = useState('applied');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const [appRes, driveRes] = await Promise.all([
        applicationService.getApplications({ search, driveId, status, page, limit: 15 }),
        driveService.getDrives(),
      ]);

      if (appRes.success) {
        setApplications(appRes.data.applications);
        setTotalPages(appRes.data.totalPages);
      }
      if (driveRes.success) {
        setDrives(driveRes.data);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [page, driveId, status]);

  // Sync driveId with URL search params
  const handleDriveChange = (selectedId) => {
    setDriveId(selectedId);
    setPage(1);
    if (selectedId) {
      setSearchParams({ driveId: selectedId });
    } else {
      setSearchParams({});
    }
  };

  const handleOpenProfileModal = (app) => {
    setViewingApp(app);
    setNewStatus(app.status);
    setRemarks(app.remarks || '');
    setError('');
  };

  const handleOpenStatusModal = (app) => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setRemarks(app.remarks || '');
    setError('');
  };

  const handleSaveStatus = async (e, appId) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await applicationService.updateApplicationStatus(appId, {
        status: newStatus,
        remarks: remarks.trim(),
      });
      setSuccess(`Candidate status successfully updated to ${newStatus.toUpperCase()}`);
      
      // Update local viewingApp if open
      if (viewingApp && viewingApp._id === appId) {
        setViewingApp((prev) => ({
          ...prev,
          status: newStatus,
          remarks: remarks.trim(),
        }));
      }
      setSelectedApp(null);
      fetchApplications();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update application status.');
    } finally {
      setSaving(false);
    }
  };

  const selectedDriveObj = drives.find((d) => d._id === driveId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Candidate Applicant Review</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review applicant academic dossiers, inspect skills & resumes, and update recruitment pipeline decisions.
          </p>
        </div>

        {driveId && (
          <button
            onClick={() => handleDriveChange('')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl transition self-start"
          >
            Clear Drive Filter (Showing: {selectedDriveObj?.title || 'Selected Drive'})
          </button>
        )}
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="text-emerald-600 hover:text-emerald-900 text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search student name, email, roll no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>

        <div>
          <select
            value={driveId}
            onChange={(e) => handleDriveChange(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-700 font-medium"
          >
            <option value="">All Company Drives ({drives.length})</option>
            {drives.map((d) => (
              <option key={d._id} value={d._id}>
                {d.title} ({d.applicantCount || 0} applicants)
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-700 font-medium"
          >
            <option value="">All Recruitment Stages</option>
            <option value="applied">1. Applied (Under Review)</option>
            <option value="shortlisted">2. Shortlisted for Assessment</option>
            <option value="test">3. Assessment / Technical Test</option>
            <option value="interview">4. Interview Round</option>
            <option value="selected">5. Selected (Offer Extended)</option>
            <option value="rejected">X. Rejected</option>
          </select>
        </div>
      </div>

      {/* Applicants Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching candidate applicant dossiers..." />
        ) : applications.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <User className="w-10 h-10 mx-auto text-slate-300" />
            <div className="text-sm font-bold text-slate-700">No applicants found</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {driveId
                ? 'No students have applied to this specific drive yet.'
                : 'No student candidates have registered for your campus drives.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Candidate Information</th>
                  <th className="py-3.5 px-4">Academic Qualifications</th>
                  <th className="py-3.5 px-4">Applied Placement Drive</th>
                  <th className="py-3.5 px-4">Applied On</th>
                  <th className="py-3.5 px-4">Current Stage</th>
                  <th className="py-3.5 px-4">Interviewer Remarks</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => {
                  const student = app.studentId;
                  const userObj = student?.userId;
                  return (
                    <tr key={app._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                            {userObj?.name ? userObj.name.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{userObj?.name || 'Unnamed Student'}</div>
                            <div className="text-slate-400 font-mono text-[11px]">
                              {student?.enrollmentNo ? `Roll: ${student.enrollmentNo}` : userObj?.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-lg text-xs">
                            {student?.cgpa !== null && student?.cgpa !== undefined ? `${student.cgpa} CGPA` : 'CGPA N/A'}
                          </span>
                          {student?.backlogs > 0 ? (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                              {student.backlogs} Backlog{student.backlogs > 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                              0 Backlogs
                            </span>
                          )}
                        </div>
                        <div className="text-slate-500 text-[11px] mt-1">
                          {student?.department || 'Department Unassigned'}
                          {student?.semester ? ` • Sem ${student.semester}` : ''}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{app.driveId?.title}</div>
                        <div className="text-slate-500 text-[11px]">
                          {app.driveId?.package} LPA • {app.driveId?.location}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={app.status} />
                      </td>

                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-600" title={app.remarks}>
                        {app.remarks || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenProfileModal(app)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs transition border border-purple-200"
                            title="View full student academic dossier and update status"
                          >
                            <Eye className="w-3.5 h-3.5 text-purple-600" />
                            <span>View Profile</span>
                          </button>

                          <button
                            onClick={() => handleOpenStatusModal(app)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                            title="Quick Stage Update"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Stage</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* MODAL 1: FULL STUDENT PROFILE & ACADEMIC REVIEW DOSSIER */}
      {viewingApp && (
        <Modal
          isOpen={!!viewingApp}
          onClose={() => setViewingApp(null)}
          title={`Candidate Dossier: ${viewingApp.studentId?.userId?.name || 'Applicant Profile'}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-5 text-xs text-slate-700">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Candidate Header Identity */}
            <div className="p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-slate-50 rounded-2xl border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-extrabold flex items-center justify-center text-lg shadow-sm">
                  {viewingApp.studentId?.userId?.name ? viewingApp.studentId.userId.name.charAt(0).toUpperCase() : 'S'}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {viewingApp.studentId?.userId?.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {viewingApp.studentId?.userId?.email}
                    </span>
                    {viewingApp.studentId?.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {viewingApp.studentId.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-col items-start sm:items-end gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Placement Status</span>
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase ${
                    viewingApp.studentId?.placementStatus === 'placed'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {viewingApp.studentId?.placementStatus || 'unplaced'}
                </span>
              </div>
            </div>

            {/* Academic Credentials Grid */}
            <div>
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-purple-600" />
                <span>Academic Record & Verification</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-xl">
                  <div className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">Cumulative CGPA</div>
                  <div className="text-lg font-black text-teal-900 mt-0.5">
                    {viewingApp.studentId?.cgpa !== null && viewingApp.studentId?.cgpa !== undefined
                      ? `${viewingApp.studentId.cgpa} / 10`
                      : 'Not Set'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Department</div>
                  <div className="text-xs font-extrabold text-slate-900 mt-1 truncate">
                    {viewingApp.studentId?.department || 'Unassigned'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current Semester</div>
                  <div className="text-xs font-extrabold text-slate-900 mt-1">
                    {viewingApp.studentId?.semester ? `Semester ${viewingApp.studentId.semester}` : 'N/A'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Backlogs</div>
                  <div className="text-xs font-extrabold text-slate-900 mt-1">
                    {viewingApp.studentId?.backlogs || 0} Backlog(s)
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Skills & Resume */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[11px] font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Technical Skills</span>
                </div>
                {viewingApp.studentId?.skills?.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {viewingApp.studentId.skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold text-[11px]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-[11px]">No technical skills logged in profile.</p>
                )}
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-brand-600" />
                    <span>Candidate Resume</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    {viewingApp.studentId?.resumeUrl
                      ? 'Student has uploaded their verified resume portfolio.'
                      : 'No external resume URL uploaded yet.'}
                  </p>
                </div>

                {viewingApp.studentId?.resumeUrl ? (
                  <a
                    href={viewingApp.studentId.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs transition mt-2 self-start shadow-xs"
                  >
                    <span>View Student Resume</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-slate-400 text-[11px] font-semibold mt-2">Resume link pending</span>
                )}
              </div>
            </div>

            {/* Application & Drive Context */}
            <div className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-100 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Applied Drive</div>
                <div className="font-extrabold text-slate-900 text-xs mt-0.5">{viewingApp.driveId?.title}</div>
                <div className="text-slate-500 text-[11px]">
                  {viewingApp.driveId?.package} LPA • {viewingApp.driveId?.location} • Applied on{' '}
                  {new Date(viewingApp.appliedAt).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Current Stage</div>
                <div className="mt-1">
                  <StatusBadge status={viewingApp.status} />
                </div>
              </div>
            </div>

            {/* Direct Stage Update Form */}
            <div className="pt-2 border-t border-slate-200">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-3">
                Update Candidate Recruitment Stage & Feedback
              </h4>

              <form onSubmit={(e) => handleSaveStatus(e, viewingApp._id)} className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Move Candidate to Stage *</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white font-bold text-slate-800"
                  >
                    {STAGES.map((st) => (
                      <option key={st.value} value={st.value}>
                        {st.label} — {st.desc}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Interviewer Notes / Candidate Schedule Guidelines
                  </label>
                  <textarea
                    rows={2}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="e.g. Cleared round 1 technical coding. Scheduled for system design interview on Friday 11:00 AM."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setViewingApp(null)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold"
                  >
                    Close Dossier
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition disabled:opacity-50 shadow-xs"
                  >
                    {saving ? 'Saving...' : 'Update Candidate Stage'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 2: QUICK STAGE UPDATE MODAL */}
      {selectedApp && (
        <Modal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={`Update Decision: ${selectedApp.studentId?.userId?.name || 'Candidate'}`}
          maxWidth="max-w-md"
        >
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={(e) => handleSaveStatus(e, selectedApp._id)} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Recruitment Stage *</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white font-semibold"
              >
                {STAGES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Evaluation Notes / Schedule Guidelines
              </label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Cleared technical interview round. Proceeding to cultural fit round."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition disabled:opacity-50"
              >
                {saving ? 'Updating...' : 'Save Decision'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
