# 📱 Attendance Facial Recognition System

> A mobile application for automated student attendance tracking using real-time facial recognition technology. Built with Framework7 v9 + Cordova, powered by face-api.js / TensorFlow.js for fully offline, on-device face recognition.

[![Framework7](https://img.shields.io/badge/Framework7-v9.0.2-blue)](https://framework7.io)
[![Cordova](https://img.shields.io/badge/Cordova-12.x-green)](https://cordova.apache.org)
[![TensorFlow.js](https://img.shields.io/badge/face--api.js-Local%20AI-orange)](https://github.com/vladmandic/face-api)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [Application Flow](#application-flow)
7. [Routes](#routes)
8. [State Management](#state-management)
9. [Installation](#installation)
10. [Usage & Build](#usage--build)
11. [Cordova Plugins](#cordova-plugins)
12. [Development Guide](#development-guide)
13. [Troubleshooting](#troubleshooting)

---

## Overview

The **Attendance Facial Recognition System** is a fully offline, privacy-first mobile application that automates student attendance using live camera-based face recognition. All processing — face detection, recognition, and data storage — happens locally on the device without any backend server or internet connection.

| Metric | Value |
|--------|-------|
| App ID | `proj.att.fc` |
| Version | `1.0.0` |
| Framework | Framework7 v9.0.2 |
| Minimum Android | API 24 (Android 7.0) |
| Minimum iOS | iOS 15.0 |
| Face Models | 3 (ssdMobilenetv1, faceLandmark68Net, faceRecognitionNet) |
| Local AI Engine | face-api.js (TensorFlow.js backend) |
| Database | SQLite (cordova-sqlite-storage) |

---

## Features

### 1. Live Facial Recognition
- Real-time camera feed with face detection overlay (bounding boxes + name labels)
- Automatic student identification using on-device TensorFlow.js models
- Confidence score display (minimum threshold: 0.6 / 60%)
- Multi-face detection support in a single frame
- 5-second duplicate detection window prevents rapid re-triggers

### 2. Attendance Recording (Enforced Alternating Sequence)
- Automatic **time-in** on first recognition each cycle
- Automatic **time-out** on next recognition if no time-out exists yet
- Unlimited daily cycles (time-in → time-out → time-in → …)
- SQL column aliases (`a.id as attendance_id`, `a.student_id as student_db_id`) prevent JOIN name collisions
- Comprehensive console logging with emoji indicators (`🆕 📋 ⏰ ✅ ❌`)

### 3. Role-Based Access Control
- **Admin**: Full access — Dashboard, Recognition, Attendance Records, Students, Settings
- **Operator**: Limited — Recognition tab only + minimal Settings
- `BottomToolbar.f7` renders tabs conditionally based on `isAdmin` store flag
- `.page-previous, .page-on-left` CSS rule hides stacked toolbars during F7 page transitions

### 4. Schedule Settings & Live Verification Strip
- Configurable school schedule: AM In/Out + PM In/Out times
- Live "Schedule Strip" on Attendance Records shows current period in real time
- Settings stored in SQLite `settings` table, loaded via `store.js` on app start

### 5. Student Database Management
- Full CRUD: add, edit, delete students
- Face encoding storage and update (retrain per student)
- CSV/Excel bulk import via SheetJS
- Search and filter by name, course, year level

### 6. Attendance Reports & Export
- Daily / date-range attendance views with CSS Grid date-nav (← date → Today)
- Export to CSV, PDF, Excel
- Email reports via `cordova-plugin-email-composer`
- Attendance statistics (present count, absent count, late, half-day)

### 7. SMS Parent Notifications
- Auto-send SMS on time-in and time-out via `cordova-sms-plugin`
- Silent background send (`android.intent: ''`) — no SMS composer popup
- Graceful fallback when SMS permission is denied

### 8. Offline-First Architecture
- 100% local: no backend, no cloud API calls required
- SQLite for all data (students, attendance, users, settings)
- Optional Google Drive / Dropbox backup via Cordova File plugin
- Works in airplane mode

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Framework7 | v9.0.2 | UI framework, routing, components |
| Vite | v5.x | Build tool & dev server |
| LESS | — | CSS preprocessor (CSS variables + golden ratio scale) |
| face-api.js | Latest | Face detection & recognition (TensorFlow.js) |

### Face Recognition Models
| Model | Purpose |
|-------|---------|
| ssdMobilenetv1 | Face detection in frame |
| faceLandmark68Net | 68-point facial landmark detection |
| faceRecognitionNet | 128-dimension face descriptor |

### Database & Storage
| Plugin | Purpose |
|--------|---------|
| cordova-sqlite-storage | Primary local database (4 tables) |
| cordova-plugin-file | File read/write for exports and backups |
| cordova-plugin-file-opener2 | Open exported CSV/PDF from device |

---

## Project Structure

```
attendance_facial_recognition/
├── src/
│   ├── index.html
│   ├── app.f7                        # Root Framework7 app component
│   ├── js/
│   │   ├── app.js                    # App initialisation & theme config
│   │   ├── routes.js                 # All 10 application routes
│   │   ├── store.js                  # Framework7 Store (global state)
│   │   ├── cordova-app.js            # Cordova deviceready handler
│   │   ├── framework7-custom.js      # F7 custom build options
│   │   └── utils/
│   │       ├── database.js           # SQLite schema, queries, CRUD helpers
│   │       ├── face-recognition.js   # face-api.js model loading & matching
│   │       ├── camera.js             # Camera preview management
│   │       ├── notifications.js      # SMS & local notifications
│   │       ├── export.js             # CSV / PDF / Excel export
│   │       ├── backup.js             # Cloud backup helpers
│   │       └── constants.js          # APP_CONFIG, roles, defaults
│   ├── pages/
│   │   ├── home.f7                   # Login page
│   │   ├── recognition.f7            # Live recognition screen (primary)
│   │   ├── camera.f7                 # Camera capture / face training
│   │   ├── 404.f7                    # Not-found page
│   │   ├── attendance/
│   │   │   ├── records.f7            # Attendance records + CSS Grid date-nav
│   │   │   └── details.f7            # Individual record detail
│   │   └── students/
│   │       ├── list.f7               # Student list (search + filter)
│   │       ├── add.f7                # Add new student + face capture
│   │       ├── edit.f7               # Edit student info
│   │       ├── details.f7            # Student detail + attendance history
│   │       └── import.f7             # Bulk CSV/Excel import
│   ├── components/
│   │   ├── BottomToolbar.f7          # Role-based bottom tab navigation
│   │   ├── AttendanceCard.f7         # Attendance entry card
│   │   ├── StudentCard.f7            # Student profile card
│   │   ├── StatCard.f7               # Stat summary card
│   │   ├── EmptyState.f7             # Empty state placeholder
│   │   └── LoadingSpinner.f7         # Loading indicator
│   ├── css/
│   │   ├── app.less                  # CSS variables, golden ratio scale, global rules
│   │   ├── framework7-custom.less    # Framework7 theme overrides
│   │   ├── components.css            # Compiled component styles
│   │   └── icons.css                 # Material Icons setup
│   └── assets/
│       ├── images/
│       ├── icons/
│       └── models/                   # face-api.js model weights
├── cordova/
│   ├── config.xml                    # App ID, permissions, plugin declarations
│   ├── plugins/                      # Installed Cordova plugins
│   ├── platforms/android/
│   ├── platforms/ios/
│   └── www/                          # Compiled Vite output (copy target)
├── build/build-cordova.js
├── vite.config.js
├── framework7.json
├── package.json
└── README.md
```

---

## Database Schema

All data is stored locally in SQLite via `cordova-sqlite-storage`. Initialised in `src/js/utils/database.js`.

### Table: `students`
| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER PK AUTOINCREMENT | Internal row ID |
| `student_id` | TEXT UNIQUE | School-assigned ID (e.g. `2024-001`) |
| `first_name` | TEXT | — |
| `last_name` | TEXT | — |
| `course` | TEXT | Department / programme |
| `year_level` | TEXT | e.g. `1st Year` |
| `parent_contact` | TEXT | Phone number for SMS notifications |
| `photo_path` | TEXT | Path to stored student photo |
| `face_encoding` | TEXT | JSON-serialised 128-dim face descriptor |
| `is_active` | INTEGER | `1` = active, `0` = inactive |
| `created_at` | DATETIME | Auto-set on INSERT |
| `updated_at` | DATETIME | Auto-updated on UPDATE |

### Table: `attendance`
| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER PK AUTOINCREMENT | `a.id as attendance_id` in JOINs |
| `student_id` | INTEGER FK → `students.id` | `a.student_id as student_db_id` in JOINs |
| `attendance_date` | TEXT | `YYYY-MM-DD` |
| `time_in` | TEXT | `HH:MM:SS` |
| `time_out` | TEXT | `HH:MM:SS` (NULL until check-out) |
| `status` | TEXT | `present`, `late`, `half-day`, `absent` |
| `confidence` | REAL | Recognition confidence 0–1 |
| `photo_path` | TEXT | Snapshot at recognition time |
| `created_at` | DATETIME | Auto-set on INSERT |

### Table: `users`
| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER PK AUTOINCREMENT | — |
| `username` | TEXT UNIQUE | Login username |
| `password` | TEXT | Hashed password |
| `role` | TEXT | `admin` or `operator` |
| `is_active` | INTEGER | `1` = active |
| `created_at` | DATETIME | — |

### Table: `settings`
| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER PK AUTOINCREMENT | — |
| `key` | TEXT UNIQUE | Setting name (e.g. `schedule_am_in`) |
| `value` | TEXT | Setting value |
| `updated_at` | DATETIME | — |

### Indexes
```sql
CREATE INDEX IF NOT EXISTS idx_attendance_date     ON attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_student  ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_students_active     ON students(is_active);
```

---

## Application Flow

### Startup
```
1. Vite serves index.html → loads app.js
2. Framework7 initialises with routes from routes.js
3. Auto-detect dark/light theme (prefers-color-scheme)
4. deviceready fires → Cordova plugins available
5. SQLite database initialised (tables created if not exist)
6. face-api.js models loaded from assets/models/
7. Store hydrated: auth, schedule settings, student cache
8. Navigate to /home/ (login page)
```

### Login → Role-Based Routing
```
/home/ → enter credentials → db.authenticateUser()
  Admin    → /recognition/  (BottomToolbar: Recognition + Attendance + Students)
  Operator → /recognition/  (BottomToolbar: Recognition only)
```

### Live Recognition Loop
```
Camera preview starts (cordova-plugin-camera-preview)
→ Capture frame every ~300ms
→ face-api.js: detectAllFaces() + computeFaceDescriptor()
→ Compare descriptor against stored face_encoding values
→ If confidence ≥ 0.6 AND not in 5s duplicate window:
    getTodayAttendance() with aliased JOIN
    studentRecords = records.filter(r => r.id === studentId)
    if 0 records          → recordTimeIn()
    if last.time_out null → recordTimeOut()
    if last.time_out set  → recordTimeIn()  // new cycle
    sendParentNotification(studentId, 'in'|'out')
```

---

## Routes

Defined in `src/js/routes.js`:

| Path | Component | Description |
|------|-----------|-------------|
| `/home/` | `pages/home.f7` | Login page |
| `/recognition/` | `pages/recognition.f7` | Live recognition (primary) |
| `/camera/` | `pages/camera.f7` | Camera capture / face training |
| `/attendance/records/` | `pages/attendance/records.f7` | Attendance records + date-nav |
| `/attendance/details/:id/` | `pages/attendance/details.f7` | Single record detail |
| `/students/` | `pages/students/list.f7` | Student list |
| `/students/add/` | `pages/students/add.f7` | Add new student |
| `/students/edit/:id/` | `pages/students/edit.f7` | Edit student |
| `/students/details/:id/` | `pages/students/details.f7` | Student detail + history |
| `/students/import/` | `pages/students/import.f7` | Bulk CSV/Excel import |

---

## State Management

The Framework7 Store (`src/js/store.js`) manages global reactive state:

```javascript
{
  user: null,            // { id, username, role }
  isAdmin: false,
  isAuthenticated: false,
  students: [],
  studentsLoaded: false,
  attendanceRecords: [],
  attendanceLoaded: false,
  recognitionActive: false,
  lastRecognizedStudent: null,
  recognitionCooldowns: {},   // { studentId: timestamp } 5s window
  cameraReady: false,
  cameraFacing: 'user',       // 'user' | 'environment'
  flashEnabled: false,
  schedule: {
    amIn: '07:00', amOut: '12:00',
    pmIn: '13:00', pmOut: '17:00',
  },
  dbReady: false,
  modelsLoaded: false,
}
```

### Constants (`src/js/utils/constants.js`)

| Constant | Value |
|----------|-------|
| `APP_CONFIG.VERSION` | `'1.0.0'` |
| `APP_CONFIG.DB_NAME` | `'attendance_db'` |
| `USER_ROLES.ADMIN` | `'admin'` |
| `USER_ROLES.OPERATOR` | `'operator'` |
| `RECOGNITION_DEFAULTS.MIN_CONFIDENCE` | `0.6` |
| `RECOGNITION_DEFAULTS.DUPLICATE_WINDOW_MS` | `5000` |
| `CAMERA_DEFAULTS.FRAME_INTERVAL_MS` | `300` |
| `EXPORT_FORMATS` | `['csv', 'pdf', 'excel']` |

---

## Installation

### Prerequisites
- Node.js 18+
- Cordova CLI: `npm install -g cordova`
- Android Studio + Android SDK (for Android builds)
- Xcode (for iOS builds, macOS only)

### Clone & Install

```bash
git clone https://github.com/bandeto45/attendance_facial_recognition.git
cd attendance_facial_recognition
npm install
cd cordova && npm install
```

### Add Platforms

```bash
cd cordova
cordova platform add android
cordova platform add ios   # macOS only
```

---

## Usage & Build

### NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server (http://localhost:5173) |
| `npm run build` | Production build to `www/` |
| `npm run build-cordova` | Build + copy to `cordova/www/` |

### Full Deploy to Android Device

```bash
npm run build-cordova && cd cordova && cordova run android --device
```

### Check Android Logs

```bash
adb logcat | grep -E "chromium|CordovaActivity|Attendance"
```

---

## Cordova Plugins

| Plugin | Purpose |
|--------|---------|
| `cordova-plugin-android-permissions` | Runtime permissions (SMS, Camera, Audio) |
| `cordova-plugin-camera-preview` | Continuous live camera feed |
| `cordova-plugin-email-composer` | Email attendance reports |
| `cordova-plugin-file` | File read/write for exports |
| `cordova-plugin-file-opener2` | Open exported CSV/PDF |
| `cordova-plugin-inappbrowser` | In-app web views |
| `cordova-plugin-keyboard` | Keyboard event handling |
| `cordova-plugin-statusbar` | Status bar colour/style |
| `cordova-plugin-vibration` | Haptic feedback on recognition |
| `cordova-sms-plugin` | Silent background SMS to parents |
| `cordova-sqlite-storage` | Local SQLite database |

### Runtime Permissions (Home Page Mount)

```javascript
permissions.requestPermissions([
  permissions.SEND_SMS,
  permissions.CAMERA,
  permissions.RECORD_AUDIO,
], (status) => { ... });
```

---

## Development Guide

### Framework7 v9 — Critical Rules

#### Use `$h` for array mappings
```javascript
// ✅ Correct — renders as HTML
${items.map((item) => $h`<li key=${item.id}>${item.name}</li>`)}

// ❌ Wrong — renders as plain text
${items.map((item) => `<li>${item.name}</li>`)}
```

#### Reusable components use `<${}>` syntax
```javascript
import BottomToolbar from '../../components/BottomToolbar.f7';
// in template:
<${BottomToolbar} active-tab="recognition" />
```

### CSS Architecture

Shared styles live in `src/css/` — never duplicate in `.f7` `<style>` blocks.

#### CSS Variables
```css
--attendance-primary:   #4CAF50   /* Green  — check-in / present */
--attendance-accent:    #FF5722   /* Red    — check-out / alert  */
--attendance-secondary: #232B2B   /* Charcoal — text             */
--attendance-bg:        #FFFFFF   /* Background (light mode)     */
```

#### Page Transition Toolbar Fix
```less
// src/css/app.less — hides previous page's toolbar during F7 transition
.page-previous, .page-on-left {
  .toolbar-bottom { display: none !important; }
  .navbar         { visibility: hidden !important; }
}
```

#### CSS Grid Date-Nav
`overflow: hidden` on a flex container clips children. Use CSS Grid:

```css
.date-nav {
  display: grid;
  grid-template-columns: 36px 1fr 36px 52px;  /* ← date → Today */
  gap: 6px;
  align-items: center;
  width: 100%;
}
```

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Date-nav shows only `<` button | `overflow: hidden` clips flex children | Use `display: grid; grid-template-columns: 36px 1fr 36px 52px` |
| Bottom toolbar appears twice | F7 keeps `.page-previous` in DOM during transition | Add `.page-previous { .toolbar-bottom { display: none } }` to `app.less` |
| Student always gets time-in, never time-out | SQL column collision — `s.student_id` overwrites `a.student_id` in JOIN | Use aliases: `a.id as attendance_id`, `a.student_id as student_db_id` |
| SMS not sending | `SEND_SMS` permission denied or wrong format | Grant on Home load; use `+63...` format |
| Camera black screen | Permission denied or plugin not initialised | Check `✅ Camera permission granted` in logcat |
| Face recognition never triggers | Models missing from `assets/models/` | Verify files exist; check `✅ Models loaded successfully` |
| Build error: `cordova/www` empty | Copy step in `build-cordova.js` failed | Run `npm run build` first, then copy script |

---

*App ID: `proj.att.fc` · Version: `1.0.0` · Platform: Android API 24+ / iOS 15+ · Last Updated: March 2, 2026*
