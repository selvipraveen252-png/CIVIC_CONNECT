import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/notificationService';
import { issueService } from '../services/issueService';
import { Issue, DashboardStats, IssueStatus } from '../types';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { CategoryIcon } from '../components/CategoryIcon';
import { ActionModal } from '../components/ActionModal';
import { formatDate } from '../utils/formatDate';
import {
  FileText,
  Clock,
  Activity,
  CheckCircle2,
  Eye,
  ShieldCheck,
  CheckCheck,
  Search,
  Filter,
  ArrowRight,
} from 'lucide-react';

export const OfficerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    assignedIssues: 0,
    pendingVerification: 0,
    inProgress: 0,
    resolved: 0,
    pending: 0,
  });
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [modalMode, setModalMode] = useState<'status' | 'assign' | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchOfficerData = async () => {
    setIsLoading(true);
    try {
      const res = await dashboardService.getStats();
      if (res.success && res.data) {
        setStats(res.data);
        if (res.data.issuesList) {
          setIssues(res.data.issuesList);
        }
      }

      // Also ensure we have the assigned list
      if (!issues.length) {
        const issuesRes = await issueService.getIssues({ limit: 50 });
        if (issuesRes.success) setIssues(issuesRes.issues);
      }
    } catch (err) {
      console.error('Error fetching officer dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficerData();
  }, []);

  const handleOpenAction = (issue: Issue, mode: 'status' | 'assign') => {
    setSelectedIssue(issue);
    setModalMode(mode);
  };

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(search.toLowerCase()) ||
      issue.address.toLowerCase().includes(search.toLowerCase()) ||
      issue._id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || issue.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Officer Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/20 px-3 py-1 rounded-full">
              Municipal Officer Control Console
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
              Officer Operations Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Logged in as <strong className="text-white">{user?.name}</strong> •{' '}
              {typeof user?.department === 'object' ? (user?.department as any)?.name : 'Field Operations Division'}
            </p>
          </div>

          <Link
            to="/map"
            className="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 shrink-0"
          >
            Open Live GIS Field Map
          </Link>
        </div>
      </div>

      {/* 4 Required Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Assigned Issues"
          value={stats.assignedIssues ?? issues.length}
          icon={FileText}
          color="indigo"
          subtitle="Department jurisdictional backlog"
        />
        <StatCard
          title="Pending Verification"
          value={stats.pendingVerification ?? 0}
          icon={Clock}
          color="amber"
          subtitle="Awaiting site validation"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress ?? 0}
          icon={Activity}
          color="blue"
          subtitle="Active workforce repairs"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved ?? 0}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Successfully completed"
        />
      </div>

      {/* Officer Work Queue Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Assigned Civic Issues Table</h2>
            <p className="text-xs text-slate-500 mt-0.5">Inspect, verify, log action remarks, and resolve reports</p>
          </div>

          {/* Table Search & Status Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search issues..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="REPORTED">Reported</option>
              <option value="VERIFIED">Verified</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REOPENED">Reopened</option>
            </select>
          </div>
        </div>

        {/* Issue Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Title & Location</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredIssues.map((issue) => (
                <tr key={issue._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                    #{issue._id.slice(-6).toUpperCase()}
                  </td>

                  <td className="py-3.5 px-4">
                    <div>
                      <Link
                        to={`/issues/${issue._id}`}
                        className="font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
                      >
                        {issue.title}
                      </Link>
                      <span className="text-[11px] text-slate-400 line-clamp-1">📍 {issue.address}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <CategoryIcon category={issue.category} showLabel />
                  </td>

                  <td className="py-3.5 px-4">
                    <PriorityBadge priority={issue.priority} />
                  </td>

                  <td className="py-3.5 px-4">
                    <StatusBadge status={issue.status} />
                  </td>

                  <td className="py-3.5 px-4 text-slate-500 font-medium">
                    {formatDate(issue.createdAt)}
                  </td>

                  {/* Actions Column: View, Verify, Update Status, Resolve */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View */}
                      <Link
                        to={`/issues/${issue._id}`}
                        title="View Full Issue Details"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>

                      {/* Verify Action (if REPORTED) */}
                      {issue.status === 'REPORTED' && (
                        <button
                          onClick={() => handleOpenAction(issue, 'status')}
                          title="Verify Issue"
                          className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-[11px] border border-sky-200 transition-colors flex items-center gap-1"
                        >
                          <ShieldCheck className="w-3 h-3" /> Verify
                        </button>
                      )}

                      {/* Update Status */}
                      <button
                        onClick={() => handleOpenAction(issue, 'status')}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] border border-blue-200 transition-colors"
                      >
                        Update
                      </button>

                      {/* Resolve Action */}
                      {['IN_PROGRESS', 'ASSIGNED', 'VERIFIED'].includes(issue.status) && (
                        <button
                          onClick={() => handleOpenAction(issue, 'status')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Resolve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal */}
      {selectedIssue && modalMode && (
        <ActionModal
          isOpen={Boolean(selectedIssue && modalMode)}
          onClose={() => {
            setSelectedIssue(null);
            setModalMode(null);
          }}
          issue={selectedIssue}
          mode={modalMode}
          userRole="officer"
          onSuccess={(updated) => {
            setIssues((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
            fetchOfficerData();
            setSelectedIssue(null);
            setModalMode(null);
          }}
        />
      )}
    </div>
  );
};

export default OfficerDashboard;
