# Schul-Fehlzeiten Dashboard - Architektur & Spezifikation

## 1. Datenmodell (.csv)
Spalten:
- `studentId` (string/number)
- `name` (string)
- `klasse` (string, z. B. "9a", "10b")
- `klasseId` (string/number)
- `absentMins` (number)
- `absentMinsNotExcused` (number)
- `absentHours` (number)
- `absentHoursNotExcused` (number)

Trennzeichen: Komma `,`, Semikolon `;` oder Tabulator `\t` (automatische Erkennung via Delimiter-Sniffing).

## 2. Ports
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`

## 3. REST API Endpunkte (Backend)
- `POST /api/upload`
  - Multipart Form-Data mit Feld `file` (.csv)
  - Optional Query/Body mit Schwellenwerten (z. B. `unexcusedThresholdWarning: 4`, `unexcusedThresholdCritical: 10`, `absentHoursWarning: 20`, `absentHoursCritical: 35`)
  - Response:
    ```json
    {
      "success": true,
      "meta": {
        "fileName": "fehlzeiten_2026.csv",
        "totalStudents": 240,
        "processedAt": "2026-09-29T08:50:00Z"
      },
      "kpis": {
        "totalStudents": 240,
        "totalAbsentHours": 1820,
        "totalAbsentMins": 109200,
        "totalUnexcusedHours": 340,
        "totalUnexcusedMins": 20400,
        "unexcusedPercentage": 18.68,
        "avgAbsentHoursPerStudent": 7.58,
        "criticalStudentsCount": 14,
        "warningStudentsCount": 28,
        "normalStudentsCount": 198
      },
      "classes": [
        {
          "klasse": "9a",
          "klasseId": "K09A",
          "studentCount": 24,
          "totalAbsentHours": 290,
          "totalUnexcusedHours": 78,
          "avgAbsentHours": 12.08,
          "avgUnexcusedHours": 3.25,
          "unexcusedPercentage": 26.9,
          "criticalCount": 3,
          "warningCount": 5,
          "riskScore": 68.4
        }
      ],
      "students": [
        {
          "studentId": "S1001",
          "name": "Max Mustermann",
          "klasse": "9a",
          "klasseId": "K09A",
          "absentMins": 1200,
          "absentMinsNotExcused": 480,
          "absentHours": 20,
          "absentHoursNotExcused": 8,
          "unexcusedPercentage": 40.0,
          "status": "warning", // "critical" | "warning" | "normal"
          "riskFactors": [
            "Über 4 unentschuldigte Stunden (8h)",
            "Hoher unentschuldigter Anteil (40.0%)"
          ]
        }
      ]
    }
    ```
- `GET /api/sample`
  - Gibt Beispieldaten direkt im gleichen Schema zurück (für Sofort-Test & Demo ohne eigene Datei).
- `GET /api/health`
  - Statuscheck `{ "status": "ok" }`

## 4. Anomalie-Kriterien (Schulverwaltung)
- **Kritisch (Rot)**:
  - `absentHoursNotExcused >= 10` ODER
  - (`unexcusedPercentage >= 30%` UND `absentHours >= 10`) ODER
  - `absentHours >= 35` (Gefährdung Schulpflicht / Zeugnisnote)
- **Auffällig / Warnung (Gelb)**:
  - `absentHoursNotExcused >= 4` ODER
  - (`unexcusedPercentage >= 20%` UND `absentHours >= 6`) ODER
  - `absentHours >= 20`
- **Normal (Grün)**:
  - Alle anderen Schüler

Klassen-Risiko-Score (0-100):
`riskScore = min(100, round((criticalCount * 25 + warningCount * 10) / studentCount * 100 * 0.5 + unexcusedPercentage * 0.5))`
