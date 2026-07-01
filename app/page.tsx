'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import {
  Brain,
  Zap,
  Bell,
  Smartphone,
  MessageCircle,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  MapPin,
  ChevronDown,
  Menu,
  X,
  Stethoscope,
  Scan,
  BarChart3,
  Globe,
  Lock,
  HeartPulse,
  Send,
  Phone,
  Star,
  ShieldCheck,
  Cpu,
  Layers,
  Users,
  Activity,
  ChevronRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface FAQItem { q: string; a: string; }

// ─── Static data ─────────────────────────────────────────────────────────────

const AI_MODULES = [
  {
    icon: MessageCircle,
    gradient: 'from-sky-500 to-blue-600',
    bg: 'bg-sky-50',
    accent: 'text-sky-600',
    title: 'AI Bemor Assistenti',
    desc: 'Bemorlar simptomlarini tasvirlab, kecha-kunduz 24/7 onlayn maslahat oladi. Navbat band qilish, klinika izlash — barchasi bir joyda.',
    badge: '24/7 faol',
  },
  {
    icon: Stethoscope,
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
    accent: 'text-emerald-600',
    title: 'Klinik Qaror Yordamchisi',
    desc: 'Shifokorga diagnosis qo\'yishda AI real-time ko\'mak beradi. Tibbiy tarix, simptomlar va laboratoriya natijalari asosida tavsiyalar.',
    badge: 'Shifokor uchun',
  },
  {
    icon: Scan,
    gradient: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50',
    accent: 'text-violet-600',
    title: 'Onko-AI Tasvir Tahlili',
    desc: 'MRT, KT, rentgen va mammografiya tasvirlarini AI 30 soniyada tahlil qiladi. Yuborishdan oldin shaxsiy ma\'lumotlar qo\'lda berkitiladi.',
    badge: 'Onkologiya',
  },
  {
    icon: BarChart3,
    gradient: 'from-orange-500 to-red-500',
    bg: 'bg-orange-50',
    accent: 'text-orange-600',
    title: 'Biznes Tahlil va Bashorat',
    desc: 'Klinika daromadi, bemor oqimi, shifokor yuklamasi va xavf omillarini AI tahlil qiladi. Ma\'lumotga asoslangan qarorlar qabul qiling.',
    badge: 'Daromad oshadi',
  },
];

const NOTIFICATIONS = [
  { label: 'In-App', desc: 'Real-time tizim ichida', color: 'from-sky-400 to-blue-500' },
  { label: 'Telegram Bot', desc: 'Shoshilinch xabarlar', color: 'from-blue-400 to-cyan-500' },
  { label: 'Push', desc: 'Telefon / brauzer', color: 'from-violet-400 to-purple-500' },
  { label: 'SMS', desc: 'Eslatma va tasdiqlash', color: 'from-emerald-400 to-teal-500' },
];

const IMPACTS = [
  { value: '3×', label: 'Bemor qabuli tezligi', desc: 'Navbat va hujjat boshqaruvi avtomatlashadi' },
  { value: '40%', label: 'Daromad o\'sishi', desc: 'AI tahlil orqali xizmatlarni to\'liq monetizatsiya qiling' },
  { value: '60%', label: 'Vaqt tejaladi', desc: 'Shifokorlar hujjat emas, bemorga e\'tibor qaratadi' },
  { value: '1 kun', label: 'Ishga tushish', desc: 'Server yo\'q, o\'rnatish yo\'q — bugun boshlang' },
];

const STEPS = [
  {
    n: '01',
    title: 'Ro\'yxatdan o\'ting',
    desc: 'Klinikangiz ma\'lumotlarini kiriting. 5 daqiqa — hisob tayyor.',
  },
  {
    n: '02',
    title: 'Tizimni sozlang',
    desc: 'Shifokorlar, bo\'limlar, jadval. AI modullar avtomatik faollashadi.',
  },
  {
    n: '03',
    title: 'Foyda ko\'ring',
    desc: 'Real-time ko\'rsatkichlar, AI tavsiyalar, daromad o\'sishi — birinchi kuni.',
  },
];

const PLANS = [
  {
    name: 'Starter',
    price: '990 000',
    period: 'oy',
    desc: 'Kichik va o\'rta klinikalar uchun',
    highlight: false,
    features: [
      '5 gacha shifokor',
      'Navbat boshqaruvi',
      'Bemor portali',
      'SMS + In-App bildirishnomalar',
      'Asosiy hisobotlar',
      '5 GB saqlash',
    ],
  },
  {
    name: 'Professional',
    price: '2 490 000',
    period: 'oy',
    desc: 'O\'sib borayotgan klinikalar uchun',
    highlight: true,
    features: [
      '25 gacha shifokor',
      'Barcha AI modullar',
      'Telegram Bot + Push',
      'Dori tekshiruvi',
      'Klinik qaror yordamchisi',
      'Biznes tahlil va bashorat',
      'API integratsiya',
      '50 GB saqlash',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Maxsus',
    period: '',
    desc: 'Katta tibbiy tarmaqlar uchun',
    highlight: false,
    features: [
      'Cheksiz shifokorlar',
      'Maxsus AI modellari',
      'Maxsus integratsiyalar',
      'Dedicated server opsiyasi',
      'SLA 99.9% uptime',
      'Shaxsiy menejer',
      'Cheksiz saqlash',
    ],
  },
];

const TESTIMONIALS = [
  {
    text: 'Tizimni joriy etganimizdan keyin kunlik bemor qabuli 2 barobar oshdi. Shifokorlarimiz hujjat emas, bemorga vaqt ajratmoqda.',
    name: 'Dr. Sardor Yusupov',
    role: 'Bosh shifokor, Toshkent',
    rating: 5,
  },
  {
    text: 'AI diagnostika yordamchisi ayniqsa yangi shifokorlarimizga katta qo\'llab-quvvatlash bo\'lmoqda. Dori tekshiruvi modulimiz xavfsizlikni tubdan oshirdi.',
    name: 'Nilufar Rahimova',
    role: 'Klinika direktori, Samarqand',
    rating: 5,
  },
  {
    text: 'Telegram bot orqali bildirishnomalar shifokorlarimizni doim xabardor qiladi. Muhim holatlar hech qachon e\'tibordan chetda qolmaydi.',
    name: 'Dr. Otabek Mirzayev',
    role: 'Kardiolog, Namangan',
    rating: 5,
  },
];

const FAQS: FAQItem[] = [
  {
    q: 'Tizimni o\'rnatish uchun texnik mutaxassis kerakmi?',
    a: 'Yo\'q. MedCore to\'liq bulutli (cloud) tizim. Server sotib olish, o\'rnatish yoki texnik mutaxassis jalb qilish shart emas. Brauzer orqali ishlaydi.',
  },
  {
    q: 'Mavjud ma\'lumotlarni ko\'chirish mumkinmi?',
    a: 'Ha. Bemor tarixi, shifokor ma\'lumotlari va boshqa ma\'lumotlarni import qilish imkoniyati mavjud. Bizning jamoa jarayonni to\'liq qo\'llab-quvvatlaydi.',
  },
  {
    q: 'Ma\'lumotlar xavfsizligi qanday ta\'minlanadi?',
    a: 'Barcha ma\'lumotlar AES-256 shifrlash bilan saqlanadi. Tibbiy ma\'lumotlar maxfiyligi standartlariga mos. Har kuni avtomatik zaxira nusxa (backup) olinadi.',
  },
  {
    q: 'Obunani istalgan vaqt bekor qilish mumkinmi?',
    a: 'Ha. Hech qanday uzoq muddatli shartnoma yo\'q. Oylik obuna sifatida ishlaydi, istalgan vaqt bekor qilishingiz mumkin.',
  },
  {
    q: 'AI modullar o\'zbek tilini tushunadi?',
    a: 'Ha. Barcha AI modullar o\'zbek, rus va ingliz tillarida ishlaydi. Bemor va shifokor o\'ziga qulay tilda muloqot qila oladi.',
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function CountUp({ target, suffix = '' }: { target: string; suffix?: string }) {
  const [display, setDisplay] = useState('0');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const num = parseInt(target.replace(/[^0-9]/g, ''));
    if (isNaN(num)) { setDisplay(target); return; }
    const observer = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      observer.disconnect();
      let cur = 0;
      const step = Math.max(1, Math.ceil(num / 50));
      const t = setInterval(() => {
        cur = Math.min(cur + step, num);
        setDisplay(cur.toLocaleString() + suffix);
        if (cur >= num) clearInterval(t);
      }, 25);
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, suffix]);

  return <span ref={ref}>{display}</span>;
}

function FAQRow({ q, a }: FAQItem) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-100 rounded-2xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-50 transition"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-slate-800 pr-6">{q}</span>
        <ChevronDown className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-6 pb-5 text-slate-500 text-sm leading-relaxed border-t border-slate-100 pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (isInitialized && user) {
      router.replace(user.role === 'PATIENT' ? '/patient' : '/dashboard');
    }
  }, [isInitialized, user, router]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  if (isInitialized && user) return null;

  return (
    <div className="min-h-screen bg-white text-slate-800 overflow-x-hidden">

      {/* ── Navbar ── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-500 text-lg">MedCore</span>
            <span className="text-sm font-semibold bg-gradient-to-r from-sky-500 to-emerald-500 bg-clip-text text-transparent -ml-1">AI-Hub</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            {[['#platform', 'Platforma'], ['#impact', 'Natijalar'], ['#pricing', 'Narxlar'], ['#faq', 'FAQ']].map(([href, label]) => (
              <a key={href} href={href} className="hover:text-sky-600 transition">{label}</a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition px-3 py-2">
              Kirish
            </Link>
            <a href="#demo" className="bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md hover:shadow-sky-500/30 hover:scale-[1.03] transition-all">
              Bepul Demo →
            </a>
          </div>

          <button className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-1">
            {[['#platform', 'Platforma'], ['#impact', 'Natijalar'], ['#pricing', 'Narxlar'], ['#faq', 'FAQ']].map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}
                className="block text-sm font-medium text-slate-700 hover:text-sky-600 py-2.5 border-b border-slate-50">{label}</a>
            ))}
            <div className="flex gap-3 pt-3">
              <Link href="/login" className="flex-1 text-center text-sm font-medium border border-slate-200 rounded-xl py-2.5 hover:bg-slate-50 transition">
                Kirish
              </Link>
              <a href="#demo" onClick={() => setMenuOpen(false)} className="flex-1 text-center text-sm font-bold bg-sky-600 text-white rounded-xl py-2.5 hover:bg-sky-700 transition">
                Demo
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-[#050d1a]">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-b from-sky-500/15 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/8 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-violet-500/8 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)', backgroundSize: '44px 44px' }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-24 text-center">

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-7">
            Klinikangizni{' '}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
              raqamli kelajakka
            </span>
            <br className="hidden sm:block" />
            olib kiring
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed">
            Tibbiyot muassasalari uchun yaratilgan{' '}
            <strong className="text-white">yagona AI platforma</strong> —
            aqlli diagnostika, avtomatik bildirishnomalar, bemor portali va biznes tahlili
            bir tizimda.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <a href="#demo"
              className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold px-9 py-4 rounded-2xl shadow-2xl shadow-sky-500/30 hover:shadow-sky-500/50 hover:scale-[1.04] transition-all text-base">
              Bepul Demo So'rash
              <ArrowRight className="w-5 h-5" />
            </a>
            <a href="#platform"
              className="inline-flex items-center justify-center gap-2 text-slate-300 hover:text-white border border-white/15 hover:border-white/30 px-9 py-4 rounded-2xl transition text-base font-medium">
              Qanday ishlashini ko'ring
              <ChevronDown className="w-4 h-4" />
            </a>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { v: '24/7', l: 'AI ishlaydi' },
              { v: '4', l: 'AI modul' },
              { v: '4', l: 'Bildirishnoma kanali' },
              { v: '1 kun', l: 'O\'rnatish' },
            ].map(({ v, l }) => (
              <div key={l} className="bg-white/5 border border-white/8 rounded-2xl px-4 py-5 backdrop-blur-sm">
                <div className="text-2xl font-black text-white mb-1">{v}</div>
                <div className="text-xs text-slate-400">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ── TRUST STRIP ── */}
      <section className="py-14 px-4 bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm text-slate-400 font-medium uppercase tracking-widest mb-8">
            O'zbekiston klinikalari ishonadi
          </p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 items-center">
            {[
              'Shifobaxsh Klinikasi',
              'Nur-Hayot Medical',
              'Al-Farabi Tibbiyot Markazi',
              'Baraka Health Center',
              'Hilol Diagnostika',
            ].map((name) => (
              <div key={name} className="flex items-center gap-2">
                <div className="w-7 h-7 bg-gradient-to-br from-sky-100 to-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <HeartPulse className="w-3.5 h-3.5 text-sky-600" />
                </div>
                <span className="text-slate-500 font-semibold text-sm">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORM / AI MODULES ── */}
      <section id="platform" className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-600 uppercase tracking-widest bg-sky-50 border border-sky-100 px-4 py-2 rounded-full mb-5">
              <Cpu className="w-3.5 h-3.5" />
              AI Platforma
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mb-5">
              Tibbiyot uchun{' '}
              <span className="bg-gradient-to-r from-sky-500 to-emerald-500 bg-clip-text text-transparent">
                to'rt qudratli modul
              </span>
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              AI asosida yaratilgan modullar klinikangiz barcha qatlamlarini qamrab oladi —
              shifokordan boshlab, bemorga qadar.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {AI_MODULES.map(({ icon: Icon, gradient, bg, accent, title, desc, badge }) => (
              <div key={title}
                className="group relative bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden">
                {/* Hover gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity rounded-3xl`} />

                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${bg} ${accent} border border-current/10`}>
                      {badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
                  <p className="text-slate-500 leading-relaxed">{desc}</p>
                  <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-slate-400 group-hover:text-sky-600 transition">
                    Ko'proq bilish <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NOTIFICATIONS ── */}
      <section className="py-24 px-4 bg-[#050d1a] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-widest bg-sky-500/10 border border-sky-500/20 px-4 py-2 rounded-full mb-6">
                <Bell className="w-3.5 h-3.5" />
                Bildirishnomalar
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">
                To'rt kanalda —
                <br />
                <span className="text-sky-400">hech qachon o'tkazib yubormang</span>
              </h2>
              <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                Muhim tibbiy voqealar shifokor va bemorlarni barcha qurilmalari orqali
                bir vaqtda xabardor qiladi. Telegram, Push, SMS, In-App —
                barchasi avtomatik.
              </p>
              <div className="space-y-4">
                {[
                  { t: 'CRITICAL', d: 'Barcha 4 kanal bir vaqtda', c: 'bg-red-500/20 text-red-400 border-red-500/30' },
                  { t: 'HIGH', d: 'Telegram majburiy qo\'shiladi', c: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
                  { t: 'NORMAL', d: 'Tanlangan kanallar', c: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
                ].map(({ t, d, c }) => (
                  <div key={t} className={`flex items-center justify-between px-5 py-3.5 rounded-2xl border ${c}`}>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm">{t}</span>
                      <span className="text-xs opacity-70">{d}</span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 opacity-70" />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {NOTIFICATIONS.map(({ label, desc, color }) => (
                <div key={label}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition group">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div className="font-bold text-white mb-1">{label}</div>
                  <div className="text-sm text-slate-400">{desc}</div>
                </div>
              ))}

              {/* Live preview card */}
              <div className="col-span-2 bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">Jonli misol</span>
                </div>
                <div className="space-y-2">
                  {[
                    { c: 'border-red-500/40 bg-red-500/5', l: '🚨 CRITICAL', t: 'Bemor qon bosimi kritik darajada — Dr. Yusupovga yuborildi' },
                    { c: 'border-sky-500/40 bg-sky-500/5', l: '✅ SENT', t: 'Telegram + Push + SMS + In-App — 0.3 sek' },
                  ].map(({ c, l, t }) => (
                    <div key={l} className={`flex items-start gap-3 border ${c} rounded-xl px-4 py-3`}>
                      <span className="text-xs font-bold text-slate-300 whitespace-nowrap pt-0.5">{l}</span>
                      <span className="text-xs text-slate-400">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PATIENT PORTAL ── */}
      <section className="py-24 px-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Phone mockup */}
            <div className="relative flex justify-center order-2 lg:order-1">
              <div className="w-72 bg-gradient-to-b from-slate-900 to-slate-800 rounded-[2.5rem] p-2 shadow-2xl shadow-slate-900/40">
                <div className="bg-slate-50 rounded-[2rem] overflow-hidden">
                  <div className="bg-gradient-to-r from-sky-600 to-blue-700 px-5 pt-4 pb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <HeartPulse className="w-5 h-5 text-white" />
                        <span className="text-white font-bold text-sm">MedERP</span>
                      </div>
                      <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                    </div>
                    <p className="text-white/70 text-xs">Salom, Akbar 👋</p>
                    <p className="text-white font-semibold mt-0.5">Bugun qanday yordam kerak?</p>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="bg-sky-50 rounded-2xl rounded-tl-sm p-3.5">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Brain className="w-3.5 h-3.5 text-sky-600" />
                        <span className="text-xs font-bold text-sky-600">AI Maslahatchisi</span>
                      </div>
                      <p className="text-xs text-slate-700">Simptomlaringizni yozing, darhol maslahat beraman...</p>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-2xl p-3.5 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-800">Navbatingiz</span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">Holda</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-sky-100 rounded-xl flex items-center justify-center">
                          <Stethoscope className="w-4 h-4 text-sky-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">Dr. Karimov</p>
                          <p className="text-xs text-slate-400">Bugun, 14:30</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-2xl p-3.5 shadow-sm flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-slate-800">Shifobaxsh Klinikasi</p>
                        <p className="text-xs text-slate-400">1.2 km · 4.9 ⭐</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex border-t border-slate-100 bg-white">
                    {[
                      { icon: Activity, l: 'Bosh' },
                      { icon: MessageCircle, l: 'AI', a: true },
                      { icon: Clock, l: 'Navbat' },
                      { icon: MapPin, l: 'Klinika' },
                    ].map(({ icon: I, l, a }) => (
                      <div key={l} className="flex-1 flex flex-col items-center py-2.5 gap-1">
                        <I className={`w-4 h-4 ${a ? 'text-sky-600' : 'text-slate-300'}`} />
                        <span className={`text-[10px] ${a ? 'text-sky-600 font-semibold' : 'text-slate-300'}`}>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -right-4 top-16 bg-white rounded-2xl shadow-xl border border-slate-100 p-3.5 w-52">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">Telegram Bot</span>
                </div>
                <p className="text-xs text-slate-500">Navbat 2 soatdan keyin. Eslatma yuborildi ✅</p>
              </div>

              <div className="absolute -left-6 bottom-20 bg-white rounded-2xl shadow-xl border border-slate-100 p-3.5 w-48">
                <div className="flex items-center gap-2 mb-1.5">
                  <Brain className="w-4 h-4 text-sky-600" />
                  <span className="text-xs font-bold text-slate-800">AI Tahlil</span>
                </div>
                <p className="text-xs text-slate-500">Bugungi bemor qabuli: <strong className="text-slate-700">↑ 23%</strong></p>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full mb-6">
                <Smartphone className="w-3.5 h-3.5" />
                Bemor Portali
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6">
                Bemorlaringiz uchun
                <br />
                <span className="text-emerald-600">premium tajriba</span>
              </h2>
              <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                Bemorlar endi telefon qilishga hojat yo'q.
                Mobil qurilmadan hamma narsani hal qiladi — navbat, maslahat, klinika.
              </p>
              <div className="space-y-5">
                {[
                  { icon: Brain, t: '24/7 AI maslahati', d: 'Istalgan vaqt simptomlar tahlili va yo\'naltirish' },
                  { icon: MapPin, t: 'Yaqin klinikalar', d: 'GPS asosida eng yaqin klinikani ko\'rsatadi' },
                  { icon: Clock, t: 'Navbat tarixi', d: 'Barcha o\'tgan va kelayotgan navbatlar ko\'rinadi' },
                  { icon: Globe, t: 'Har qanday qurilmada', d: 'iOS, Android, desktop — maxsus app shart emas' },
                ].map(({ icon: I, t, d }) => (
                  <div key={t} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                      <I className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{t}</div>
                      <div className="text-sm text-slate-500 mt-0.5">{d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BUSINESS IMPACT ── */}
      <section id="impact" className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 border border-orange-100 px-4 py-2 rounded-full mb-5">
              <TrendingUp className="w-3.5 h-3.5" />
              Biznes natijalar
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mb-5">
              Raqamlarda isbotlangan
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">natijalar</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Tizimni joriy etgan klinikalar o'rtacha 90 kun ichida
              to'liq investitsiya qaytimini kuzatadi.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {IMPACTS.map(({ value, label, desc }) => (
              <div key={label} className="bg-gradient-to-b from-slate-50 to-white border border-slate-100 rounded-3xl p-8 text-center shadow-sm hover:shadow-md transition">
                <div className="text-4xl sm:text-5xl font-black bg-gradient-to-br from-sky-500 to-blue-600 bg-clip-text text-transparent mb-3">
                  {value}
                </div>
                <div className="font-bold text-slate-800 mb-2">{label}</div>
                <div className="text-sm text-slate-500 leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>

          {/* SaaS advantages */}
          <div className="bg-gradient-to-br from-sky-600 to-blue-700 rounded-3xl p-8 sm:p-12">
            <div className="grid sm:grid-cols-3 gap-8">
              <div>
                <div className="text-sm font-bold text-sky-200 uppercase tracking-widest mb-4">SaaS Modeli</div>
                <h3 className="text-2xl font-black text-white mb-4">
                  Kapital xarajat yo'q
                </h3>
                <p className="text-sky-100 leading-relaxed">
                  Server, litsenziya, texnik xodim — bularning hech biriga pul sarflamang.
                  Faqat oylik obuna to'lang va foyda ko'ring.
                </p>
              </div>
              <div className="sm:col-span-2 grid sm:grid-cols-2 gap-4">
                {[
                  { icon: Zap, t: 'Tezkor ishga tushish', d: 'Bugun ro\'yxatdan o\'ting, ertaga ish boshlang' },
                  { icon: TrendingUp, t: 'Miqyos bilan o\'sing', d: '5 dan 500 shifokorga — bir xil narx formulasi' },
                  { icon: ShieldCheck, t: 'Doim yangi versiya', d: 'Barcha yangilanishlar avtomatik, bepul' },
                  { icon: Layers, t: 'Integratsiya', d: 'Laboratoriya, aptek, sug\'urta tizimlari bilan' },
                ].map(({ icon: I, t, d }) => (
                  <div key={t} className="bg-white/10 rounded-2xl p-5 border border-white/15">
                    <I className="w-6 h-6 text-sky-300 mb-3" />
                    <div className="font-bold text-white text-sm mb-1">{t}</div>
                    <div className="text-xs text-sky-200 leading-relaxed">{d}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-violet-600 uppercase tracking-widest bg-violet-50 border border-violet-100 px-4 py-2 rounded-full mb-6">
            <Zap className="w-3.5 h-3.5" />
            Boshlash jarayoni
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-5">
            Uch qadamda ishga tushing
          </h2>
          <p className="text-slate-500 text-lg mb-16 max-w-xl mx-auto">
            Texnik bilim kerak emas. Biz hamma narsani o'rnatib, sozlab beramiz.
          </p>

          <div className="grid sm:grid-cols-3 gap-8 relative">
            <div className="hidden sm:block absolute top-10 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-sky-200 via-blue-300 to-emerald-200" />
            {STEPS.map(({ n, title, desc }) => (
              <div key={n} className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-sky-500/25 relative z-10">
                  <span className="text-2xl font-black text-white">{n}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
                <p className="text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-widest bg-amber-50 border border-amber-100 px-4 py-2 rounded-full mb-5">
              <Star className="w-3.5 h-3.5" />
              Mijozlar fikri
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
              Shifokorlar va direktorlar nima deydi
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ text, name, role, rating }) => (
              <div key={name} className="bg-slate-50 border border-slate-100 rounded-3xl p-7 hover:shadow-md transition">
                <div className="flex gap-0.5 mb-5">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 leading-relaxed mb-6 text-sm">&ldquo;{text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-sm">{name}</div>
                    <div className="text-xs text-slate-400">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 px-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-600 uppercase tracking-widest bg-sky-50 border border-sky-100 px-4 py-2 rounded-full mb-5">
              <Layers className="w-3.5 h-3.5" />
              Narxlar
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
              Klinikangiz uchun to'g'ri tarif
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Barcha tariflar 14 kunlik bepul sinov bilan keladi. Kredit karta shart emas.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {PLANS.map(({ name, price, period, desc, highlight, features }) => (
              <div key={name}
                className={`relative rounded-3xl p-8 border transition ${
                  highlight
                    ? 'bg-gradient-to-b from-sky-600 to-blue-700 border-transparent shadow-2xl shadow-sky-500/30 scale-[1.03]'
                    : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
                }`}>
                {highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wide">
                    Eng mashhur
                  </div>
                )}
                <div className={`text-sm font-bold mb-2 ${highlight ? 'text-sky-200' : 'text-sky-600'}`}>{name}</div>
                <div className={`mb-1 ${highlight ? 'text-white' : 'text-slate-900'}`}>
                  {price === 'Maxsus' ? (
                    <span className="text-3xl font-black">Maxsus narx</span>
                  ) : (
                    <>
                      <span className="text-3xl font-black">{price}</span>
                      <span className={`text-sm ml-1 ${highlight ? 'text-sky-200' : 'text-slate-400'}`}>
                        UZS/{period}
                      </span>
                    </>
                  )}
                </div>
                <p className={`text-sm mb-7 ${highlight ? 'text-sky-200' : 'text-slate-500'}`}>{desc}</p>
                <ul className="space-y-3 mb-8">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle className={`w-4 h-4 flex-shrink-0 ${highlight ? 'text-sky-300' : 'text-emerald-500'}`} />
                      <span className={highlight ? 'text-sky-100' : 'text-slate-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <a href="#demo"
                  className={`block text-center py-3 rounded-2xl font-bold text-sm transition ${
                    highlight
                      ? 'bg-white text-blue-700 hover:bg-sky-50'
                      : 'bg-sky-600 text-white hover:bg-sky-700'
                  }`}>
                  {price === 'Maxsus' ? 'Bog\'lanish' : 'Bepul boshlash'}
                </a>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-slate-400 mt-8">
            Barcha narxlar QQS siz. Oylik obuna — istalgan vaqt bekor qilishingiz mumkin.
          </p>
        </div>
      </section>

      {/* ── TECH ── */}
      <section className="py-14 px-4 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-7">
            Zamonaviy texnologiyalar asosida qurilgan
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              ['NestJS', 'bg-red-50 text-red-600 border-red-100'],
              ['Next.js 14', 'bg-slate-100 text-slate-700 border-slate-200'],
              ['Claude AI', 'bg-orange-50 text-orange-600 border-orange-100'],
              ['PostgreSQL', 'bg-blue-50 text-blue-600 border-blue-100'],
              ['TypeScript', 'bg-blue-50 text-blue-700 border-blue-100'],
              ['WebSocket', 'bg-violet-50 text-violet-600 border-violet-100'],
              ['Telegram Bot API', 'bg-sky-50 text-sky-600 border-sky-100'],
              ['PWA', 'bg-emerald-50 text-emerald-600 border-emerald-100'],
            ].map(([name, cls]) => (
              <span key={name} className={`px-5 py-2 rounded-xl border text-sm font-semibold ${cls}`}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 px-4 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Ko'p so'raladigan savollar</h2>
            <p className="text-slate-500">Javob topa olmadingizmi? <a href="#demo" className="text-sky-600 font-medium hover:underline">Bizga yozing →</a></p>
          </div>
          <div className="space-y-3">
            {FAQS.map((item) => <FAQRow key={item.q} {...item} />)}
          </div>
        </div>
      </section>

      {/* ── DEMO CTA ── */}
      <section id="demo" className="py-24 px-4 bg-[#0b5de1] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-sky-500/12 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-5">
              Bugun boshlab<br />
              <span className="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
                kelajakda ishlang
              </span>
            </h2>
            <p className="text-slate-300 text-lg max-w-xl mx-auto">
              14 kunlik bepul sinov. Kredit karta shart emas.
              Mutaxassisimiz sizga shaxsan yordam beradi.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl max-w-lg mx-auto">
            <h3 className="text-xl font-black text-slate-900 mb-7 text-center">Bepul Demo So'rash</h3>
            <div className="space-y-4">
              {[
                { label: 'Ism va Familiya', type: 'text', placeholder: 'Abdullayev Jasur' },
                { label: 'Telefon', type: 'tel', placeholder: '+998 90 123 45 67' },
                { label: 'Klinika nomi', type: 'text', placeholder: 'Shifobaxsh Klinikasi' },
              ].map(({ label, type, placeholder }) => (
                <div key={label}>
                  <label className="text-sm font-semibold text-slate-700 mb-1.5 block">{label}</label>
                  <input type={type} placeholder={placeholder}
                    className="w-full px-4 py-3.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition" />
                </div>
              ))}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Shifokorlar soni</label>
                <select className="w-full px-4 py-3.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition bg-white text-slate-600">
                  <option value="">Tanlang</option>
                  <option>1–5 nafar</option>
                  <option>6–20 nafar</option>
                  <option>21–50 nafar</option>
                  <option>50+ nafar</option>
                </select>
              </div>
              <button type="button"
                onClick={() => alert('Rahmat! Tez orada siz bilan bog\'lanamiz.')}
                className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black py-4 rounded-2xl hover:shadow-xl hover:shadow-sky-500/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-base mt-2">
                <Send className="w-5 h-5" />
                Demo So'rash — Bepul
              </button>
              <p className="text-xs text-slate-400 text-center">24 soat ichida javob. Spam yo'q.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <a href="tel:+998901234567"
              className="inline-flex items-center gap-2.5 bg-white/8 border border-white/15 text-white px-7 py-3.5 rounded-2xl hover:bg-white/15 transition font-medium text-sm">
              <Phone className="w-4 h-4" />
              +998 90 123 45 67
            </a>
            <a href="https://t.me/mederp_uz"
              className="inline-flex items-center gap-2.5 bg-white/8 border border-white/15 text-white px-7 py-3.5 rounded-2xl hover:bg-white/15 transition font-medium text-sm">
              <Send className="w-4 h-4" />
              @mederp_uz
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#030a14] text-slate-400 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-4 gap-10 mb-12">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <HeartPulse className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-white text-lg">MedERP</span>
                  <span className="ml-1 text-sm font-semibold text-sky-400">AI-Hub</span>
                </div>
              </div>
              <p className="text-sm leading-relaxed max-w-xs">
                O'zbekistondagi klinikalar uchun yaratilgan AI-powered tibbiy ERP platformasi.
                Raqamli kelajak — bugun.
              </p>
              <div className="flex items-center gap-1.5 mt-4">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs text-emerald-400 font-medium">Ma'lumotlar AES-256 bilan himoyalangan</span>
              </div>
            </div>
            <div>
              <div className="text-sm font-bold text-white mb-5">Platforma</div>
              <ul className="space-y-3 text-sm">
                {['AI Modullar', 'Bildirishnomalar', 'Bemor Portali', 'Biznes Tahlil', 'Narxlar'].map((l) => (
                  <li key={l}><a href="#platform" className="hover:text-white transition">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-sm font-bold text-white mb-5">Aloqa</div>
              <ul className="space-y-3 text-sm">
                <li><a href="tel:+998901234567" className="hover:text-white transition">+998 90 123 45 67</a></li>
                <li><a href="mailto:info@mederp.uz" className="hover:text-white transition">info@mederp.uz</a></li>
                <li><a href="https://t.me/mederp_uz" className="hover:text-white transition">Telegram: @mederp_uz</a></li>
                <li className="pt-2">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-xs font-medium">Hozir online</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs">© 2025 MedCore. Barcha huquqlar himoyalangan.</p>
            <div className="flex items-center gap-5 text-xs">
              <a href="#" className="hover:text-white transition">Maxfiylik siyosati</a>
              <a href="#" className="hover:text-white transition">Foydalanish shartlari</a>
              <Link href="/login" className="text-sky-400 hover:text-sky-300 font-medium transition">
                Tizimga kirish →
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
