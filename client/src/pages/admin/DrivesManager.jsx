import React, { useState, useEffect } from 'react';
import { driveService } from '../../services/driveService.js';
import { companyService } from '../../services/companyService.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import {
  Briefcase,
  PlusCircle,
  Search,
  Calendar,
  MapPin,
  Building,
  Edit2,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';

const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
];

export const DrivesManager = () => {
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDrive, setEditingDrive] = useState(null);

  const [formData, setFormData] = useState({
    companyId: '',
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
      const [drivesRes, compRes] = await Promise.all([
        driveService.getDrives({ search, status: statusFilter }),
        companyService.getCompanies({ isActive: true }),
      ]);
      if (drivesRes.success) setDrives(drivesRes.data);
      if (compRes.success) setCompanies(compRes.data);
    } catch (err) {
      console.error('Failed to load drives:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, [statusFilter]);

  const handleOpenCreate = () => {
    setEditingDrive(null);
    setFormData({
      companyId: companies[0]?._id || '',
      title: '',
      description: '',
      package: 10.0,
      location: '',
      jobType: 'full_time',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
      companyId: drive.companyId?._id || drive.companyId,
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

    if (!formData.companyId || !formData.title || !formData.deadline) {
      setError('Please fill in all mandatory fields.');
      return;
    }
    if (formData.eligibleDepartments.length === 0) {
      setError('Select at least one eligible department.');
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
        setSuccess('Placement drive updated.');
      } else {
        await driveService.createDrive(formData);
        setSuccess('Placement drive created and broadcasted.');
      }
      setIsModalOpen(false);
      fetchDrives();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseDrive = async (id) => {
    try {
      await driveService.deleteDrive(id);
      fetchDrives();
    } catch (err) {
      console.error('Failed to close drive:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Placement Drives</h1>
          <p className="text-sm text-slate-500 mt-1">
            Publish recruitment campaigns, enforce rule-engine thresholds, and manage registration cutoffs.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs transition self-start"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish Placement Drive</span>
        </button>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{success}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search drives by title, company, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchDrives()}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white sm:w-44"
        >
          <option value="">All Statuses</option>
          <option value="open">Active (Open)</option>
          <option value="closed">Closed / Expired</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Drives Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8">
            <LoadingSpinner text="Loading placement drives..." />
          </div>
        ) : drives.length === 0 ? (
          <div className="text-center py-16">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">No Placement Drives Found</p>
            <p className="text-xs text-slate-400 mt-1">
              {search || statusFilter ? 'Try clearing your active filters.' : 'Click "Publish Placement Drive" to create one.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Drive & Company</th>
                  <th className="py-3.5 px-4">Package</th>
                  <th className="py-3.5 px-4">Eligibility Thresholds</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Deadline</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {drives.map((d) => {
                  const isExpired = new Date(d.deadline) < new Date();
                  const displayStatus = isExpired && d.status === 'open' ? 'closed' : d.status;
                  return (
                    <tr key={d._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{d.title}</div>
                        <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{d.companyId?.name || 'Company'}</span>
                          <span className="text-slate-300">•</span>
                          <span className="capitalize">{d.jobType?.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-teal-800">{d.package} LPA</td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div>Min CGPA: <strong>{d.minCgpa}</strong> • Max Backlogs: <strong>{d.maxBacklogs}</strong></div>
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">
                          {d.eligibleDepartments?.join(', ')}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{d.location}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        <div>{new Date(d.deadline).toLocaleDateString()}</div>
                        {isExpired && (
                          <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded mt-0.5">
                            Deadline Ended
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={displayStatus} />
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEdit(d)}
                          className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
                          title="Edit Drive Criteria"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {d.status === 'open' && !isExpired && (
                          <button
                            onClick={() => handleCloseDrive(d._id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Close Drive"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Drive Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDrive ? `Edit Placement Drive: ${editingDrive.title}` : 'Publish New Placement Drive'}
        maxWidth="max-w-2xl"
      >
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Corporate Partner *</label>
              <select
                required
                value={formData.companyId}
                onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white"
              >
                <option value="">Select Partner Company</option>
                {companies.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.industry})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Job Role Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Full Stack MERN Engineer"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Role Description & Specifications *</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detail job responsibilities, tech stack, and interview process..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                placeholder="e.g. Bengaluru / Hybrid"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Application Deadline *</label>
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

          {/* Rule Engine Thresholds */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Authoritative Rule Engine Parameters
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Minimum CGPA (0-10)</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  max={10}
                  value={formData.minCgpa}
                  onChange={(e) => setFormData({ ...formData, minCgpa: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Maximum Allowed Backlogs</label>
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
              <label className="block font-semibold text-slate-700 mb-1.5">Permitted Academic Departments</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DEPARTMENTS.map((dept) => {
                  const checked = formData.eligibleDepartments.includes(dept);
                  return (
                    <label
                      key={dept}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-[11px] cursor-pointer transition ${
                        checked ? 'bg-teal-50 border-teal-300 text-teal-900 font-bold' : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleDeptToggle(dept)}
                        className="rounded text-brand-600 focus:ring-brand-500"
                      />
                      <span>{dept}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
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
              {saving ? 'Publishing...' : editingDrive ? 'Update Drive' : 'Publish Drive'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
