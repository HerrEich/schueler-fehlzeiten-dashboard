import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseStudentsCsv } from '../src/csvParser.js';
import { analyzeStudent, aggregateClasses, calculateKpis, runAnalysis, DEFAULT_THRESHOLDS } from '../src/analyzer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('--- Starte Tests für Fehlzeiten-Backend ---');

// Test 1: CSV-Parser mit Kommas
const commaCsv = `studentId,name,klasse,klasseId,absentMins,absentMinsNotExcused,absentHours,absentHoursNotExcused
S1,Max Mustermann,9a,K09A,900,450,15,7.5
S2,Erika Musterfrau,9a,K09A,180,0,3,0`;

const parsed1 = parseStudentsCsv(commaCsv);
assert.strictEqual(parsed1.length, 2, 'Sollte 2 Schüler parsen');
assert.strictEqual(parsed1[0].name, 'Max Mustermann');
assert.strictEqual(parsed1[0].absentHours, 15);
assert.strictEqual(parsed1[0].absentHoursNotExcused, 7.5);
console.log('✓ Test 1: Standard Komma-CSV erfolgreich geparst');

// Test 2: CSV-Parser mit Semikolon & Whitespace & BOM
const semicolonCsv = `\uFEFFstudentId;name;klasse;klasseId;absentMins;absentMinsNotExcused;absentHours;absentHoursNotExcused
S3;Anna Schmidt;10b;K10B;1800;900;30;15`;

const parsed2 = parseStudentsCsv(semicolonCsv);
assert.strictEqual(parsed2.length, 1);
assert.strictEqual(parsed2[0].studentId, 'S3');
assert.strictEqual(parsed2[0].name, 'Anna Schmidt');
assert.strictEqual(parsed2[0].absentHoursNotExcused, 15);
console.log('✓ Test 2: Semikolon mit UTF-8 BOM erfolgreich geparst');

// Test 3: Anomalie-Erkennung (Kritisch vs Auffällig vs Normal)
const sCritical = analyzeStudent({
  studentId: '1',
  name: 'Test Kritisch',
  klasse: '9a',
  klasseId: 'K9A',
  absentMins: 1800,
  absentMinsNotExcused: 900,
  absentHours: 30,
  absentHoursNotExcused: 12
});
assert.strictEqual(sCritical.status, 'critical', 'Sollte kritisch sein wegen >= 10 unentschuldigten Stunden');
assert.strictEqual(sCritical.unexcusedPercentage, 40.0);
assert.ok(sCritical.riskFactors.length > 0, 'Sollte Risikofaktoren enthalten');

const sWarning = analyzeStudent({
  studentId: '2',
  name: 'Test Warnung',
  klasse: '9a',
  klasseId: 'K9A',
  absentMins: 1350,
  absentMinsNotExcused: 360,
  absentHours: 22.5,
  absentHoursNotExcused: 6
});
assert.strictEqual(sWarning.status, 'warning', 'Sollte auffällig sein');

const sNormal = analyzeStudent({
  studentId: '3',
  name: 'Test Normal',
  klasse: '9a',
  klasseId: 'K9A',
  absentMins: 180,
  absentMinsNotExcused: 0,
  absentHours: 3,
  absentHoursNotExcused: 0
});
assert.strictEqual(sNormal.status, 'normal', 'Sollte unauffällig sein');
console.log('✓ Test 3: Anomalie-Klassifizierung (Critical, Warning, Normal) korrekt');

// Test 4: Klassen-Aggregation und Klassen-Risiko-Score
const classSample = [sCritical, sWarning, sNormal];
const aggregated = aggregateClasses(classSample);
assert.strictEqual(aggregated.length, 1);
const k9a = aggregated[0];
assert.strictEqual(k9a.studentCount, 3);
assert.strictEqual(k9a.criticalCount, 1);
assert.strictEqual(k9a.warningCount, 1);
assert.strictEqual(k9a.normalCount, 1);
assert.ok(k9a.riskScore > 0 && k9a.riskScore <= 100, `RiskScore (${k9a.riskScore}) sollte zwischen 0 und 100 liegen`);
console.log(`✓ Test 4: Klassen-Aggregation & Risk-Score (${k9a.riskScore}) korrekt`);

// Test 5: Reale Beispieldatei laden und vollständig durchlaufen
const samplePath = path.join(__dirname, '../sample_data/sample_fehlzeiten.csv');
const sampleCsv = fs.readFileSync(samplePath, 'utf-8');
const allStudents = parseStudentsCsv(sampleCsv);
const result = runAnalysis(allStudents);

assert.strictEqual(result.students.length, 25, 'Sollte 25 Schüler aus Beispieldatei parsen');
assert.ok(result.classes.length >= 4, 'Sollte mindestens 4 Klassen aggregieren');
assert.ok(result.kpis.totalStudents === 25);
assert.ok(result.kpis.totalAbsentHours > 0);
assert.ok(result.kpis.criticalStudentsCount > 0);
assert.ok(result.kpis.warningStudentsCount > 0);

console.log('✓ Test 5: Beispieldatei erfolgreich analysiert:', {
  totalStudents: result.kpis.totalStudents,
  totalAbsentHours: result.kpis.totalAbsentHours,
  criticalStudents: result.kpis.criticalStudentsCount,
  warningStudents: result.kpis.warningStudentsCount,
  topRiskClass: result.classes[0].klasse,
  topRiskScore: result.classes[0].riskScore
});

console.log('\n--> Alle Backend-Tests erfolgreich bestanden! <--');
