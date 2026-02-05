/**
 * Backup Utility
 * Handles database backup and restore operations
 * Supports local backups and cloud storage (Google Drive, Dropbox)
 */

class BackupManager {
  constructor() {
    this.isInitialized = false;
    this.lastBackupTime = null;
  }

  /**
   * Initialize backup manager
   */
  async init() {
    if (this.isInitialized) return true;

    try {
      // Load last backup time from localStorage
      const lastBackup = localStorage.getItem('lastBackupTime');
      if (lastBackup) {
        this.lastBackupTime = new Date(lastBackup);
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Backup init error:', error);
      return false;
    }
  }

  /**
   * Create backup of SQLite database
   */
  async createBackup(db) {
    try {
      if (!db || !db.isInitialized) {
        return { success: false, error: 'Database not initialized' };
      }

      // Export all data from database
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        students: await db.getAllStudents(),
        attendance: await db.query('SELECT * FROM attendance ORDER BY id'),
        settings: await db.query('SELECT * FROM settings'),
        users: await db.query('SELECT * FROM users')
      };

      // Convert to JSON
      const jsonData = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const filename = `attendance_backup_${timestamp}.json`;

      // Save backup file
      const result = await this.saveBackupFile(blob, filename);

      if (result.success) {
        this.lastBackupTime = new Date();
        localStorage.setItem('lastBackupTime', this.lastBackupTime.toISOString());
      }

      return result;
    } catch (error) {
      console.error('Create backup error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Restore database from backup
   */
  async restoreBackup(db, backupFile) {
    try {
      if (!db || !db.isInitialized) {
        return { success: false, error: 'Database not initialized' };
      }

      // Read backup file
      const backupData = await this.readBackupFile(backupFile);

      if (!backupData) {
        return { success: false, error: 'Invalid backup file' };
      }

      // Clear existing data (optional - can be configurable)
      await db.query('DELETE FROM attendance');
      await db.query('DELETE FROM students');
      await db.query('DELETE FROM settings');
      await db.query('DELETE FROM users WHERE role != "admin"'); // Keep admin users

      // Restore students
      for (const student of backupData.students) {
        await db.addStudent(student);
      }

      // Restore attendance
      for (const record of backupData.attendance) {
        await db.query(
          `INSERT INTO attendance (student_id, attendance_date, time_in, time_out, status, confidence, photo_blob) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [record.student_id, record.attendance_date, record.time_in, record.time_out, record.status, record.confidence, record.photo_blob]
        );
      }

      // Restore settings
      for (const setting of backupData.settings) {
        await db.setSetting(setting.key, setting.value);
      }

      return { success: true, recordsRestored: backupData.students.length + backupData.attendance.length };
    } catch (error) {
      console.error('Restore backup error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save backup file to device
   */
  async saveBackupFile(blob, filename) {
    return new Promise((resolve, reject) => {
      if (window.cordova && window.cordova.file) {
        // Use Cordova File plugin
        const directory = window.cordova.file.externalRootDirectory || window.cordova.file.dataDirectory;
        const backupPath = directory + 'Backups/';

        // Ensure backup directory exists
        window.resolveLocalFileSystemURL(directory, (dirEntry) => {
          dirEntry.getDirectory('Backups', { create: true }, (backupDir) => {
            backupDir.getFile(filename, { create: true }, (fileEntry) => {
              fileEntry.createWriter((fileWriter) => {
                fileWriter.onwriteend = () => {
                  resolve({ success: true, filename, path: backupPath + filename });
                };
                fileWriter.onerror = (error) => {
                  reject({ success: false, error: error.message });
                };
                fileWriter.write(blob);
              }, reject);
            }, reject);
          }, reject);
        }, reject);
      } else {
        // Browser fallback - download file
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        resolve({ success: true, filename });
      }
    });
  }

  /**
   * Read backup file
   */
  async readBackupFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  /**
   * List available backups
   */
  async listBackups() {
    try {
      if (window.cordova && window.cordova.file) {
        const directory = window.cordova.file.externalRootDirectory || window.cordova.file.dataDirectory;
        const backupPath = directory + 'Backups/';

        return new Promise((resolve) => {
          window.resolveLocalFileSystemURL(backupPath, (dirEntry) => {
            const reader = dirEntry.createReader();
            reader.readEntries((entries) => {
              const backups = entries
                .filter(entry => entry.isFile && entry.name.endsWith('.json'))
                .map(entry => ({
                  name: entry.name,
                  fullPath: entry.fullPath
                }));
              resolve({ success: true, backups });
            }, (error) => {
              resolve({ success: false, error: error.message });
            });
          }, (error) => {
            resolve({ success: false, error: error.message, backups: [] });
          });
        });
      } else {
        // Browser mode - no listing available
        return { success: false, error: 'Not available in browser mode', backups: [] };
      }
    } catch (error) {
      console.error('List backups error:', error);
      return { success: false, error: error.message, backups: [] };
    }
  }

  /**
   * Delete backup file
   */
  async deleteBackup(filename) {
    try {
      if (window.cordova && window.cordova.file) {
        const directory = window.cordova.file.externalRootDirectory || window.cordova.file.dataDirectory;
        const filepath = directory + 'Backups/' + filename;

        return new Promise((resolve, reject) => {
          window.resolveLocalFileSystemURL(filepath, (fileEntry) => {
            fileEntry.remove(
              () => resolve({ success: true }),
              reject
            );
          }, reject);
        });
      }
      return { success: false, error: 'Not available in browser mode' };
    } catch (error) {
      console.error('Delete backup error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Email backup file
   */
  async emailBackup(filename, recipients = []) {
    try {
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.email) {
        const directory = window.cordova.file.externalRootDirectory || window.cordova.file.dataDirectory;
        const filepath = directory + 'Backups/' + filename;

        return new Promise((resolve) => {
          window.cordova.plugins.email.open({
            to: recipients,
            subject: `Attendance Database Backup - ${filename}`,
            body: `Database backup created on ${new Date().toLocaleString()}`,
            attachments: [filepath],
            isHtml: false
          }, (result) => {
            resolve({ success: result === true });
          });
        });
      }
      return { success: false, error: 'Email plugin not available' };
    } catch (error) {
      console.error('Email backup error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Schedule automatic backup
   */
  scheduleAutoBackup(db, intervalHours = 24) {
    if (this.autoBackupInterval) {
      clearInterval(this.autoBackupInterval);
    }

    this.autoBackupInterval = setInterval(async () => {
      console.log('Running scheduled backup...');
      const result = await this.createBackup(db);
      if (result.success) {
        console.log('Auto backup completed:', result.filename);
      } else {
        console.error('Auto backup failed:', result.error);
      }
    }, intervalHours * 60 * 60 * 1000);

    console.log(`Auto backup scheduled every ${intervalHours} hours`);
  }

  /**
   * Stop automatic backup
   */
  stopAutoBackup() {
    if (this.autoBackupInterval) {
      clearInterval(this.autoBackupInterval);
      this.autoBackupInterval = null;
      console.log('Auto backup stopped');
    }
  }

  /**
   * Upload backup to cloud (Google Drive) - Placeholder
   * Requires OAuth2 integration with Google Drive API
   */
  async uploadToGoogleDrive(backupFile) {
    // This would require:
    // 1. Google Drive API client library
    // 2. OAuth2 authentication
    // 3. cordova-plugin-googleplus or similar
    console.log('Google Drive integration not implemented yet');
    return { success: false, error: 'Not implemented' };
  }

  /**
   * Upload backup to cloud (Dropbox) - Placeholder
   * Requires OAuth2 integration with Dropbox API
   */
  async uploadToDropbox(backupFile) {
    // This would require:
    // 1. Dropbox API client library
    // 2. OAuth2 authentication
    console.log('Dropbox integration not implemented yet');
    return { success: false, error: 'Not implemented' };
  }

  /**
   * Get last backup time
   */
  getLastBackupTime() {
    return this.lastBackupTime;
  }
}

// Export singleton instance
const backupManager = new BackupManager();
export default backupManager;
