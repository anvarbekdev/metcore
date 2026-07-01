'use client';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { patientAssistantApi } from '@/lib/api';
import { MapPin, Phone, Clock, Navigation, Star, Loader2 } from 'lucide-react';

interface Clinic {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  workingHours?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  rating?: number;
  specializations?: string[];
}

function DistanceBadge({ meters }: { meters?: number }) {
  if (!meters) return null;
  const label = meters < 1000 ? `${meters} m` : `${(meters / 1000).toFixed(1)} km`;
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-sky-50 text-sky-600 px-2 py-0.5 rounded-full border border-sky-100">
      <Navigation className="w-3 h-3" />
      {label}
    </span>
  );
}

export default function PatientClinicsPage() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      // Fallback: Toshkent markazi koordinatalari
      setCoords({ lat: 40.1344, lng: 67.8255 });
      setGeoLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoLoading(false);
      },
      () => {
        // Geolokatsiya rad etilsa — Toshkent markazi (demo uchun)
        setCoords({ lat: 40.1344, lng: 67.8255 });
        setGeoLoading(false);
      },
      { timeout: 6000 },
    );
  }, []);

  const nearbyQuery = useQuery({
    queryKey: ['nearby-clinics', coords?.lat, coords?.lng],
    queryFn: () =>
      patientAssistantApi
        .nearbyClinics(coords!.lat, coords!.lng)
        .then((r) => r.data),
    enabled: !!coords,
  });

  const isLoading = geoLoading || nearbyQuery.isLoading;
  const clinics: Clinic[] = nearbyQuery.data || [];

  return (
    <div className="space-y-5 pt-4">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Klinikalar</h1>
        <p className="text-slate-500 text-sm mt-0.5">Sizga yaqin klinikalar</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
          <p className="text-slate-400 text-sm">
            {geoLoading ? 'Joylashuv aniqlanmoqda...' : 'Klinikalar yuklanmoqda...'}
          </p>
        </div>
      ) : clinics.length === 0 ? (
        <div className="py-14 text-center">
          <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Klinika topilmadi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clinics.map((clinic, idx) => (
            <div
              key={clinic.id ?? idx}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{clinic.name}</p>
                    {clinic.address && (
                      <p className="text-xs text-slate-400 mt-0.5">{clinic.address}</p>
                    )}
                  </div>
                </div>
                <DistanceBadge meters={clinic.distance} />
              </div>

              {clinic.specializations && clinic.specializations.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {clinic.specializations.slice(0, 4).map((s) => (
                    <span key={s} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-slate-600">
                {clinic.workingHours && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs">{clinic.workingHours}</span>
                  </div>
                )}
                {clinic.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-medium">{clinic.rating}</span>
                  </div>
                )}
              </div>

              {clinic.phone && (
                <a
                  href={`tel:${clinic.phone}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition"
                >
                  <Phone className="w-4 h-4" />
                  {clinic.phone}
                </a>
              )}

              {clinic.latitude && clinic.longitude && (
                <a
                  href={`https://maps.google.com/?q=${clinic.latitude},${clinic.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition"
                >
                  <Navigation className="w-4 h-4" />
                  Yo'l ko'rsatish
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
