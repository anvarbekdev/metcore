'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Calendar, Clock, User, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PENDING: {
    label: 'Kutilmoqda',
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
    icon: <Clock className="w-4 h-4" />,
  },
  SCHEDULED: {
    label: 'Kutilmoqda',
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
    icon: <Clock className="w-4 h-4" />,
  },
  CONFIRMED: {
    label: 'Tasdiqlangan',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  COMPLETED: {
    label: 'Yakunlangan',
    color: 'text-slate-500',
    bg: 'bg-slate-50 border-slate-200',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  CANCELLED: {
    label: 'Bekor qilingan',
    color: 'text-red-500',
    bg: 'bg-red-50 border-red-200',
    icon: <X className="w-4 h-4" />,
  },
  NO_SHOW: {
    label: 'Kelmagan',
    color: 'text-orange-500',
    bg: 'bg-orange-50 border-orange-200',
    icon: <AlertCircle className="w-4 h-4" />,
  },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('uz-UZ', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('uz-UZ', {
    hour: '2-digit', minute: '2-digit',
  });
}

export default function PatientAppointmentsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['patient-appointments', user?.patientId],
    queryFn: () =>
      appointmentsApi
        .list(user?.patientId ? { patientId: user.patientId } : {})
        .then((r) => r.data),
    enabled: !!user,
  });
  
  const cancelMut = useMutation({
    mutationFn: (id: string) => appointmentsApi.updateStatus(id, { status: 'CANCELLED' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patient-appointments'] }),
  });

  const appointments: any[] = data || [];
  const upcoming = appointments.filter((a) => ['PENDING', 'SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'].includes(a.status));
  const past = appointments.filter((a) => ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(a.status));

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
        <p className="text-slate-500 text-sm">Navbatlar yuklanmoqda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-slate-600 font-medium">Ma'lumotlarni yuklashda xatolik</p>
        <p className="text-slate-400 text-sm mt-1">Iltimos qayta urinib ko'ring</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Mening Navbatlarim</h1>
        <p className="text-slate-500 text-sm mt-0.5">Barcha tibbiy navbatlaringiz</p>
      </div>

      {appointments.length === 0 ? (
        <div className="py-14 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Navbat yo'q</p>
          <p className="text-slate-400 text-sm mt-1">Hali birorta navbat band qilinmagan</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Kelayotgan navbatlar ({upcoming.length})
              </h2>
              <div className="space-y-3">
                {upcoming.map((appt) => {
                  const cfg = STATUS_CONFIG[appt.status] ?? STATUS_CONFIG.SCHEDULED;
                  return (
                    <div key={appt.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 bg-sky-100 rounded-xl flex items-center justify-center">
                            <User className="w-4 h-4 text-sky-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">
                              {appt.doctor?.fullName || 'Shifokor belgilanmagan'}
                            </p>
                            <p className="text-xs text-slate-400">
                              {appt.department?.name || appt.doctor?.specialization || ''}
                            </p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color} ${cfg.bg}`}>
                          {cfg.icon}
                          {cfg.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-slate-600 bg-slate-50 rounded-xl p-3">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>{formatDate(appt.scheduledAt)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span>{formatTime(appt.scheduledAt)}</span>
                        </div>
                      </div>

                      {appt.notes && (
                        <p className="text-xs text-slate-500 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                          {appt.notes}
                        </p>
                      )}

                      {['PENDING', 'SCHEDULED'].includes(appt.status) && (
                        <button
                          onClick={() => cancelMut.mutate(appt.id)}
                          disabled={cancelMut.isPending}
                          className="w-full py-2 text-sm text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition disabled:opacity-50"
                        >
                          {cancelMut.isPending ? 'Bekor qilinmoqda...' : 'Navbatni bekor qilish'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                O'tgan navbatlar ({past.length})
              </h2>
              <div className="space-y-3">
                {past.map((appt) => {
                  const cfg = STATUS_CONFIG[appt.status] ?? STATUS_CONFIG.COMPLETED;
                  return (
                    <div key={appt.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 opacity-75">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-700 text-sm">
                            {appt.doctor?.fullName || 'Shifokor'}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {formatDate(appt.scheduledAt)} · {formatTime(appt.scheduledAt)}
                          </p>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color} ${cfg.bg}`}>
                          {cfg.icon}
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
