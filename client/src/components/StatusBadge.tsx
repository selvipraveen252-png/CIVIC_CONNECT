import React from 'react';
import { IssueStatus } from '../types';
import { getStatusConfig } from '../utils/statusColors';

interface Props {
  status: IssueStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const config = getStatusConfig(status);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium transition-all ${config.badge} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
