/**
 * Export Utility
 * Handles exporting attendance data to Excel/PDF/CSV
 */

import { EXPORT_FORMATS } from './constants.js';

class ExportManager {
  constructor() {
    this.initialized = false;
  }

  /**
   * Export attendance records to Excel
   */
  async exportToExcel(data, filename = 'attendance_report.xlsx') {
    try {
      // In production, use SheetJS (xlsx library)
      // For now, export as CSV with .xlsx extension as fallback
      return this.exportToCSV(data, filename);
    } catch (error) {
      console.error('Excel export error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Export attendance records to CSV
   */
  async exportToCSV(data, filename = 'attendance_report.csv') {
    try {
      if (!data || data.length === 0) {
        return { success: false, error: 'No data to export' };
      }

      console.log('📊 Exporting to CSV:', { filename, rows: data.length });

      // Generate CSV content
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            let value = row[header];
            // Escape commas and quotes
            if (typeof value === 'string') {
              value = value.replace(/"/g, '""');
              if (value.includes(',') || value.includes('\n')) {
                value = `"${value}"`;
              }
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      console.log('✅ CSV content generated:', csvContent.substring(0, 200) + '...');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      if (window.cordova) {
        console.log('📱 Cordova detected - using file plugin');
        
        try {
          // Save file using Cordova File plugin
          const result = await this.saveFileToDevice(blob, filename);
          console.log('✅ File saved via Cordova:', result);
          
          // Open the file after successful save
          if (result.success && result.path) {
            await this.openFile(result.path, 'text/csv');
          }
          
          return result;
        } catch (fileError) {
          console.error('❌ Cordova file save failed:', fileError);
          
          // Fallback: Try to share file instead of saving
          if (window.cordova.plugins && window.cordova.plugins.socialsharing) {
            console.log('🔄 Trying social sharing as fallback...');
            return await this.shareFile(blob, filename);
          }
          
          return { 
            success: false, 
            error: 'File system access failed. ' + (fileError.message || 'Unknown error'),
            errorDetails: fileError
          };
        }
      } else {
        console.log('🌐 Browser mode - using download');
        // Browser download
        this.downloadBlob(blob, filename);
        return { success: true, filename };
      }
    } catch (error) {
      console.error('❌ CSV export error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Export attendance records to PDF
   */
  async exportToPDF(data, filename = 'attendance_report.pdf', options = {}) {
    try {
      // In production, use jsPDF or pdfmake
      // For now, return a mock implementation
      console.log('PDF export not fully implemented yet');
      
      // Generate HTML content
      const htmlContent = this.generateHTMLReport(data, options);
      
      // In Cordova, can use cordova-plugin-printer
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.printer) {
        return new Promise((resolve) => {
          window.cordova.plugins.printer.print(htmlContent, { name: filename }, (res) => {
            resolve({ success: res === true, filename });
          });
        });
      }

      return { success: false, error: 'PDF export not available in browser' };
    } catch (error) {
      console.error('PDF export error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate HTML report for printing/PDF
   */
  generateHTMLReport(data, options = {}) {
    const { title = 'Attendance Report', date = new Date().toLocaleDateString() } = options;

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #4CAF50; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
          .meta { color: #666; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #4CAF50; color: white; padding: 12px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          tr:hover { background: #f5f5f5; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="meta">
          <p>Generated: ${date}</p>
          <p>Total Records: ${data.length}</p>
        </div>
        <table>
          <thead>
            <tr>
    `;

    // Add table headers
    if (data.length > 0) {
      Object.keys(data[0]).forEach(key => {
        html += `<th>${key}</th>`;
      });
    }

    html += `
            </tr>
          </thead>
          <tbody>
    `;

    // Add table rows
    data.forEach(row => {
      html += '<tr>';
      Object.values(row).forEach(value => {
        html += `<td>${value || '-'}</td>`;
      });
      html += '</tr>';
    });

    html += `
          </tbody>
        </table>
        <div class="footer">
          <p>Attendance Facial Recognition System - Report generated on ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;

    return html;
  }

  /**
   * Email report
   */
  async emailReport(data, format, options = {}) {
    try {
      const { recipients = [], subject = 'Attendance Report', body = 'Please find the attendance report attached.' } = options;

      // Export data to specified format
      let exportResult;
      switch (format) {
        case EXPORT_FORMATS.EXCEL:
          exportResult = await this.exportToExcel(data);
          break;
        case EXPORT_FORMATS.CSV:
          exportResult = await this.exportToCSV(data);
          break;
        case EXPORT_FORMATS.PDF:
          exportResult = await this.exportToPDF(data);
          break;
        default:
          return { success: false, error: 'Invalid format' };
      }

      if (!exportResult.success) {
        return exportResult;
      }

      // Use cordova-plugin-email-composer if available
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.email) {
        return new Promise((resolve) => {
          window.cordova.plugins.email.open({
            to: recipients,
            subject: subject,
            body: body,
            attachments: [exportResult.filename],
            isHtml: false
          }, (result) => {
            resolve({ success: result === true });
          });
        });
      }

      return { success: false, error: 'Email plugin not available' };
    } catch (error) {
      console.error('Email report error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save file to device using Cordova File plugin
   */
  async saveFileToDevice(blob, filename) {
    return new Promise((resolve, reject) => {
      try {
        if (!window.cordova || !window.cordova.file) {
          console.error('File system not available - Cordova file plugin not loaded');
          reject(new Error('File system not available'));
          return;
        }

        console.log('📁 Cordova file paths:', {
          externalRootDirectory: window.cordova.file.externalRootDirectory,
          externalDataDirectory: window.cordova.file.externalDataDirectory,
          dataDirectory: window.cordova.file.dataDirectory,
          cacheDirectory: window.cordova.file.cacheDirectory
        });

        // Try multiple directory options in order of preference
        const directoryOptions = [
          window.cordova.file.externalDataDirectory, // Android: /storage/emulated/0/Android/data/<app-id>/files
          window.cordova.file.externalRootDirectory, // Android: /storage/emulated/0/
          window.cordova.file.dataDirectory,         // Internal app data
          window.cordova.file.cacheDirectory         // Cache directory (fallback)
        ].filter(Boolean); // Remove undefined values

        console.log('📁 Available directory options:', directoryOptions);

        // Try first available directory
        const directory = directoryOptions[0];
        
        if (!directory) {
          reject(new Error('No suitable directory found for file storage'));
          return;
        }

        console.log('📁 Using directory:', directory);

        window.resolveLocalFileSystemURL(directory, (dirEntry) => {
          console.log('✅ Directory resolved:', dirEntry.nativeURL);
          
          dirEntry.getFile(filename, { create: true, exclusive: false }, (fileEntry) => {
            console.log('✅ File entry created:', fileEntry.nativeURL);
            
            fileEntry.createWriter((fileWriter) => {
              fileWriter.onwriteend = () => {
                console.log('✅ File written successfully');
                resolve({ 
                  success: true, 
                  filename, 
                  path: fileEntry.nativeURL,
                  message: 'File saved to app storage'
                });
              };
              
              fileWriter.onerror = (error) => {
                console.error('❌ File writer error:', error);
                reject(error);
              };
              
              fileWriter.write(blob);
            }, (error) => {
              console.error('❌ Create writer error:', error);
              reject(error);
            });
          }, (error) => {
            console.error('❌ Get file error:', error);
            reject(error);
          });
        }, (error) => {
          console.error('❌ Resolve directory error:', error);
          reject(error);
        });
      } catch (error) {
        console.error('❌ Save file exception:', error);
        reject(error);
      }
    });
  }

  /**
   * Download blob in browser
   */
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Share file using social sharing plugin (fallback when file save fails)
   */
  async shareFile(blob, filename) {
    return new Promise((resolve) => {
      if (!window.cordova || !window.cordova.plugins || !window.cordova.plugins.socialsharing) {
        resolve({ 
          success: false, 
          error: 'Social sharing plugin not available' 
        });
        return;
      }

      // Convert blob to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;
        
        window.cordova.plugins.socialsharing.shareWithOptions({
          message: `Attendance report: ${filename}`,
          subject: 'Attendance Report',
          files: [base64data],
          chooserTitle: 'Share report via...'
        }, (result) => {
          console.log('✅ Share successful:', result);
          resolve({ 
            success: true, 
            filename,
            shared: true,
            message: 'File shared successfully'
          });
        }, (error) => {
          console.error('❌ Share failed:', error);
          resolve({ 
            success: false, 
            error: 'Could not share file: ' + error 
          });
        });
      };
      
      reader.onerror = () => {
        resolve({ 
          success: false, 
          error: 'Could not read file for sharing' 
        });
      };
      
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Open file using InAppBrowser or native file opener
   */
  async openFile(filePath, mimeType = 'text/csv') {
    try {
      console.log('📂 Opening file:', { filePath, mimeType });
      
      if (!window.cordova) {
        console.log('⚠️ Cordova not available - cannot open file');
        return { success: false, error: 'Not in Cordova environment' };
      }

      // Option 1: Try cordova-plugin-file-opener2 (if available)
      if (window.cordova.plugins && window.cordova.plugins.fileOpener2) {
        console.log('📱 Using file opener plugin...');
        return new Promise((resolve) => {
          window.cordova.plugins.fileOpener2.open(
            filePath,
            mimeType,
            {
              error: (error) => {
                console.error('❌ File opener error:', error);
                // Fallback to InAppBrowser
                this.openWithInAppBrowser(filePath).then(resolve);
              },
              success: () => {
                console.log('✅ File opened successfully');
                resolve({ success: true });
              }
            }
          );
        });
      }
      
      // Option 2: Use InAppBrowser as fallback
      return await this.openWithInAppBrowser(filePath);
    } catch (error) {
      console.error('❌ Open file error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Open file with InAppBrowser
   */
  async openWithInAppBrowser(filePath) {
    try {
      if (!window.cordova || !window.cordova.InAppBrowser) {
        console.log('⚠️ InAppBrowser not available');
        return { success: false, error: 'InAppBrowser not available' };
      }

      console.log('🌐 Opening with InAppBrowser:', filePath);
      
      // Open file in system browser or InAppBrowser
      const ref = window.cordova.InAppBrowser.open(
        filePath,
        '_system', // Use system viewer for better file handling
        'location=yes'
      );
      
      if (ref) {
        console.log('✅ InAppBrowser opened');
        return { success: true };
      } else {
        console.log('⚠️ InAppBrowser failed to open');
        return { success: false, error: 'Failed to open InAppBrowser' };
      }
    } catch (error) {
      console.error('❌ InAppBrowser error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Format attendance data for export
   */
  formatAttendanceData(records) {
    return records.map(record => ({
      'Student ID': record.student_id,
      'Name': `${record.first_name} ${record.last_name}`,
      'Course': record.course,
      'Date': record.attendance_date,
      'Time In': record.time_in || '-',
      'Time Out': record.time_out || '-',
      'Status': record.status,
      'Confidence': record.confidence ? `${(record.confidence * 100).toFixed(1)}%` : '-'
    }));
  }
}

// Export singleton instance
const exportManager = new ExportManager();
export default exportManager;
