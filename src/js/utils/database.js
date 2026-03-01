/**
 * SQLite Database Manager
 * Handles all local database operations for attendance system
 */

class Database {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  /**
   * Initialize SQLite database
   */
  async init() {
    return new Promise((resolve, reject) => {
      if (this.isInitialized) {
        resolve(this.db);
        return;
      }

      // Check if running in Cordova environment
      if (window.cordova && window.cordova.platformId !== 'browser') {
        const initDatabase = () => {
          // Try both window.sqlitePlugin and window.SQLitePlugin
          const SQLite = window.sqlitePlugin || window.SQLitePlugin;
          
          if (!SQLite) {
            console.error('SQLite plugin not available yet');
            reject(new Error('SQLite plugin not loaded'));
            return;
          }

          try {
            this.db = SQLite.openDatabase({
              name: 'attendance.db',
              location: 'default',
              androidDatabaseProvider: 'system'
            });
            
            this.createTables()
              .then(() => {
                this.isInitialized = true;
                console.log('Database initialized successfully');
                resolve(this.db);
              })
              .catch(reject);
          } catch (err) {
            console.error('Database init error:', err);
            reject(err);
          }
        };

        // Check if deviceready already fired
        if (window.sqlitePlugin || window.SQLitePlugin) {
          console.log('SQLite plugin already available, initializing immediately');
          initDatabase();
        } else {
          console.log('Waiting for deviceready event...');
          document.addEventListener('deviceready', initDatabase, { once: true });
        }
      } else {
        // Fallback for browser testing (use WebSQL or IndexedDB)
        console.warn('Running in browser mode - using fallback storage');
        this.isInitialized = true;
        resolve(null);
      }
    });
  }

  /**
   * Create database tables
   */
  createTables() {
    return new Promise(async (resolve, reject) => {
      try {
        // First, create tables
        const createTableQueries = [
          // Students table
          `CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT UNIQUE NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            course TEXT,
            year_level INTEGER,
            photo_path TEXT,
            face_encoding TEXT,
            status TEXT DEFAULT 'active',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
          )`,
          
          // Attendance records table
          `CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            attendance_date TEXT NOT NULL,
            time_in TEXT,
            time_out TEXT,
            status TEXT,
            confidence REAL,
            photo_path TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(id)
          )`,
          
          // Users table (admin/operator)
          `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          )`,
          
          // Settings table
          `CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
          )`,
          
          // Create indexes
          `CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date)`,
          `CREATE INDEX IF NOT EXISTS idx_student_id ON attendance(student_id)`,
          `CREATE INDEX IF NOT EXISTS idx_student_status ON students(status)`
        ];

        await this.executeBatch(createTableQueries, false);
        
        // Then, run migrations (add columns if they don't exist) - tolerate errors
        const migrationQueries = [
          `ALTER TABLE students ADD COLUMN parent_name TEXT`,
          `ALTER TABLE students ADD COLUMN relationship TEXT`,
          `ALTER TABLE students ADD COLUMN parent_contact TEXT`,
          `ALTER TABLE students ADD COLUMN parent_email TEXT`
        ];
        
        await this.executeBatch(migrationQueries, true);
        
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Execute batch of SQL queries (with optional error tolerance for migrations)
   */
  executeBatch(queries, tolerateErrors = false) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      let completed = 0;
      const total = queries.length;

      queries.forEach(query => {
        this.db.executeSql(query, [], 
          () => {
            completed++;
            if (completed === total) resolve();
          },
          (error) => {
            // For ALTER TABLE statements, ignore "duplicate column" errors
            if (tolerateErrors && error && (
              error.message.includes('duplicate column') || 
              error.message.includes('already exists')
            )) {
              console.log('Ignoring expected migration error:', error.message);
              completed++;
              if (completed === total) resolve();
            } else {
              reject(error);
            }
          }
        );
      });
    });
  }

  /**
   * Execute single query
   */
  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.executeSql(sql, params,
        (resultSet) => {
          const rows = [];
          for (let i = 0; i < resultSet.rows.length; i++) {
            rows.push(resultSet.rows.item(i));
          }
          resolve(rows);
        },
        (error) => reject(error)
      );
    });
  }

  // ========== STUDENTS OPERATIONS ==========

  /**
   * Add new student
   */
  async addStudent(student) {
    const sql = `INSERT INTO students (student_id, first_name, last_name, course, year_level, photo_path, face_encoding, parent_name, relationship, parent_contact, parent_email) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const encoding = typeof student.face_encoding === 'string'
      ? student.face_encoding
      : JSON.stringify(student.face_encoding);
    const params = [
      student.student_id,
      student.first_name,
      student.last_name,
      student.course,
      student.year_level,
      student.photo_path,
      encoding,
      student.parent_name || null,
      student.relationship || null,
      student.parent_contact || null,
      student.parent_email || null
    ];
    return this.query(sql, params);
  }

  /**
   * Get all students (without photo_blob to avoid CursorWindow overflow)
   */
  async getAllStudents() {
    return this.query(`
      SELECT id, student_id, first_name, last_name, course, year_level, 
             face_encoding, status, created_at, updated_at 
      FROM students 
      WHERE status = 'active' 
      ORDER BY last_name, first_name
    `);
  }

  /**
   * Get student by ID
   */
  async getStudent(id) {
    const results = await this.query(`SELECT * FROM students WHERE id = ?`, [id]);
    return results[0] || null;
  }

  /**
   * Get student by student ID
   */
  async getStudentByStudentId(studentId) {
    const results = await this.query(`SELECT * FROM students WHERE student_id = ?`, [studentId]);
    return results[0] || null;
  }

  /**
   * Update student
   */
  async updateStudent(id, student) {
    const sql = `UPDATE students 
                 SET first_name = ?, last_name = ?, course = ?, year_level = ?, 
                     photo_path = ?, face_encoding = ?, parent_name = ?, relationship = ?, 
                     parent_contact = ?, parent_email = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`;
    const encoding = typeof student.face_encoding === 'string'
      ? student.face_encoding
      : JSON.stringify(student.face_encoding);
    const params = [
      student.first_name,
      student.last_name,
      student.course,
      student.year_level,
      student.photo_path,
      encoding,
      student.parent_name || null,
      student.relationship || null,
      student.parent_contact || null,
      student.parent_email || null,
      id
    ];
    return this.query(sql, params);
  }

  /**
   * Delete student (permanent delete)
   */
  async deleteStudent(id) {
    // First delete all attendance records for this student
    await this.query(`DELETE FROM attendance WHERE student_id = ?`, [id]);
    
    // Then delete the student record
    return this.query(`DELETE FROM students WHERE id = ?`, [id]);
  }

  // ========== ATTENDANCE OPERATIONS ==========

  /**
   * Get current local date as YYYY-MM-DD string
   * Uses local time zone to prevent date bleeding across midnight UTC
   */
  getLocalDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get current local time as HH:MM:SS string
   */
  getLocalTime() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  // ========== SCHEDULE SETTINGS ==========

  /**
   * Get schedule settings used to determine late / early status on first time-in.
   * Defaults: timeIn = '08:00' (on-time from), lateAfter = '08:30' (late threshold)
   */
  async getScheduleSettings() {
    const timeIn    = (await this.getSetting('schedule_time_in'))    || '08:00';
    const lateAfter = (await this.getSetting('schedule_late_after')) || '08:30';
    return { timeIn, lateAfter };
  }

  /**
   * Return all active students who have NO attendance record for the given date (absent).
   */
  async getAbsentStudents(date) {
    return this.query(`
      SELECT s.id, s.student_id, s.first_name, s.last_name, s.course, s.year_level
      FROM students s
      WHERE s.status = 'active'
        AND s.id NOT IN (
          SELECT DISTINCT a.student_id FROM attendance a WHERE a.attendance_date = ?
        )
      ORDER BY s.last_name, s.first_name
    `, [date]);
  }

  /**
   * Record time-in.
   *
   * Status rules (FIRST time-in of the day only):
   *   'early'   – arrived before the scheduled time-in start
   *   'present' – arrived within the on-time window
   *   'late'    – arrived after the late-after threshold
   *
   * All subsequent time-ins on the same day get status = 'present'.
   */
  async recordTimeIn(studentId, confidence, photoPath = null) {
    const date = this.getLocalDate();
    const time = this.getLocalTime();

    // Is this the first time-in today for this student?
    const existing = await this.query(
      `SELECT id FROM attendance WHERE student_id = ? AND attendance_date = ? ORDER BY id ASC LIMIT 1`,
      [studentId, date]
    );

    let status = 'present';
    if (existing.length === 0) {
      // ── First time-in today: evaluate against the schedule ───────────────
      try {
        const schedule = await this.getScheduleSettings();
        const [cH, cM] = time.split(':').map(Number);
        const [iH, iM] = schedule.timeIn.split(':').map(Number);
        const [lH, lM] = schedule.lateAfter.split(':').map(Number);
        const current  = cH * 60 + cM;
        const onTime   = iH * 60 + iM;
        const lateAt   = lH * 60 + lM;
        if      (current < onTime)  status = 'early';
        else if (current > lateAt)  status = 'late';
        else                        status = 'present';
        console.log(`📋 First time-in: ${time} → ${status} (schedule: on-time ${schedule.timeIn}, late after ${schedule.lateAfter})`);
      } catch (e) {
        console.warn('Schedule check failed, defaulting to present:', e);
        status = 'present';
      }
    }

    const sql = `INSERT INTO attendance (student_id, attendance_date, time_in, status, confidence, photo_path)
                 VALUES (?, ?, ?, ?, ?, ?)`;
    await this.query(sql, [studentId, date, time, status, confidence, photoPath]);
    return { success: true, message: 'Time-in recorded', status };
  }

  /**
   * Record time-out
   * Updates the MOST RECENT attendance record for the student that has time_in but no time_out
   */
  async recordTimeOut(studentId, confidence, photoPath = null) {
    const date = this.getLocalDate();
    const time = this.getLocalTime();
    
    // Update only the most recent record (highest ID) that has time_in without time_out
    const sql = `UPDATE attendance 
                 SET time_out = ?, confidence = ?, photo_path = COALESCE(?, photo_path)
                 WHERE id = (
                   SELECT id FROM attendance 
                   WHERE student_id = ? AND attendance_date = ? AND time_out IS NULL 
                   ORDER BY id DESC LIMIT 1
                 )`;
    await this.query(sql, [time, confidence, photoPath, studentId, date]);
    return { success: true, message: 'Time-out recorded' };
  }

  /**
   * Get today's attendance
   */
  async getTodayAttendance() {
    const date = this.getLocalDate();
    return this.query(`
      SELECT 
        a.id,
        a.student_id AS attendance_student_id,
        a.attendance_date,
        a.time_in,
        a.time_out,
        a.status,
        a.confidence,
        a.photo_path,
        a.created_at,
        s.student_id,
        s.first_name,
        s.last_name,
        s.course
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE a.attendance_date = ?
      ORDER BY a.id DESC
    `, [date]);
  }

  /**
   * Get today's record for a student (latest)
   */
  async getTodayRecordForStudent(studentId) {
    const date = this.getLocalDate();
    const rows = await this.query(
      `SELECT * FROM attendance WHERE student_id = ? AND attendance_date = ? ORDER BY id DESC LIMIT 1`,
      [studentId, date]
    );
    return rows[0] || null;
  }

  /**
   * Get attendance by date range
   */
  async getAttendanceByDateRange(startDate, endDate) {
    return this.query(`
      SELECT a.*, s.student_id, s.first_name, s.last_name, s.course
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE a.attendance_date BETWEEN ? AND ?
      ORDER BY a.attendance_date DESC, a.time_in DESC
    `, [startDate, endDate]);
  }

  /**
   * Get student attendance history
   */
  async getStudentAttendance(studentId) {
    return this.query(`
      SELECT * FROM attendance 
      WHERE student_id = ?
      ORDER BY attendance_date DESC
    `, [studentId]);
  }

  // ========== SETTINGS OPERATIONS ==========

  /**
   * Get setting value
   */
  async getSetting(key) {
    const results = await this.query(`SELECT value FROM settings WHERE key = ?`, [key]);
    return results[0] ? results[0].value : null;
  }

  /**
   * Set setting value
   */
  async setSetting(key, value) {
    return this.query(`
      INSERT OR REPLACE INTO settings (key, value, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `, [key, value]);
  }
}

// Export singleton instance
const db = new Database();
export default db;
