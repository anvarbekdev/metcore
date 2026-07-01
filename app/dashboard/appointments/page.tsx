'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi, patientsApi, doctorsApi, clinicsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Calendar, Clock, CheckCircle, XCircle, Plus, X, Loader2, Search } from 'lucide-react';

function extractErrorMessage(error: unknown): string {
  const data = (error as any)?.response?.data;
  if (!data) return (error as any)?.message || 'Saqlashda xatolik';
  const msg = data.message;
  if (typeof msg === 'string') return msg;
  if (Array.isArray(msg)) return msg.join(', ');
  return data.error || 'Saqlashda xatolik';
}

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  PENDING: { label: 'Kutilmoqda', class: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'Tasdiqlangan', class: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS: { label: 'Jarayonda', class: 'bg-purple-100 text-purple-700' },
  COMPLETED: { label: 'Tugatilgan', class: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Bekor qilingan', class: 'bg-red-100 text-red-700' },
  NO_SHOW: { label: 'Kelmadi', class: 'bg-gray-100 text-gray-600' },
};

const EMPTY_FORM = {
  patientId: '',
  doctorId: '',
  clinicId: '',
  scheduledDate: '',
  scheduledTime: '',
  reason: '',
};

function CreateModal({
  defaultClinicId,
  onClose,
  onSave,
}: {
  defaultClinicId?: string;
  onClose: () => void;
  onSave: (d: any) => void;
}) {
  const [form, setForm] = useState({ ...EMPTY_FORM, clinicId: defaultClinicId || '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [patientSearch, setPatientSearch] = useState('');

  const { data: patients } = useQuery({
    queryKey: ['patients-modal'],
    queryFn: () => patientsApi.list().then((r) => r.data),
  });
  const { data: doctors } = useQuery({
    queryKey: ['doctors-modal'],
    queryFn: () => doctorsApi.list().then((r) => r.data).catch(() => []),
  });
  const { data: clinics } = useQuery({
    queryKey: ['clinics-modal'],
    queryFn: () => clinicsApi.list().then((r) => r.data),
  });

  function set(k: string, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: '' }));
  }

  const filteredPatients = (patients || []).filter((p: any) =>
    !patientSearch ||
    p.fullName?.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.phone?.includes(patientSearch),
  );

  function validate() {
    const e: Record<string, string> = {};
    if (!form.patientId) e.patientId = 'Bemor tanlanishi shart';
    if (!form.doctorId) e.doctorId = 'Shifokor tanlanishi shart';
    if (!form.scheduledDate) e.scheduledDate = 'Sana tanlanishi shart';
    if (!form.scheduledTime) e.scheduledTime = 'Vaqt tanlanishi shart';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const scheduledAt = new Date(`${form.scheduledDate}T${form.scheduledTime}`).toISOString();
    const selectedDoctor = (doctors || []).find((d: any) => d.id === form.doctorId);

    onSave({
      patientId: form.patientId,
      doctorId: form.doctorId,
      clinicId: form.clinicId || selectedDoctor?.user?.clinicId || defaultClinicId,
      scheduledAt,
      reason: form.reason.trim() || undefined,
    });
  }

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Yangi navbat qo'shish</h2>
            <p className="text-xs text-slate-400 mt-0.5">Bemor va shifokorni tanlang</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {/* Patient select */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">
              Bemor <span className="text-red-500">*</span>
            </label>
            <div className="relative mb-1.5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                placeholder="Ism yoki telefon..."
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <select
              value={form.patientId}
              onChange={(e) => set('patientId', e.target.value)}
              size={Math.min(filteredPatients.length + 1, 5)}
              className={`w-full px-3.5 py-2 border rounded-xl text-sm outline-none transition bg-white
                ${errors.patientId ? 'border-red-400' : 'border-slate-200 focus:ring-2 focus:ring-sky-400 focus:border-sky-400'}`}
            >
              <option value="">— Bemorni tanlang —</option>
              {filteredPatients.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} · {p.phone}
                </option>
              ))}
            </select>
            {errors.patientId && <p className="text-xs text-red-500 mt-1">{errors.patientId}</p>}
          </div>

          {/* Doctor select */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">
              Shifokor <span className="text-red-500">*</span>
            </label>
            <select
              value={form.doctorId}
              onChange={(e) => set('doctorId', e.target.value)}
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none transition bg-white
                ${errors.doctorId ? 'border-red-400' : 'border-slate-200 focus:ring-2 focus:ring-sky-400 focus:border-sky-400'}`}
            >
              <option value="">— Shifokorni tanlang —</option>
              {(doctors || []).map((d: any) => (
                <option key={d.id} value={d.id}>
                  {d.user?.fullName} — {d.specialization || 'Mutaxassislik yo\'q'}
                </option>
              ))}
            </select>
            {errors.doctorId && <p className="text-xs text-red-500 mt-1">{errors.doctorId}</p>}
          </div>

          {/* Clinic (optional if already set) */}
          {!defaultClinicId && (
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Klinika</label>
              <select
                value={form.clinicId}
                onChange={(e) => set('clinicId', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 bg-white text-slate-600"
              >
                <option value="">— Klinikani tanlang —</option>
                {(clinics || []).map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">
                Sana <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.scheduledDate}
                min={minDate}
                onChange={(e) => set('scheduledDate', e.target.value)}
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none transition text-slate-700
                  ${errors.scheduledDate ? 'border-red-400' : 'border-slate-200 focus:ring-2 focus:ring-sky-400 focus:border-sky-400'}`}
              />
              {errors.scheduledDate && <p className="text-xs text-red-500 mt-1">{errors.scheduledDate}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">
                Vaqt <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={form.scheduledTime}
                onChange={(e) => set('scheduledTime', e.target.value)}
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none transition text-slate-700
                  ${errors.scheduledTime ? 'border-red-400' : 'border-slate-200 focus:ring-2 focus:ring-sky-400 focus:border-sky-400'}`}
              />
              {errors.scheduledTime && <p className="text-xs text-red-500 mt-1">{errors.scheduledTime}</p>}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Murojaat sababi</label>
            <textarea
              value={form.reason}
              onChange={(e) => set('reason', e.target.value)}
              placeholder="Bemor murojaat sababi..."
              rows={2}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition">
              Bekor qilish
            </button>
            <button type="submit"
              className="flex-1 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700 transition">
              Navbat qo'shish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AppointmentsPage() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', filterStatus],
    queryFn: () =>
      appointmentsApi.list(filterStatus ? { status: filterStatus } : {}).then((r) => r.data),
    refetchInterval: 30_000,
  });

  const updateMut = useMutation({
    mutationFn: ({ id, status }: any) =>
      appointmentsApi.updateStatus(id, { status }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  });

  const createMut = useMutation({
    mutationFn: (data: any) => appointmentsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      setShowModal(false);
    },
  });

  return (
    <div className="space-y-6">
      {showModal && (
        <CreateModal
          defaultClinicId={user?.clinicId}
          onClose={() => setShowModal(false)}
          onSave={(data) => createMut.mutate(data)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Navbatlar</h1>
          <p className="text-slate-500 text-sm mt-1">Barcha navbatlarni boshqarish</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700 transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Yangi navbat
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition ${
              filterStatus === s
                ? 'bg-sky-600 text-white'
                : 'bg-white border text-slate-600 hover:bg-slate-50'
            }`}
          >
            {s ? STATUS_CONFIG[s]?.label : 'Barchasi'}
          </button>
        ))}
      </div>

      {createMut.isPending && (
        <div className="flex items-center gap-2 text-sm text-sky-600 bg-sky-50 px-4 py-2.5 rounded-xl border border-sky-100">
          <Loader2 className="w-4 h-4 animate-spin" />
          Navbat qo'shilmoqda...
        </div>
      )}
      {createMut.isError && (
        <div className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-xl border border-red-100">
          Xatolik: {extractErrorMessage(createMut.error)}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-5 py-3 text-left font-medium text-slate-500">Bemor</th>
                <th className="px-5 py-3 text-left font-medium text-slate-500">Shifokor</th>
                <th className="px-5 py-3 text-left font-medium text-slate-500 hidden md:table-cell">Klinika</th>
                <th className="px-5 py-3 text-left font-medium text-slate-500">Vaqt</th>
                <th className="px-5 py-3 text-left font-medium text-slate-500">Holat</th>
                <th className="px-5 py-3 text-left font-medium text-slate-500">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {(appointments || []).map((a: any) => (
                <tr key={a.id} className="border-t border-slate-50 hover:bg-slate-50 transition">
                  <td className="px-5 py-3 font-medium text-slate-800">{a.patient?.fullName || '—'}</td>
                  <td className="px-5 py-3 text-slate-600">{a.doctor?.user?.fullName || '—'}</td>
                  <td className="px-5 py-3 text-slate-500 hidden md:table-cell">{a.clinic?.name || '—'}</td>
                  <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                    {a.scheduledAt
                      ? new Date(a.scheduledAt).toLocaleString('uz-UZ', {
                          month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })
                      : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[a.status]?.class || 'bg-slate-100 text-slate-600'}`}>
                      {STATUS_CONFIG[a.status]?.label || a.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1.5">
                      {a.status === 'PENDING' && (
                        <button
                          onClick={() => updateMut.mutate({ id: a.id, status: 'CONFIRMED' })}
                          disabled={updateMut.isPending}
                          className="p-1.5 hover:bg-green-50 text-green-600 rounded-lg transition disabled:opacity-40"
                          title="Tasdiqlash"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {a.status === 'CONFIRMED' && (
                        <button
                          onClick={() => updateMut.mutate({ id: a.id, status: 'IN_PROGRESS' })}
                          disabled={updateMut.isPending}
                          className="p-1.5 hover:bg-purple-50 text-purple-600 rounded-lg transition disabled:opacity-40"
                          title="Boshlash"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                      )}
                      {a.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => updateMut.mutate({ id: a.id, status: 'COMPLETED' })}
                          disabled={updateMut.isPending}
                          className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition disabled:opacity-40"
                          title="Tugatish"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {['PENDING', 'CONFIRMED'].includes(a.status) && (
                        <button
                          onClick={() => updateMut.mutate({ id: a.id, status: 'CANCELLED' })}
                          disabled={updateMut.isPending}
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition disabled:opacity-40"
                          title="Bekor qilish"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!appointments?.length && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p>Navbatlar topilmadi</p>
                    <button onClick={() => setShowModal(true)}
                      className="mt-2 text-sm text-sky-600 hover:underline">
                      Birinchi navbatni qo'shing →
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
