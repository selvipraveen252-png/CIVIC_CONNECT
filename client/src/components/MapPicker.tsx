import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Compass, Check, Crosshair } from 'lucide-react';

interface Props {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number, addressSuggestion?: string) => void;
  className?: string;
}

export const MapPicker: React.FC<Props> = ({
  latitude,
  longitude,
  onChange,
  className = 'h-[360px]',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: latitude || 12.9716,
    lng: longitude || 77.5946,
  });

  // Reverse geocoding helper using OpenStreetMap Nominatim
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          return data.display_name;
        }
      }
    } catch (e) {
      console.warn('Reverse geocode error:', e);
    }
    return '';
  };

  const createPickerIcon = () => {
    return L.divIcon({
      className: 'custom-picker-pin',
      html: `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: grab;">
          <div style="
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid #ffffff;
            box-shadow: 0 4px 14px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="width: 10px; height: 10px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36],
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = latitude || 12.9716;
      const initialLng = longitude || 77.5946;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 14,
        zoomControl: true,
      });

      const mapTilerKey = import.meta.env.VITE_MAPTILER_API_KEY;

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

      L.tileLayer(tileUrl, tileOptions).addTo(map);

      // Create Draggable Marker
      const pinIcon = createPickerIcon();
      const marker = L.marker([initialLat, initialLng], {
        icon: pinIcon,
        draggable: true,
      }).addTo(map);

      marker.bindPopup(`
        <div style="padding: 4px; font-family: sans-serif; text-align: center;">
          <div style="font-weight: 700; color: #065f46; font-size: 12px;">📍 Pinpointed Location</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Click or drag to adjust location</div>
        </div>
      `);

      // Click to place pin
      map.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setCurrentCoords({ lat, lng });
        const addr = await reverseGeocode(lat, lng);
        onChange(lat, lng, addr);
      });

      // Drag pin to adjust
      marker.on('dragend', async () => {
        const pos = marker.getLatLng();
        setCurrentCoords({ lat: pos.lat, lng: pos.lng });
        const addr = await reverseGeocode(pos.lat, pos.lng);
        onChange(pos.lat, pos.lng, addr);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Invalidate size to guarantee tiles render without grey box
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
          markerRef.current = null;
        }
      };
    }
  }, []);

  // Sync external coordinate changes if provided
  useEffect(() => {
    if (latitude && longitude && markerRef.current && mapInstanceRef.current) {
      const cur = markerRef.current.getLatLng();
      if (Math.abs(cur.lat - latitude) > 0.0001 || Math.abs(cur.lng - longitude) > 0.0001) {
        markerRef.current.setLatLng([latitude, longitude]);
        mapInstanceRef.current.panTo([latitude, longitude]);
        setCurrentCoords({ lat: latitude, lng: longitude });
      }
    }
  }, [latitude, longitude]);

  // GPS Locate User
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsLocating(false);
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setCurrentCoords({ lat: userLat, lng: userLng });

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([userLat, userLng], 16, { duration: 1.2 });
          markerRef.current.setLatLng([userLat, userLng]);
          markerRef.current.openPopup();
        }
        const addr = await reverseGeocode(userLat, userLng);
        onChange(userLat, userLng, addr);
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err);
        alert('Could not determine your GPS location. Please click on the map to place the marker.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleCenterCity = () => {
    const cityLat = 12.9716;
    const cityLng = 77.5946;
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.flyTo([cityLat, cityLng], 14, { duration: 0.8 });
      markerRef.current.setLatLng([cityLat, cityLng]);
      setCurrentCoords({ lat: cityLat, lng: cityLng });
      onChange(cityLat, cityLng);
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-md w-full bg-slate-100 min-h-[340px] h-[360px] group">
      {/* Map Canvas Container */}
      <div
        ref={mapContainerRef}
        className={`w-full ${className} z-0`}
        style={{ minHeight: '340px', height: '100%', width: '100%' }}
      />

      {/* Geolocation Controls Overlay */}
      <div className="absolute top-3 right-3 z-[400] flex items-center gap-2">
        <button
          type="button"
          onClick={handleCenterCity}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 hover:bg-white text-slate-700 text-xs font-semibold rounded-xl shadow-md border border-slate-200/90 transition-all hover:shadow-lg backdrop-blur-sm"
          title="Reset to City Center"
        >
          <Crosshair className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Reset Center</span>
        </button>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md border border-emerald-500 transition-all hover:shadow-lg disabled:opacity-50"
        >
          <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
          {isLocating ? 'Detecting GPS...' : 'Use My GPS'}
        </button>
      </div>

      {/* Interactive Helper Banner & Live Coordinates */}
      <div className="absolute bottom-3 left-3 right-3 z-[400] bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg border border-slate-200 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Click anywhere on map or drag pin to select exact issue spot</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-lg font-semibold">
            {currentCoords.lat.toFixed(5)}, {currentCoords.lng.toFixed(5)}
          </span>
          <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Check className="w-3 h-3" /> Pin Set
          </span>
        </div>
      </div>
    </div>
  );
};

export default MapPicker;
