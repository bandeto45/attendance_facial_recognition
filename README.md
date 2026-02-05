# 📱 Attendance Facial Recognition System

> A mobile application for automated student attendance tracking using real-time facial recognition technology. Built with Framework7 v9 + Cordova, powered by TensorFlow.js for local face recognition processing.

[![Framework7](https://img.shields.io/badge/Framework7-v9.0.2-blue)](https://framework7.io)
[![Cordova](https://img.shields.io/badge/Cordova-12.x-green)](https://cordova.apache.org)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-Face--API-orange)](https://github.com/vladmandic/face-api)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [Application Flow](#application-flow)
7. [Installation](#installation)
8. [Usage](#usage)
9. [Build & Deploy](#build--deploy)
10. [Plugins & Libraries](#plugins--libraries)
11. [Development Guide](#development-guide)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

**Smart Attendance System** replaces traditional manual attendance methods with automated facial recognition. The system:

- ✅ **Detects and recognizes** student faces in real-time using TensorFlow.js
- ✅ **Records attendance** automatically (time-in/time-out with unlimited cycles)
- ✅ **Sends SMS notifications** to parents when students arrive/leave school
- ✅ **Stores data locally** in SQLite database (100% offline operation)
- ✅ **Exports reports** to CSV/PDF for easy sharing
- ✅ **Enforces validation** - prevents duplicate check-ins without time-out

### Key Highlights
- **Recognition Speed**: 2-3 seconds per student
- **Accuracy**: 70%+ confidence threshold with Euclidean distance matching
- **Privacy**: All data stays on device, no cloud servers
- **Cross-Platform**: Android & iOS support
- **Offline-First**: Works without internet connection

---

## ✨ Features

### 1. **Live Facial Recognition**
- Real-time face detection using TinyFaceDetector model
- 128-dimensional face descriptor computation
- Multiple face detection in single frame
- Confidence scoring (70%+ required for match)
- Camera controls (front/back switch, flash toggle)

### 2. **Smart Attendance Recording**
- **Automatic time-in/time-out** when face is recognized
- **Enforced alternating sequence**: Forces time-out before allowing next time-in
- **Unlimited daily cycles**: Students can check in/out multiple times per day
- **Duplicate prevention**: 5-second window between same student detections
- **Real-time validation**: Prevents multiple check-ins without check-out

### 3. **Parent Notifications**
- Automatic SMS notifications via `cordova-sms-plugin`
- Silent background sending (no SMS composer popup)
- Message format: "Your child [Name] has arrived/left school at [Time] on [Date]"
- Permission-based system with graceful fallbacks

### 4. **Student Management**
- Complete CRUD operations (Create, Read, Update, Delete)
- Face photo capture using camera preview
- Bulk import from CSV/Excel files
- Search and filter by name, ID, course, year level
- Active/inactive status tracking

### 5. **Attendance Reports**
- Daily/weekly/monthly attendance summaries
- Individual student attendance history
- Date range filtering
- Export to CSV/PDF/Excel formats
- Automatic file opening in native viewers

### 6. **Security & Privacy**
- All data stored locally in SQLite
- Face encodings encrypted
- User authentication (Admin/Operator roles)
- Audit trail for modifications
- No internet required (maximum privacy)

---

## 🛠️ Technology Stack

### Frontend Framework
- **Framework7 v9.0.2** - Mobile app framework with iOS & Material Design themes
- **Cordova 12.x** - Cross-platform mobile app wrapper
- **Vite 7.3.1** - Fast build tool and dev server
- **LESS** - CSS preprocessor for styling

### Face Recognition
- **@vladmandic/face-api v1.7.15** - TensorFlow.js-based face detection & recognition
- **TensorFlow.js** - Machine learning framework (runs locally)
- **Models Used**:
  - Tiny Face Detector (fast & lightweight)
  - Face Landmark 68 Model (facial landmarks)
  - Face Recognition Model (128D face descriptors)

### Database
- **cordova-sqlite-storage** - Native SQLite database for Cordova apps
- **Schema**: 2 tables (students, attendance)

### File Processing
- **PapaParse v5.5.3** - CSV parsing for bulk imports
- **XLSX v0.18.5** - Excel file reading/writing
- **PDFKit v0.17.2** - PDF generation for reports

### UI Components
- **Swiper v12.0.3** - Touch slider/carousel
- **Skeleton Elements v4.0.1** - Loading placeholders
- **Material Icons v1.13.14** - Icon library
- **Framework7 Icons v5.0.5** - Additional icons

---

## 📁 Project Structure

```
attendance_facial_recognition/
├── src/                              # Source code
│   ├── index.html                    # Main HTML entry
│   ├── app.f7                        # Root Framework7 component
│   │
│   ├── pages/                        # Framework7 Router Components (.f7)
│   │   ├── home.f7                   # Login page
│   │   ├── recognition.f7            # Recognition dashboard
│   │   ├── camera.f7                 # Live camera recognition (MAIN)
│   │   ├── 404.f7                    # Not found page
│   │   │
│   │   ├── attendance/               # Attendance pages
│   │   │   ├── records.f7            # Attendance records list
│   │   │   ├── details.f7            # Individual record details
│   │   │   └── reports.f7            # Reports & analytics
│   │   │
│   │   └── students/                 # Student management pages
│   │       ├── list.f7               # Student list with search/filter
│   │       ├── add.f7                # Add new student form
│   │       └── details.f7            # Student profile & history
│   │
│   ├── components/                   # Reusable .f7 Components
│   │   ├── BottomToolbar.f7          # Bottom navigation bar
│   │   ├── AttendanceCard.f7         # Attendance entry card
│   │   ├── StudentCard.f7            # Student profile card
│   │   ├── StatCard.f7               # Statistics card widget
│   │   ├── EmptyState.f7             # Empty state placeholder
│   │   └── LoadingSpinner.f7         # Loading spinner
│   │
│   ├── js/                           # JavaScript files
│   │   ├── app.js                    # App initialization & config
│   │   ├── routes.js                 # Route definitions
│   │   ├── store.js                  # Framework7 Store (state mgmt)
│   │   ├── cordova-app.js            # Cordova-specific initialization
│   │   ├── framework7-custom.js      # Custom Framework7 components
│   │   │
│   │   └── utils/                    # Utility modules
│   │       ├── database.js           # SQLite CRUD operations
│   │       ├── faceDetection.js      # Face detection logic
│   │       ├── face-recognition.js   # Face recognition & matching
│   │       ├── notifications.js      # SMS/notification service
│   │       ├── export.js             # Export to CSV/PDF/Excel
│   │       ├── fileStorage.js        # File system operations
│   │       ├── camera.js             # Camera utilities
│   │       ├── backup.js             # Backup/restore utilities
│   │       ├── storage.js            # Local storage wrapper
│   │       ├── modelLoader.js        # Load face recognition models
│   │       ├── seedDemoData.js       # Demo data seeder
│   │       └── constants.js          # App constants & config
│   │
│   ├── css/                          # Stylesheets
│   │   ├── app.less                  # Main styles (CSS variables, golden ratio)
│   │   ├── framework7-custom.less    # Framework7 theme overrides
│   │   ├── components.css            # Component-specific styles
│   │   └── icons.css                 # Icon fonts
│   │
│   ├── assets/                       # Static assets
│   │   ├── images/                   # App images
│   │   ├── icons/                    # App icons
│   │   └── models/                   # Face recognition models
│   │       ├── tiny_face_detector_model-weights_manifest.json
│   │       ├── face_landmark_68_model-weights_manifest.json
│   │       └── face_recognition_model-weights_manifest.json
│   │
│   └── fonts/                        # Icon fonts (Material Icons, Framework7 Icons)
│
├── cordova/                          # Cordova project folder
│   ├── config.xml                    # Cordova configuration
│   ├── platforms/                    # Platform-specific code (Android, iOS)
│   ├── plugins/                      # Installed Cordova plugins
│   ├── www/                          # Built app files (auto-generated)
│   └── res/                          # Resources (icons, splash screens)
│
├── build/                            # Build scripts
│   └── build-cordova.js              # Cordova build automation
│
├── public/                           # Public assets (copied to build)
├── package.json                      # npm dependencies
├── vite.config.js                    # Vite bundler configuration
├── framework7.json                   # Framework7 CLI config
└── README.md                         # This file
```

---

## 🗄️ Database Schema

### SQLite Database: `attendance.db`

#### **Table: `students`**
Stores student profile information and face encodings.

```sql
CREATE TABLE students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT UNIQUE NOT NULL,           -- Student ID (e.g., "2021-001")
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  course TEXT,
  year_level INTEGER,
  photo_path TEXT,                            -- Path to face photo
  face_encoding TEXT,                         -- JSON array of 128D descriptor
  status TEXT DEFAULT 'active',               -- 'active' or 'inactive'
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

#### **Table: `attendance`**
Stores attendance records with time-in and time-out timestamps.

```sql
CREATE TABLE attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,               -- Foreign key to students.id
  attendance_date TEXT NOT NULL,             -- Date (YYYY-MM-DD)
  time_in TEXT,                              -- Time-in (HH:MM:SS)
  time_out TEXT,                             -- Time-out (HH:MM:SS) or NULL
  status TEXT DEFAULT 'present',             -- 'present', 'late', 'absent'
  confidence REAL,                           -- Recognition confidence (0-100)
  photo_path TEXT,                           -- Optional photo at check-in
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id)
);
```

### Database Operations (CRUD)

#### **Students Table**

```javascript
// CREATE - Add new student
await db.addStudent({
  student_id: '2021-001',
  first_name: 'John',
  last_name: 'Doe',
  course: 'Computer Science',
  year_level: 3,
  photo_path: '/path/to/photo.jpg',
  face_encoding: JSON.stringify([...128D_array]),
  status: 'active'
});

// READ - Get all students
const students = await db.getAllStudents();

// READ - Get single student
const student = await db.getStudent(studentId);

// READ - Get students with face encodings
const activeStudents = await db.getStudentsWithEncodings();

// UPDATE - Update student info
await db.updateStudent(studentId, {
  course: 'Information Technology',
  year_level: 4
});

// UPDATE - Update face encoding
await db.updateFaceEncoding(studentId, encodingArray);

// DELETE - Delete student
await db.deleteStudent(studentId);

// SEARCH - Search students by name/ID
const results = await db.searchStudents('John');
```

#### **Attendance Table**

```javascript
// CREATE - Record time-in
await db.recordTimeIn(studentId, confidence, photoPath);

// CREATE/UPDATE - Record time-out
await db.recordTimeOut(studentId, confidence, photoPath);

// READ - Get today's attendance
const todayRecords = await db.getTodayAttendance();

// READ - Get attendance by date
const records = await db.getAttendanceByDate('2026-02-05');

// READ - Get attendance by date range
const records = await db.getAttendanceByDateRange('2026-02-01', '2026-02-28');

// READ - Get student's attendance history
const history = await db.getStudentAttendanceHistory(studentId, startDate, endDate);

// READ - Get attendance summary
const summary = await db.getAttendanceSummary(date);

// UPDATE - Update attendance record
await db.updateAttendanceRecord(recordId, { status: 'late' });

// DELETE - Delete attendance record
await db.deleteAttendanceRecord(recordId);
```

### Database Initialization Flow

```javascript
// On app startup
const db = new Database();

// Initialize database
await db.init();

// Create tables if not exist
await db.createTables();

// Optional: Seed demo data (development only)
await seedDemoData(db);
```

---

## 🔄 Application Flow

### Complete User Journey

```
┌─────────────────────────────────────────────────────────────┐
│                    APP STARTUP                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Device Ready Event                                       │
│     - Initialize Cordova plugins                             │
│     - Load SQLite database                                   │
│     - Request permissions (SMS, Camera, Audio)               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Login Page (home.f7)                                     │
│     - User authentication                                    │
│     - Role selection (Admin/Operator)                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Main Dashboard                                           │
│     - Navigation to: Recognition / Attendance / Students     │
│     - No settings page (all controls in-page)                │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┼───────────┐
                │           │           │
                ▼           ▼           ▼
        ┌────────────┐ ┌────────────┐ ┌────────────┐
        │Recognition │ │ Attendance │ │  Students  │
        │   Page     │ │   Records  │ │    List    │
        └────────────┘ └────────────┘ └────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Camera Page (camera.f7) - MAIN FEATURE                  │
│                                                              │
│  a) Start Camera                                             │
│     - Request camera permission                              │
│     - Initialize cordova-plugin-camera-preview               │
│     - Set camera resolution & facing mode                    │
│                                                              │
│  b) Load Face Recognition Models                            │
│     - Load TinyFaceDetector model                            │
│     - Load FaceLandmark68 model                              │
│     - Load FaceRecognition model                             │
│                                                              │
│  c) Face Detection Loop (runs continuously)                 │
│     - Capture frame from video stream                        │
│     - Detect faces using TinyFaceDetector                    │
│     - Extract facial landmarks (68 points)                   │
│     - Compute 128D face descriptor                           │
│                                                              │
│  d) Face Recognition & Matching                             │
│     - Compare descriptor with database                       │
│     - Calculate Euclidean distance                           │
│     - Match if distance < 0.6 threshold                      │
│     - Return student info if match found                     │
│                                                              │
│  e) Attendance Validation                                   │
│     - Query today's attendance records                       │
│     - Check if student has records today                     │
│     - Apply validation rules (see below)                     │
│                                                              │
│  f) Record Attendance                                       │
│     - Insert/Update attendance record in SQLite              │
│     - Send SMS notification to parent                        │
│     - Display success toast to user                          │
│     - Continue detection loop                                │
└─────────────────────────────────────────────────────────────┘
```

### Attendance Validation Logic

**Critical: Enforced Alternating Time-In/Time-Out Sequence**

```javascript
// Step 1: Get today's records for recognized student
const todayRecords = await db.getTodayAttendance();
const studentRecords = todayRecords.filter(r => r.id === studentId);

// Step 2: Apply validation rules
if (studentRecords.length === 0) {
  // Rule 1: FIRST TIME TODAY → Record TIME-IN
  await db.recordTimeIn(studentId, confidence);
  await sendNotification(studentId, 'in');
  showToast('✓ Time-in recorded');
  
} else {
  const lastRecord = studentRecords[0]; // Most recent record
  
  if (!lastRecord.time_out) {
    // Rule 2: HAS TIME-IN BUT NO TIME-OUT → Force TIME-OUT
    await db.recordTimeOut(studentId, confidence);
    await sendNotification(studentId, 'out');
    showToast('✓ Time-out recorded');
    
  } else {
    // Rule 3: HAS TIME-OUT → Allow NEW TIME-IN (new cycle)
    await db.recordTimeIn(studentId, confidence);
    await sendNotification(studentId, 'in');
    showToast('✓ Time-in recorded (new cycle)');
  }
}
```

**Key Points:**
- ✅ Prevents duplicate check-ins without time-out
- ✅ Supports unlimited daily cycles (in/out/in/out...)
- ✅ Uses proper SQL aliases to avoid column name collision
- ✅ Filters by `r.id === studentId` (not `r.student_id`)

### Face Recognition Process

```
1. Camera Frame Capture
   ↓
2. Face Detection (TinyFaceDetector)
   - Detect faces in frame
   - Return bounding boxes
   ↓
3. Facial Landmark Detection
   - Detect 68 facial landmarks
   - Normalize face alignment
   ↓
4. Face Descriptor Computation
   - Compute 128-dimensional descriptor
   - Unique numerical representation of face
   ↓
5. Database Comparison
   - Load all active students with encodings
   - Compare descriptor with each stored encoding
   ↓
6. Distance Calculation (Euclidean Distance)
   - Calculate distance between descriptors
   - Lower distance = better match
   ↓
7. Match Decision
   - If distance < 0.6 → MATCH FOUND
   - If distance >= 0.6 → NO MATCH
   ↓
8. Return Result
   - Student info + confidence score
   - Or null if no match
```

### SMS Notification Flow

```javascript
// When attendance is recorded
async function sendNotification(studentId, status) {
  // 1. Get student info from database
  const student = await db.getStudent(studentId);
  
  // 2. Check if parent contact exists
  if (!student.parent_contact) {
    console.log('No parent contact - skipping SMS');
    return;
  }
  
  // 3. Check SMS permission
  const hasPermission = await notifications.checkSMSPermission();
  if (!hasPermission) {
    await notifications.requestSMSPermission();
  }
  
  // 4. Build message
  const message = buildMessage(student.first_name, status);
  // Example: "Your child John Doe has arrived at school at 8:30 AM on Feb 5, 2026"
  
  // 5. Send SMS silently (no composer popup)
  const options = {
    replaceLineBreaks: false,
    android: { intent: '' } // Silent send
  };
  
  await smsPlugin.send(student.parent_contact, message, options);
  
  // 6. Log success
  console.log('✅ SMS sent successfully');
}
```

---

## 📦 Installation

### Prerequisites

```bash
# Required software
node --version     # v18.0.0 or higher
npm --version      # v9.0.0 or higher

# For Android development
android --version  # Android SDK Platform 30+
java -version      # JDK 11 or higher

# For iOS development (Mac only)
xcodebuild -version # Xcode 14+
pod --version      # CocoaPods
```

### Getting the Project from GitHub

#### Option 1: Clone via HTTPS (Recommended for beginners)

```bash
# Clone the repository
git clone https://github.com/your-username/attendance-facial-recognition.git

# Navigate into the project directory
cd attendance-facial-recognition
```

#### Option 2: Clone via SSH (For users with SSH keys configured)

```bash
# Clone the repository using SSH
git clone git@github.com:your-username/attendance-facial-recognition.git

# Navigate into the project directory
cd attendance-facial-recognition
```

#### Option 3: Download as ZIP

If you don't have Git installed or prefer not to use it:

1. **Visit the GitHub repository** in your browser:
   ```
   https://github.com/your-username/attendance-facial-recognition
   ```

2. **Click the green "Code" button** at the top right of the file list

3. **Select "Download ZIP"** from the dropdown menu

4. **Extract the ZIP file** to your desired location:
   ```bash
   # macOS/Linux
   unzip attendance-facial-recognition-main.zip
   cd attendance-facial-recognition-main
   
   # Windows (PowerShell)
   Expand-Archive attendance-facial-recognition-main.zip
   cd attendance-facial-recognition-main
   ```

#### Option 4: Fork the Repository (For contributors)

If you plan to contribute or maintain your own version:

1. **Visit the repository** on GitHub:
   ```
   https://github.com/your-username/attendance-facial-recognition
   ```

2. **Click the "Fork" button** at the top right of the page

3. **Clone your forked repository**:
   ```bash
   # Replace YOUR_USERNAME with your GitHub username
   git clone https://github.com/YOUR_USERNAME/attendance-facial-recognition.git
   cd attendance-facial-recognition
   ```

4. **Add upstream remote** (to sync with original repository):
   ```bash
   git remote add upstream https://github.com/your-username/attendance-facial-recognition.git
   
   # Verify remotes
   git remote -v
   # Should show:
   # origin    https://github.com/YOUR_USERNAME/attendance-facial-recognition.git (fetch)
   # origin    https://github.com/YOUR_USERNAME/attendance-facial-recognition.git (push)
   # upstream  https://github.com/your-username/attendance-facial-recognition.git (fetch)
   # upstream  https://github.com/your-username/attendance-facial-recognition.git (push)
   ```

5. **Keep your fork updated**:
   ```bash
   # Fetch upstream changes
   git fetch upstream
   
   # Merge upstream changes to your main branch
   git checkout main
   git merge upstream/main
   
   # Push updates to your fork
   git push origin main
   ```

#### Verify Git Installation

If you don't have Git installed:

**macOS:**
```bash
# Install via Homebrew
brew install git

# Or download from: https://git-scm.com/download/mac
```

**Windows:**
```bash
# Download Git for Windows
# https://git-scm.com/download/win

# Or install via Chocolatey
choco install git
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install git
```

**Verify installation:**
```bash
git --version
# Should output: git version 2.x.x
```

### Step-by-Step Installation

Once you have the project files from GitHub, follow these steps:

#### 1. Verify Project Structure
```bash
# List project contents
ls -la

# Should see:
# src/
# cordova/
# package.json
# vite.config.js
# README.md
# etc.
```

#### 2. Install Dependencies
```bash
# Install npm packages
npm install

# This will automatically:
# - Install node_modules
# - Copy icon fonts to src/fonts/
# - Copy assets to public/assets/
```

#### 3. Install Cordova CLI (if not installed)
```bash
npm install -g cordova
```

#### 4. Setup Cordova Platforms
```bash
cd cordova

# Add Android platform
cordova platform add android

# Add iOS platform (Mac only)
cordova platform add ios

cd ..
```

#### 5. Verify Plugin Installation
```bash
cd cordova
cordova plugin list

# Should show:
# cordova-plugin-camera-preview 0.14.0
# cordova-plugin-email-composer 0.10.1
# cordova-plugin-file 8.1.3
# cordova-plugin-keyboard 1.3.0
# cordova-plugin-statusbar 4.0.0
# cordova-plugin-vibration 3.1.1
# cordova-sqlite-storage 7.0.0
```

---

## 🚀 Usage

### Development Mode (Browser Testing)

```bash
# Start development server with hot reload
npm run dev

# Open browser at http://localhost:3000
# Note: Camera and SQLite features won't work in browser
```

### Build for Production

```bash
# Build web version
npm run build

# Build Cordova app (both Android & iOS)
npm run build-cordova
```

### Build for Android

```bash
# Build Android APK (debug)
npm run cordova-android

# Output: cordova/platforms/android/app/build/outputs/apk/debug/app-debug.apk

# Build Android APK (release)
cd cordova
cordova build android --release

# Sign the APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
  -keystore my-release-key.keystore \
  platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk \
  alias_name
```

### Build for iOS (Mac Only)

```bash
# Build iOS app
npm run cordova-ios

# This will open Xcode
# Or manually: open cordova/platforms/ios/App.xcworkspace

# In Xcode:
# 1. Select your team and signing certificate
# 2. Connect iOS device
# 3. Click Run
```

### Run on Device

```bash
# Android (USB debugging enabled)
cd cordova
cordova run android --device

# iOS (Mac only, provisioning profile required)
cordova run ios --device
```

---

## 🔧 Build & Deploy

### Complete Build Process

```bash
# Clean previous builds
rm -rf cordova/www
rm -rf cordova/platforms/android/build

# Build from scratch
npm run build-cordova

# Or step by step:
# 1. Copy assets
npm run copy-assets

# 2. Build with Vite
cross-env TARGET=cordova NODE_ENV=production vite build

# 3. Copy to Cordova
node ./build/build-cordova.js

# 4. Build Android
cd cordova && cordova build android
```

### APK Installation

```bash
# Install via ADB
adb install cordova/platforms/android/app/build/outputs/apk/debug/app-debug.apk

# Or manually:
# 1. Copy APK to device
# 2. Open file manager on device
# 3. Tap APK file to install
# 4. Allow "Install from unknown sources"
```

### Release Checklist

- [ ] Update version in `cordova/config.xml`
- [ ] Update version in `package.json`
- [ ] Test all features on real device
- [ ] Check SMS notifications working
- [ ] Verify face recognition accuracy
- [ ] Test database operations
- [ ] Export attendance reports
- [ ] Build release APK
- [ ] Sign APK with release key
- [ ] Test signed APK on device
- [ ] Create release notes
- [ ] Tag release in git: `git tag v1.0.0`

---

## 📚 Plugins & Libraries

### Cordova Plugins

| Plugin | Version | Purpose | Source |
|--------|---------|---------|--------|
| **cordova-plugin-camera-preview** | 0.14.0 | Live camera feed for face detection | [GitHub](https://github.com/cordova-plugin-camera-preview/cordova-plugin-camera-preview) |
| **cordova-sqlite-storage** | 7.0.0 | Native SQLite database | [GitHub](https://github.com/xpbrew/cordova-sqlite-storage) |
| **cordova-plugin-file** | 8.1.3 | File system access | [GitHub](https://github.com/apache/cordova-plugin-file) |
| **cordova-plugin-email-composer** | 0.10.1 | Email sharing | [GitHub](https://github.com/katzer/cordova-plugin-email-composer) |
| **cordova-plugin-statusbar** | 4.0.0 | Status bar styling | [GitHub](https://github.com/apache/cordova-plugin-statusbar) |
| **cordova-plugin-keyboard** | 1.3.0 | Keyboard control | [GitHub](https://github.com/apache/cordova-plugin-keyboard) |
| **cordova-plugin-vibration** | 3.1.1 | Haptic feedback | [GitHub](https://github.com/apache/cordova-plugin-vibration) |

**SMS Plugin (Manual Install):**
```bash
cd cordova
cordova plugin add cordova-sms-plugin
# For Android: Adds SEND_SMS & READ_PHONE_STATE permissions
```

### NPM Libraries

#### Core Framework
```json
{
  "framework7": "^9.0.2",           // Mobile app framework
  "dom7": "^4.0.6",                 // DOM manipulation
  "swiper": "^12.0.3"               // Touch slider
}
```

#### Face Recognition
```json
{
  "@vladmandic/face-api": "^1.7.15"  // TensorFlow.js face detection
}
```

#### File Processing
```json
{
  "papaparse": "^5.5.3",            // CSV parsing
  "xlsx": "^0.18.5",                // Excel files
  "pdfkit": "^0.17.2"               // PDF generation
}
```

#### UI Components
```json
{
  "framework7-icons": "^5.0.5",     // Framework7 icons
  "material-icons": "^1.13.14",     // Material Design icons
  "skeleton-elements": "^4.0.1"     // Loading skeletons
}
```

#### Build Tools
```json
{
  "vite": "^7.3.1",                 // Build tool
  "less": "^4.5.1",                 // CSS preprocessor
  "cross-env": "^10.1.0",           // Cross-platform env vars
  "cpy-cli": "^6.0.0"               // File copying
}
```

### Model Files (included in project)

Face recognition models located in `src/assets/models/`:

```
├── tiny_face_detector_model-shard1
├── tiny_face_detector_model-weights_manifest.json
├── face_landmark_68_model-shard1
├── face_landmark_68_model-weights_manifest.json
├── face_recognition_model-shard1
├── face_recognition_model-shard2
└── face_recognition_model-weights_manifest.json
```

**Total size**: ~6MB  
**Source**: [@vladmandic/face-api](https://github.com/vladmandic/face-api) pre-trained models

---

## 💻 Development Guide

### Project Configuration Files

#### `package.json`
- npm dependencies
- Build scripts
- Browserslist targets

#### `vite.config.js`
```javascript
// Vite bundler configuration
- Entry point: src/index.html
- Output: www/ (for web) or cordova/www/ (for mobile)
- Asset handling
- Environment variables
```

#### `cordova/config.xml`
```xml
<!-- Cordova app configuration -->
- App ID: proj.att.fc
- App name: Attendance Monitoring
- Plugins list
- Platform preferences
- Permissions (SMS, Camera, etc.)
```

#### `framework7.json`
```json
// Framework7 CLI configuration
- Custom color theme
- Components included
- Build options
```

### Key JavaScript Modules

#### `src/js/app.js` - App Initialization
```javascript
// Initializes Framework7 app
- Theme configuration (iOS/Material)
- Routes registration
- Store initialization
- Cordova integration
```

#### `src/js/routes.js` - Route Configuration
```javascript
// All app routes
- Login: /
- Recognition: /recognition/
- Camera: /camera/:mode/
- Attendance: /attendance/records/
- Students: /students/
```

#### `src/js/store.js` - State Management
```javascript
// Framework7 Store for global state
- User session
- Current student data
- Attendance records
- App preferences
```

#### `src/js/utils/database.js` - Database Layer
```javascript
// SQLite database operations
class Database {
  async init()                          // Initialize database
  async createTables()                  // Create schema
  
  // Students CRUD
  async addStudent(data)
  async getStudent(id)
  async getAllStudents()
  async updateStudent(id, data)
  async deleteStudent(id)
  async searchStudents(query)
  
  // Attendance CRUD
  async recordTimeIn(studentId, confidence)
  async recordTimeOut(studentId, confidence)
  async getTodayAttendance()
  async getAttendanceByDate(date)
  async getAttendanceByDateRange(start, end)
  async getStudentAttendanceHistory(studentId)
  
  // Face Encodings
  async updateFaceEncoding(studentId, encoding)
  async getStudentsWithEncodings()
}
```

#### `src/js/utils/faceDetection.js` - Face Detection
```javascript
// Face detection using face-api.js
async function loadModels()              // Load TensorFlow models
async function detectFaces(videoElement) // Detect faces in frame
async function getFaceDescriptor(detection) // Get 128D descriptor
function euclideanDistance(desc1, desc2) // Calculate distance
```

#### `src/js/utils/face-recognition.js` - Face Recognition
```javascript
// Face recognition & matching
async function recognizeFace(descriptor, students) {
  // Compare with all students
  // Return best match if distance < threshold
}

async function startRecognitionLoop(videoElement, students, onMatch) {
  // Continuous face detection loop
  // Call onMatch when student recognized
}
```

#### `src/js/utils/notifications.js` - Notifications
```javascript
// SMS & notification service
class NotificationService {
  async init()
  async requestSMSPermission()
  async sendSMS(phoneNumber, message)
  async sendParentNotification(studentId, status)
}
```

#### `src/js/utils/export.js` - Export Service
```javascript
// Export attendance to files
async function exportToCSV(data, filename)
async function exportToPDF(data, filename)
async function exportToExcel(data, filename)
async function saveFileToDevice(blob, filename)
async function openFile(filePath, mimeType)
```

### CSS Architecture

#### `src/css/app.less` - Main Stylesheet
```less
// CSS Variables (Golden Ratio Design System)
:root {
  // Colors
  --attendance-primary: #4CAF50;     // Green
  --attendance-accent: #FF5722;      // Red
  --attendance-secondary: #232B2B;   // Dark
  
  // Typography (Golden Ratio Scale)
  --font-base: 16px;
  --font-lg: 22px;
  --font-xl: 26px;
  
  // Spacing (Golden Ratio Scale)
  --space-1: 8px;
  --space-2: 13px;
  --space-3: 16px;
  --space-4: 21px;
  
  // Border Radius
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
}

// Utility Classes
.m-{size}, .p-{size}     // Margin/padding
.text-{size}             // Font sizes
.color-{name}            // Text colors
.bg-{name}               // Background colors
.rounded-{size}          // Border radius
.flex, .grid             // Layout
```

#### Component Styling Pattern
```less
// BEM-style naming
.component-name {
  // Base styles
  
  &--modifier {
    // Variant styles
  }
  
  &__element {
    // Child element styles
  }
  
  &.theme-dark {
    // Dark mode overrides
  }
}
```

### Adding New Features

#### 1. Create New Page
```bash
# Create new .f7 file
touch src/pages/myfeature/mypage.f7
```

```html
<!-- src/pages/myfeature/mypage.f7 -->
<template>
  <div class="page">
    <div class="navbar">
      <div class="navbar-bg"></div>
      <div class="navbar-inner">
        <div class="left">
          <a href="#" class="link back">
            <i class="icon material-icons">arrow_back</i>
          </a>
        </div>
        <div class="title">My Feature</div>
      </div>
    </div>
    
    <div class="page-content">
      <h1>Content here</h1>
    </div>
  </div>
</template>

<script>
export default (props, { $f7, $on, $onMounted }) => {
  $onMounted(() => {
    console.log('Page mounted');
  });
  
  return $render;
}
</script>

<style scoped>
/* Page-specific styles */
</style>
```

#### 2. Register Route
```javascript
// src/js/routes.js
import MyPage from '../pages/myfeature/mypage.f7';

const routes = [
  // ... existing routes
  {
    path: '/myfeature/',
    component: MyPage,
  },
];
```

#### 3. Add Navigation
```html
<!-- In any page -->
<a href="/myfeature/" class="link">
  Go to My Feature
</a>
```

### Debugging

#### Enable Debug Logs
```javascript
// src/js/app.js
const app = f7.createApp({
  // ...
  debug: true, // Enable Framework7 debug logs
});
```

#### Console Logging Pattern
```javascript
// Use emoji prefixes for easier log filtering
console.log('🚀 App Started');
console.log('📱 Permission granted');
console.log('📷 Camera started');
console.log('👤 Face detected');
console.log('✅ Success');
console.log('❌ Error occurred');
console.log('⚠️ Warning');
```

#### View Android Logs
```bash
# View all logs
adb logcat

# Filter by tag
adb logcat | grep "Attendance"

# View errors only
adb logcat *:E

# Clear logs
adb logcat -c
```

#### View iOS Logs (Mac)
```bash
# Using Xcode
# Window → Devices and Simulators → Select device → View Device Logs

# Or using command line
idevicesyslog

# Filter logs
idevicesyslog | grep "Attendance"
```

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. **Camera Not Starting**

**Symptoms:**
- Black screen on camera page
- Error: "Camera permission denied"

**Solutions:**
```bash
# Check permissions in device settings
# Settings → Apps → Attendance → Permissions → Camera (Allow)

# Restart app after granting permission

# Check if camera plugin installed
cd cordova
cordova plugin list | grep camera-preview
```

**Debug Code:**
```javascript
// In camera.f7
console.log('📷 Camera permission status:', hasPermission);
console.log('📸 Starting camera with options:', cameraOptions);
```

#### 2. **SQLite Database Not Initializing**

**Symptoms:**
- Error: "SQLite plugin not available"
- Database operations fail

**Solutions:**
```bash
# Verify plugin installed
cd cordova
cordova plugin list | grep sqlite

# Reinstall if missing
cordova plugin remove cordova-sqlite-storage
cordova plugin add cordova-sqlite-storage

# Rebuild app
cd ..
npm run build-cordova
```

**Debug Code:**
```javascript
// In database.js
console.log('🗄️ SQLite plugin available:', !!window.sqlitePlugin);
console.log('📊 Database initialized:', db.isInitialized);
```

#### 3. **Face Recognition Models Not Loading**

**Symptoms:**
- Error: "Failed to load models"
- Face detection not working

**Solutions:**
```bash
# Check if model files exist
ls -lh src/assets/models/

# Should see:
# tiny_face_detector_model-*
# face_landmark_68_model-*
# face_recognition_model-*

# Verify files copied to build
ls -lh cordova/www/assets/models/

# If missing, rebuild
npm run build-cordova
```

**Debug Code:**
```javascript
// In faceDetection.js
console.log('🔄 Loading models from:', modelPath);
console.log('✅ Models loaded successfully');
```

#### 4. **SMS Not Sending**

**Symptoms:**
- Attendance recorded but no SMS sent
- Error: "SMS permission not granted"

**Solutions:**
```bash
# Check SMS plugin installed
cd cordova
cordova plugin list | grep sms

# Install if missing
cordova plugin add cordova-sms-plugin

# Check permissions in config.xml
grep SEND_SMS cordova/config.xml
# Should see: <uses-permission android:name="android.permission.SEND_SMS" />

# Grant permission in device settings
# Settings → Apps → Attendance → Permissions → SMS (Allow)
```

**Debug Code:**
```javascript
// In notifications.js
console.log('📱 SMS permission granted:', this.smsPermissionGranted);
console.log('💬 Sending SMS to:', phoneNumber);
console.log('✅ SMS sent successfully');
```

#### 5. **Build Errors**

**Error: "Cannot find module"**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error: "Cordova platform not found"**
```bash
cd cordova
cordova platform add android
cd ..
```

**Error: "Vite build failed"**
```bash
# Clear cache and rebuild
rm -rf .vite
rm -rf www
rm -rf cordova/www
npm run build-cordova
```

#### 6. **APK Installation Failed**

**Error: "App not installed"**
```bash
# Uninstall old version first
adb uninstall proj.att.fc

# Then install new APK
adb install cordova/platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

**Error: "Signature mismatch"**
```bash
# This happens when trying to install over existing app with different signature
# Solution: Uninstall the old app completely first
```

### Performance Optimization

#### Face Recognition Performance
```javascript
// Adjust detection interval (in faceDetection.js)
const DETECTION_INTERVAL = 500; // milliseconds (default: 500ms)

// Reduce confidence threshold (less accurate but faster)
const CONFIDENCE_THRESHOLD = 0.65; // (default: 0.7)

// Use smaller input size
const inputSize = 320; // (default: 416, options: 128/160/224/320/416/512/608)
```

#### Database Performance
```javascript
// Use indexed queries
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_student_id ON students(student_id);

// Limit query results
SELECT * FROM attendance LIMIT 100;

// Use prepared statements (already implemented in database.js)
```

#### App Performance
```bash
# Enable production build (minification, tree-shaking)
cross-env NODE_ENV=production vite build

# Analyze bundle size
npm run build -- --mode analyze
```

### Getting Help

#### Documentation
- **Project Docs**: `/PROJECT_DOCUMENTATION.md`
- **Instructions**: `/.github/instructions/attendance-live-recog.instructions.md`
- **Framework7 Docs**: https://framework7.io/docs/
- **Cordova Docs**: https://cordova.apache.org/docs/
- **face-api.js**: https://github.com/vladmandic/face-api

#### Support Channels
- **GitHub Issues**: Report bugs and feature requests
- **Email**: support@attendance-app.com
- **Forum**: Framework7 Community Forum

#### Debug Commands Cheatsheet
```bash
# View running processes
adb shell ps | grep proj.att.fc

# Clear app data
adb shell pm clear proj.att.fc

# View app storage
adb shell run-as proj.att.fc ls -la

# Export database from device
adb shell run-as proj.att.fc cat databases/attendance.db > attendance.db

# Take screenshot
adb shell screencap /sdcard/screenshot.png
adb pull /sdcard/screenshot.png

# Record screen video
adb shell screenrecord /sdcard/demo.mp4
# (Ctrl+C to stop)
adb pull /sdcard/demo.mp4
```

---

## 📄 License

**Proprietary License**

© 2026 Attendance Facial Recognition System. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, distribution, or use of this software, via any medium, is strictly prohibited.

For licensing inquiries, contact: your@email.com

---

## 👥 Contributors

- **Developer**: Your Name
- **Organization**: Your School/Company
- **Year**: 2026

---

## 🔗 Resources

### Official Documentation
- [Framework7 Documentation](https://framework7.io/docs/)
- [Cordova Documentation](https://cordova.apache.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [face-api.js GitHub](https://github.com/vladmandic/face-api)

### Tutorials & Guides
- [Framework7 React Tutorial](https://framework7.io/react/)
- [Cordova Plugin Development](https://cordova.apache.org/docs/en/latest/guide/hybrid/plugins/)
- [TensorFlow.js Face Detection](https://github.com/tensorflow/tfjs-models/tree/master/face-detection)

### Community
- [Framework7 Forum](https://forum.framework7.io)
- [Cordova Community](https://cordova.apache.org/community/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/framework7)

---

## 📊 Project Statistics

- **Lines of Code**: ~15,000+
- **Files**: 50+ (.f7, .js, .less, etc.)
- **Database Tables**: 2 (students, attendance)
- **Cordova Plugins**: 7
- **NPM Dependencies**: 15+
- **Face Recognition Models**: 3
- **Supported Platforms**: Android, iOS
- **Minimum Android**: 7.0 (API 24)
- **Minimum iOS**: 12.0

---

**Last Updated**: February 5, 2026  
**Version**: 1.0.0  
**Status**: Production Ready ✅