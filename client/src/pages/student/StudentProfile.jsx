import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import {
  GraduationCap,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Phone,
  BookOpen,
  Award,
  Hash,
  Sparkles,
} from 'lucide-react';

export const StudentProfile = () => {
  const { user, profile, updateLocalProfile } = useAuth();
  const [formData, setFormData] = useState({
    enrollmentNo: '',
    department: '',
    semester: '',
    cgpa: '',
    backlogs: '0',
    phone: '',
    skills: '',
    resumeUrl: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await studentService.getProfile();
        if (res.success && res.data) {
          const p = res.data;
          setFormData({
            enrollmentNo: p.enrollmentNo || '',
            department: p.department || '',
            semester: p.semester !== null && p.semester !== undefined ? p.semester : '',
            cgpa: p.cgpa !== null && p.cgpa !== undefined ? p.cgpa : '',
            backlogs: p.backlogs !== null && p.backlogs !== undefined ? p.backlogs : '0',
            phone: p.phone || '',
            skills: p.skills && p.skills.length > 0 ? p.skills.join(', ') : '',
            resumeUrl: p.resumeUrl || '',
          });
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Strict Validations for Student Input
    if (!formData.enrollmentNo.trim()) {
      setError('Please enter your official College Enrollment / Roll Number.');
      return;
    }
    if (!formData.department) {
      setError('Please select your academic Department.');
      return;
    }
    if (!formData.semester || Number(formData.semester) < 1 || Number(formData.semester) > 8) {
      setError('Please enter a valid Semester between 1 and 8.');
      return;
    }
    if (formData.cgpa === '' || Number(formData.cgpa) < 0 || Number(formData.cgpa) > 10) {
      setError('Please enter a valid CGPA between 0.0 and 10.0.');
      return;
    }
    if (formData.backlogs === '' || Number(formData.backlogs) < 0) {
      setError('Backlogs cannot be negative.');
      return;
    }
    if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
      setError('Please enter a valid 10-digit mobile phone number.');
      return;
    }

    setSaving(true);
    try {
      const res = await studentService.updateProfile({
        enrollmentNo: formData.enrollmentNo.trim(),
        department: formData.department,
        semester: Number(formData.semester),
        cgpa: Number(formData.cgpa),
        backlogs: Number(formData.backlogs),
        phone: formData.phone.trim(),
        skills: formData.skills,
        resumeUrl: formData.resumeUrl.trim(),
      });

      if (res.success) {
        setMessage('Your academic profile has been saved successfully!');
        updateLocalProfile(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading academic profile..." size="lg" />;
  }

  const isDossierEmpty = !formData.enrollmentNo || !formData.department || formData.cgpa === '';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Dossier & Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Enter your academic credentials and technical skills. This information is evaluated by the eligibility engine when applying for company placement drives.
        </p>
      </div>

      {isDossierEmpty && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Complete Your Academic Profile</p>
            <p className="mt-0.5 text-amber-800">
              Please enter your Roll Number, Department, Semester, and current CGPA to unlock eligible campus drives.
            </p>
          </div>
        </div>
      )}

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Section 1: Basic Details */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-600" />
            Personal & Identification
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                disabled
                value={user?.name || ''}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Student Email</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">College Roll / Enrollment Number *</label>
              <input
                type="text"
                name="enrollmentNo"
                required
                value={formData.enrollmentNo}
                onChange={handleChange}
                placeholder="e.g. 21BCSE042 or STU202601"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone (10 Digits) *</label>
              <input
                type="tel"
                name="phone"
                required
                maxLength={10}
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Academic Credentials */}
        <div className="pt-6 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-brand-600" />
            Academic Metrics (Drive Eligibility Criteria)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department / Branch *</label>
              <select
                name="department"
                required
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white"
              >
                <option value="">-- Select Your Department --</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Semester (1-8) *</label>
              <input
                type="number"
                name="semester"
                required
                min={1}
                max={8}
                value={formData.semester}
                onChange={handleChange}
                placeholder="e.g. 7"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cumulative CGPA (0-10) *</label>
              <input
                type="number"
                step="0.01"
                name="cgpa"
                required
                min={0}
                max={10}
                value={formData.cgpa}
                onChange={handleChange}
                placeholder="e.g. 8.25"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-semibold text-brand-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Active Backlogs Count *</label>
              <input
                type="number"
                name="backlogs"
                required
                min={0}
                value={formData.backlogs}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Technical Skills & Resume */}
        <div className="pt-6 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-600" />
            Skills & Resume
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Technical Skills (Comma separated)</label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="e.g. React, Node.js, Python, SQL, Java"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Resume Link (Google Drive / LinkedIn / Portfolio URL)</label>
              <input
                type="url"
                name="resumeUrl"
                value={formData.resumeUrl}
                onChange={handleChange}
                placeholder="https://drive.google.com/... or https://github.com/..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Profile...' : 'Save Academic Dossier'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
