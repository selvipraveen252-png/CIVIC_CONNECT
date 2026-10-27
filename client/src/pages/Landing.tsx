import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Camera,
  Activity,
  Users,
  Building2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { dashboardService } from '../services/notificationService';
import { CategoryIcon } from '../components/CategoryIcon';
import { IssueCategory } from '../types';

export const Landing: React.FC = () => {
  const [stats, setStats] = useState<any>({
    totalIssues: 18,
    resolved: 12,
    pending: 6,
    totalUsers: 25,
    departmentsCount: 6,
    resolutionRate: 75,
  });
  const [recentIssues, setRecentIssues] = useState<any[]>([]);

  useEffect(() => {
    dashboardService.getStats().then((res) => {
      if (res.success && res.data) {
        setStats(res.data);
        if (res.data.recentIssues) {
          setRecentIssues(res.data.recentIssues);
        }
      }
    }).catch(() => {
      // fallback
    });
  }, []);

  const categories: { name: IssueCategory; desc: string }[] = [
    { name: 'Road Damage', desc: 'Broken asphalt, sunken slabs, and cracked roadways affecting vehicular transit.' },
    { name: 'Pothole', desc: 'Hazardous craters, road depressions, and asphalt erosion threatening motorists.' },
    { name: 'Water Leakage', desc: 'Ruptured mains, underground valve leakages, and burst municipal pipes.' },
    { name: 'Garbage Overflow', desc: 'Unattended dumpsters, illegal commercial debris, and unhygienic waste piles.' },
    { name: 'Streetlight Failure', desc: 'Dark corridors, non-functional light fixtures, and sparking poles.' },
    { name: 'Drainage Problem', desc: 'Clogged storm drains, overflowing manholes, and monsoon waterlogging.' },
    { name: 'Traffic Problem', desc: 'Faded zebra crossings, downed signboards, and damaged safety signals.' },
    { name: 'Public Infrastructure', desc: 'Damaged sidewalks, broken pedestrian barriers, and vandalized amenities.' },
  ];

  const workflowSteps = [
    {
      num: '01',
      title: 'Report with GPS & Photo',
      desc: 'Snap a picture, pinpoint the location on our interactive OpenStreetMap Leaflet GIS, and submit in seconds.',
      icon: Camera,
      color: 'bg-emerald-500 text-white',
    },
    {
      num: '02',
      title: 'Verification & Auto-Routing',
      desc: 'Issue is categorized and automatically assigned to the designated municipal department and field officer.',
      icon: ShieldCheck,
      color: 'bg-blue-500 text-white',
    },
    {
      num: '03',
      title: 'Action In Progress',
      desc: 'Field engineers and maintenance trucks are dispatched. Officers log status updates and progress remarks.',
      icon: Activity,
      color: 'bg-indigo-500 text-white',
    },
    {
      num: '04',
      title: 'Verified Resolution',
      desc: 'Repair is completed with photo evidence. Citizen receives notification and can verify or reopen if needed.',
      icon: CheckCircle2,
      color: 'bg-teal-500 text-white',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-900 text-white pt-20 pb-28">
        {/* Decorative Grid & Glow Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> Smart Civic Issue Reporting & Tracking Platform
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            CivicConnect
          </h1>

          <p className="mt-4 text-xl sm:text-2xl font-medium text-emerald-400 max-w-2xl mx-auto">
            "Report. Track. Improve Your Community."
          </p>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            A transparent, GIS-powered civic engagement bridge connecting citizens with municipal departments.
            Report potholes, water leakages, garbage overflows, and broken streetlights with verifiable audit trails.
          </p>

          {/* Call to Actions */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/report"
              className="px-8 py-3.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              Report an Issue Now
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/map"
              className="px-8 py-3.5 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/15 text-white border border-white/20 backdrop-blur transition-all flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              Explore GIS Map
            </Link>
          </div>

          {/* Quick Real-Time Metrics Strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur border border-white/10 p-4 rounded-2xl">
              <span className="text-3xl font-extrabold text-white block">{stats.totalIssues || 18}+</span>
              <span className="text-xs text-slate-400 font-medium">Civic Issues Tracked</span>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 p-4 rounded-2xl">
              <span className="text-3xl font-extrabold text-emerald-400 block">{stats.resolved || 12}+</span>
              <span className="text-xs text-slate-400 font-medium">Resolved & Verified</span>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 p-4 rounded-2xl">
              <span className="text-3xl font-extrabold text-blue-400 block">{stats.resolutionRate || 75}%</span>
              <span className="text-xs text-slate-400 font-medium">Resolution Success Rate</span>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 p-4 rounded-2xl">
              <span className="text-3xl font-extrabold text-purple-400 block">{stats.departmentsCount || 6}</span>
              <span className="text-xs text-slate-400 font-medium">Active Municipal Depts</span>
            </div>
          </div>
        </div>
      </section>

      {/* Issue Categories Section */}
      <section id="categories" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
            Municipal Scope
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
            Report Issues Across Critical Civic Categories
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            CivicConnect routes complaints to the responsible municipal department immediately based on category.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all hover:border-emerald-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CategoryIcon category={cat.name} className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">{cat.name}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{cat.desc}</p>
              <Link
                to={`/report?category=${encodeURIComponent(cat.name)}`}
                className="mt-4 inline-flex items-center text-xs font-bold text-emerald-600 hover:text-emerald-700 gap-1"
              >
                Report this &rarr;
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-100/70 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full uppercase tracking-wider">
              Transparent Lifecycle
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
              How CivicConnect Works
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              From citizen smartphone report to verified repair on the ground.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {workflowSteps.map((step) => {
              const StepIcon = step.icon;
              return (
                <div key={step.num} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${step.color}`}>
                      <StepIcon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-black text-slate-200">{step.num}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-2">{step.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live Recent Reports Section */}
      {recentIssues.length > 0 && (
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full uppercase tracking-wider">
                Public Transparency
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
                Recent Civic Reports from the Community
              </h2>
            </div>
            <Link
              to="/issues"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              View all reports &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentIssues.slice(0, 3).map((issue: any) => (
              <div
                key={issue._id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {issue.image ? (
                  <img
                    src={issue.image}
                    alt={issue.title}
                    className="w-full h-44 object-cover"
                  />
                ) : (
                  <div className="w-full h-44 bg-slate-100 flex items-center justify-center text-slate-400">
                    <CategoryIcon category={issue.category} className="w-12 h-12" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                      {issue.category}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {issue.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1">{issue.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{issue.description}</p>
                  <p className="text-[11px] text-slate-400 mt-3 font-medium">📍 {issue.address}</p>
                  <Link
                    to={`/issues/${issue._id}`}
                    className="mt-4 block w-full text-center py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors"
                  >
                    View Status Timeline &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Ready to Participate CTA */}
      <section className="bg-emerald-600 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight">Ready to improve your neighborhood?</h2>
          <p className="mt-3 text-emerald-100 text-sm max-w-xl mx-auto">
            Register your citizen account, snap problems on your street, and track government repairs in real-time.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors"
            >
              Create Free Citizen Account
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-emerald-900 font-bold text-xs shadow-md transition-colors"
            >
              Sign In to Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
