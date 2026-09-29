import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import KpiCards from './components/KpiCards';
import ClassOverview from './components/ClassOverview';
import StudentTable from './components/StudentTable';
import ThresholdSettings from './components/ThresholdSettings';
import StudentDetailModal from './components/StudentDetailModal';
import UploadZone from './components/UploadZone';

const DEFAULT_THRESHOLDS = {
  unexcusedHoursCritical: 10,
  unexcusedHoursWarning: 4,
  absentHoursCritical: 35,
  absentHoursWarning: 20,
  unexcusedRateCritical: 30,
};

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters & State
  const [selectedClass, setSelectedClass] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showThresholds, setShowThresholds] = useState(false);
  const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS);
  const [currentFile, setCurrentFile] = useState(null);

  // Load sample data from API
  const loadSampleData = async (customThresh = thresholds) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams(customThresh).toString();
      const res = await fetch(`/api/sample?${queryParams}`);
      if (!res.ok) {
        throw new Error(`Server antwortete mit Status ${res.status}`);
      }
      const json = await res.json();
      setData(json);
      setCurrentFile(null); // working on sample
    } catch (err) {
      console.error('Fehler beim Abrufen der Beispieldaten:', err);
      setError(`Verbindungsfehler zum Backend: ${err.message}. Stelle sicher, dass das Backend auf Port 5000 läuft.`);
    } finally {
      setLoading(false);
    }
  };

  // Upload custom CSV file
  const handleUploadFile = async (file, customThresh = thresholds) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const queryParams = new URLSearchParams(customThresh).toString();
      const res = await fetch(`/api/upload?${queryParams}`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.error || `Upload fehlgeschlagen (${res.status})`);
      }

      const json = await res.json();
      setData(json);
      setCurrentFile(file);
      setShowUploadModal(false);
    } catch (err) {
      console.error('Upload-Fehler:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Re-apply analysis with modified thresholds
  const handleApplyThresholds = () => {
    if (currentFile) {
      handleUploadFile(currentFile, thresholds);
    } else {
      loadSampleData(thresholds);
    }
  };

  const handleResetThresholds = () => {
    setThresholds(DEFAULT_THRESHOLDS);
    if (currentFile) {
      handleUploadFile(currentFile, DEFAULT_THRESHOLDS);
    } else {
      loadSampleData(DEFAULT_THRESHOLDS);
    }
  };

  const handleChangeThreshold = (key, value) => {
    setThresholds(prev => ({ ...prev, [key]: value }));
  };

  // Auto-load sample data on startup
  useEffect(() => {
    loadSampleData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <Header
        onLoadSample={() => loadSampleData()}
        onOpenUpload={() => setShowUploadModal(true)}
        meta={data?.meta}
        loading={loading}
        showThresholds={showThresholds}
        setShowThresholds={setShowThresholds}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center justify-between shadow-xs">
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="text-red-600 font-bold hover:underline"
            >
              Schließen
            </button>
          </div>
        )}

        {/* Dynamic Thresholds Settings Bar */}
        {showThresholds && (
          <ThresholdSettings
            thresholds={thresholds}
            onChangeThreshold={handleChangeThreshold}
            onResetThresholds={handleResetThresholds}
            onApplyThresholds={handleApplyThresholds}
          />
        )}

        {/* KPI Metric Cards */}
        {data && (
          <KpiCards
            kpis={data.kpis}
            onFilterByStatus={(status) => setStatusFilter(status)}
          />
        )}

        {/* Classes Risk Comparison Overview */}
        {data && (
          <ClassOverview
            classes={data.classes}
            selectedClass={selectedClass}
            onSelectClass={(cls) => setSelectedClass(cls)}
          />
        )}

        {/* Detailed Students Table */}
        {data && (
          <StudentTable
            students={data.students}
            classes={data.classes}
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onSelectStudent={(student) => setSelectedStudent(student)}
          />
        )}
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadZone
          onUpload={handleUploadFile}
          onClose={() => setShowUploadModal(false)}
          loading={loading}
          error={error}
        />
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}
