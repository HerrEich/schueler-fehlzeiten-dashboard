import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseStudentsCsv } from './csvParser.js';
import { runAnalysis } from './analyzer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory file upload storage (up to 15MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }
});

/**
 * Extracts and sanitizes custom thresholds from request if provided.
 */
function extractThresholds(req) {
  const source = { ...req.query, ...req.body };
  const thresholds = {};

  if (source.unexcusedHoursCritical !== undefined) {
    thresholds.unexcusedHoursCritical = parseFloat(source.unexcusedHoursCritical);
  }
  if (source.unexcusedHoursWarning !== undefined) {
    thresholds.unexcusedHoursWarning = parseFloat(source.unexcusedHoursWarning);
  }
  if (source.absentHoursCritical !== undefined) {
    thresholds.absentHoursCritical = parseFloat(source.absentHoursCritical);
  }
  if (source.absentHoursWarning !== undefined) {
    thresholds.absentHoursWarning = parseFloat(source.absentHoursWarning);
  }
  if (source.unexcusedRateCritical !== undefined) {
    thresholds.unexcusedRateCritical = parseFloat(source.unexcusedRateCritical);
  }
  if (source.unexcusedRateWarning !== undefined) {
    thresholds.unexcusedRateWarning = parseFloat(source.unexcusedRateWarning);
  }

  return thresholds;
}

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

/**
 * Sample demo data endpoint
 */
app.get('/api/sample', (req, res) => {
  try {
    const sampleFilePath = path.join(__dirname, '../sample_data/sample_fehlzeiten.csv');
    if (!fs.existsSync(sampleFilePath)) {
      return res.status(404).json({ error: 'Beispieldatei nicht gefunden.' });
    }

    const csvContent = fs.readFileSync(sampleFilePath, 'utf-8');
    const students = parseStudentsCsv(csvContent);
    const thresholds = extractThresholds(req);
    const analysis = runAnalysis(students, thresholds);

    res.json({
      success: true,
      meta: {
        fileName: 'sample_fehlzeiten.csv',
        totalStudents: students.length,
        processedAt: new Date().toISOString()
      },
      ...analysis
    });
  } catch (err) {
    console.error('Fehler beim Laden der Beispieldaten:', err);
    res.status(500).json({ error: err.message || 'Interner Serverfehler' });
  }
});

/**
 * CSV Upload & Analysis endpoint
 */
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Keine CSV-Datei hochgeladen. Bitte Datei im Feld "file" mitsenden.' });
    }

    const csvContent = req.file.buffer.toString('utf-8');
    const students = parseStudentsCsv(csvContent);
    const thresholds = extractThresholds(req);
    const analysis = runAnalysis(students, thresholds);

    res.json({
      success: true,
      meta: {
        fileName: req.file.originalname || 'upload.csv',
        totalStudents: students.length,
        fileSize: req.file.size,
        processedAt: new Date().toISOString()
      },
      ...analysis
    });
  } catch (err) {
    console.error('Fehler bei der CSV-Verarbeitung:', err);
    res.status(400).json({ error: err.message || 'Ungültige CSV-Datei' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`[Backend] Schul-Fehlzeiten API Server läuft auf http://localhost:${PORT}`);
});
