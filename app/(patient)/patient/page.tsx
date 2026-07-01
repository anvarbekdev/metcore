'use client';
import Link from 'next/link';
import { MessageCircle, MapPin, Calendar, Phone } from 'lucide-react';

export default function PatientHomePage() {
  return (
    <div className="space-y-6 pt-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800">Salom! 👋</h1>
        <p className="text-slate-500 mt-1">Bugun qanday yordam kerak?</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/patient/assistant" className="bg-sky-600 text-white rounded-2xl p-5 hover:bg-sky-700 transition">
          <MessageCircle className="w-8 h-8 mb-3 opacity-90" />
          <p className="font-semibold">AI Yordamchi</p>
          <p className="text-sky-100 text-xs mt-0.5">Simptomlarni tekshiring</p>
        </Link>

        <Link href="/patient/clinics" className="bg-emerald-600 text-white rounded-2xl p-5 hover:bg-emerald-700 transition">
          <MapPin className="w-8 h-8 mb-3 opacity-90" />
          <p className="font-semibold">Klinikalar</p>
          <p className="text-emerald-100 text-xs mt-0.5">Yaqin klinikani toping</p>
        </Link>

        <Link href="/patient/appointments" className="bg-violet-600 text-white rounded-2xl p-5 hover:bg-violet-700 transition">
          <Calendar className="w-8 h-8 mb-3 opacity-90" />
          <p className="font-semibold">Navbatlarim</p>
          <p className="text-violet-100 text-xs mt-0.5">Navbat holati</p>
        </Link>

        <a href="tel:+998712345678" className="bg-orange-500 text-white rounded-2xl p-5 hover:bg-orange-600 transition">
          <Phone className="w-8 h-8 mb-3 opacity-90" />
          <p className="font-semibold">Tez yordam</p>
          <p className="text-orange-100 text-xs mt-0.5">103 yoki klinika</p>
        </a>
      </div>

      <div className="bg-white rounded-2xl border p-5">
        <h3 className="font-semibold text-slate-800 mb-3">Muhim eslatma</h3>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-amber-800 text-sm">
            ⚠️ Bu tizim tibbiy maslahat uchun mo'ljallangan. Favqulodda holatlarda darhol 103 ga qo'ng'iroq qiling.
          </p>
        </div>
      </div>
    </div>
  );
}
