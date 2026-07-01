'use client';
import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { patientAssistantApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import {
  Activity, MapPin, Phone, ChevronRight, Heart,
  AlertCircle, CheckCircle, Clock, Stethoscope, Loader2,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const URGENCY = {
  LOW:       { label: 'Shoshilmas',   icon: CheckCircle,   cls: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  MEDIUM:    { label: "Tez murojaat", icon: Clock,         cls: 'text-amber-600 bg-amber-50 border-amber-200' },
  HIGH:      { label: 'Tezroq boring', icon: AlertCircle,  cls: 'text-orange-600 bg-orange-50 border-orange-200' },
  EMERGENCY: { label: 'Tez yordam!',  icon: AlertCircle,   cls: 'text-red-600 bg-red-50 border-red-200' },
};

const QUICK = [
  'Bosh og\'rig\'i va ko\'ngil aynishi',
  'Qorin og\'rig\'i va isitma 38°',
  'Yo\'tal va tomoq og\'rig\'i',
  'Nafas olishda qiyinchilik',
  'Umumiy holsizlik va charchash',
  'Uyqu buzilishi',
];

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**'))
      return <strong key={i} className="font-semibold text-slate-800">{p.slice(2, -2)}</strong>;
    if (p.startsWith('`') && p.endsWith('`'))
      return <code key={i} className="bg-slate-100 text-sky-700 px-1 rounded text-xs font-mono">{p.slice(1, -1)}</code>;
    return p;
  });
}

function MarkdownMessage({ content }: { content: string }) {
  const lines = content.split('\n');
  const nodes: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (line.startsWith('## ')) {
      nodes.push(<p key={i} className="font-bold text-slate-800 mt-3 mb-1">{renderInline(line.slice(3))}</p>);
    } else if (line.startsWith('- ')) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].slice(2));
        i++;
      }
      nodes.push(
        <ul key={`ul-${i}`} className="space-y-1.5 mt-1">
          {items.map((it, ii) => (
            <li key={ii} className="flex items-start gap-2 text-sm text-slate-600">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0" />
              <span>{renderInline(it)}</span>
            </li>
          ))}
        </ul>,
      );
      continue;
    } else {
      nodes.push(<p key={i} className="text-sm text-slate-600 leading-relaxed">{renderInline(line)}</p>);
    }
    i++;
  }
  return <>{nodes}</>;
}

const SYMPTOM_GUIDE = `## Simptomlarni aniq tasvirlang

- **Qachon boshlandi** — bugun, kecha, bir necha kun oldin
- **Harorat** bor bo'lsa aniq ayt: 37.5°, 38.2° va h.k.
- **Og'riq joyi** — bosh, qorin, ko'krak, orqa, bo'g'im...
- **Og'riq darajasi** — kuchli, o'rta, zaif (1–10 ball)
- **Boshqa alomatlar** — yo'tal, ko'ngil aynishi, holsizlik`;

function Cursor() {
  return <span className="inline-block w-0.5 h-4 bg-sky-500 ml-0.5 animate-pulse align-middle" />;
}

export default function PatientAssistantPage() {
  const { accessToken } = useAuthStore();
  const [step, setStep]           = useState<'input' | 'streaming' | 'result'>('input');
  const [symptoms, setSymptoms]   = useState('');
  const [streamText, setStreamText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [result, setResult]       = useState<any>(null);
  const [streamError, setStreamError] = useState('');
  const streamRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);

  const notifyMut = useMutation({
    mutationFn: () =>
      patientAssistantApi.notifyDoctor({
        patientId: 'ba000001-0000-0000-0000-000000000001',
        symptomSummary: symptoms,
        urgencyLevel: result?.assessment?.urgencyLevel || 'MEDIUM',
      }).then((r) => r.data),
  });

  useEffect(() => {
    streamRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [streamText]);

  async function startStream() {
    if (!symptoms.trim()) return;
    setStep('streaming');
    setStreamText('');
    setStreamError('');
    setIsStreaming(true);
    setResult(null);

    try {
      const res = await fetch(
        `${API_URL}/api/v1/patient-assistant/symptom-stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({ symptomText: symptoms }),
        },
      );

      if (!res.ok || !res.body) {
        throw new Error('Server bilan bog\'lanib bo\'lmadi');
      }

      const reader = res.body.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;
          try {
            const data = JSON.parse(raw);
            if (data.type === 'text') {
              setStreamText((p) => p + data.text);
            } else if (data.type === 'done') {
              setResult(data);
              setIsStreaming(false);
              setStep('result');
            } else if (data.type === 'error') {
              setStreamError(data.message || 'Xatolik');
              setIsStreaming(false);
            }
          } catch { /* skip bad chunks */ }
        }
      }
    } catch (e: any) {
      setStreamError(e.message || 'Ulanishda xatolik');
      setIsStreaming(false);
    }
  }

  function reset() {
    readerRef.current?.cancel().catch(() => {});
    setStep('input');
    setStreamText('');
    setResult(null);
    setStreamError('');
    setIsStreaming(false);
  }

  const urgencyCfg = result?.assessment?.urgencyLevel
    ? URGENCY[result.assessment.urgencyLevel as keyof typeof URGENCY] ?? URGENCY.MEDIUM
    : null;

  return (
    <div className="space-y-5 pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-sky-100 rounded-2xl flex items-center justify-center">
          <Heart className="w-5 h-5 text-sky-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">AI Yordamchi</h1>
          <p className="text-slate-400 text-xs mt-0.5">Simptomlarni baholash · Mutaxassis tavsiyasi</p>
        </div>
      </div>

      {/* ── STEP 1: INPUT ── */}
      {step === 'input' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
              </div>
              <span className="text-sm font-medium text-sky-700">AI Yordamchi maslahat beradi</span>
            </div>
            <MarkdownMessage content={SYMPTOM_GUIDE} />
          </div>

          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            rows={4}
            placeholder="Masalan: 2 kundan beri bosh og'riq, isitma 37.8°, uyqu yomon..."
            className="w-full p-4 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none bg-white"
          />

          <div>
            <p className="text-xs text-slate-400 mb-2">Tezkor tanlash:</p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK.map((q) => (
                <button
                  key={q}
                  onClick={() => setSymptoms(q)}
                  className={`text-left text-xs p-3 rounded-xl border transition ${
                    symptoms === q
                      ? 'bg-sky-50 border-sky-300 text-sky-700'
                      : 'bg-white border-slate-100 text-slate-600 hover:border-sky-200 hover:bg-sky-50'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startStream}
            disabled={!symptoms.trim()}
            className="w-full py-3.5 bg-sky-600 text-white rounded-2xl font-semibold hover:bg-sky-700 disabled:opacity-40 transition flex items-center justify-center gap-2 text-sm"
          >
            <Activity className="w-4 h-4" />
            AI bilan maslahatlashish
          </button>
        </div>
      )}

      {/* ── STEP 2: STREAMING ── */}
      {(step === 'streaming' || (step === 'result' && streamText)) && (
        <div className="space-y-4">
          {/* AI message bubble */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-sky-100 rounded-full flex items-center justify-center">
                <Heart className="w-3.5 h-3.5 text-sky-600" />
              </div>
              <span className="text-sm font-medium text-sky-700">AI Yordamchi</span>
              {isStreaming && (
                <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto">
                  <Loader2 className="w-3 h-3 animate-spin" /> Javob yozilmoqda...
                </span>
              )}
            </div>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {streamText}
              {isStreaming && <Cursor />}
            </p>
          </div>

          {/* Loading indicator while fetching structured data */}
          {!isStreaming && step === 'streaming' && (
            <div className="flex items-center gap-2 text-xs text-slate-400 px-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Natijalar tayyorlanmoqda...
            </div>
          )}

          {streamError && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-sm text-red-600">
              {streamError}
            </div>
          )}
        </div>
      )}

      {/* ── STEP 3: RESULT ── */}
      {step === 'result' && result && (
        <div className="space-y-4">
          {/* Urgency badge */}
          {urgencyCfg && (
            <div className={`rounded-2xl border p-4 flex items-center gap-3 ${urgencyCfg.cls}`}>
              <urgencyCfg.icon className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">{urgencyCfg.label}</p>
                <p className="text-xs mt-0.5 opacity-80">
                  {result.assessment?.recommendation}
                </p>
              </div>
            </div>
          )}

          {/* Possible conditions */}
          {result.assessment?.possibleConditions?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <h3 className="font-semibold text-slate-800 text-sm mb-3">
                Shifokor bilan muhokama qilish tavsiya etiladi
              </h3>
              <div className="space-y-2">
                {result.assessment.possibleConditions.map((c: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <span className="text-sm text-slate-700">{c.name}</span>
                    <span className="text-xs text-slate-400 bg-slate-50 px-2.5 py-0.5 rounded-full">
                      {c.probability}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched doctors from DB */}
          {result.doctors?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <h3 className="font-semibold text-slate-800 text-sm mb-3 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-sky-500" />
                Tavsiya etilgan mutaxassislar
              </h3>
              <div className="space-y-3">
                {result.doctors.map((doc: any, i: number) => (
                  <div
                    key={doc.id ?? i}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sky-700 font-bold text-sm">
                        {(doc.fullName || 'D')[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{doc.fullName}</p>
                      <p className="text-xs text-sky-600">{doc.specialization}</p>
                      {doc.department && (
                        <p className="text-xs text-slate-400">{doc.department}</p>
                      )}
                    </div>
                    {doc.phone && (
                      <a
                        href={`tel:${doc.phone}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-medium hover:bg-emerald-700 transition flex-shrink-0"
                      >
                        <Phone className="w-3 h-3" />
                        <span className="hidden sm:inline">{doc.phone}</span>
                        <span className="sm:hidden">Qo'ng'iroq</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 flex gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-amber-700 text-xs leading-relaxed">
              {result.disclaimer || 'Bu tizim yakuniy tibbiy tashxis qo\'ymaydi. Shifokorga murojaat qiling.'}
            </p>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => notifyMut.mutate()}
              disabled={notifyMut.isPending || notifyMut.isSuccess}
              className="py-3 bg-emerald-600 text-white rounded-2xl font-medium text-sm hover:bg-emerald-700 disabled:opacity-50 transition text-center"
            >
              {notifyMut.isSuccess ? '✅ Yuborildi' : notifyMut.isPending ? 'Yuborilmoqda...' : 'Shifokorga murojaat'}
            </button>
            <button
              onClick={reset}
              className="py-3 border border-slate-200 text-slate-600 rounded-2xl font-medium text-sm hover:bg-slate-50 transition"
            >
              Qaytish
            </button>
          </div>

          <button
            onClick={() => (window.location.href = '/patient/clinics')}
            className="w-full py-3 border border-sky-200 text-sky-600 rounded-2xl font-medium text-sm hover:bg-sky-50 transition flex items-center justify-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            Yaqin klinikalarni ko'rish
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
