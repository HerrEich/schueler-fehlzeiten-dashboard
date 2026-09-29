import React from 'react';
import { X, AlertOctagon, AlertTriangle, CheckCircle, Clock, FileText, CheckCheck } from 'lucide-react';

export default function StudentDetailModal({ student, onClose }) {
  if (!student) return null;

  const excusedHours = Math.max(0, Math.round((student.absentHours - student.absentHoursNotExcused) * 10) / 10);
  const excusedMins = Math.max(0, student.absentMins - student.absentMinsNotExcused);

  let statusBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  let StatusIcon = CheckCircle;
  let statusText = 'Unauffällig';

  if (student.status === 'critical') {
    statusBg = 'bg-red-50 text-red-800 border-red-200';
    StatusIcon = AlertOctagon;
    statusText = 'Kritisch - Handlungsbedarf';
  } else if (student.status === 'warning') {
    statusBg = 'bg-amber-50 text-amber-800 border-amber-200';
    StatusIcon = AlertTriangle;
    statusText = 'Auffällig - Unter Beobachtung';
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400">ID: {student.studentId}</span>
            <h3 className="text-lg font-bold text-slate-900">{student.name}</h3>
            <p className="text-xs font-semibold text-slate-500">Klasse {student.klasse} (Klassen-ID: {student.klasseId})</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Status Badge */}
          <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${statusBg}`}>
            <StatusIcon className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">Einstufung Schulverwaltung</p>
              <p className="text-sm font-semibold">{statusText}</p>
            </div>
          </div>

          {/* Stunden-Aufschlüsselung */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Gesamt</p>
              <p className="text-xl font-bold text-slate-900 mt-1">{student.absentHours}h</p>
              <p className="text-[11px] text-slate-400">{student.absentMins} Min</p>
            </div>

            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200">
              <p className="text-[11px] font-bold text-amber-700 uppercase">Unentschuldigt</p>
              <p className="text-xl font-bold text-amber-700 mt-1">{student.absentHoursNotExcused}h</p>
              <p className="text-[11px] text-amber-600">{student.absentMinsNotExcused} Min ({student.unexcusedPercentage}%)</p>
            </div>

            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
              <p className="text-[11px] font-bold text-emerald-700 uppercase">Entschuldigt</p>
              <p className="text-xl font-bold text-emerald-700 mt-1">{excusedHours}h</p>
              <p className="text-[11px] text-emerald-600">{excusedMins} Min</p>
            </div>
          </div>

          {/* Risikofaktoren */}
          {student.riskFactors && student.riskFactors.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Identifizierte Auffälligkeiten:</span>
              </p>
              <ul className="space-y-1 pl-1">
                {student.riskFactors.map((rf, idx) => (
                  <li key={idx} className="text-xs text-red-700 bg-red-50/70 border border-red-100 px-2.5 py-1.5 rounded-lg flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    <span>{rf}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Handlungsempfehlungen für Verwaltung */}
          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-1.5">
            <p className="font-bold flex items-center gap-1.5 text-blue-950">
              <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Verwaltungs-Checkliste:</span>
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-blue-800">
              {student.status === 'critical' ? (
                <>
                  <li>Schriftliche Mahnung an Erziehungsberechtigte versenden</li>
                  <li>Klassenleitung und Schulsozialarbeit kontaktieren</li>
                  <li>Prüfung von Attestpflicht oder Bußgeldverfahren</li>
                </>
              ) : student.status === 'warning' ? (
                <>
                  <li>Rücksprache mit Klassenleitung bei nächster Konferenz</li>
                  <li>Nachweis ausstehender Entschuldigungen anfordern</li>
                </>
              ) : (
                <>
                  <li>Keine Verwaltungsmaßnahmen erforderlich</li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition"
          >
            Schließen
          </button>
        </div>

      </div>
    </div>
  );
}
