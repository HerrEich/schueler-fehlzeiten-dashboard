/**
 * Default thresholds for anomaly detection in school administration.
 */
export const DEFAULT_THRESHOLDS = {
  unexcusedHoursCritical: 10,
  unexcusedHoursWarning: 4,
  absentHoursCritical: 35,
  absentHoursWarning: 20,
  unexcusedRateCritical: 30, // percent
  unexcusedRateWarning: 20,  // percent
};

/**
 * Rounds a number to a specified number of decimal places.
 */
function round(value, decimals = 1) {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Analyzes an individual student's absence record.
 */
export function analyzeStudent(student, thresholds = DEFAULT_THRESHOLDS) {
  const { absentHours, absentHoursNotExcused } = student;

  const unexcusedPercentage = absentHours > 0 
    ? round((absentHoursNotExcused / absentHours) * 100, 1) 
    : 0;

  const riskFactors = [];
  let status = 'normal';

  // Check Critical conditions
  const isCriticalUnexcused = absentHoursNotExcused >= thresholds.unexcusedHoursCritical;
  const isCriticalRate = unexcusedPercentage >= thresholds.unexcusedRateCritical && absentHours >= 10;
  const isCriticalTotal = absentHours >= thresholds.absentHoursCritical;

  if (isCriticalUnexcused) {
    riskFactors.push(`Kritisch: ${absentHoursNotExcused} unentschuldigte Stunden (>= ${thresholds.unexcusedHoursCritical}h)`);
  }
  if (isCriticalRate) {
    riskFactors.push(`Kritisch: ${unexcusedPercentage}% unentschuldigt bei ${absentHours} Gesamtstunden`);
  }
  if (isCriticalTotal) {
    riskFactors.push(`Kritisch: Extrem hohe Gesamtfehlzeit (${absentHours}h >= ${thresholds.absentHoursCritical}h)`);
  }

  if (isCriticalUnexcused || isCriticalRate || isCriticalTotal) {
    status = 'critical';
  } else {
    // Check Warning conditions
    const isWarningUnexcused = absentHoursNotExcused >= thresholds.unexcusedHoursWarning;
    const isWarningRate = unexcusedPercentage >= thresholds.unexcusedRateWarning && absentHours >= 6;
    const isWarningTotal = absentHours >= thresholds.absentHoursWarning;

    if (isWarningUnexcused) {
      riskFactors.push(`Auffällig: ${absentHoursNotExcused} unentschuldigte Stunden (>= ${thresholds.unexcusedHoursWarning}h)`);
    }
    if (isWarningRate) {
      riskFactors.push(`Auffällig: ${unexcusedPercentage}% unentschuldigt (>= ${thresholds.unexcusedRateWarning}%)`);
    }
    if (isWarningTotal) {
      riskFactors.push(`Auffällig: Erhöhte Gesamtfehlzeit (${absentHours}h >= ${thresholds.absentHoursWarning}h)`);
    }

    if (isWarningUnexcused || isWarningRate || isWarningTotal) {
      status = 'warning';
    }
  }

  return {
    ...student,
    unexcusedPercentage,
    status,
    riskFactors
  };
}

/**
 * Aggregates student records by class and computes class risk metrics.
 */
export function aggregateClasses(analyzedStudents) {
  const classMap = new Map();

  for (const s of analyzedStudents) {
    const key = s.klasse || 'Unbekannt';
    if (!classMap.has(key)) {
      classMap.set(key, {
        klasse: key,
        klasseId: s.klasseId || key,
        studentCount: 0,
        totalAbsentHours: 0,
        totalAbsentMins: 0,
        totalUnexcusedHours: 0,
        totalUnexcusedMins: 0,
        criticalCount: 0,
        warningCount: 0,
        normalCount: 0
      });
    }

    const c = classMap.get(key);
    c.studentCount += 1;
    c.totalAbsentHours += s.absentHours;
    c.totalAbsentMins += s.absentMins;
    c.totalUnexcusedHours += s.absentHoursNotExcused;
    c.totalUnexcusedMins += s.absentMinsNotExcused;

    if (s.status === 'critical') c.criticalCount += 1;
    else if (s.status === 'warning') c.warningCount += 1;
    else c.normalCount += 1;
  }

  const classes = [];
  for (const c of classMap.values()) {
    const totalAbsentHours = round(c.totalAbsentHours, 1);
    const totalUnexcusedHours = round(c.totalUnexcusedHours, 1);
    const avgAbsentHours = c.studentCount > 0 ? round(c.totalAbsentHours / c.studentCount, 2) : 0;
    const avgUnexcusedHours = c.studentCount > 0 ? round(c.totalUnexcusedHours / c.studentCount, 2) : 0;
    const unexcusedPercentage = totalAbsentHours > 0 
      ? round((totalUnexcusedHours / totalAbsentHours) * 100, 1) 
      : 0;

    // Class Risk Score (0-100)
    // Weighted share of critical (2.5x) and warning (1x) students plus unexcused percentage
    const weightedAtRiskShare = c.studentCount > 0
      ? ((c.criticalCount * 2.5 + c.warningCount * 1.0) / c.studentCount) * 100
      : 0;
    
    const riskScore = round(Math.min(100, (weightedAtRiskShare * 0.5) + (unexcusedPercentage * 0.5)), 1);

    classes.push({
      klasse: c.klasse,
      klasseId: c.klasseId,
      studentCount: c.studentCount,
      totalAbsentHours,
      totalAbsentMins: c.totalAbsentMins,
      totalUnexcusedHours,
      totalUnexcusedMins: c.totalUnexcusedMins,
      avgAbsentHours,
      avgUnexcusedHours,
      unexcusedPercentage,
      criticalCount: c.criticalCount,
      warningCount: c.warningCount,
      normalCount: c.normalCount,
      riskScore
    });
  }

  // Sort descending by risk score
  classes.sort((a, b) => b.riskScore - a.riskScore || b.totalUnexcusedHours - a.totalUnexcusedHours);

  return classes;
}

/**
 * Calculates overall school KPIs.
 */
export function calculateKpis(analyzedStudents) {
  const totalStudents = analyzedStudents.length;
  let totalAbsentHours = 0;
  let totalAbsentMins = 0;
  let totalUnexcusedHours = 0;
  let totalUnexcusedMins = 0;
  let criticalStudentsCount = 0;
  let warningStudentsCount = 0;
  let normalStudentsCount = 0;

  for (const s of analyzedStudents) {
    totalAbsentHours += s.absentHours;
    totalAbsentMins += s.absentMins;
    totalUnexcusedHours += s.absentHoursNotExcused;
    totalUnexcusedMins += s.absentMinsNotExcused;

    if (s.status === 'critical') criticalStudentsCount += 1;
    else if (s.status === 'warning') warningStudentsCount += 1;
    else normalStudentsCount += 1;
  }

  totalAbsentHours = round(totalAbsentHours, 1);
  totalUnexcusedHours = round(totalUnexcusedHours, 1);

  const unexcusedPercentage = totalAbsentHours > 0
    ? round((totalUnexcusedHours / totalAbsentHours) * 100, 1)
    : 0;

  const avgAbsentHoursPerStudent = totalStudents > 0
    ? round(totalAbsentHours / totalStudents, 2)
    : 0;

  const avgUnexcusedHoursPerStudent = totalStudents > 0
    ? round(totalUnexcusedHours / totalStudents, 2)
    : 0;

  return {
    totalStudents,
    totalAbsentHours,
    totalAbsentMins,
    totalUnexcusedHours,
    totalUnexcusedMins,
    unexcusedPercentage,
    avgAbsentHoursPerStudent,
    avgUnexcusedHoursPerStudent,
    criticalStudentsCount,
    warningStudentsCount,
    normalStudentsCount
  };
}

/**
 * Full analysis pipeline for parsed students.
 */
export function runAnalysis(students, customThresholds = {}) {
  const thresholds = { ...DEFAULT_THRESHOLDS, ...customThresholds };
  const analyzedStudents = students.map(s => analyzeStudent(s, thresholds));
  const kpis = calculateKpis(analyzedStudents);
  const classes = aggregateClasses(analyzedStudents);

  return {
    kpis,
    classes,
    students: analyzedStudents,
    thresholds
  };
}
