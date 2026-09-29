import React from 'react';
import { Users, Clock, AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react';

export default function KpiCards({ kpis, onFilterByStatus }) {
  if (!kpis) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Gesamtschüler */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Schüler Gesamt</p>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{kpis.totalStudents}</p>
          <p className="text-xs text-slate-500 font-medium">Im Datensatz</p>
        </div>
      </div>

      {/* Gesamtfehlstunden */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fehlstunden</p>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{kpis.totalAbsentHours} <span className="text-sm font-medium text-slate-500">Std</span></p>
          <p className="text-xs text-slate-500 font-medium">Ø {kpis.avgAbsentHoursPerStudent} h / Schüler</p>
        </div>
      </div>

      {/* Unentschuldigt */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unentschuldigt</p>
          <p className="text-2xl font-bold text-amber-600 mt-0.5">{kpis.totalUnexcusedHours} <span className="text-sm font-medium text-slate-500">Std</span></p>
          <p className="text-xs text-amber-700 font-semibold">{kpis.unexcusedPercentage}% aller Fehlzeiten</p>
        </div>
      </div>

      {/* Kritische Fälle */}
      <div 
        onClick={() => onFilterByStatus && onFilterByStatus('critical')}
        className="bg-red-50/70 hover:bg-red-100/60 transition p-4 rounded-xl border border-red-200 shadow-xs flex items-center gap-3.5 cursor-pointer"
        title="Klicken, um nur kritische Fälle zu filtern"
      >
        <div className="w-11 h-11 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <AlertOctagon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-bold text-red-700 uppercase tracking-wider">Kritische Fälle</p>
          <p className="text-2xl font-bold text-red-900 mt-0.5">{kpis.criticalStudentsCount}</p>
          <p className="text-xs text-red-600 font-medium">Sofortige Prüfung</p>
        </div>
      </div>

      {/* Auffällige Fälle */}
      <div 
        onClick={() => onFilterByStatus && onFilterByStatus('warning')}
        className="bg-amber-50/70 hover:bg-amber-100/60 transition p-4 rounded-xl border border-amber-200 shadow-xs flex items-center gap-3.5 cursor-pointer"
        title="Klicken, um nur auffällige Fälle zu filtern"
      >
        <div className="w-11 h-11 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Auffällig</p>
          <p className="text-2xl font-bold text-amber-900 mt-0.5">{kpis.warningStudentsCount}</p>
          <p className="text-xs text-amber-700 font-medium">Beobachtung nötig</p>
        </div>
      </div>
    </div>
  );
}
