import React, { useState, useMemo } from 'react';
import { Search, Download, ArrowUpDown, AlertOctagon, AlertTriangle, CheckCircle, Filter } from 'lucide-react';

export default function StudentTable({ 
  students, 
  classes, 
  selectedClass, 
  setSelectedClass, 
  statusFilter, 
  setStatusFilter,
  onSelectStudent 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('absentHoursNotExcused');
  const [sortAsc, setSortAsc] = useState(false);

  // Filter students
  const filteredStudents = useMemo(() => {
    if (!students) return [];

    return students.filter((s) => {
      // Class filter
      if (selectedClass && s.klasse !== selectedClass) return false;

      // Status filter
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = s.name.toLowerCase().includes(query);
        const matchId = s.studentId.toString().toLowerCase().includes(query);
        const matchKlasse = s.klasse.toLowerCase().includes(query);
        if (!matchName && !matchId && !matchKlasse) return false;
      }

      return true;
    });
  }, [students, selectedClass, statusFilter, searchTerm]);

  // Sort students
  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      return sortAsc ? valA - valB : valB - valA;
    });
  }, [filteredStudents, sortField, sortAsc]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default descending for numbers
    }
  };

  // CSV Export for filtered results
  const exportFilteredCsv = () => {
    if (sortedStudents.length === 0) return;

    const headers = ['studentId', 'name', 'klasse', 'klasseId', 'absentHours', 'absentHoursNotExcused', 'unexcusedPercentage', 'status', 'riskFactors'];
    const rows = sortedStudents.map(s => [
      `"${s.studentId}"`,
      `"${s.name}"`,
      `"${s.klasse}"`,
      `"${s.klasseId}"`,
      s.absentHours,
      s.absentHoursNotExcused,
      `${s.unexcusedPercentage}%`,
      s.status,
      `"${(s.riskFactors || []).join('; ')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fehlzeiten_auswertung_${selectedClass || 'alle'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Controls / Filters */}
      <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Schüler suchen (Name, ID)..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            />
          </div>

          {/* Class Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              <option value="">Alle Klassen</option>
              {(classes || []).map(c => (
                <option key={c.klasse} value={c.klasse}>Klasse {c.klasse} ({c.studentCount})</option>
              ))}
            </select>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md transition ${statusFilter === 'all' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Alle
            </button>
            <button
              onClick={() => setStatusFilter('critical')}
              className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${statusFilter === 'critical' ? 'bg-red-600 text-white shadow-xs' : 'text-red-700 hover:bg-red-50'}`}
            >
              <AlertOctagon className="w-3 h-3" />
              Kritisch
            </button>
            <button
              onClick={() => setStatusFilter('warning')}
              className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${statusFilter === 'warning' ? 'bg-amber-500 text-white shadow-xs' : 'text-amber-800 hover:bg-amber-50'}`}
            >
              <AlertTriangle className="w-3 h-3" />
              Auffällig
            </button>
            <button
              onClick={() => setStatusFilter('normal')}
              className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${statusFilter === 'normal' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700 hover:bg-emerald-50'}`}
            >
              <CheckCircle className="w-3 h-3" />
              Normal
            </button>
          </div>
        </div>

        {/* Counter & Export */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium">
            <strong>{sortedStudents.length}</strong> von {students.length} Schülern
          </span>

          <button
            onClick={exportFilteredCsv}
            disabled={sortedStudents.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-xs disabled:opacity-50"
            title="Gefilterte Ansicht als CSV exportieren"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>CSV Export</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1">
                  <span>Name / ID</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort('klasse')}>
                <div className="flex items-center gap-1">
                  <span>Klasse</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort('absentHours')}>
                <div className="flex items-center gap-1">
                  <span>Fehlzeit Gesamt</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort('absentHoursNotExcused')}>
                <div className="flex items-center gap-1">
                  <span>Unentschuldigt</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort('unexcusedPercentage')}>
                <div className="flex items-center gap-1">
                  <span>Quote (%)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Status & Auffälligkeiten</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {sortedStudents.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-400">
                  Keine Schüler für die gewählten Filter gefunden.
                </td>
              </tr>
            ) : (
              sortedStudents.map((s) => {
                let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                let Icon = CheckCircle;
                let statusLabel = 'Unauffällig';

                if (s.status === 'critical') {
                  badgeClass = 'bg-red-50 text-red-700 border-red-200 font-bold';
                  Icon = AlertOctagon;
                  statusLabel = 'Kritisch';
                } else if (s.status === 'warning') {
                  badgeClass = 'bg-amber-50 text-amber-800 border-amber-200 font-semibold';
                  Icon = AlertTriangle;
                  statusLabel = 'Auffällig';
                }

                return (
                  <tr 
                    key={s.studentId}
                    onClick={() => onSelectStudent(s)}
                    className="hover:bg-blue-50/40 cursor-pointer transition"
                  >
                    {/* Name & ID */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{s.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">ID: {s.studentId}</div>
                    </td>

                    {/* Klasse */}
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[11px]">
                        {s.klasse}
                      </span>
                    </td>

                    {/* Gesamtfehlzeit */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{s.absentHours} Std</div>
                      <div className="text-[11px] text-slate-400">{s.absentMins} Min</div>
                    </td>

                    {/* Unentschuldigt */}
                    <td className="py-3 px-4">
                      <div className={`font-bold ${s.absentHoursNotExcused > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
                        {s.absentHoursNotExcused} Std
                      </div>
                      <div className="text-[11px] text-slate-400">{s.absentMinsNotExcused} Min</div>
                    </td>

                    {/* Unentschuldigte Quote */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${s.unexcusedPercentage > 30 ? 'bg-red-500' : s.unexcusedPercentage > 15 ? 'bg-amber-500' : 'bg-blue-500'}`}
                            style={{ width: `${Math.min(100, s.unexcusedPercentage)}%` }}
                          />
                        </div>
                        <span className="font-semibold text-slate-700">{s.unexcusedPercentage}%</span>
                      </div>
                    </td>

                    {/* Status & Risikofaktoren */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border ${badgeClass}`}>
                          <Icon className="w-3 h-3" />
                          <span>{statusLabel}</span>
                        </span>

                        {s.riskFactors && s.riskFactors.length > 0 && (
                          <span className="text-[11px] text-slate-500 truncate max-w-xs" title={s.riskFactors.join('\n')}>
                            • {s.riskFactors[0]}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
