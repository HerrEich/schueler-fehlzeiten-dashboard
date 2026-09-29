# Schul-Fehlzeiten Dashboard

Analyse-Dashboard für die Schulverwaltung zur schnellen Erkennung auffälliger Fehlzeiten von Schülern und Klassen.

## 🚀 Features

- **CSV-Import & Drag-and-Drop**: Importiert Fehlzeiten-Daten direkt aus Schulverwaltungssystemen.
  - Erkennt automatisch Trennzeichen (Komma `,`, Semikolon `;`, Tabulator `\t`).
  - Unterstützt UTF-8 mit und ohne BOM.
- **1-Klick Demo-Daten**: Sofortiges Testen aller Funktionen ohne eigene Datei.
- **KPI-Übersicht**:
  - Gesamtschüler, Gesamtfehlstunden, durchschnittliche Fehlzeit pro Schüler.
  - Unentschuldigte Fehlzeiten (Stunden und prozentualer Anteil).
  - Schnellzähler für kritische und auffällige Schüler.
- **Klassen-Vergleich & Risiko-Ranking**:
  - Automatischer Klassen-Risiko-Score (0–100) basierend auf unentschuldigter Quote und Risikofällen.
  - Direkter Klassenfilter durch Klick auf eine Klasse.
- **Schüler-Tabelle mit Mehrfachfiltern**:
  - Filter nach Klasse, Risikostufe (Kritisch / Auffällig / Normal), Textsuche (Name/ID).
  - Sortierbare Spalten nach Fehlstunden, unentschuldigten Stunden und Quote.
  - Farbige Status-Badges und detaillierte Risikofaktoren.
  - **CSV-Export**: Exportiert gefilterte Listen (z. B. für Klassenkonferenzen oder Elternbriefe).
- **Detail-Modal**:
  - Vollständige Aufschlüsselung von Stunden und Minuten (Gesamt, Entschuldigt, Unentschuldigt).
  - Handlungsempfehlungen / Checkliste für das Sekretariat und die Schulleitung.
- **Dynamische Schwellenwerte**:
  - Anpassbare Grenzwerte für unentschuldigte und Gesamtstunden mit sofortiger Neuberechnung.

---

## 📋 Erwartetes CSV-Format

Das System erwartet eine `.csv`-Datei mit folgenden Spalten:

```csv
studentId,name,klasse,klasseId,absentMins,absentMinsNotExcused,absentHours,absentHoursNotExcused
S1001,Maximilian Schmidt,9a,K09A,1800,720,30,12
S1002,Sophie Weber,9a,K09A,450,90,7.5,1.5
S1003,Leon Fischer,9a,K09A,2250,900,37.5,15
```

---

## 🛠️ Installation & Start

### Voraussetzungen
- Node.js (>= 18)
- npm

### 1. Backend starten
```bash
cd backend
npm install
npm start
```
*Backend läuft auf `http://localhost:5000`.*

### 2. Frontend starten
```bash
cd frontend
npm install
npm run dev
```
*Frontend läuft auf `http://localhost:3000`.*

### 3. Tests ausführen
```bash
npm test
```

---

## 🏗️ Architektur

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide-React.
- **Backend**: Node.js, Express, Multer, PapaParse.
