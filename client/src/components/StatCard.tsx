import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  isPositive?: boolean;
  color?: 'emerald' | 'blue' | 'amber' | 'red' | 'purple' | 'indigo';
  subtitle?: string;
}

export const StatCard: React.FC<Props> = ({
  title,
  value,
  icon: Icon,
  change,
  isPositive,
  color = 'emerald',
  subtitle,
}) => {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      ring: 'border-emerald-100',
      accent: 'from-emerald-500/10 to-transparent',
    },
    blue: {
      bg: 'bg-blue-50 text-blue-600',
      ring: 'border-blue-100',
      accent: 'from-blue-500/10 to-transparent',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      ring: 'border-amber-100',
      accent: 'from-amber-500/10 to-transparent',
    },
    red: {
      bg: 'bg-rose-50 text-rose-600',
      ring: 'border-rose-100',
      accent: 'from-rose-500/10 to-transparent',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600',
      ring: 'border-purple-100',
      accent: 'from-purple-500/10 to-transparent',
    },
    indigo: {
      bg: 'bg-indigo-50 text-indigo-600',
      ring: 'border-indigo-100',
      accent: 'from-indigo-500/10 to-transparent',
    },
  };

  const scheme = colorMap[color];

  return (
    <div className="relative overflow-hidden bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${scheme.accent} rounded-bl-full pointer-events-none`} />

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${scheme.bg} border ${scheme.ring}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold tracking-tight text-slate-900">{value}</span>
        {change && (
          <span
            className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
              isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {change}
          </span>
        )}
      </div>

      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
