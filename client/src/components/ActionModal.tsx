import React, { useState, useEffect } from 'react';
import { Issue, IssueStatus, IssuePriority, Department, User } from '../types';
import { issueService } from '../services/issueService';
import { departmentService } from '../services/departmentService';
import { userService } from '../services/userService';
import { X, CheckCircle, Upload, ShieldAlert, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  issue: Issue | null;
  mode: 'status' | 'assign' | 'reopen';
  onSuccess: (updatedIssue: Issue) => void;
  userRole?: string;
}

export const ActionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  issue,
  mode,
  onSuccess,
  userRole,
}) => {
  if (!isOpen || !issue) return null;

  const [status, setStatus] = useState<IssueStatus>(issue.status);
  const [priority, setPriority] = useState<IssuePriority>(issue.priority);
  const [remarks, setRemarks] = useState('');
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidencePreview, setEvidencePreview] = useState<string>('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>(issue.assignedDepartment?._id || '');
  const [officers, setOfficers] = useState<User[]>([]);
  const [selectedOfficer, setSelectedOfficer] = useState<string>(issue.assignedOfficer?._id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (mode === 'assign') {
      departmentService.getDepartments().then((res) => {
        if (res.success) setDepartments(res.departments);
      });
      userService.getUsers({ role: 'officer' }).then((res) => {
        if (res.success) setOfficers(res.users);
      });
    }
  }, [mode]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEvidenceFile(file);
      setEvidencePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (mode === 'status') {
        const res = await issueService.updateStatus(issue._id, {
          status,
          remarks,
          evidenceImage: evidenceFile || undefined,
        });
        if (res.success) {
          onSuccess(res.issue);
          onClose();
        }
      } else if (mode === 'assign') {
        const res = await issueService.assignIssue(issue._id, {
          departmentId: selectedDept || undefined,
          officerId: selectedOfficer || undefined,
          priority,
          remarks,
        });
        if (res.success) {
          onSuccess(res.issue);
          onClose();
        }
      } else if (mode === 'reopen') {
        const res = await issueService.reopenIssue(issue._id, remarks);
        if (res.success) {
          onSuccess(res.issue);
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Operation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {mode === 'status' && 'Update Issue Status & Add Remarks'}
              {mode === 'assign' && 'Assign Department, Officer & Priority'}
              {mode === 'reopen' && 'Reopen Resolved Issue'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium line-clamp-1">
              Issue #{issue._id.slice(-6).toUpperCase()} — {issue.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {mode === 'status' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select New Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as IssueStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                >
                  <option value="REPORTED">REPORTED (New)</option>
                  <option value="VERIFIED">VERIFIED (Inspected by Officer)</option>
                  <option value="ASSIGNED">ASSIGNED (Assigned to Workforce)</option>
                  <option value="IN_PROGRESS">IN_PROGRESS (Action Ongoing)</option>
                  <option value="RESOLVED">RESOLVED (Repairs Complete)</option>
                  <option value="CLOSED">CLOSED (Confirmed by Admin/Citizen)</option>
                  <option value="REJECTED">REJECTED (Non-jurisdictional/Duplicate)</option>
                </select>
              </div>

              {status === 'RESOLVED' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Resolution Evidence Photograph (Optional / Recommended)
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                    <p className="text-xs text-slate-600 font-medium">Click to upload repair completion photo</p>
                    <p className="text-[10px] text-slate-400">PNG, JPG or WebP up to 10MB</p>
                  </div>
                  {evidencePreview && (
                    <div className="mt-2 relative inline-block">
                      <img
                        src={evidencePreview}
                        alt="Evidence preview"
                        className="w-24 h-24 object-cover rounded-lg border border-slate-200 shadow-sm"
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {mode === 'assign' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Department
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="">Select a Department...</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Assigned Officer
                </label>
                <select
                  value={selectedOfficer}
                  onChange={(e) => setSelectedOfficer(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="">Select Officer to Dispatch...</option>
                  {officers
                    .filter((o) => !selectedDept || (typeof o.department === 'object' ? (o.department as any)?._id === selectedDept : o.department === selectedDept))
                    .map((officer) => (
                      <option key={officer._id} value={officer._id}>
                        {officer.name} ({officer.email})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Priority Override
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as IssuePriority)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              {mode === 'reopen' ? 'Reason for Reopening *' : 'Official Remarks & Audit Notes'}
            </label>
            <textarea
              required={mode === 'reopen'}
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={
                mode === 'reopen'
                  ? 'Please explain why the civic issue was not adequately resolved...'
                  : 'Enter field remarks, dispatch notes, or resolution confirmation...'
              }
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                'Processing...'
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {mode === 'status' && 'Apply Status Change'}
                  {mode === 'assign' && 'Confirm Assignment'}
                  {mode === 'reopen' && 'Submit Reopen Request'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActionModal;
