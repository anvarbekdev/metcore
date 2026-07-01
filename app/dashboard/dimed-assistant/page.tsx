'use client';
import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { dimedApi } from '@/lib/api';
import { Send, Bot, User as UserIcon } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// ─── Lightweight Markdown Renderer ──────────────────────────────────────────
function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*|`(.+?)`/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[1] !== undefined) parts.push(<strong key={match.index} className="font-semibold">{match[1]}</strong>);
    if (match[2] !== undefined) parts.push(<code key={match.index} className="bg-slate-200 text-slate-700 px-1 rounded text-xs font-mono">{match[2]}</code>);
    last = regex.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function MarkdownMessage({ content }: { content: string }) {
  const lines = content.split('\n');
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      nodes.push(<hr key={i} className="my-3 border-slate-200" />);
      i++;
      continue;
    }

    // Heading ##
    if (/^###\s/.test(line)) {
      nodes.push(<p key={i} className="font-bold text-slate-800 mt-3 mb-1 text-sm">{renderInline(line.replace(/^###\s/, ''))}</p>);
      i++;
      continue;
    }
    if (/^##\s/.test(line)) {
      nodes.push(<p key={i} className="font-bold text-slate-800 mt-3 mb-1">{renderInline(line.replace(/^##\s/, ''))}</p>);
      i++;
      continue;
    }
    if (/^#\s/.test(line)) {
      nodes.push(<p key={i} className="font-bold text-slate-900 mt-2 mb-1 text-base">{renderInline(line.replace(/^#\s/, ''))}</p>);
      i++;
      continue;
    }

    // Blockquote
    if (/^>\s/.test(line)) {
      nodes.push(
        <div key={i} className="border-l-4 border-amber-400 bg-amber-50 pl-3 py-1.5 my-2 rounded-r-lg text-amber-800 text-xs">
          {renderInline(line.replace(/^>\s*/, ''))}
        </div>
      );
      i++;
      continue;
    }

    // Table: detect header row
    if (/^\|/.test(line)) {
      const tableLines: string[] = [];
      while (i < lines.length && /^\|/.test(lines[i])) {
        tableLines.push(lines[i]);
        i++;
      }
      const rows = tableLines.filter((r) => !/^\|[\s\-:|]+\|/.test(r));
      if (rows.length > 0) {
        const parseRow = (r: string) =>
          r.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1).map((c) => c.trim());

        const [headerRow, ...bodyRows] = rows;
        const headers = parseRow(headerRow);
        nodes.push(
          <div key={`tbl-${i}`} className="overflow-x-auto my-3 rounded-xl border border-slate-200">
            <table className="w-full text-xs">
              <thead className="bg-sky-50">
                <tr>
                  {headers.map((h, hi) => (
                    <th key={hi} className="px-3 py-2 text-left font-semibold text-sky-700 whitespace-nowrap">
                      {renderInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, ri) => (
                  <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    {parseRow(row).map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 text-slate-700 border-t border-slate-100">
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // List item
    if (/^[-*]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s/, ''));
        i++;
      }
      nodes.push(
        <ul key={`ul-${i}`} className="list-disc list-inside space-y-0.5 my-1 text-sm text-slate-700">
          {items.map((it, ii) => <li key={ii}>{renderInline(it)}</li>)}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
      }
      nodes.push(
        <ol key={`ol-${i}`} className="list-decimal list-inside space-y-0.5 my-1 text-sm text-slate-700">
          {items.map((it, ii) => <li key={ii}>{renderInline(it)}</li>)}
        </ol>
      );
      continue;
    }

    // Empty line → small gap
    if (line.trim() === '') {
      nodes.push(<div key={i} className="h-1" />);
      i++;
      continue;
    }

    // Plain paragraph
    nodes.push(<p key={i} className="text-sm leading-relaxed">{renderInline(line)}</p>);
    i++;
  }

  return <div className="space-y-0.5">{nodes}</div>;
}

// ────────────────────────────────────────────────────────────────────────────

export default function DimedAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Assalomu alaykum! Men **AI** yordamchiman. Tibbiy statistika va ma\'lumotlar bo\'yicha savollaringizga javob beraman.\n\nMasalan:\n- Bu hafta nechta bemor?\n- Navbat holati qanday?\n- Yuqori xavfli holatlar' },
  ]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [tab, setTab] = useState<'chat' | 'stats'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: stats } = useQuery({
    queryKey: ['dimed-stats'],
    queryFn: () => dimedApi.stats().then((r) => r.data),
  });

  const queryMut = useMutation({
    mutationFn: (q: string) => dimedApi.query({ question: q, sessionId }).then((r) => r.data),
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function sendMessage() {
    if (!input.trim() || queryMut.isPending) return;
    setMessages((prev) => [...prev, { role: 'user', content: input }]);
    queryMut.mutate(input);
    setInput('');
  }

  const weekData = [
    { day: 'Dush', bemorlar: 12 }, { day: 'Sesh', bemorlar: 18 },
    { day: 'Chor', bemorlar: 22 }, { day: 'Pay', bemorlar: 16 },
    { day: 'Jum', bemorlar: 25 }, { day: 'Shan', bemorlar: 10 },
    { day: 'Yak', bemorlar: 5 },
  ];

  const QUICK = ['Bu hafta nechta bemor?', 'Yuqori xavfli holatlar', 'Navbat holati', 'Bugungi jadval'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">AI Yordamchi</h1>
          <p className="text-slate-500 text-sm mt-1">24/7 tibbiy statistika va tavsiyalar</p>
        </div>
        <div className="flex rounded-xl border border-slate-200 overflow-hidden">
          {[{ id: 'chat', label: 'Chat' }, { id: 'stats', label: 'Statistika' }].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`px-5 py-2 text-sm font-medium transition ${
                tab === t.id ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'chat' ? (
        <div className="bg-white rounded-xl border shadow-sm flex flex-col" style={{ height: '68vh' }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  msg.role === 'assistant' ? 'bg-sky-100' : 'bg-slate-100'
                }`}>
                  {msg.role === 'assistant'
                    ? <Bot className="w-4 h-4 text-sky-600" />
                    : <UserIcon className="w-4 h-4 text-slate-600" />
                  }
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'assistant'
                    ? 'bg-slate-50 text-slate-800 rounded-tl-sm border border-slate-100'
                    : 'bg-sky-600 text-white rounded-tr-sm text-sm'
                }`}>
                  {msg.role === 'assistant'
                    ? <MarkdownMessage content={msg.content} />
                    : <span>{msg.content}</span>
                  }
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {queryMut.isPending && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-sky-600" />
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1.5 items-center h-5">
                    {[0, 0.15, 0.3].map((d, j) => (
                      <div key={j} className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
                        style={{ animationDelay: `${d}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-slate-100 p-4 space-y-2">
            <div className="flex gap-2 flex-wrap">
              {QUICK.map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); }}
                  className="text-xs px-3 py-1 bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-700 rounded-full transition"
                >
                  {q}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Savol bering..."
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || queryMut.isPending}
                className="px-4 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 disabled:opacity-50 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border p-5 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4">Haftalik bemorlar soni</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="bemorlar" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Bemorlar" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Jami bemorlar',  value: stats?.totalPatients ?? 0,       color: 'text-sky-600',     bg: 'bg-sky-50' },
              { label: 'Jami navbatlar', value: stats?.totalAppointments ?? 0,   color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Kutilayotgan',   value: stats?.pendingAppointments ?? 0,  color: 'text-orange-600',  bg: 'bg-orange-50' },
              { label: 'Yuqori xavf',    value: stats?.highRiskDiagnoses ?? 0,   color: 'text-red-600',     bg: 'bg-red-50' },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl border p-5 text-center ${s.bg}`}>
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-slate-500 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
