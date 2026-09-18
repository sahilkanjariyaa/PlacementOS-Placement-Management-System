import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationService } from '../../services/applicationService.js';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import {
  FileCheck2,
  Building,
  Calendar,
  Clock,
  ArrowRight,
  MessageSquareQuote,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

const STAGES = ['applied', 'shortlisted', 'test', 'interview', 'selected'];

export const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await applicationService.getMyApplications();
        if (res.success) {
          setApplications(res.data);
        }
      } catch (err) {
        console.error('Failed to load applications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Fetching your application pipeline..." size="lg" />;
  }

  const getStageIndex = (status) => {
    if (status === 'rejected') return -1;
    return STAGES.indexOf(status);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Applications</h1>
        <p className="text-sm text-slate-500 mt-1">
          Track recruitment stages, interview invitations, and selection remarks in real time.
        </p>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title="No applications submitted yet"
          description="Explore active placement drives matching your academic profile and apply."
          actionText="Browse Placement Drives"
          onAction={() => (window.location.href = '/student/drives')}
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const currentStageIdx = getStageIndex(app.status);
            const isRejected = app.status === 'rejected';

            return (
              <div
                key={app._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6"
              >
                {/* Top: Drive Title, Company, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 uppercase">
                        {app.driveId?.companyId?.name}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-semibold text-slate-600">
                        {app.driveId?.package} LPA
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">{app.driveId?.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Applied on {new Date(app.appliedAt).toLocaleDateString()} • {app.driveId?.location}
                    </p>
                  </div>

                  <div className="self-start sm:self-center">
                    <StatusBadge status={app.status} className="text-sm px-3 py-1" />
                  </div>
                </div>

                {/* Progress Step Timeline */}
                {!isRejected ? (
                  <div className="py-2">
                    <div className="grid grid-cols-5 gap-2 relative">
                      {STAGES.map((stage, idx) => {
                        const isCompleted = idx <= currentStageIdx;
                        const isCurrent = idx === currentStageIdx;

                        return (
                          <div key={stage} className="flex flex-col items-center text-center">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                isCompleted
                                  ? 'bg-teal-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-400 border border-slate-200'
                              } ${isCurrent ? 'ring-4 ring-teal-100' : ''}`}
                            >
                              {idx + 1}
                            </div>
                            <span
                              className={`text-[11px] font-semibold mt-2 capitalize ${
                                isCompleted ? 'text-slate-800' : 'text-slate-400'
                              }`}
                            >
                              {stage === 'test' ? 'Assessment' : stage}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-xs text-rose-800">
                    <XCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                    <span>Application was not progressed in this recruitment cycle.</span>
                  </div>
                )}

                {/* Interviewer / Officer Remarks */}
                {app.remarks && (
                  <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2.5">
                    <MessageSquareQuote className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                        Interviewer / Officer Notes:
                      </span>
                      <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">{app.remarks}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
