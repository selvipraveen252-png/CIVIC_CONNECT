import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/notificationService';
import { Issue, User, DashboardStats } from '../types';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { CategoryIcon } from '../components/CategoryIcon';
import { formatDate } from '../utils/formatDate';
import {
  Users,
  FileText,
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Building2,
  MapPin,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  PieChart as PieIcon,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await dashboardService.getStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard statistics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const STATUS_COLORS: Record<string, string> = {
    REPORTED: '#f59e0b',
    VERIFIED: '#0284c7',
    ASSIGNED: '#6366f1',
    IN_PROGRESS: '#2563eb',
    RESOLVED: '#16a34a',
    CLOSED: '#64748b',
    REJECTED: '#e11d48',
    REOPENED: '#9333ea',
  };

  const PRIORITY_COLORS: Record<string, string> = {
    CRITICAL: '#ef4444',
    HIGH: '#f97316',
    MEDIUM: '#eab308',
    LOW: '#22c55e',
  };

  if (isLoading || !stats) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading municipal analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/20 px-3 py-1 rounded-full">
              System Administration Executive Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
              City-Wide Civic Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              High-level operational metrics, cross-departmental workload distribution, and resolution velocity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link
              to="/admin/users"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur border border-white/20 transition-all flex items-center gap-1.5"
            >
              <Users className="w-4 h-4 text-purple-400" />
              Manage Users
            </Link>
            <Link
              to="/admin/departments"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur border border-white/20 transition-all flex items-center gap-1.5"
            >
              <Building2 className="w-4 h-4 text-emerald-400" />
              Departments
            </Link>
            <Link
              to="/map"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <MapPin className="w-4 h-4" />
              GIS Map View
            </Link>
          </div>
        </div>
      </div>

      {/* 5 Required Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers ?? 0}
          icon={Users}
          color="indigo"
          subtitle="Citizens, officers & staff"
        />
        <StatCard
          title="Total Issues"
          value={stats.totalIssues ?? 0}
          icon={FileText}
          color="blue"
          subtitle="Cumulative tickets filed"
        />
        <StatCard
          title="Pending"
          value={stats.pending ?? 0}
          icon={Clock}
          color="amber"
          subtitle="Reported or in verification"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress ?? 0}
          icon={Activity}
          color="purple"
          subtitle="Workforce repair active"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved ?? 0}
          icon={CheckCircle2}
          color="emerald"
          change={`${stats.resolutionRate ?? 0}% Rate`}
          isPositive={true}
          subtitle="Completed & closed"
        />
      </div>

      {/* 3 Real Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Issues by Category */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-600" /> Issues by Category
              </h3>
              <p className="text-[11px] text-slate-400">Distribution across civic problem domains</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byCategory || []} layout="vertical" margin={{ left: 10, right: 10 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="category" type="category" width={110} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} issues`, 'Count']}
                  contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Issues by Status */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <PieIcon className="w-4 h-4 text-blue-600" /> Issues by Status
              </h3>
              <p className="text-[11px] text-slate-400">Workflow pipeline breakdown</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.byStatus || []}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={3}
                >
                  {(stats.byStatus || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #e2e8f0' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Issues by Priority */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" /> Issues by Priority
              </h3>
              <p className="text-[11px] text-slate-400">Severity risk classification</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byPriority || []}>
                <XAxis dataKey="priority" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {(stats.byPriority || []).map((entry, index) => (
                    <Cell key={`cell-priority-${index}`} fill={PRIORITY_COLORS[entry.priority] || '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Critical Issues & Recent Issues & Users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Critical Issues Requiring Immediate Action */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                Critical & High Priority Urgent Issues
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">High safety hazards pending resolution</p>
            </div>
            <Link to="/issues" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
              View all &rarr;
            </Link>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {(stats.criticalIssues || []).length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">No urgent critical issues pending!</p>
            ) : (
              (stats.criticalIssues || []).map((issue: any) => (
                <div key={issue._id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <PriorityBadge priority={issue.priority} size="sm" />
                    <div>
                      <Link
                        to={`/issues/${issue._id}`}
                        className="font-bold text-slate-900 text-xs hover:text-emerald-600 line-clamp-1"
                      >
                        {issue.title}
                      </Link>
                      <p className="text-[11px] text-slate-400 line-clamp-1">📍 {issue.address}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={issue.status} size="sm" />
                    <Link
                      to={`/issues/${issue._id}`}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                    >
                      Assign
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Registered Users */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent Users</h3>
              <p className="text-xs text-slate-500 mt-0.5">Latest system onboarding</p>
            </div>
            <Link to="/admin/users" className="text-xs font-bold text-purple-600 hover:text-purple-700">
              Users list &rarr;
            </Link>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {(stats.recentUsers || []).map((u: any) => (
              <div key={u._id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-100 font-bold text-xs text-slate-700 flex items-center justify-center">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-xs">{u.name}</p>
                    <p className="text-[10px] text-slate-400">{u.email}</p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    u.role === 'admin'
                      ? 'bg-purple-100 text-purple-800'
                      : u.role === 'officer'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
