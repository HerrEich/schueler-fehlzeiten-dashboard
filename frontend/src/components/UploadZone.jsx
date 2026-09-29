import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, X, AlertCircle } from 'lucide-react';

export default function UploadZone({ onUpload, onClose, loading, error }) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv') || file.type === 'text/csv') {
        onUpload(file);
      } else {
        alert('Bitte eine .csv-Datei auswählen.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">CSV Fehlzeiten importieren</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
              dragOver
                ? 'border-blue-500 bg-blue-50/50'
                : 'border-slate-300 hover:border-blue-400 bg-slate-50/60'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv,text/csv"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">
              CSV-Datei hierher ziehen oder <span className="text-blue-600 underline">auswählen</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Unterstützt Komma, Semikolon und Tabulator als Trennzeichen
            </p>
          </div>

          {/* Expected Columns Box */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs">
            <p className="font-bold text-slate-700 mb-1.5">Erwartete CSV-Spalten:</p>
            <div className="flex flex-wrap gap-1 font-mono text-[11px] text-slate-600">
              {['studentId', 'name', 'klasse', 'klasseId', 'absentMins', 'absentMinsNotExcused', 'absentHours', 'absentHoursNotExcused'].map((col) => (
                <span key={col} className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">
                  {col}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs">
          <span className="text-slate-400">
            {loading ? 'Wird verarbeitet...' : 'Maximale Dateigröße: 15 MB'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            Abbrechen
          </button>
        </div>

      </div>
    </div>
  );
}
