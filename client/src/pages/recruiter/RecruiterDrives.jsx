import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { driveService } from '../../services/driveService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import {
  Briefcase,
  PlusCircle,
  Calendar,
  MapPin,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Users,
  ArrowRight,
} from 'lucide-react';

const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
];

export const RecruiterDrives = () => {
  const { user } = useAuth();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDrive, setEditingDrive] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    package: 10.0,
    location: '',
    jobType: 'full_time',
    deadline: '',
    minCgpa: 6.5,
    maxBacklogs: 0,
    eligibleDepartments: ['Computer Science', 'Information Technology'],
    status: 'open',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const res = await driveService.getDrives();
      if (res.success) setDrives(res.data);
    } catch (err) {
      console.error('Failed to load drives:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const handleOpenCreate = () => {
    setEditingDrive(null);
    setFormData({
      title: '',
      description: '',
      package: 12.0,
      location: 'Bengaluru / Hybrid',
      jobType: 'full_time',
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      minCgpa: 6.5,
      maxBacklogs: 0,
      eligibleDepartments: ['Computer Science', 'Information Technology'],
      status: 'open',
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (drive) => {
    setEditingDrive(drive);
    setFormData({
      title: drive.title,
      description: drive.description,
      package: drive.package,
      location: drive.location,
      jobType: drive.jobType,
      deadline: drive.deadline ? new Date(drive.deadline).toISOString().split('T')[0] : '',
      minCgpa: drive.minCgpa,
      maxBacklogs: drive.maxBacklogs,
      eligibleDepartments: drive.eligibleDepartments || [],
      status: drive.status,
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleDeptToggle = (dept) => {
    setFormData((prev) => {
      const exists = prev.eligibleDepartments.includes(dept);
      if (exists) {
        return {
          ...prev,
          eligibleDepartments: prev.eligibleDepartments.filter((d) => d !== dept),
        };
      } else {
        return { ...prev, eligibleDepartments: [...prev.eligibleDepartments, dept] };
      }
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.deadline) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    const deadlineDate = new Date(formData.deadline);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    if (deadlineDate < todayStart) {
      setError('Deadline date cannot be in the past. Please select today or a future date.');
      return;
    }

    setSaving(true);
    try {
      if (editingDrive) {
        await driveService.updateDrive(editingDrive._id, formData);
        setSuccess('Drive criteria updated.');
      } else {
        const compId = user?.companyId?._id || user?.companyId || user?.company?._id || user?.company;
        await driveService.createDrive({
          ...formData,
          ...(compId ? { companyId: compId } : {}),
        });
        setSuccess('New placement drive published for campus registration.');
      }
      setIsModalOpen(false);
      fetchDrives();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Our Placement Drives</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your company's campus hiring drives and eligibility criteria.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs transition self-start"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish Drive</span>
        </button>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{success}</span>
        </div>
      )}

      {/* Drives Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching company drives..." />
      ) : drives.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
          No placement drives created yet. Click Publish Drive to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {drives.map((d) => {
            const isExpired = new Date(d.deadline) < new Date();
            const displayStatus = isExpired && d.status === 'open' ? 'closed' : d.status;
            return (
              <div
                key={d._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{d.title}</h3>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={displayStatus} />
                      {isExpired && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                          Deadline Ended
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-100 text-teal-800 font-extrabold text-xs">
                      {d.package} LPA
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs">
                      <Users className="w-3 h-3 text-indigo-500" />
                      <span>{d.applicantCount || 0} Applicants</span>
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{d.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Deadline: {new Date(d.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      <span>Min CGPA: {d.minCgpa} • Max Backlogs: {d.maxBacklogs}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    to={`/recruiter/applications?driveId=${d._id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs transition border border-purple-200"
                  >
                    <Users className="w-3.5 h-3.5 text-purple-600" />
                    <span>View Applicants ({d.applicantCount || 0})</span>
                  </Link>

                  <button
                    onClick={() => handleOpenEdit(d)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDrive ? 'Edit Drive' : 'Publish Campus Drive'}
        maxWidth="max-w-xl"
      >
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Job Role Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Associate Software Development Engineer"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Job Description *</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detail job requirements, stack, and round formats..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">CTC Package (LPA) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.package}
                onChange={(e) => setFormData({ ...formData, package: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-bold text-teal-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Location *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Bengaluru"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Deadline *</label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
              Rule Engine Eligibility Requirements
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Minimum CGPA (0-10)</label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  max={10}
                  value={formData.minCgpa}
                  onChange={(e) => setFormData({ ...formData, minCgpa: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Max Active Backlogs</label>
                <input
                  type="number"
                  min={0}
                  value={formData.maxBacklogs}
                  onChange={(e) => setFormData({ ...formData, maxBacklogs: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Eligible Departments</label>
              <div className="grid grid-cols-2 gap-2">
                {DEPARTMENTS.map((dept) => (
                  <label
                    key={dept}
                    className={`flex items-center gap-2 p-1.5 rounded-lg border text-[11px] cursor-pointer ${
                      formData.eligibleDepartments.includes(dept)
                        ? 'bg-teal-50 border-teal-300 text-teal-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.eligibleDepartments.includes(dept)}
                      onChange={() => handleDeptToggle(dept)}
                      className="rounded text-brand-600"
                    />
                    <span className="truncate">{dept}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingDrive ? 'Update Drive' : 'Publish Drive'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
