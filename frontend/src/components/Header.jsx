import React from 'react';
import { School, UploadCloud, Database, Sliders, FileSpreadsheet } from 'lucide-react';

export default function Header({ 
  onLoadSample, 
  onOpenUpload, 
  meta, 
  loading, 
  showThresholds, 
  setShowThresholds 
}) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        
        {/* Logo & Titel */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
            <School className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">
              Schul-Fehlzeiten Dashboard
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Schulverwaltung • Früherkennung & Auffälligkeiten
            </p>
          </div>
        </div>

        {/* Status & Aktionen */}
        <div className="flex items-center flex-wrap gap-2.5">
          {meta && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-600">
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
              <span>{meta.fileName}</span>
              <span className="text-slate-400">•</span>
              <span>{meta.totalStudents} Schüler</span>
            </div>
          )}

          <button
            onClick={() => setShowThresholds(!showThresholds)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
              showThresholds
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Grenzwerte</span>
          </button>

          <button
            onClick={onLoadSample}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 transition disabled:opacity-50"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Demo-Daten</span>
          </button>

          <button
            onClick={onOpenUpload}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white shadow-xs hover:bg-blue-700 transition disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4" />
            <span>CSV Import</span>
          </button>
        </div>
      </div>
    </header>
  );
}
