import Papa from 'papaparse';

/**
 * Normalizes header keys to standard lowercase alphanumeric representation.
 */
function normalizeKey(key) {
  if (!key) return '';
  return key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Standard column aliases map.
 */
const COLUMN_MAP = {
  studentid: 'studentId',
  id: 'studentId',
  schuelerid: 'studentId',
  name: 'name',
  schueler: 'name',
  klasse: 'klasse',
  class: 'klasse',
  klasseid: 'klasseId',
  classid: 'klasseId',
  absentmins: 'absentMins',
  fehlminuten: 'absentMins',
  absentminsnotexcused: 'absentMinsNotExcused',
  fehlminutenunentschuldigt: 'absentMinsNotExcused',
  absenthours: 'absentHours',
  fehlstunden: 'absentHours',
  absenthoursnotexcused: 'absentHoursNotExcused',
  fehlstundenunentschuldigt: 'absentHoursNotExcused'
};

/**
 * Parses raw CSV string or Buffer into validated student objects.
 * Handles BOM, delimiters (, ; \t whitespace), and number parsing.
 */
export function parseStudentsCsv(csvContent) {
  if (Buffer.isBuffer(csvContent)) {
    csvContent = csvContent.toString('utf-8');
  }

  // Strip BOM if present
  if (csvContent.charCodeAt(0) === 0xFEFF) {
    csvContent = csvContent.slice(1);
  }

  const trimmed = csvContent.trim();
  if (!trimmed) {
    throw new Error('CSV-Datei ist leer.');
  }

  // Parse with PapaParse
  const parsed = Papa.parse(trimmed, {
    header: true,
    skipEmptyLines: 'greedy',
    dynamicTyping: false,
    transformHeader: (header) => {
      const clean = normalizeKey(header);
      return COLUMN_MAP[clean] || header.trim();
    }
  });

  if (parsed.errors && parsed.errors.length > 0) {
    // If fatal parsing error
    const fatal = parsed.errors.find(e => e.type === 'Delimiter' || e.code === 'UndetectableDelimiter');
    if (fatal) {
      throw new Error(`Fehler beim Erkennen des CSV-Formats: ${fatal.message}`);
    }
  }

  const rows = parsed.data;
  if (!rows || rows.length === 0) {
    throw new Error('Keine Datensätze in der CSV-Datei gefunden.');
  }

  const students = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    // Must have at least a student identifier or name
    const studentId = (row.studentId || row.id || `S-${i + 1}`).toString().trim();
    const name = (row.name || 'Unbekannt').toString().trim();
    const klasse = (row.klasse || 'Ohne Klasse').toString().trim();
    const klasseId = (row.klasseId || klasse).toString().trim();

    // Numerical conversions
    const absentMins = Math.max(0, parseInt(row.absentMins, 10) || 0);
    const absentMinsNotExcused = Math.max(0, parseInt(row.absentMinsNotExcused, 10) || 0);
    
    let absentHours = Math.max(0, parseFloat(row.absentHours) || 0);
    let absentHoursNotExcused = Math.max(0, parseFloat(row.absentHoursNotExcused) || 0);

    // If absentHours is 0 but absentMins > 0, estimate hours (assuming 45 min Schulstunde)
    if (absentHours === 0 && absentMins > 0) {
      absentHours = Math.round((absentMins / 45) * 10) / 10;
    }
    if (absentHoursNotExcused === 0 && absentMinsNotExcused > 0) {
      absentHoursNotExcused = Math.round((absentMinsNotExcused / 45) * 10) / 10;
    }

    students.push({
      studentId,
      name,
      klasse,
      klasseId,
      absentMins,
      absentMinsNotExcused,
      absentHours,
      absentHoursNotExcused
    });
  }

  return students;
}
