import React, { useState, useEffect } from 'react';
import { announcementService } from '../../services/announcementService.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { Megaphone, Calendar, UserCheck } from 'lucide-react';

export const StudentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await announcementService.getAnnouncements();
        if (res.success) {
          setAnnouncements(res.data);
        }
      } catch (err) {
        console.error('Failed to load notices:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Fetching official circulars..." size="lg" />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Placement Bulletins & Notices</h1>
        <p className="text-sm text-slate-500 mt-1">
          Official campus recruitment announcements, schedule changes, and placement cell guidelines.
        </p>
      </div>

      {announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No active circulars"
          description="There are currently no active placement bulletins posted by the training cell."
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((notice) => (
            <div
              key={notice._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                  Target: {notice.audience.toUpperCase()}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(notice.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>

              <h2 className="text-base font-bold text-slate-900">{notice.title}</h2>

              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {notice.message}
              </p>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Posted by: {notice.publishedBy?.name || 'Placement Cell Officer'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
