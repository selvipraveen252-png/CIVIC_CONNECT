import React from 'react';
import { IssueStatus, StatusHistoryItem } from '../types';
import { CheckCircle2, Clock, AlertTriangle, XCircle, RefreshCw, ChevronRight } from 'lucide-react';
import { formatDateTime } from '../utils/formatDate';

interface Props {
  currentStatus: IssueStatus;
  statusHistory: StatusHistoryItem[];
}

const WORKFLOW_STEPS: { key: IssueStatus; label: string; desc: string }[] = [
  { key: 'REPORTED', label: 'Reported', desc: 'Submitted by citizen' },
  { key: 'VERIFIED', label: 'Verified', desc: 'Validated by dept officer' },
  { key: 'ASSIGNED', label: 'Assigned', desc: 'Workforce dispatched' },
  { key: 'IN_PROGRESS', label: 'In Progress', desc: 'Field repair active' },
  { key: 'RESOLVED', label: 'Resolved', desc: 'Resolution evidence uploaded' },
  { key: 'CLOSED', label: 'Closed', desc: 'Confirmed & closed' },
];

export const VisualTimeline: React.FC<Props> = ({ currentStatus, statusHistory }) => {
  const isRejected = currentStatus === 'REJECTED';
  const isReopened = currentStatus === 'REOPENED';

  // Determine current step index
  const stepIndexMap: Record<string, number> = {
    REPORTED: 0,
    VERIFIED: 1,
    ASSIGNED: 2,
    IN_PROGRESS: 3,
    RESOLVED: 4,
    CLOSED: 5,
  };

  const currentIdx = stepIndexMap[currentStatus] ?? -1;

  // Find history timestamp for a given status
  const getHistoryItem = (statusKey: IssueStatus) => {
    return statusHistory.find((h) => h.status === statusKey);
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Issue Progress Tracking</h3>
          <p className="text-xs text-slate-500 mt-0.5">End-to-end civic resolution workflow & audit trail</p>
        </div>

        {isRejected && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
            <XCircle className="w-4 h-4" /> Issue Rejected
          </div>
        )}

        {isReopened && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold animate-pulse">
            <RefreshCw className="w-4 h-4" /> Issue Reopened
          </div>
        )}
      </div>

      {/* Desktop Horizontal Workflow */}
      <div className="hidden md:grid md:grid-cols-6 gap-2 relative">
        {WORKFLOW_STEPS.map((step, idx) => {
          const historyRecord = getHistoryItem(step.key);
          const isCompleted = currentIdx >= idx && !isRejected;
          const isCurrent = currentIdx === idx && !isRejected;

          return (
            <div key={step.key} className="flex flex-col items-center text-center relative group">
              {/* Connector line */}
              {idx < WORKFLOW_STEPS.length - 1 && (
                <div
                  className={`absolute top-4 left-1/2 w-full h-0.5 -z-0 transition-colors ${
                    currentIdx > idx && !isRejected ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}

              {/* Node Icon */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all z-10 ${
                  isCompleted
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 ring-4 ring-emerald-50'
                    : isCurrent
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200 ring-4 ring-blue-50 animate-pulse'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              {/* Labels */}
              <span className={`text-xs font-bold mt-2.5 ${isCompleted || isCurrent ? 'text-slate-900' : 'text-slate-400'}`}>
                {step.label}
              </span>
              <span className="text-[11px] text-slate-400 leading-tight mt-0.5 px-1 line-clamp-1">
                {step.desc}
              </span>

              {historyRecord && (
                <span className="text-[10px] text-emerald-600 font-medium mt-1">
                  {formatDateTime(historyRecord.changedAt)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Vertical Workflow */}
      <div className="md:hidden space-y-4">
        {WORKFLOW_STEPS.map((step, idx) => {
          const historyRecord = getHistoryItem(step.key);
          const isCompleted = currentIdx >= idx && !isRejected;
          const isCurrent = currentIdx === idx && !isRejected;

          return (
            <div key={step.key} className="flex items-start gap-3 relative">
              {idx < WORKFLOW_STEPS.length - 1 && (
                <div
                  className={`absolute left-4 top-8 bottom-0 w-0.5 -ml-px ${
                    currentIdx > idx ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 ${
                  isCompleted
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-blue-600 text-white ring-2 ring-blue-100 animate-pulse'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
              </div>
              <div className="flex-1 pb-3">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-semibold ${isCompleted || isCurrent ? 'text-slate-900' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                  {historyRecord && (
                    <span className="text-[10px] text-slate-400">
                      {formatDateTime(historyRecord.changedAt)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VisualTimeline;
