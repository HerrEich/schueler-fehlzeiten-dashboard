import React from 'react';
import { Sliders, RotateCcw, Check } from 'lucide-react';

export default function ThresholdSettings({ 
  thresholds, 
  onChangeThreshold, 
  onResetThresholds, 
  onApplyThresholds 
}) {
  return (
    <div className="bg-slate-900 text-white rounded-xl p-4 shadow-md mb-6 border border-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Schwellenwerte für Auffälligkeiten (Schulverwaltung)
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onResetThresholds}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white transition px-2 py-1 rounded"
          >
            <RotateCcw className="w-3 h-3" />
            Standard
          </button>
          <button
            onClick={onApplyThresholds}
            className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-600 hover:bg-blue-500 text-white transition px-3 py-1 rounded-md shadow-xs"
          >
            <Check className="w-3 h-3" />
            Neu berechnen
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div>
          <label className="block text-[11px] text-slate-400 font-medium mb-1">
            🔴 Kritisch unentschuldigt (Std)
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={thresholds.unexcusedHoursCritical}
            onChange={(e) => onChangeThreshold('unexcusedHoursCritical', parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
          />
        </div>

        <div>
          <label className="block text-[11px] text-slate-400 font-medium mb-1">
            🟡 Auffällig unentschuldigt (Std)
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={thresholds.unexcusedHoursWarning}
            onChange={(e) => onChangeThreshold('unexcusedHoursWarning', parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
          />
        </div>

        <div>
          <label className="block text-[11px] text-slate-400 font-medium mb-1">
            🔴 Kritisch Gesamtstunden
          </label>
          <input
            type="number"
            min="1"
            max="200"
            value={thresholds.absentHoursCritical}
            onChange={(e) => onChangeThreshold('absentHoursCritical', parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
          />
        </div>

        <div>
          <label className="block text-[11px] text-slate-400 font-medium mb-1">
            🟡 Auffällig Gesamtstunden
          </label>
          <input
            type="number"
            min="1"
            max="200"
            value={thresholds.absentHoursWarning}
            onChange={(e) => onChangeThreshold('absentHoursWarning', parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
          />
        </div>

        <div>
          <label className="block text-[11px] text-slate-400 font-medium mb-1">
            🔴 Quote unentschuldigt (%)
          </label>
          <input
            type="number"
            min="5"
            max="100"
            value={thresholds.unexcusedRateCritical}
            onChange={(e) => onChangeThreshold('unexcusedRateCritical', parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
          />
        </div>
      </div>
    </div>
  );
}
