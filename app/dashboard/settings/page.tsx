'use client';
import { useAuthStore } from '@/lib/store';
import { notificationsApi } from '@/lib/api';
import { useState, useEffect } from 'react';
import { Bell, Shield, User, Smartphone } from 'lucide-react';

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const bytes = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) bytes[i] = rawData.charCodeAt(i);
  return bytes.buffer as ArrayBuffer;
}

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [pushEnabled, setPushEnabled] = useState(false);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.ready.then(async (reg) => {
      const existing = await reg.pushManager.getSubscription();
      if (existing) setPushEnabled(true);
    });
  }, []);

  async function enablePush() {
    if (!('Notification' in window)) {
      setMsg('❌ Brauzer push bildirishnomalarni qo\'llab-quvvatlamaydi');
      return;
    }

    setLoading(true);
    setMsg('');
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        setMsg('❌ Bildirishnomaga ruxsat berilmadi. Brauzer sozlamalaridan ruxsat bering.');
        return;
      }

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY;
      if (!vapidKey) {
        setMsg('❌ VAPID kaliti topilmadi — .env.local faylini tekshiring');
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      await notificationsApi.savePushSubscription(sub.toJSON());
      setPushEnabled(true);
      setMsg('✅ Push bildirishnomalar yoqildi!');
    } catch (err: any) {
      setMsg(`❌ Xatolik: ${err.message || 'Noma\'lum xatolik'}`);
    } finally {
      setLoading(false);
    }
  }

  async function disablePush() {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();
      setPushEnabled(false);
      setMsg('Push bildirishnomalar o\'chirildi');
    } catch {
      setMsg('❌ O\'chirishda xatolik');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Sozlamalar</h1>
        <p className="text-slate-500 text-sm mt-1">Profil va bildirishnoma sozlamalari</p>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-sm border ${
          msg.startsWith('❌')
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-sky-50 border-sky-200 text-sky-700'
        }`}>{msg}</div>
      )}

      <div className="bg-white rounded-xl border shadow-sm divide-y divide-slate-100">
        {/* Profil */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-slate-500" />
            <h3 className="font-semibold text-slate-800">Profil ma'lumotlari</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'To\'liq ism', value: user?.fullName },
              { label: 'Telefon', value: user?.phone },
              { label: 'Email', value: user?.email },
              { label: 'Rol', value: user?.role },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                <p className="text-sm font-medium text-slate-700">{item.value || '—'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Push bildirishnomalar */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-slate-500" />
            <h3 className="font-semibold text-slate-800">Push Bildirishnomalar</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Brauzer push bildirishnomalar</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {pushEnabled
                    ? 'Brauzer orqali real-time xabarnomalar yoqilgan'
                    : 'Brauzer orqali real-time xabarnomalar olish'}
                </p>
              </div>
              <button
                onClick={pushEnabled ? disablePush : enablePush}
                disabled={loading}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition disabled:opacity-50 ${
                  pushEnabled
                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                    : 'bg-sky-600 text-white hover:bg-sky-700'
                }`}
              >
                {loading ? '...' : pushEnabled ? 'O\'chirish' : 'Yoqish'}
              </button>
            </div>

            {!pushEnabled && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                <strong>Qanday ishlaydi:</strong> "Yoqish" tugmasini bosing → brauzer ruxsat so'raydi →
                Qabul qiling → Endi barcha tizim xabarlari brauzeringizga keladi.
              </div>
            )}
          </div>
        </div>

        {/* Telegram */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Smartphone className="w-5 h-5 text-slate-500" />
            <h3 className="font-semibold text-slate-800">Telegram Bot</h3>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-sm text-slate-600 mb-3">
              Telegram botimizni ulang va xabarnomalarni Telegram'da oling:
            </p>
            <a
              href={`https://t.me/MedERPBot?start=${user?.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#229ED9] text-white rounded-xl text-sm font-medium hover:opacity-90 transition"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.05 9.66c-.15.698-.543.869-1.1.54l-3.042-2.24-1.468 1.413c-.162.162-.298.298-.612.298l.218-3.093 5.63-5.086c.245-.218-.053-.338-.38-.12L6.67 14.37l-2.998-.936c-.652-.204-.665-.652.136-.965l11.695-4.51c.542-.196 1.017.12.859.962z" />
              </svg>
              Telegram botga ulash
            </a>
          </div>
        </div>

        {/* Xavfsizlik */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-slate-500" />
            <h3 className="font-semibold text-slate-800">Xavfsizlik</h3>
          </div>
          <p className="text-sm text-slate-500">Parolni o'zgartirish va ikki bosqichli tasdiq (keyinchalik)</p>
        </div>
      </div>
    </div>
  );
}
