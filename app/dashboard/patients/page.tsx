'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientsApi } from '@/lib/api';
import { Users, Search, Plus, Phone, Calendar, X, Loader2 } from 'lucide-react';

function extractErrorMessage(error: unknown): string {
  const data = (error as any)?.response?.data;
  if (!data) return (error as any)?.message || 'Saqlashda xatolik';
  const msg = data.message;
  if (typeof msg === 'string') return msg;
  if (Array.isArray(msg)) return msg.join(', ');
  return data.error || 'Saqlashda xatolik';
}

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const EMPTY_FORM = {
  fullName: '',
  phone: '',
  gender: '',
  birthDate: '',
  bloodType: '',
  address: '',
};

function Modal({ onClose, onSave }: { onClose: () => void; onSave: (d: any) => void }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(k: string, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: '' }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = 'Ism familiya kiritilishi shart';
    if (!form.phone.trim()) e.phone = 'Telefon kiritilishi shart';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const payload: any = { fullName: form.fullName, phone: form.phone };
    if (form.gender) payload.gender = form.gender;
    if (form.birthDate) payload.birthDate = form.birthDate;
    if (form.bloodType) payload.bloodType = form.bloodType;
    if (form.address.trim()) payload.address = form.address;
    onSave(payload);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Yangi bemor qo'shish</h2>
            <p className="text-xs text-slate-400 mt-0.5">Asosiy ma'lumotlarni kiriting</p>
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
              placeholder="Toshmatova Malika"
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none transition
                ${errors.fullName ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:ring-2 focus:ring-sky-400 focus:border-sky-400'}`}
            />
            {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">
              Telefon <span className="text-red-500">*</span>
            </label>
            <input
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+998 90 123 45 67"
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none transition
                ${errors.phone ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:ring-2 focus:ring-sky-400 focus:border-sky-400'}`}
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Jinsi</label>
              <select
                value={form.gender}
                onChange={(e) => set('gender', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 bg-white text-slate-600"
              >
                <option value="">Tanlang</option>
                <option value="MALE">Erkak</option>
                <option value="FEMALE">Ayol</option>
                <option value="OTHER">Boshqa</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Qon guruhi</label>
              <select
                value={form.bloodType}
                onChange={(e) => set('bloodType', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 bg-white text-slate-600"
              >
                <option value="">Tanlang</option>
                {BLOOD_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Tug'ilgan sana</label>
            <input
              type="date"
              value={form.birthDate}
              onChange={(e) => set('birthDate', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 text-slate-700"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Manzil</label>
            <input
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
              placeholder="Toshkent, Chilonzor tumani"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition">
              Bekor qilish
            </button>
            <button type="submit"
              className="flex-1 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700 transition">
              Saqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PatientsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const { data: patients, isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: () => patientsApi.list().then((r) => r.data),
  });

  const createMut = useMutation({
    mutationFn: (data: any) => patientsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patients'] });
      setShowModal(false);
    },
  });

  const filtered = (patients || []).filter((p: any) =>
    p.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search),
  );

  return (
    <div className="space-y-6">
      {showModal && (
        <Modal
          onClose={() => setShowModal(false)}
          onSave={(data) => createMut.mutate(data)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bemorlar</h1>
          <p className="text-slate-500 text-sm mt-1">{patients?.length || 0} ta bemor ro'yxatda</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700 transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Yangi bemor
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ism yoki telefon bo'yicha qidirish..."
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white"
        />
      </div>

      {createMut.isPending && (
        <div className="flex items-center gap-2 text-sm text-sky-600 bg-sky-50 px-4 py-2.5 rounded-xl border border-sky-100">
          <Loader2 className="w-4 h-4 animate-spin" />
          Bemor qo'shilmoqda...
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
          {filtered.map((patient: any) => (
            <div key={patient.id} className="bg-white rounded-xl border p-5 hover:shadow-md transition cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700 font-bold text-lg flex-shrink-0">
                  {patient.fullName?.[0] || 'B'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{patient.fullName}</p>
                  <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                    <Phone className="w-3 h-3" />
                    <span>{patient.phone}</span>
                  </div>
                </div>
                {patient.gender && (
                  <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full flex-shrink-0">
                    {patient.gender === 'MALE' ? 'Erkak' : patient.gender === 'FEMALE' ? 'Ayol' : 'Boshqa'}
                  </span>
                )}
              </div>
              {patient.birthDate && (
                <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-400">
                  <Calendar className="w-3 h-3" />
                  <span>Tug'ilgan: {new Date(patient.birthDate).toLocaleDateString('uz-UZ')}</span>
                </div>
              )}
              {patient.bloodType && (
                <div className="mt-2 inline-flex items-center px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-xs font-medium">
                  Qon guruhi: {patient.bloodType}
                </div>
              )}
            </div>
          ))}

          {!filtered.length && (
            <div className="col-span-3 text-center py-12 text-slate-400">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
              {search ? 'Bemor topilmadi' : (
                <div>
                  <p className="mb-3">Hali bemorlar yo'q</p>
                  <button onClick={() => setShowModal(true)}
                    className="text-sm text-sky-600 hover:underline">
                    Birinchi bemorni qo'shing →
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
