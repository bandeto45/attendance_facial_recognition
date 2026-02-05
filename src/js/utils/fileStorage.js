/**
 * File Storage Manager
 * Handles saving and loading photos from device file system
 */

class FileStorage {
  constructor() {
    this.photosDir = null;
    this.isInitialized = false;
  }

  /**
   * Initialize file storage directory
   */
  async init() {
    if (this.isInitialized) return true;

    try {
      if (window.cordova && window.cordova.file) {
        // Cordova environment - use persistent storage
        const dataDirectory = window.cordova.file.dataDirectory;
        
        return new Promise((resolve, reject) => {
          window.resolveLocalFileSystemURL(dataDirectory, (dirEntry) => {
            dirEntry.getDirectory('photos', { create: true }, (photosDir) => {
              this.photosDir = photosDir;
              this.isInitialized = true;
              console.log('File storage initialized:', photosDir.nativeURL);
              resolve(true);
            }, reject);
          }, reject);
        });
      } else {
        // Browser fallback - use localStorage for base64 data
        console.warn('Running in browser mode - using localStorage for photos');
        this.isInitialized = true;
        return true;
      }
    } catch (error) {
      console.error('File storage init error:', error);
      return false;
    }
  }

  /**
   * Save photo to file system
   * @param {string} base64Data - Base64 encoded image data (with or without data:image prefix)
   * @param {string} filename - Filename (e.g., 'student_12345.jpg' or 'attendance_12345_1234567890.jpg')
   * @returns {Promise<string>} File path or localStorage key
   */
  async savePhoto(base64Data, filename) {
    await this.init();

    try {
      if (window.cordova && this.photosDir) {
        // Remove data:image/jpeg;base64, prefix if present
        const base64Clean = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');

        return new Promise((resolve, reject) => {
          this.photosDir.getFile(filename, { create: true }, (fileEntry) => {
            fileEntry.createWriter((fileWriter) => {
              fileWriter.onwriteend = () => {
                console.log('Photo saved:', fileEntry.nativeURL);
                resolve(fileEntry.nativeURL);
              };
              
              fileWriter.onerror = (error) => {
                console.error('Write error:', error);
                reject(error);
              };

              // Convert base64 to Blob
              const blob = this.base64ToBlob(base64Clean, 'image/jpeg');
              fileWriter.write(blob);
            }, reject);
          }, reject);
        });
      } else {
        // Browser fallback - save to localStorage
        const storageKey = `photo_${filename}`;
        localStorage.setItem(storageKey, base64Data);
        console.log('Photo saved to localStorage:', storageKey);
        return storageKey;
      }
    } catch (error) {
      console.error('Save photo error:', error);
      throw error;
    }
  }

  /**
   * Load photo from file system
   * @param {string} filePath - File path or localStorage key
   * @returns {Promise<string>} Base64 data URL
   */
  async loadPhoto(filePath) {
    if (!filePath) return null;

    try {
      if (window.cordova && filePath.startsWith('file://')) {
        // Cordova - read from file system
        return new Promise((resolve, reject) => {
          window.resolveLocalFileSystemURL(filePath, (fileEntry) => {
            fileEntry.file((file) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                resolve(reader.result); // Returns data:image/jpeg;base64,...
              };
              reader.onerror = reject;
              reader.readAsDataURL(file);
            }, reject);
          }, reject);
        });
      } else if (filePath.startsWith('photo_')) {
        // Browser - load from localStorage
        return localStorage.getItem(filePath);
      } else {
        // Fallback - assume it's already base64 data
        return filePath;
      }
    } catch (error) {
      console.error('Load photo error:', error);
      return null;
    }
  }

  /**
   * Delete photo from file system
   * @param {string} filePath - File path or localStorage key
   */
  async deletePhoto(filePath) {
    if (!filePath) return;

    try {
      if (window.cordova && filePath.startsWith('file://')) {
        return new Promise((resolve, reject) => {
          window.resolveLocalFileSystemURL(filePath, (fileEntry) => {
            fileEntry.remove(() => {
              console.log('Photo deleted:', filePath);
              resolve();
            }, reject);
          }, reject);
        });
      } else if (filePath.startsWith('photo_')) {
        localStorage.removeItem(filePath);
        console.log('Photo deleted from localStorage:', filePath);
      }
    } catch (error) {
      console.error('Delete photo error:', error);
    }
  }

  /**
   * Generate unique filename for student photo
   * @param {string} studentId - Student ID
   * @returns {string} Filename
   */
  getStudentPhotoFilename(studentId) {
    return `student_${studentId}_${Date.now()}.jpg`;
  }

  /**
   * Generate unique filename for attendance photo
   * @param {number} studentId - Student database ID
   * @returns {string} Filename
   */
  getAttendancePhotoFilename(studentId) {
    return `attendance_${studentId}_${Date.now()}.jpg`;
  }

  /**
   * Convert base64 to Blob
   * @private
   */
  base64ToBlob(base64, contentType = '') {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  }

  /**
   * Load all student photos for face recognition
   * @param {Array} students - Array of student objects with photo_path
   * @returns {Promise<Map>} Map of student IDs to base64 photo data
   */
  async loadStudentPhotos(students) {
    const photoMap = new Map();
    
    for (const student of students) {
      if (student.photo_path) {
        try {
          const photoData = await this.loadPhoto(student.photo_path);
          if (photoData) {
            photoMap.set(student.id, photoData);
          }
        } catch (error) {
          console.error(`Failed to load photo for student ${student.id}:`, error);
        }
      }
    }
    
    return photoMap;
  }
}

// Export singleton instance
const fileStorage = new FileStorage();
export default fileStorage;
