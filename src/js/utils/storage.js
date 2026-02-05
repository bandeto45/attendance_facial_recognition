/**
 * Storage Utility
 * Handles file storage operations for photos and backups
 */

class StorageManager {
  constructor() {
    this.fileSystem = null;
    this.isInitialized = false;
  }

  /**
   * Initialize file system
   */
  async init() {
    if (this.isInitialized) return true;

    try {
      if (window.cordova && window.cordova.file) {
        // Cordova File plugin available
        this.fileSystem = window.cordova.file;
        this.isInitialized = true;
        return true;
      } else {
        console.warn('File system not available in browser mode');
        return false;
      }
    } catch (error) {
      console.error('Storage init error:', error);
      return false;
    }
  }

  /**
   * Save base64 image to file
   */
  async saveImage(base64Data, filename) {
    if (!this.isInitialized) {
      await this.init();
    }

    try {
      // Remove data URL prefix if present
      const base64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
      
      if (window.cordova) {
        const directory = this.fileSystem.dataDirectory;
        const filepath = directory + 'photos/' + filename;

        await this.ensureDirectory(directory + 'photos/');
        
        return new Promise((resolve, reject) => {
          window.resolveLocalFileSystemURL(directory + 'photos/', (dirEntry) => {
            dirEntry.getFile(filename, { create: true }, (fileEntry) => {
              fileEntry.createWriter((fileWriter) => {
                fileWriter.onwriteend = () => {
                  resolve({ success: true, path: filepath });
                };
                fileWriter.onerror = reject;

                const blob = this.base64ToBlob(base64, 'image/jpeg');
                fileWriter.write(blob);
              }, reject);
            }, reject);
          }, reject);
        });
      } else {
        // Browser fallback - save to localStorage
        localStorage.setItem(`photo_${filename}`, base64Data);
        return { success: true, path: filename };
      }
    } catch (error) {
      console.error('Save image error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Load image from file
   */
  async loadImage(filename) {
    if (!this.isInitialized) {
      await this.init();
    }

    try {
      if (window.cordova) {
        const directory = this.fileSystem.dataDirectory;
        const filepath = directory + 'photos/' + filename;

        return new Promise((resolve, reject) => {
          window.resolveLocalFileSystemURL(filepath, (fileEntry) => {
            fileEntry.file((file) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                resolve({ success: true, data: reader.result });
              };
              reader.onerror = reject;
              reader.readAsDataURL(file);
            }, reject);
          }, reject);
        });
      } else {
        // Browser fallback
        const data = localStorage.getItem(`photo_${filename}`);
        if (data) {
          return { success: true, data };
        } else {
          return { success: false, error: 'File not found' };
        }
      }
    } catch (error) {
      console.error('Load image error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete image file
   */
  async deleteImage(filename) {
    if (!this.isInitialized) {
      await this.init();
    }

    try {
      if (window.cordova) {
        const directory = this.fileSystem.dataDirectory;
        const filepath = directory + 'photos/' + filename;

        return new Promise((resolve, reject) => {
          window.resolveLocalFileSystemURL(filepath, (fileEntry) => {
            fileEntry.remove(
              () => resolve({ success: true }),
              reject
            );
          }, reject);
        });
      } else {
        localStorage.removeItem(`photo_${filename}`);
        return { success: true };
      }
    } catch (error) {
      console.error('Delete image error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Ensure directory exists
   */
  async ensureDirectory(path) {
    return new Promise((resolve, reject) => {
      if (!window.cordova) {
        resolve();
        return;
      }

      window.resolveLocalFileSystemURL(path, 
        () => resolve(),
        () => {
          // Directory doesn't exist, create it
          const parentPath = path.substring(0, path.lastIndexOf('/', path.length - 2) + 1);
          const dirName = path.substring(path.lastIndexOf('/', path.length - 2) + 1).replace('/', '');

          window.resolveLocalFileSystemURL(parentPath, (parentDir) => {
            parentDir.getDirectory(dirName, { create: true }, resolve, reject);
          }, reject);
        }
      );
    });
  }

  /**
   * Convert base64 to Blob
   */
  base64ToBlob(base64, contentType = 'image/jpeg') {
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
   * Get storage info
   */
  async getStorageInfo() {
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        return {
          usage: estimate.usage,
          quota: estimate.quota,
          usagePercent: (estimate.usage / estimate.quota * 100).toFixed(2)
        };
      }
      return null;
    } catch (error) {
      console.error('Get storage info error:', error);
      return null;
    }
  }

  /**
   * Clear all stored photos
   */
  async clearPhotos() {
    if (!this.isInitialized) {
      await this.init();
    }

    try {
      if (window.cordova) {
        const directory = this.fileSystem.dataDirectory + 'photos/';

        return new Promise((resolve, reject) => {
          window.resolveLocalFileSystemURL(directory, (dirEntry) => {
            dirEntry.removeRecursively(
              () => resolve({ success: true }),
              reject
            );
          }, reject);
        });
      } else {
        // Clear localStorage photos
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('photo_')) {
            localStorage.removeItem(key);
          }
        });
        return { success: true };
      }
    } catch (error) {
      console.error('Clear photos error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
const storageManager = new StorageManager();
export default storageManager;
