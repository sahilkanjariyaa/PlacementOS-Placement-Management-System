import React, { useState, useEffect } from 'react';
import { applicationService } from '../../services/applicationService.js';
import { driveService } from '../../services/driveService.js';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { Pagination } from '../../components/common/Pagination.jsx';
import {
  FileCheck2,
  Search,
  Filter,
  Edit,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

const STAGES = [
  { value: 'applied', label: '1. Applied (Under Review)' },
  { value: 'shortlisted', label: '2. Shortlisted for Assessment' },
  { value: 'test', label: '3. Assessment / Coding Test' },
  { value: 'interview', label: '4. Technical & HR Interview' },
  { value: 'selected', label: '5. Selected & Offer Rolled Out (Placed)' },
  { value: 'rejected', label: 'X. Rejected / Not Progressed' },
];

export const ApplicationsManager = () => {
  const [applications, setApplications] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [driveId, setDriveId] = useState('');
  const [status, setStatus] = useState('');
  const [department, setDepartment] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalApps, setTotalApps] = useState(0);

  // Status Change Modal State
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
        applicationService.getApplications({
          search,
          driveId,
          status,
          department,
          page,
          limit: 15,
        }),
        driveService.getDrives(),
      ]);

      if (appRes.success) {
        setApplications(appRes.data.applications);
        setTotalPages(appRes.data.totalPages);
        setTotalApps(appRes.data.total);
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
  }, [page, driveId, status, department]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchApplications();
  };

  const handleOpenStatusModal = (app) => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setRemarks(app.remarks || '');
    setError('');
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await applicationService.updateApplicationStatus(selectedApp._id, {
        status: newStatus,
        remarks: remarks.trim(),
      });
      setSuccess(`Application moved to ${newStatus.toUpperCase()}`);
      setSelectedApp(null);
      fetchApplications();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update application status.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Master ATS Pipeline</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track student applicants, update selection stages, provide interview feedback, and record offers. ({totalApps} Applications)
          </p>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{success}</span>
        </div>
      )}

      {/* Multi-Column Filter Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
      >
        <div className="relative lg:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search candidate name, roll no, company, role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>

        <div>
          <select
            value={driveId}
            onChange={(e) => {
              setDriveId(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-700"
          >
            <option value="">All Placement Drives</option>
            {drives.map((d) => (
              <option key={d._id} value={d._id}>
                {d.title} ({d.companyId?.name})
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
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-700"
          >
            <option value="">All Application Stages</option>
            <option value="applied">Applied</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="test">Test / Assessment</option>
            <option value="interview">Interview</option>
            <option value="selected">Selected (Placed)</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="flex gap-2">
          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-700"
          >
            <option value="">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics & Communication">Electronics & Communication</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Civil Engineering">Civil Engineering</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            Filter
          </button>
        </div>
      </form>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching applicant records..." />
        ) : applications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No applications match your filter criteria</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Candidate</th>
                  <th className="py-3.5 px-4">Department & CGPA</th>
                  <th className="py-3.5 px-4">Placement Drive / Company</th>
                  <th className="py-3.5 px-4">Applied Date</th>
                  <th className="py-3.5 px-4">Stage / Status</th>
                  <th className="py-3.5 px-4">Evaluation Notes</th>
                  <th className="py-3.5 px-4 text-right">Update Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">
                        {app.studentId?.userId?.name || 'Candidate'}
                      </div>
                      <div className="text-slate-400 text-[11px] font-mono">
                        {app.studentId?.enrollmentNo}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-medium">{app.studentId?.department}</div>
                      <div className="text-slate-400 text-[11px]">
                        CGPA: <strong className="text-teal-700">{app.studentId?.cgpa}</strong> •{' '}
                        {app.studentId?.backlogs} Backlogs
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{app.driveId?.title}</div>
                      <div className="text-brand-700 font-semibold text-[11px]">
                        {app.driveId?.companyId?.name} ({app.driveId?.package} LPA)
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-600 text-[11px]">
                      {app.remarks || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenStatusModal(app)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 font-semibold transition"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Move Stage</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Move Stage Modal */}
      {selectedApp && (
        <Modal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={`Update Recruitment Stage: ${selectedApp.studentId?.userId?.name}`}
          maxWidth="max-w-md"
        >
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSaveStatus} className="space-y-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
              <div>
                <span className="text-slate-400">Position: </span>
                <strong className="text-slate-800">{selectedApp.driveId?.title}</strong>
              </div>
              <div>
                <span className="text-slate-400">Company: </span>
                <strong className="text-slate-800">{selectedApp.driveId?.companyId?.name}</strong>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Target Recruitment Stage *
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white font-semibold text-slate-800"
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
                Interviewer / Placement Cell Remarks (Visible to Candidate)
              </label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Cleared online coding test with 95% score. Final technical round scheduled for Friday 10:00 AM."
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
                {saving ? 'Updating...' : 'Save & Notify Candidate'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
