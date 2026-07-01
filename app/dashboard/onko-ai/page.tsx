'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { onkoAiApi } from '@/lib/api';
import { Upload, AlertTriangle, CheckCircle, Clock, Shield, Loader2, Send, RefreshCw, Undo2, Trash2 } from 'lucide-react';

const RISK_CONFIG = {
  LOW:      { label: 'Past xavf',   class: 'medical-badge-low' },
  MEDIUM:   { label: "O'rta xavf",  class: 'medical-badge-medium' },
  HIGH:     { label: 'Yuqori xavf', class: 'medical-badge-high' },
  CRITICAL: { label: 'Kritik',      class: 'medical-badge-critical' },
};

interface Rect { x: number; y: number; w: number; h: number }

// ── Manual redaction canvas ───────────────────────────────────────────────

function RedactionCanvas({
  file,
  onConfirm,
  onCancel,
  isPending,
}: {
  file: File;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef    = useRef<HTMLImageElement | null>(null);
  const [rects, setRects]         = useState<Rect[]>([]);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [liveRect, setLiveRect]   = useState<Rect | null>(null);

  // Load image onto canvas once
  useEffect(() => {
    const url = URL.createObjectURL(file);
    const img  = new Image();
    img.onload = () => {
      imgRef.current = img;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const MAX   = 1200;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      drawAll([]);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [file]);

  function drawAll(rs: Rect[], extra?: Rect) {
    const canvas = canvasRef.current;
    const img    = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(220, 38, 38, 0.93)';
    for (const r of rs)    ctx.fillRect(r.x, r.y, r.w, r.h);
    if (extra)              ctx.fillRect(extra.x, extra.y, extra.w, extra.h);
  }

  function canvasCoords(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const br     = canvas.getBoundingClientRect();
    const sx     = canvas.width  / br.width;
    const sy     = canvas.height / br.height;
    return {
      x: (e.clientX - br.left) * sx,
      y: (e.clientY - br.top)  * sy,
    };
  }

  function onMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    if (isPending) return;
    setDragStart(canvasCoords(e));
    setLiveRect(null);
  }

  function onMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!dragStart) return;
    const { x, y } = canvasCoords(e);
    const r: Rect = {
      x: Math.min(dragStart.x, x),
      y: Math.min(dragStart.y, y),
      w: Math.abs(x - dragStart.x),
      h: Math.abs(y - dragStart.y),
    };
    setLiveRect(r);
    drawAll(rects, r);
  }

  function onMouseUp(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!dragStart) return;
    const { x, y } = canvasCoords(e);
    const r: Rect = {
      x: Math.min(dragStart.x, x),
      y: Math.min(dragStart.y, y),
      w: Math.abs(x - dragStart.x),
      h: Math.abs(y - dragStart.y),
    };
    // Ignore tiny accidental clicks
    if (r.w > 4 && r.h > 4) {
      const next = [...rects, r];
      setRects(next);
      drawAll(next);
    }
    setDragStart(null);
    setLiveRect(null);
  }

  function undo() {
    const next = rects.slice(0, -1);
    setRects(next);
    drawAll(next);
  }

  function clearAll() {
    setRects([]);
    drawAll([]);
  }

  function handleConfirm() {
    const canvas = canvasRef.current!;
    canvas.toBlob((blob) => { if (blob) onConfirm(blob); }, 'image/jpeg', 0.92);
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Toolbar */}
      <div className="bg-slate-50 border-b border-slate-100 px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-sky-600" />
          <span className="text-sm font-semibold text-slate-700">Shaxsiy ma'lumotlarni berkiting</span>
          <span className="text-xs text-slate-400 hidden sm:inline">— yashirmoqchi bo'lgan joyni torting</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={!rects.length || isPending}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition"
          >
            <Undo2 className="w-3.5 h-3.5" />
            Orqaga
          </button>
          <button
            onClick={clearAll}
            disabled={!rects.length || isPending}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-600 border border-red-100 rounded-lg hover:bg-red-50 disabled:opacity-40 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Tozalash
          </button>
          {rects.length > 0 && (
            <span className="text-xs bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full">
              {rects.length} ta berkitildi
            </span>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="bg-slate-800 flex items-center justify-center overflow-auto" style={{ maxHeight: 420 }}>
        <canvas
          ref={canvasRef}
          className="max-w-full object-contain select-none"
          style={{ cursor: isPending ? 'default' : 'crosshair', maxHeight: 400, display: 'block' }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={() => { if (dragStart) { setDragStart(null); drawAll(rects); } }}
        />
      </div>

      {/* Hint */}
      <div className="px-4 py-2 bg-sky-50 border-t border-sky-100 flex items-center gap-2 text-xs text-sky-600">
        <span className="inline-block w-6 h-2 bg-red-600 rounded opacity-80 flex-shrink-0" />
        Sichqoncha bilan bosib torting — qizil qoplama ism, sana va boshqa shaxsiy ma'lumotlarni yashiradi
      </div>

      {/* Actions */}
      <div className="px-4 py-3 bg-white flex items-center gap-3">
        <button
          onClick={handleConfirm}
          disabled={isPending}
          className="flex-1 py-2.5 bg-sky-600 text-white rounded-lg text-sm font-semibold hover:bg-sky-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
        >
          {isPending
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Yuklanmoqda...</>
            : <><Send className="w-4 h-4" /> AI ga yuborish</>}
        </button>
        <button
          onClick={onCancel}
          disabled={isPending}
          className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 transition flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Bekor
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function OnkoAiPage() {
  const qc = useQueryClient();
  const [selected,   setSelected]   = useState<any>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploadMsg,  setUploadMsg]  = useState<string | null>(null);

  const { data: results, isLoading } = useQuery({
    queryKey: ['onko-results'],
    queryFn: () => onkoAiApi.results().then((r) => r.data),
    refetchInterval: 10_000,
  });

  const uploadMut = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      return onkoAiApi.upload(fd).then((r) => r.data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['onko-results'] });
      setPendingFile(null);
      setUploadMsg('Fayl yuklandi! AI tahlili boshlandi...');
      setTimeout(() => setUploadMsg(null), 4000);
    },
  });

  const reviewMut = useMutation({
    mutationFn: ({ id, status, notes }: any) =>
      onkoAiApi.review(id, { status, doctorNotes: notes }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['onko-results'] }),
  });

  const onDrop = useCallback((files: File[]) => {
    if (files[0]) setPendingFile(files[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    disabled: !!pendingFile,
  });

  function handleConfirm(blob: Blob) {
    const file = new File(
      [blob],
      (pendingFile?.name ?? 'image').replace(/\.[^.]+$/, '_redacted.jpg'),
      { type: 'image/jpeg' },
    );
    uploadMut.mutate(file);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Onko-AI</h1>
        <p className="text-slate-500 text-sm mt-1">Tibbiy tasvirlarni AI orqali tahlil qilish</p>
      </div>

      {/* ── Dropzone ─────────────────────────────────────────── */}
      {!pendingFile && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-sky-400 bg-sky-50'
              : 'border-slate-200 hover:border-sky-300 hover:bg-slate-50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">
            {isDragActive ? "Tasvirni qo'yib yuboring..." : 'Tibbiy tasvir yuklash'}
          </p>
          <p className="text-slate-400 text-sm mt-1">JPEG, PNG (max 10MB)</p>
          <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-sky-600 bg-sky-50 px-3 py-1 rounded-full">
            <Shield className="w-3.5 h-3.5" />
            Shaxsiy ma'lumotlarni o'zingiz belgilaysiz
          </div>
        </div>
      )}

      {/* ── Manual redaction canvas ──────────────────────────── */}
      {pendingFile && (
        <RedactionCanvas
          file={pendingFile}
          onConfirm={handleConfirm}
          onCancel={() => setPendingFile(null)}
          isPending={uploadMut.isPending}
        />
      )}

      {/* ── Upload success ───────────────────────────────────── */}
      {uploadMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
          ✅ {uploadMsg}
        </div>
      )}

      {/* ── Results ─────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {(results || []).map((result: any) => (
            <div
              key={result.id}
              className={`bg-white rounded-xl border shadow-sm p-5 cursor-pointer hover:shadow-md transition ${
                selected?.id === result.id ? 'ring-2 ring-sky-400' : ''
              }`}
              onClick={() => setSelected(selected?.id === result.id ? null : result)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-slate-800">
                    {result.diseaseDetected || 'Tahlil kutilmoqda...'}
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {new Date(result.createdAt).toLocaleString('uz-UZ')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {result.riskLevel && (
                    <span className={RISK_CONFIG[result.riskLevel as keyof typeof RISK_CONFIG]?.class}>
                      {RISK_CONFIG[result.riskLevel as keyof typeof RISK_CONFIG]?.label}
                    </span>
                  )}
                  {result.status === 'PENDING'   && <Clock       className="w-4 h-4 text-yellow-500" />}
                  {result.status === 'CONFIRMED' && <CheckCircle className="w-4 h-4 text-green-500"  />}
                </div>
              </div>

              {result.confidenceScore > 0 && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Ishonchlilik darajasi</span>
                    <span className="font-medium">{Number(result.confidenceScore).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        result.confidenceScore >= 75 ? 'bg-emerald-500' :
                        result.confidenceScore >= 50 ? 'bg-yellow-500' : 'bg-red-400'
                      }`}
                      style={{ width: `${Math.min(result.confidenceScore, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {selected?.id === result.id && (
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                  {result.aiSummary && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">AI Xulosasi</p>
                      <p className="text-sm text-slate-700">{result.aiSummary}</p>
                    </div>
                  )}
                  {result.recommendations && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Tavsiyalar</p>
                      <p className="text-sm text-slate-700">{result.recommendations}</p>
                    </div>
                  )}
                  {result.status === 'PENDING' && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); reviewMut.mutate({ id: result.id, status: 'CONFIRMED' }); }}
                        className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
                      >
                        Tasdiqlash
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); reviewMut.mutate({ id: result.id, status: 'REJECTED' }); }}
                        className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition"
                      >
                        Rad etish
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {!results?.length && (
            <div className="col-span-2 text-center py-12 text-slate-400">
              <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-50" />
              Hali tahlil natijalari yo'q. Tasvir yuklang.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
