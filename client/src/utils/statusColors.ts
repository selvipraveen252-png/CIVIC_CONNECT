import { IssueStatus, IssuePriority, IssueCategory } from '../types';

export const getStatusConfig = (status: IssueStatus) => {
  switch (status) {
    case 'REPORTED':
      return {
        label: 'Reported',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        badge: 'bg-amber-100 text-amber-800 border-amber-300',
        dot: 'bg-amber-500',
      };
    case 'VERIFIED':
      return {
        label: 'Verified',
        bg: 'bg-sky-50',
        text: 'text-sky-700',
        border: 'border-sky-200',
        badge: 'bg-sky-100 text-sky-800 border-sky-300',
        dot: 'bg-sky-500',
      };
    case 'ASSIGNED':
      return {
        label: 'Assigned',
        bg: 'bg-indigo-50',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
        badge: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        dot: 'bg-indigo-500',
      };
    case 'IN_PROGRESS':
      return {
        label: 'In Progress',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        badge: 'bg-blue-100 text-blue-800 border-blue-300',
        dot: 'bg-blue-500',
      };
    case 'RESOLVED':
      return {
        label: 'Resolved',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        dot: 'bg-emerald-500',
      };
    case 'CLOSED':
      return {
        label: 'Closed',
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-300',
        badge: 'bg-slate-200 text-slate-800 border-slate-300',
        dot: 'bg-slate-500',
      };
    case 'REJECTED':
      return {
        label: 'Rejected',
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        badge: 'bg-rose-100 text-rose-800 border-rose-300',
        dot: 'bg-rose-500',
      };
    case 'REOPENED':
      return {
        label: 'Reopened',
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        badge: 'bg-purple-100 text-purple-800 border-purple-300',
        dot: 'bg-purple-500',
      };
    default:
      return {
        label: status,
        bg: 'bg-slate-50',
        text: 'text-slate-700',
        border: 'border-slate-200',
        badge: 'bg-slate-100 text-slate-800 border-slate-300',
        dot: 'bg-slate-500',
      };
  }
};

export const getPriorityConfig = (priority: IssuePriority) => {
  switch (priority) {
    case 'CRITICAL':
      return {
        label: 'Critical',
        badge: 'bg-red-50 text-red-700 border-red-200 font-semibold',
        dot: 'bg-red-600',
      };
    case 'HIGH':
      return {
        label: 'High',
        badge: 'bg-orange-50 text-orange-700 border-orange-200 font-medium',
        dot: 'bg-orange-500',
      };
    case 'MEDIUM':
      return {
        label: 'Medium',
        badge: 'bg-amber-50 text-amber-700 border-amber-200 font-medium',
        dot: 'bg-amber-500',
      };
    case 'LOW':
      return {
        label: 'Low',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-normal',
        dot: 'bg-emerald-500',
      };
    default:
      return {
        label: priority,
        badge: 'bg-slate-50 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
      };
  }
};
