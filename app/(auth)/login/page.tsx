'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { connectSocket } from '@/lib/socket';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setToken } = useAuthStore();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(form);
      const { user, accessToken } = res.data;
      setUser(user);
      setToken(accessToken);
      if (accessToken) connectSocket(accessToken);
      const from = searchParams.get('from') || '/dashboard';
      router.push(from);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login yoki parol noto\'g\'ri');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-teal-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">MedCore</h1>
          <p className="text-slate-500 text-sm mt-1">Tibbiy boshqaruv tizimi</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Tizimga kirish</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Telefon raqam yoki Email
              </label>
              <input
                type="text"
                value={form.identifier}
                onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                placeholder="+998901234567 yoki email@example.com"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Parol</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-sky-600 text-white rounded-lg font-medium text-sm hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition mt-2"
            >
              {loading ? 'Tekshirilmoqda...' : 'Kirish'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center mb-3">Demo login ma'lumotlari (parol: Admin123!):</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { role: 'Super Admin', email: 'admin@mederp.uz' },
                { role: 'Klinika Admin', email: 'alisher@mederp.uz' },
                { role: 'Shifokor', email: 'nodira@mederp.uz' },
                { role: 'Bemor', email: 'malika@mederp.uz' },
              ].map((d) => (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => setForm({ identifier: d.email, password: 'Admin123!' })}
                  className="text-left p-2 bg-slate-50 hover:bg-sky-50 rounded-lg border border-slate-100 hover:border-sky-200 transition"
                >
                  <div className="font-medium text-slate-700">{d.role}</div>
                  <div className="text-slate-400 truncate">{d.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
