import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/notificationService';
import { issueService } from '../services/issueService';
import { Issue, DashboardStats } from '../types';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { CategoryIcon } from '../components/CategoryIcon';
import { formatDate } from '../utils/formatDate';
import {
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalReports: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const statsRes = await dashboardService.getStats();
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
        if (statsRes.data.recentReports) {
          setRecentIssues(statsRes.data.recentReports);
        }
      }

      // Also ensure my issues list
      const issuesRes = await issueService.getMyIssues();
      if (issuesRes.success && issuesRes.issues) {
        setRecentIssues(issuesRes.issues.slice(0, 5));
      }
    } catch (err) {
      console.error('Error fetching citizen dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Welcome & Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full">
            Citizen Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            Welcome back, {user?.name || 'Citizen'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Track and monitor resolution progress for public problems you have reported in your neighborhood.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-2.5">
          <Link
            to="/report"
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
          >
            <PlusCircle className="w-4 h-4" />
            Report New Issue
          </Link>
          <Link
            to="/map"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur border border-white/20 transition-all flex items-center gap-1.5"
          >
            <MapPin className="w-4 h-4 text-emerald-400" />
            Live Map
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Reports"
          value={stats.totalReports ?? recentIssues.length}
          icon={FileText}
          color="emerald"
          subtitle="All complaints filed by you"
        />
        <StatCard
          title="Pending Review"
          value={stats.pending ?? 0}
          icon={Clock}
          color="amber"
          subtitle="Awaiting officer verification"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress ?? 0}
          icon={AlertCircle}
          color="blue"
          subtitle="Field team dispatched on site"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved ?? 0}
          icon={CheckCircle2}
          color="purple"
          subtitle="Repairs verified & closed"
        />
      </div>

      {/* Recent Reports Table & Details */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Recent Reported Issues</h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time status updates of your submitted tickets</p>
          </div>
          <Link
            to="/issues"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            View all ({recentIssues.length}) &rarr;
          </Link>
        </div>

        {recentIssues.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <PlusCircle className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No issues reported yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              Notice a pothole, broken streetlight, or garbage overflow in your area? Report it to get it fixed!
            </p>
            <Link
              to="/report"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-700 transition-colors"
            >
              <PlusCircle className="w-4 h-4" /> Report Your First Issue
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Issue Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Reported Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recentIssues.map((issue) => (
                  <tr key={issue._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {issue.image ? (
                          <img
                            src={issue.image}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                            <CategoryIcon category={issue.category} className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <Link
                            to={`/issues/${issue._id}`}
                            className="font-bold text-slate-900 hover:text-emerald-600 transition-colors line-clamp-1"
                          >
                            {issue.title}
                          </Link>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {issue.address}
                          </span>
                        </div>
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

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/issues/${issue._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                      >
                        Details <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenDashboard;
