'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorsApi, departmentsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Activity, Search, Plus, X, Loader2, Stethoscope } from 'lucide-react';

function extractErrorMessage(error: unknown): string {
  const data = (error as any)?.response?.data;
  if (!data) return (error as any)?.message || 'Saqlashda xatolik';
  const msg = data.message;
  if (typeof msg === 'string') return msg;
  if (Array.isArray(msg)) return msg.join(', ');
  return data.error || 'Saqlashda xatolik';
}

const EMPTY_FORM = {
  fullName: '',
  phone: '',
  email: '',
  specialization: '',
  departmentId: '',
  experienceYears: '',
  bio: '',
};

function Modal({
  clinicId,
  onClose,
  onSave,
}: {
  clinicId?: string;
  onClose: () => void;
  onSave: (d: any) => void;
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: departments } = useQuery({
    queryKey: ['departments', clinicId],
    queryFn: () => departmentsApi.list(clinicId).then((r) => r.data),
  });

  function set(k: string, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: '' }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = 'Ism familiya shart';
    if (!form.phone.trim()) e.phone = 'Telefon shart';
    if (!form.specialization.trim()) e.specialization = 'Mutaxassislik shart';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const payload: any = {
      fullName: form.fullName,
      phone: form.phone,
      specialization: form.specialization,
      clinicId,
    };
    if (form.email.trim()) payload.email = form.email;
    if (form.departmentId) payload.departmentId = form.departmentId;
    if (form.experienceYears) payload.experienceYears = Number(form.experienceYears);
    if (form.bio.trim()) payload.bio = form.bio;
    onSave(payload);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Yangi shifokor qo'shish</h2>
            <p className="text-xs text-slate-400 mt-0.5">Parol avtomatik: Doctor123!</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">
              Ism va Familiya <span className="text-red-500">*</span>
            </label>
            <input
              value={form.fullName}
              onChange={(e) => set('fullName', e.target.value)}
              placeholder="Dr. Sardor Yusupov"
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none transition
                ${errors.fullName ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:ring-2 focus:ring-sky-400 focus:border-sky-400'}`}
            />
            {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">
                Telefon <span className="text-red-500">*</span>
              </label>
              <input
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="+998901234567"
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none transition
                  ${errors.phone ? 'border-red-400' : 'border-slate-200 focus:ring-2 focus:ring-sky-400 focus:border-sky-400'}`}
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="doctor@klinika.uz"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">
              Mutaxassislik <span className="text-red-500">*</span>
            </label>
            <input
              value={form.specialization}
              onChange={(e) => set('specialization', e.target.value)}
              placeholder="Kardiolog"
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none transition
                ${errors.specialization ? 'border-red-400' : 'border-slate-200 focus:ring-2 focus:ring-sky-400 focus:border-sky-400'}`}
            />
            {errors.specialization && <p className="text-xs text-red-500 mt-1">{errors.specialization}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Bo'lim</label>
              <select
                value={form.departmentId}
                onChange={(e) => set('departmentId', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 bg-white text-slate-600"
              >
                <option value="">Tanlang</option>
                {(departments || []).map((d: any) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Tajriba (yil)</label>
              <input
                type="number"
                min="0"
                max="60"
                value={form.experienceYears}
                onChange={(e) => set('experienceYears', e.target.value)}
                placeholder="5"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Bio (qisqacha)</label>
            <textarea
              value={form.bio}
              onChange={(e) => set('bio', e.target.value)}
              placeholder="Shifokor haqida qisqacha ma'lumot..."
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
              className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition">
              Qo'shish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DoctorsPage() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const { data: doctors, isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => doctorsApi.list().then((r) => r.data).catch(() => []),
  });

  const createMut = useMutation({
    mutationFn: (data: any) => doctorsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doctors'] });
      setShowModal(false);
    },
  });

  const filtered = (doctors || []).filter((d: any) =>
    d.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {showModal && (
        <Modal
          clinicId={user?.clinicId}
          onClose={() => setShowModal(false)}
          onSave={(data) => createMut.mutate(data)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Shifokorlar</h1>
          <p className="text-slate-500 text-sm mt-1">{doctors?.length || 0} ta shifokor</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Yangi shifokor
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ism yoki mutaxassislik..."
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white"
        />
      </div>

      {createMut.isPending && (
        <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-100">
          <Loader2 className="w-4 h-4 animate-spin" />
          Shifokor qo'shilmoqda...
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doctor: any) => (
            <div key={doctor.id} className="bg-white rounded-xl border p-5 hover:shadow-md transition">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg flex-shrink-0">
                  {doctor.user?.fullName?.[0] || 'D'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{doctor.user?.fullName || '—'}</p>
                  <p className="text-emerald-600 text-sm">{doctor.specialization || 'Mutaxassislik ko\'rsatilmagan'}</p>
                </div>
                <Stethoscope className="w-4 h-4 text-slate-200 flex-shrink-0" />
              </div>
              {doctor.department && (
                <div className="mt-3 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg">
                  📍 {doctor.department.name}
                </div>
              )}
              <div className="flex items-center gap-3 mt-2">
                {doctor.experienceYears && (
                  <p className="text-xs text-slate-400">{doctor.experienceYears} yillik tajriba</p>
                )}
                {doctor.user?.email && (
                  <p className="text-xs text-slate-400 truncate">{doctor.user.email}</p>
                )}
              </div>
            </div>
          ))}

          {!filtered.length && (
            <div className="col-span-3 text-center py-12 text-slate-400">
              <Activity className="w-10 h-10 mx-auto mb-2 opacity-40" />
              {search ? 'Shifokor topilmadi' : (
                <div>
                  <p className="mb-3">Hali shifokorlar yo'q</p>
                  <button onClick={() => setShowModal(true)}
                    className="text-sm text-emerald-600 hover:underline">
                    Birinchi shifokorni qo'shing →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
