import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { issueService } from '../services/issueService';
import { Issue } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { CategoryIcon } from '../components/CategoryIcon';
import { VisualTimeline } from '../components/VisualTimeline';
import { ActionModal } from '../components/ActionModal';
import { formatDate, formatDateTime, timeAgo } from '../utils/formatDate';
import L from 'leaflet';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Building2,
  ShieldCheck,
  RotateCcw,
  CheckCircle,
  Clock,
  Sparkles,
  ExternalLink,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';

export const IssueDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [issue, setIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalMode, setModalMode] = useState<'status' | 'assign' | 'reopen' | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const fetchIssue = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await issueService.getIssueById(id);
      if (res.success && res.issue) {
        setIssue(res.issue);
      }
    } catch (err) {
      console.error('Error fetching issue details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIssue();
  }, [id]);

  // Mini Leaflet Map initialization for location preview
  useEffect(() => {
    if (!issue || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const [lng, lat] = issue.location.coordinates;
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      const pinIcon = L.divIcon({
        className: 'custom-pin',
        html: `
          <div style="background:#16a34a;width:24px;height:24px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 3px 8px rgba(0,0,0,0.3);"></div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
      });

      L.marker([lat, lng], { icon: pinIcon }).addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [issue]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading issue details...</p>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900">Issue not found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">The requested civic ticket does not exist or was removed.</p>
        <button
          onClick={() => navigate('/issues')}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          Back to Issues
        </button>
      </div>
    );
  }

  const isReporter = user?._id === (typeof issue.reportedBy === 'object' ? issue.reportedBy?._id : issue.reportedBy);
  const isOfficerOrAdmin = user?.role === 'officer' || user?.role === 'admin';
  const canReopen = (isReporter || user?.role === 'admin') && ['RESOLVED', 'CLOSED', 'REJECTED'].includes(issue.status);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Back button and quick actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to list
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          {canReopen && (
            <button
              onClick={() => setModalMode('reopen')}
              className="px-4 py-2 text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reopen Issue
            </button>
          )}

          {isOfficerOrAdmin && (
            <>
              <button
                onClick={() => setModalMode('assign')}
                className="px-4 py-2 text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Assign Dept / Officer
              </button>
              <button
                onClick={() => setModalMode('status')}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Update Status / Remarks
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Issue Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              #{issue._id.slice(-6).toUpperCase()}
            </span>
            <CategoryIcon category={issue.category} showLabel />
          </div>

          <div className="flex items-center gap-2">
            <PriorityBadge priority={issue.priority} />
            <StatusBadge status={issue.status} size="lg" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-4">
          {issue.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2 font-medium">
          <span className="flex items-center gap-1 text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            {issue.address}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Reported on {formatDateTime(issue.createdAt)}
          </span>
        </div>

        {/* Visual Workflow Timeline */}
        <div className="mt-8">
          <VisualTimeline
            currentStatus={issue.status}
            statusHistory={issue.statusHistory}
          />
        </div>
      </div>

      {/* Two Column Layout: Description & Media | Meta & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Details & Photos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Description */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              Issue Description
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {issue.description}
            </p>
          </div>

          {/* Issue Photo */}
          {issue.image && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                Reported Site Photograph
              </h3>
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 max-h-96">
                <img
                  src={issue.image}
                  alt={issue.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Complete Status History / Audit Trail */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Official Status History & Remarks
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                {issue.statusHistory.length} audit records
              </span>
            </div>

            <div className="space-y-4">
              {issue.statusHistory.map((history, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100/90 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={history.status} size="sm" />
                      <span className="font-bold text-slate-800">
                        {typeof history.changedBy === 'object' ? (history.changedBy as any)?.name : 'System User'}
                      </span>
                      <span className="text-[10px] font-semibold uppercase text-slate-400">
                        ({typeof history.changedBy === 'object' ? (history.changedBy as any)?.role : 'User'})
                      </span>
                    </div>
                    <span className="text-slate-400 font-medium text-[11px]">
                      {formatDateTime(history.changedAt)}
                    </span>
                  </div>

                  {history.remarks && (
                    <p className="text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/60 leading-relaxed">
                      💬 "{history.remarks}"
                    </p>
                  )}

                  {history.evidenceImage && (
                    <div className="mt-2">
                      <p className="text-[11px] font-bold text-emerald-700 mb-1">
                        📸 Resolution Evidence Uploaded:
                      </p>
                      <img
                        src={history.evidenceImage}
                        alt="Resolution proof"
                        className="w-36 h-36 object-cover rounded-xl border border-slate-200 shadow-sm"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Location, Reporter, Assignment Metadata */}
        <div className="space-y-6">
          {/* Location Map Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Geographic Location
            </h3>
            <div ref={mapContainerRef} className="w-full h-44 rounded-2xl border border-slate-200 overflow-hidden" />
            <div>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                {issue.address}
              </p>
              <p className="text-[11px] font-mono text-slate-400 mt-1">
                GeoJSON: [{issue.location.coordinates[0].toFixed(5)}, {issue.location.coordinates[1].toFixed(5)}]
              </p>
            </div>
            <Link
              to={`/map?lat=${issue.location.coordinates[1]}&lng=${issue.location.coordinates[0]}`}
              className="block text-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
            >
              Open on Full GIS Map &rarr;
            </Link>
          </div>

          {/* Department & Officer Assignment Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Jurisdiction & Dispatch
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Assigned Department</span>
                <p className="font-bold text-slate-800">
                  {issue.assignedDepartment ? issue.assignedDepartment.name : 'Unassigned'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Assigned Officer</span>
                <p className="font-bold text-slate-800">
                  {issue.assignedOfficer ? issue.assignedOfficer.name : 'Pending dispatch'}
                </p>
              </div>
            </div>
          </div>

          {/* Reporter Details Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-2 text-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Reporter Information
            </h3>
            <div className="flex items-center gap-2.5 pt-1">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                {issue.reportedBy?.name?.charAt(0).toUpperCase() || 'C'}
              </div>
              <div>
                <p className="font-bold text-slate-900">{issue.reportedBy?.name || 'Anonymous Citizen'}</p>
                <p className="text-[11px] text-slate-400">{issue.reportedBy?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {modalMode && (
        <ActionModal
          isOpen={Boolean(modalMode)}
          onClose={() => setModalMode(null)}
          issue={issue}
          mode={modalMode}
          userRole={user?.role}
          onSuccess={(updated) => {
            setIssue(updated);
            setModalMode(null);
          }}
        />
      )}
    </div>
  );
};

export default IssueDetails;
