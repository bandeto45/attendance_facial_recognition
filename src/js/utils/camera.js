/**
 * Camera Management Utility
 * Handles camera operations for facial recognition
 * Uses cordova-plugin-camera-preview for live camera feed
 */

class CameraManager {
  constructor() {
    this.stream = null;
    this.videoElement = null;
    this.currentCamera = 'front'; // 'front' or 'rear'
    this.flashEnabled = false;
    this.isRunning = false;
  }

  /**
   * Initialize camera stream
   */
  async start(videoElement, cameraType = 'front', position = {}) {
    this.videoElement = videoElement;
    this.currentCamera = cameraType === 'user' ? 'front' : cameraType;

    try {
      // Stop existing stream if any
      if (this.isRunning) {
        this.stop();
      }

      // Check for Cordova camera preview at runtime (not in constructor)
      const isCordova = typeof window.CameraPreview !== 'undefined';
      
      console.log('Camera start - isCordova:', isCordova, 'window.CameraPreview:', window.CameraPreview);

      // Use Cordova camera preview if available
      if (isCordova && window.CameraPreview) {
        return await this.startCordovaCamera(position);
      } else {
        // Fallback to browser getUserMedia for web preview
        return await this.startBrowserCamera(cameraType);
      }
    } catch (error) {
      console.error('Camera start error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Start Cordova camera preview
   */
  async startCordovaCamera(position = {}) {
    return new Promise((resolve) => {
      // camera parameter should be 'front' or 'rear' string
      const cameraDirection = this.currentCamera === 'front' ? 'front' : 'rear';

      const cameraOptions = {
        x: position.x || 0,
        y: position.y || 0,
        width: position.width || window.innerWidth,
        height: position.height || window.innerHeight,
        toBack: false, // render camera above webview at specific position
        previewDrag: false,
        tapPhoto: false,
        tapFocus: true,
        camera: cameraDirection,
        storeToFile: false,
        disableExifHeaderStripping: false
      };

      console.log('Starting Cordova camera with options:', cameraOptions);

      window.CameraPreview.startCamera(cameraOptions, () => {
        console.log('Camera preview started');
        this.isRunning = true;
        resolve({ success: true });
      }, (err) => {
        console.error('Camera preview error:', err);
        resolve({ success: false, error: err || 'Camera start failed' });
      });
    });
  }

  /**
   * Start browser camera (fallback for web testing)
   */
  async startBrowserCamera(cameraType) {
    try {
      const constraints = {
        video: {
          facingMode: cameraType,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: false
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.videoElement.srcObject = this.stream;
      
      // Wait for video to be ready
      await new Promise((resolve) => {
        this.videoElement.onloadedmetadata = () => {
          this.videoElement.play();
          this.isRunning = true;
          resolve();
        };
      });

      return { success: true };
    } catch (error) {
      console.error('Browser camera error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Stop camera stream
   */
  stop() {
    const isCordova = typeof window.CameraPreview !== 'undefined';
    
    if (isCordova && window.CameraPreview && this.isRunning) {
      window.CameraPreview.stopCamera();
    } else if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    this.isRunning = false;
    
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }

  /**
   * Switch between front and back camera
   */
  async switchCamera() {
    const newCamera = this.currentCamera === 'front' ? 'rear' : 'front';
    const isCordova = typeof window.CameraPreview !== 'undefined';
    
    if (isCordova && window.CameraPreview) {
      return new Promise((resolve, reject) => {
        window.CameraPreview.switchCamera(() => {
          this.currentCamera = newCamera;
          resolve(newCamera);
        }, (err) => {
          console.error('Switch camera error:', err);
          reject(err || new Error('Switch camera failed'));
        });
      });
    } else if (this.videoElement) {
      const cameraType = newCamera === 'front' ? 'user' : 'environment';
      await this.startBrowserCamera(cameraType);
      this.currentCamera = newCamera;
    }
    
    return newCamera;
  }

  /**
   * Toggle flash/torch (for devices that support it)
   */
  async toggleFlash() {
    const isCordova = typeof window.CameraPreview !== 'undefined';
    
    if (isCordova && window.CameraPreview) {
      return new Promise((resolve) => {
        const mode = this.flashEnabled ? 'off' : 'torch';
        window.CameraPreview.setFlashMode(mode, () => {
          this.flashEnabled = !this.flashEnabled;
          resolve(this.flashEnabled);
        }, (err) => {
          console.error('Flash toggle error:', err);
          resolve(false);
        });
      });
    } else if (this.stream) {
      try {
        const track = this.stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities();

        if (capabilities.torch) {
          this.flashEnabled = !this.flashEnabled;
          await track.applyConstraints({
            advanced: [{ torch: this.flashEnabled }]
          });
          return this.flashEnabled;
        }
      } catch (error) {
        console.error('Flash toggle error:', error);
      }
    }

    return false;
  }

  /**
   * Capture current frame as image
   */
  captureFrame() {
    const isCordova = typeof window.CameraPreview !== 'undefined';
    
    if (isCordova && window.CameraPreview && this.isRunning) {
      return new Promise((resolve) => {
        window.CameraPreview.takeSnapshot({
          quality: 90
        }, (base64PictureData) => {
          resolve('data:image/jpeg;base64,' + base64PictureData);
        }, (err) => {
          console.error('Capture frame error:', err);
          resolve(null);
        });
      });
    } else if (this.videoElement && this.isRunning) {
      const canvas = document.createElement('canvas');
      canvas.width = this.videoElement.videoWidth;
      canvas.height = this.videoElement.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(this.videoElement, 0, 0);
      
      return canvas.toDataURL('image/jpeg', 0.9);
    }
    
    return null;
  }

  /**
   * Get available cameras
   */
  async getAvailableCameras() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'videoinput');
    } catch (error) {
      console.error('Get cameras error:', error);
      return [];
    }
  }

  /**
   * Check camera permissions
   */
  async checkPermissions() {
    try {
      if (navigator.permissions) {
        const result = await navigator.permissions.query({ name: 'camera' });
        return result.state; // 'granted', 'denied', or 'prompt'
      }
      return 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Request camera permissions
   */
  async requestPermissions() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  }
}

// Export singleton instance
const cameraManager = new CameraManager();
export default cameraManager;
