import React from 'react';
import {
  Construction,
  AlertOctagon,
  Droplets,
  Trash2,
  LightbulbOff,
  Waves,
  TrafficCone,
  Landmark,
  HelpCircle,
} from 'lucide-react';
import { IssueCategory } from '../types';

interface Props {
  category: IssueCategory | string;
  className?: string;
  showLabel?: boolean;
}

export const CategoryIcon: React.FC<Props> = ({ category, className = 'w-4 h-4', showLabel = false }) => {
  let IconComponent = HelpCircle;
  let color = 'text-slate-500';

  switch (category) {
    case 'Road Damage':
      IconComponent = Construction;
      color = 'text-amber-600';
      break;
    case 'Pothole':
      IconComponent = AlertOctagon;
      color = 'text-red-600';
      break;
    case 'Water Leakage':
      IconComponent = Droplets;
      color = 'text-cyan-600';
      break;
    case 'Garbage Overflow':
      IconComponent = Trash2;
      color = 'text-emerald-600';
      break;
    case 'Streetlight Failure':
      IconComponent = LightbulbOff;
      color = 'text-yellow-600';
      break;
    case 'Drainage Problem':
      IconComponent = Waves;
      color = 'text-teal-600';
      break;
    case 'Traffic Problem':
      IconComponent = TrafficCone;
      color = 'text-orange-600';
      break;
    case 'Public Infrastructure':
      IconComponent = Landmark;
      color = 'text-purple-600';
      break;
    default:
      IconComponent = HelpCircle;
      color = 'text-slate-500';
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <IconComponent className={`${className} ${color}`} />
      {showLabel && <span className="font-medium text-slate-700">{category}</span>}
    </span>
  );
};

export default CategoryIcon;
