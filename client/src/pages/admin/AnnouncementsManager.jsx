import React, { useState, useEffect } from 'react';
import { announcementService } from '../../services/announcementService.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.jsx';
import {
  Megaphone,
  PlusCircle,
  Calendar,
  UserCheck,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const AnnouncementsManager = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    audience: 'all',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await announcementService.getAnnouncements();
      if (res.success) setAnnouncements(res.data);
    } catch (err) {
      console.error('Failed to load notices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenCreate = () => {
    setEditingNotice(null);
    setFormData({
      title: '',
      message: '',
      audience: 'all',
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      message: notice.message,
      audience: notice.audience,
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editingNotice) {
        await announcementService.updateAnnouncement(editingNotice._id, formData);
        setSuccess('Announcement updated.');
      } else {
        await announcementService.createAnnouncement(formData);
        setSuccess('Announcement published and broadcasted to students.');
      }
      setIsModalOpen(false);
      fetchAnnouncements();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await announcementService.deleteAnnouncement(deletingId);
      setSuccess('Announcement deleted.');
      setDeletingId(null);
      fetchAnnouncements();
    } catch (err) {
      console.error('Failed to delete notice:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Broadcast Circulars</h1>
          <p className="text-sm text-slate-500 mt-1">
            Publish official announcements, placement policies, workshop schedules, and guidelines.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs transition self-start"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish Notice</span>
        </button>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{success}</span>
        </div>
      )}

      {/* Announcements List */}
      {loading ? (
        <LoadingSpinner text="Fetching notices..." />
      ) : announcements.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
          No announcements published yet.
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((n) => (
            <div
              key={n._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                  Target: {n.audience.toUpperCase()}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">{n.title}</h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{n.message}</p>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Published by: {n.publishedBy?.name || 'Placement Officer'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(n)}
                    className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
                    title="Edit Notice"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingId(n._id)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingNotice ? 'Edit Circular Notice' : 'Publish New Circular Notice'}
        maxWidth="max-w-lg"
      >
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Audience *</label>
            <select
              value={formData.audience}
              onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white"
            >
              <option value="all">Entire College (All Students & Recruiters)</option>
              <option value="student">Students Only</option>
              <option value="recruiter">Recruiters Only</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notice Headline / Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Mock Interview Workshop Schedule"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notice Content / Instructions *</label>
            <textarea
              required
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Provide complete details, dates, venue, and instructions..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none leading-relaxed"
            />
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
              {saving ? 'Publishing...' : editingNotice ? 'Update Notice' : 'Broadcast Notice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Announcement"
        message="Are you sure you want to delete this announcement? This action cannot be undone."
        confirmText="Delete Notice"
        isDestructive={true}
      />
    </div>
  );
};
