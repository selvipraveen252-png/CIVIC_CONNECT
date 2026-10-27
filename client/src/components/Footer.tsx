import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, PhoneCall, Mail, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md">
                <MapPin className="w-5 h-5 fill-white/20" />
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">CivicConnect</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering citizens, field officers, and city administrators with transparent civic issue reporting, GIS mapping, and automated resolution workflows.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" /> Academic First Project Review
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Platform Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition-colors">Home & Overview</Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-emerald-400 transition-colors">Interactive GIS Map</Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-emerald-400 transition-colors">Report New Civic Issue</Link>
              </li>
              <li>
                <Link to="/issues" className="hover:text-emerald-400 transition-colors">Public Issues Registry</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition-colors">Portal Login</Link>
              </li>
            </ul>
          </div>

          {/* Issue Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Key Civic Domains</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Road Damage & Potholes</li>
              <li>Water Leakage & Pipeline Rupture</li>
              <li>Solid Waste & Garbage Overflow</li>
              <li>Streetlight & Electrical Failures</li>
              <li>Drainage & Stormwater Clogging</li>
              <li>Traffic Signs & Safety Hazards</li>
            </ul>
          </div>

          {/* Emergency Helpline & Technical Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Emergency Dispatch</h4>
            <p className="text-xs text-slate-400 mb-3">
              For immediate life-safety emergencies, contact central municipal helplines:
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>Control Room: 1800-CIVIC-CONNECT</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>support@civicconnect.gov</span>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-400">
              MERN Stack Architecture • MongoDB Atlas • Leaflet GIS • Express • React • Node.js
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-center flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CivicConnect Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for Smart Cities & Transparent Civic Governance
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
