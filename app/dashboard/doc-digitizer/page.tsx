'use client';
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { docDigitizerApi } from '@/lib/api';
import { Upload, FileText, Download, CheckCircle, Loader2, AlertCircle, Edit2 } from 'lucide-react';

export default function DocDigitizerPage() {
  const qc = useQueryClient();
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Record<string, any>>({});

  const { data: docs, isLoading } = useQuery({
    queryKey: ['doc-digitizer'],
    queryFn: () => docDigitizerApi.list().then((r) => r.data),
    refetchInterval: 8_000,
  });

  const uploadMut = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      return docDigitizerApi.upload(fd).then((r) => r.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['doc-digitizer'] }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: any) => docDigitizerApi.update(id, { extractedDataJson: data }).then((r) => r.data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['doc-digitizer'] });
      setSelectedDoc(updated);
      setEditMode(false);
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => files[0] && uploadMut.mutate(files[0]),
    accept: { 'image/*': [], 'application/pdf': [] },
    maxFiles: 1,
  });

  async function handleExport(id: string) {
    const res = await docDigitizerApi.export(id);
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-${id}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  function startEdit(doc: any) {
    setEditData(doc.extractedDataJson || {});
    setEditMode(true);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Doc-Digitizer AI</h1>
        <p className="text-slate-500 text-sm mt-1">Qog'oz hujjatlarni raqamlashtirishg</p>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
          isDragActive ? 'border-sky-400 bg-sky-50' : 'border-slate-200 hover:border-sky-300 hover:bg-slate-50'
        }`}
      >
        <input {...getInputProps()} />
        <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-600 font-medium">Hujjat skan/foto/PDF yuklash</p>
        <p className="text-slate-400 text-sm mt-1">AI avtomatik matnni ajratib, tuzilmaga keltiradi</p>
        {uploadMut.isPending && <p className="text-sky-600 text-sm mt-2 animate-pulse">Yuklanmoqda...</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-700">Hujjatlar ro'yxati</h3>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-sky-500" /></div>
          ) : (
            (docs || []).map((doc: any) => (
              <div
                key={doc.id}
                onClick={() => { setSelectedDoc(doc); setEditMode(false); }}
                className={`bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition ${
                  selectedDoc?.id === doc.id ? 'ring-2 ring-sky-400' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {doc.originalFile?.originalName || 'Hujjat'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(doc.createdAt).toLocaleString('uz-UZ')}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    doc.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    doc.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-700 animate-pulse' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {doc.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedDoc && (
          <div className="bg-white rounded-xl border shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">Ajratilgan ma'lumotlar</h3>
              <div className="flex gap-2">
                {selectedDoc.status === 'COMPLETED' && (
                  <>
                    <button
                      onClick={() => startEdit(selectedDoc)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-500"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleExport(selectedDoc.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition"
                    >
                      <Download className="w-3 h-3" /> Excel
                    </button>
                  </>
                )}
              </div>
            </div>

            {selectedDoc.status === 'PROCESSING' ? (
              <div className="flex items-center gap-3 py-8 justify-center text-sky-600">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>AI matnni ajratmoqda...</span>
              </div>
            ) : selectedDoc.status === 'FAILED' ? (
              <div className="flex items-center gap-2 text-red-600 py-4">
                <AlertCircle className="w-5 h-5" />
                <span>Xatolik: {selectedDoc.errorMessage}</span>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(selectedDoc.extractedDataJson || {}).map(([key, value]) => {
                  if (key === 'rawText') return null;
                  return (
                    <div key={key} className="flex gap-3 items-start">
                      <span className="text-xs font-medium text-slate-500 min-w-28 pt-1">{key}</span>
                      {editMode ? (
                        <input
                          value={Array.isArray(editData[key]) ? editData[key].join(', ') : String(editData[key] || '')}
                          onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
                          className="flex-1 text-sm px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
                        />
                      ) : (
                        <span className="flex-1 text-sm text-slate-800">
                          {Array.isArray(value) ? value.join(', ') : String(value || '—')}
                        </span>
                      )}
                    </div>
                  );
                })}

                {editMode && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => updateMut.mutate({ id: selectedDoc.id, data: editData })}
                      disabled={updateMut.isPending}
                      className="flex-1 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 disabled:opacity-50 transition"
                    >
                      Saqlash
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 transition"
                    >
                      Bekor qilish
                    </button>
                  </div>
                )}

                {selectedDoc.rawText && (
                  <details className="mt-4">
                    <summary className="text-xs font-medium text-slate-400 cursor-pointer hover:text-slate-600">
                      Xom matn ko'rish
                    </summary>
                    <p className="mt-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg whitespace-pre-wrap">
                      {selectedDoc.rawText}
                    </p>
                  </details>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
