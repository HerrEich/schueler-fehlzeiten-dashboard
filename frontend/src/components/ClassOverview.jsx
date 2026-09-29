import React from 'react';
import { BarChart3, AlertOctagon, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function ClassOverview({ classes, selectedClass, onSelectClass }) {
  if (!classes || classes.length === 0) return null;

  // Find max absent hours among classes for scaling bars
  const maxHours = Math.max(...classes.map(c => c.totalAbsentHours), 1);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">
            Klassen-Vergleich & Risikoeinstufung
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Klicke auf eine Klasse, um Schüler zu filtern
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {classes.map((c) => {
          const isSelected = selectedClass === c.klasse;
          const barWidthPercent = Math.min(100, Math.round((c.totalAbsentHours / maxHours) * 100));

          // Risk color coding
          let riskBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
          let riskText = 'Gering';
          if (c.riskScore >= 60) {
            riskBadgeClass = 'bg-red-50 text-red-700 border-red-200';
            riskText = 'Kritisch';
          } else if (c.riskScore >= 35) {
            riskBadgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
            riskText = 'Auffällig';
          }

          return (
            <div
              key={c.klasse}
              onClick={() => onSelectClass(isSelected ? '' : c.klasse)}
              className={`p-3.5 rounded-lg border transition cursor-pointer relative ${
                isSelected 
                  ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-2 ring-blue-500/20' 
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-slate-900">
                    Klasse {c.klasse}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    ({c.studentCount} Schüler)
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${riskBadgeClass}`}>
                    Score: {c.riskScore}
                  </span>
                </div>
              </div>

              {/* Progress bar visual of absences */}
              <div className="space-y-1 mb-2.5">
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <span>Fehlstunden: <strong className="text-slate-800">{c.totalAbsentHours}h</strong></span>
                  <span>Unentschuldigt: <strong className="text-amber-600">{c.totalUnexcusedHours}h</strong> ({c.unexcusedPercentage}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-blue-500 h-full"
                    style={{ width: `${barWidthPercent}%` }}
                    title={`Gesamtfehlstunden: ${c.totalAbsentHours}h`}
                  />
                  <div 
                    className="bg-amber-500 h-full -ml-1"
                    style={{ width: `${(c.unexcusedPercentage / 100) * barWidthPercent}%` }}
                    title={`Unentschuldigt: ${c.totalUnexcusedHours}h`}
                  />
                </div>
              </div>

              {/* Summary counters */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 text-slate-500">
                <span>Ø {c.avgAbsentHours} h/Schüler</span>
                
                <div className="flex items-center gap-2 font-medium">
                  {c.criticalCount > 0 && (
                    <span className="inline-flex items-center gap-0.5 text-red-600 font-bold" title={`${c.criticalCount} kritische Fälle`}>
                      <AlertOctagon className="w-3.5 h-3.5" />
                      {c.criticalCount}
                    </span>
                  )}
                  {c.warningCount > 0 && (
                    <span className="inline-flex items-center gap-0.5 text-amber-600 font-bold" title={`${c.warningCount} auffällige Fälle`}>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {c.warningCount}
                    </span>
                  )}
                  {c.criticalCount === 0 && c.warningCount === 0 && (
                    <span className="inline-flex items-center gap-0.5 text-emerald-600 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Unauffällig
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
