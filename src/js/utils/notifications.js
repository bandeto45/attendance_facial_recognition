/**
 * Notifications Manager
 * Handles SMS and Email notifications to parents after attendance recording
 */

class Notifications {
  constructor() {
    this.smsAvailable = false;
    this.emailAvailable = false;
    this.initialized = false;
    this.smsPermissionGranted = false;
  }

  /**
   * Request SMS permission (required for Android 6.0+)
   */
  async requestSMSPermission() {
    return new Promise((resolve) => {
      if (!window.cordova || !window.cordova.plugins || !window.cordova.plugins.permissions) {
        console.warn('⚠️ Permissions plugin not available');
        resolve(true); // Assume granted if plugin not available
        return;
      }

      const permissions = window.cordova.plugins.permissions;
      
      // Check if SEND_SMS permission is granted
      permissions.checkPermission(permissions.SEND_SMS, (status) => {
        if (status.hasPermission) {
          console.log('✅ SMS permission already granted');
          this.smsPermissionGranted = true;
          resolve(true);
        } else {
          // Request permission
          console.log('📱 Requesting SMS permission...');
          permissions.requestPermission(permissions.SEND_SMS, (status) => {
            if (status.hasPermission) {
              console.log('✅ SMS permission granted by user');
              this.smsPermissionGranted = true;
              resolve(true);
            } else {
              console.warn('⚠️ SMS permission denied by user');
              this.smsPermissionGranted = false;
              resolve(false);
            }
          }, () => {
            console.error('❌ Error requesting SMS permission');
            this.smsPermissionGranted = false;
            resolve(false);
          });
        }
      }, () => {
        console.error('❌ Error checking SMS permission');
        resolve(false);
      });
    });
  }

  /**
   * Initialize notification services
   */
  async init() {
    if (this.initialized) return;

    // Check if running in Cordova environment
    if (window.cordova) {
      // Check SMS plugin availability
      this.smsAvailable = !!(window.sms || window.SMS);
      
      // Request SMS permission if plugin available
      if (this.smsAvailable) {
        await this.requestSMSPermission();
      }
      
      // Check Email Composer plugin availability
      this.emailAvailable = !!(window.cordova && window.cordova.plugins && window.cordova.plugins.email);
      
      console.log('📧 Notification services initialized:', {
        sms: this.smsAvailable,
        smsPermission: this.smsPermissionGranted,
        email: this.emailAvailable
      });
    } else {
      console.warn('⚠️ Running in browser mode - notifications disabled');
    }

    this.initialized = true;
  }

  /**
   * Format attendance notification message
   * @param {Object} params - Message parameters
   * @param {string} params.studentName - Student full name
   * @param {string} params.status - 'in' or 'out'
   * @param {string} params.time - Time string (e.g., "08:30:15")
   * @param {string} params.date - Date string (e.g., "2026-02-05")
   * @returns {string} Formatted message
   */
  formatAttendanceMessage({ studentName, status, time, date }) {
    const action = status === 'in' ? 'checked in' : 'checked out';
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    const formattedTime = new Date(`2000-01-01 ${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    return `Hello! Your child ${studentName} has ${action} at ${formattedTime} on ${formattedDate}. - Attendance Monitoring System`;
  }

  /**
   * Send SMS notification (automatic background sending)
   * @param {string} phoneNumber - Parent contact number
   * @param {string} message - Message to send
   * @returns {Promise<boolean>} Success status
   */
  async sendSMS(phoneNumber, message) {
    if (!this.initialized) await this.init();

    if (!this.smsAvailable) {
      console.warn('⚠️ SMS plugin not available');
      return false;
    }

    if (!this.smsPermissionGranted) {
      console.warn('⚠️ SMS permission not granted - requesting permission...');
      const granted = await this.requestSMSPermission();
      if (!granted) {
        console.error('❌ Cannot send SMS without permission');
        return false;
      }
    }

    if (!phoneNumber || phoneNumber.trim() === '') {
      console.warn('⚠️ No phone number provided');
      return false;
    }

    return new Promise((resolve) => {
      try {
        const smsPlugin = window.sms || window.SMS;
        
        console.log('📱 Sending SMS in background to:', phoneNumber);
        console.log('📝 Message:', message);
        
        // Configure for silent background sending
        const options = {
          replaceLineBreaks: false,
          android: {
            intent: '' // Empty string = send silently in background without opening SMS app
          }
        };

        smsPlugin.send(phoneNumber, message, options, 
          () => {
            console.log('✅ SMS sent successfully in background to:', phoneNumber);
            resolve(true);
          },
          (error) => {
            console.error('❌ SMS send error:', error);
            console.error('Error details:', JSON.stringify(error));
            resolve(false);
          }
        );
      } catch (err) {
        console.error('❌ SMS exception:', err);
        resolve(false);
      }
    });
  }

  /**
   * Send Email notification
   * Note: Cordova email plugin only opens the composer - it cannot send automatically.
   * For automatic email sending, you need a backend service (SendGrid, AWS SES, etc.)
   * 
   * @param {string} emailAddress - Parent email address
   * @param {string} subject - Email subject
   * @param {string} body - Email body message
   * @returns {Promise<boolean>} Success status
   */
  async sendEmail(emailAddress, subject, body) {
    if (!this.initialized) await this.init();

    if (!this.emailAvailable) {
      console.warn('⚠️ Email plugin not available');
      return false;
    }

    if (!emailAddress || emailAddress.trim() === '') {
      console.warn('⚠️ No email address provided');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      console.warn('⚠️ Invalid email address format:', emailAddress);
      return false;
    }

    console.log('📧 Email notification prepared (requires backend for auto-send):', {
      to: emailAddress,
      subject: subject,
      preview: body.substring(0, 50) + '...'
    });

    // TODO: Implement backend API for automatic email sending
    // For now, we'll skip email to avoid opening the composer
    // Uncomment below to open email composer manually
    
    /*
    return new Promise((resolve) => {
      try {
        const emailComposer = window.cordova.plugins.email;

        const emailOptions = {
          to: emailAddress,
          subject: subject,
          body: body,
          isHtml: false
        };

        // Check if email is available
        emailComposer.isAvailable((available) => {
          if (!available) {
            console.warn('⚠️ Email service not available on device');
            resolve(false);
            return;
          }

          // Open email composer
          emailComposer.open(emailOptions, () => {
            console.log('✅ Email composer opened successfully for:', emailAddress);
            resolve(true);
          }, (error) => {
            console.error('❌ Email send error:', error);
            resolve(false);
          });
        });
      } catch (err) {
        console.error('❌ Email exception:', err);
        resolve(false);
      }
    });
    */

    // Return false for now - email requires backend implementation
    console.log('ℹ️ Email notification logged (auto-send requires backend API)');
    return false;
  }

  /**
   * Send both SMS and Email notifications
   * @param {Object} params - Notification parameters
   * @param {string} params.phoneNumber - Parent contact number
   * @param {string} params.emailAddress - Parent email address
   * @param {string} params.studentName - Student full name
   * @param {string} params.status - 'in' or 'out'
   * @param {string} params.time - Time string
   * @param {string} params.date - Date string
   * @returns {Promise<Object>} Results { sms: boolean, email: boolean }
   */
  async sendAttendanceNotification({ phoneNumber, emailAddress, studentName, status, time, date }) {
    const message = this.formatAttendanceMessage({ studentName, status, time, date });
    const subject = `Attendance Notification - ${studentName}`;

    const results = {
      sms: false,
      email: false,
      message: message
    };

    // Send SMS if phone number provided
    if (phoneNumber && phoneNumber.trim() !== '') {
      results.sms = await this.sendSMS(phoneNumber, message);
    } else {
      console.log('ℹ️ No phone number - skipping SMS');
    }

    // Send Email if email address provided
    if (emailAddress && emailAddress.trim() !== '') {
      results.email = await this.sendEmail(emailAddress, subject, message);
    } else {
      console.log('ℹ️ No email address - skipping Email');
    }

    return results;
  }
}

// Export singleton instance
const notifications = new Notifications();
export default notifications;
