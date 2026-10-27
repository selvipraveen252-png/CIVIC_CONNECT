import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Issue } from '../types';
import { formatDate } from '../utils/formatDate';

interface Props {
  issues: Issue[];
  className?: string;
  center?: [number, number];
  zoom?: number;
  userLocation?: { lat: number; lng: number } | null;
}

export const MapView: React.FC<Props> = ({
  issues,
  className = 'h-[620px]',
  center = [12.9716, 77.5946],
  zoom = 13,
  userLocation = null,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userLayerRef = useRef<L.LayerGroup | null>(null);
  const navigate = useNavigate();

  // Color generator based on status & priority
  const getMarkerColor = (status: string, priority: string) => {
    if (priority === 'CRITICAL') return '#dc2626'; // bright red
    switch (status) {
      case 'REPORTED':
        return '#f59e0b'; // amber
      case 'VERIFIED':
        return '#0284c7'; // sky
      case 'ASSIGNED':
        return '#6366f1'; // indigo
      case 'IN_PROGRESS':
        return '#2563eb'; // blue
      case 'RESOLVED':
      case 'CLOSED':
        return '#16a34a'; // green
      case 'REJECTED':
        return '#e11d48'; // rose
      case 'REOPENED':
        return '#9333ea'; // purple
      default:
        return '#64748b'; // slate
    }
  };

  const createMarkerIcon = (color: string) => {
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="
          background-color: ${color};
          width: 30px;
          height: 30px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2.5px solid #ffffff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        ">
          <div style="width: 10px; height: 10px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -32],
    });
  };

  // 1. Initialize Map and TileLayer once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Prevent duplicate map initialization
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
      });

      const mapTilerKey = import.meta.env.VITE_MAPTILER_API_KEY;

      // Use MapTiler Streets raster tiles when API key is provided
      const tileUrl = mapTilerKey
        ? `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${mapTilerKey}`
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      const tileOptions: L.TileLayerOptions = mapTilerKey
        ? {
            tileSize: 512,
            zoomOffset: -1,
            minZoom: 1,
            maxZoom: 19,
            attribution:
              '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
            crossOrigin: true,
          }
        : {
            maxZoom: 19,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          };

      const tileLayer = L.tileLayer(tileUrl, tileOptions).addTo(map);

      // Handle any tile error gracefully
      tileLayer.on('tileerror', (errorEvent) => {
        console.warn('Map tile failed to load:', errorEvent);
      });

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;

      const userGroup = L.layerGroup().addTo(map);
      userLayerRef.current = userGroup;

      mapInstanceRef.current = map;

      // Invalidate size after rendering to guarantee map container dimensions are calculated
      const t1 = setTimeout(() => {
        map.invalidateSize();
      }, 100);
      const t2 = setTimeout(() => {
        map.invalidateSize();
      }, 350);

      const handleResize = () => {
        map.invalidateSize();
      };
      window.addEventListener('resize', handleResize);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        window.removeEventListener('resize', handleResize);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
          markersLayerRef.current = null;
          userLayerRef.current = null;
        }
      };
    }
  }, []);

  // 2. Refresh issue pins when issues list updates
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();
    const bounds = L.latLngBounds([]);
    let validPinsCount = 0;

    issues.forEach((issue) => {
      if (!issue.location || !issue.location.coordinates) return;

      // MongoDB GeoJSON coordinates are in [longitude, latitude] format
      // Leaflet requires [latitude, longitude]
      let lng = Number(issue.location.coordinates[0]);
      let lat = Number(issue.location.coordinates[1]);

      if (isNaN(lat) || isNaN(lng)) return;

      // Handle inverted coordinates if present
      if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) {
        const temp = lat;
        lat = lng;
        lng = temp;
      }

      const color = getMarkerColor(issue.status, issue.priority);
      const icon = createMarkerIcon(color);
      const marker = L.marker([lat, lng], { icon });

      // Interactive popup with issue details and navigation
      const popupContent = document.createElement('div');
      popupContent.className = 'civic-popup p-1 min-w-[240px] max-w-[280px] font-sans';
      popupContent.innerHTML = `
        ${issue.image ? `<img src="${issue.image}" class="w-full h-28 object-cover rounded-lg mb-2" alt="${issue.title}" />` : ''}
        <div class="flex items-center gap-1.5 mb-1">
          <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">${issue.category}</span>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded ${issue.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}">${issue.priority}</span>
        </div>
        <h4 class="font-bold text-slate-900 text-sm leading-snug line-clamp-2">${issue.title}</h4>
        <p class="text-xs text-slate-500 mt-1 line-clamp-1">📍 ${issue.address}</p>
        <div class="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
          <span class="font-medium text-slate-600">Status: <strong class="text-slate-900">${issue.status}</strong></span>
          <span class="text-[11px] text-slate-400">${formatDate(issue.createdAt)}</span>
        </div>
        <button id="view-issue-${issue._id}" class="w-full mt-3 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow transition-colors cursor-pointer">
          View Issue Details &rarr;
        </button>
      `;

      // Attach navigation listener
      popupContent.querySelector(`#view-issue-${issue._id}`)?.addEventListener('click', (e) => {
        e.stopPropagation();
        navigate(`/issues/${issue._id}`);
      });

      marker.bindPopup(popupContent, { maxWidth: 320 });
      markersGroup.addLayer(marker);
      bounds.extend([lat, lng]);
      validPinsCount++;
    });

    // Fit map bounds to issues if available and user hasn't requested My GPS
    if (validPinsCount > 0 && bounds.isValid() && !userLocation) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }

    map.invalidateSize();
  }, [issues, navigate, userLocation]);

  // 3. Update User Location Pin & Center when GPS is triggered
  useEffect(() => {
    const map = mapInstanceRef.current;
    const userGroup = userLayerRef.current;
    if (!map || !userGroup) return;

    userGroup.clearLayers();

    if (userLocation && !isNaN(userLocation.lat) && !isNaN(userLocation.lng)) {
      const userIcon = L.divIcon({
        className: 'user-gps-marker',
        html: `
          <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(16, 185, 129, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 18px; height: 18px; border-radius: 50%; background: #059669; border: 3px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.35);"></div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18],
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon });
      userMarker.bindPopup(`
        <div style="padding: 4px; font-family: sans-serif; font-size: 12px; font-weight: 600; color: #065f46;">
          📍 Your Current GPS Location
        </div>
      `);

      userGroup.addLayer(userMarker);
      map.flyTo([userLocation.lat, userLocation.lng], 15, { duration: 1.2 });
      userMarker.openPopup();
      map.invalidateSize();
    }
  }, [userLocation]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-md w-full bg-slate-100 min-h-[500px]">
      <div
        ref={mapContainerRef}
        className={`w-full ${className} z-0`}
        style={{ minHeight: '620px', height: '100%', width: '100%' }}
      />
    </div>
  );
};

export default MapView;
