import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { issueService } from '../services/issueService';
import { IssueCategory, IssuePriority } from '../types';
import { MapPicker } from '../components/MapPicker';
import { CategoryIcon } from '../components/CategoryIcon';
import {
  Upload,
  MapPin,
  CheckCircle,
  AlertCircle,
  FileText,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

const CATEGORIES: IssueCategory[] = [
  'Road Damage',
  'Pothole',
  'Water Leakage',
  'Garbage Overflow',
  'Streetlight Failure',
  'Drainage Problem',
  'Traffic Problem',
  'Public Infrastructure',
  'Other',
];

export const ReportIssue: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IssueCategory>(
    (searchParams.get('category') as IssueCategory) || 'Pothole'
  );
  const [priority, setPriority] = useState<IssuePriority>('MEDIUM');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number>(12.9716);
  const [longitude, setLongitude] = useState<number>(77.5946);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleLocationChange = (lat: number, lng: number, addrSuggestion?: string) => {
    setLatitude(lat);
    setLongitude(lng);
    if (addrSuggestion && (!address || address.length < 5)) {
      setAddress(addrSuggestion);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    if (!title || !description || !category || !address) {
      setErrorMsg('Please complete all required fields (Title, Category, Description, and Address).');
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('priority', priority);
      formData.append('description', description.trim());
      formData.append('address', address.trim());
      formData.append('latitude', latitude.toString());
      formData.append('longitude', longitude.toString());

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await issueService.createIssue(formData);
      if (res.success && res.issue) {
        navigate(`/issues/${res.issue._id}?reported=true`);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit report. Please verify connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
          Citizen Reporting Portal
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
          Report a Civic Issue
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Provide accurate details and photos so municipal departments can verify and dispatch repairs quickly.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md">
        {/* Step 1: Category & Priority */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-bold">1</span>
            Civic Category & Severity
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                  category === cat
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold ring-2 ring-emerald-500/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 font-medium'
                }`}
              >
                <CategoryIcon category={cat} className="w-5 h-5 shrink-0" />
                <span className="text-xs leading-tight line-clamp-1">{cat}</span>
              </button>
            ))}
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Perceived Severity / Priority
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as IssuePriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-2 text-xs font-bold rounded-xl border text-center transition-all ${
                    priority === p
                      ? p === 'CRITICAL'
                        ? 'bg-red-500 text-white border-red-500 shadow-sm'
                        : p === 'HIGH'
                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                        : 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 2: Issue Details */}
        <div className="pt-6 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-bold">2</span>
            Issue Description
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Issue Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Deep pothole causing vehicular damage near 4th Cross"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Detailed Description *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happened, depth or severity, safety impact, and any landmarks to help officers locate it..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Geographic Location & Map */}
        <div className="pt-6 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-bold">3</span>
            Geographic Location & Landmark
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            Click directly on the interactive map or drag the pin to pinpoint the exact issue coordinates.
          </p>

          <div className="my-3">
            <MapPicker
              latitude={latitude}
              longitude={longitude}
              onChange={handleLocationChange}
              className="h-[360px]"
            />
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Street Address / Landmark *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Near Metro Station Pillar 104, Outer Ring Road"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Step 4: Photograph Upload */}
        <div className="pt-6 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-bold">4</span>
            Photograph Evidence (Recommended)
          </h2>

          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50/80 transition-colors cursor-pointer relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">Click or Drag to Upload Issue Image</p>
            <p className="text-[11px] text-slate-400 mt-1">JPEG, PNG or WebP up to 10MB</p>
          </div>

          {imagePreview && (
            <div className="mt-3 flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <img
                src={imagePreview}
                alt="Selected"
                className="w-16 h-16 object-cover rounded-xl border border-slate-200 shadow-sm"
              />
              <div className="text-xs">
                <p className="font-bold text-slate-800">{imageFile?.name}</p>
                <p className="text-[11px] text-slate-400">{Math.round((imageFile?.size || 0) / 1024)} KB</p>
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview('');
                  }}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 mt-1"
                >
                  Remove photograph
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-7 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              'Submitting Report...'
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Submit Civic Issue Report
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportIssue;
